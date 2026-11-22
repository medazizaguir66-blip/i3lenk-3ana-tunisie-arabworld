import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { computeNewExpiry, FREE_DAILY_LIMIT, isValidCode, normalizeCode } from "./codes";

const deviceSchema = z.string().regex(/^[A-Za-z0-9_-]{8,128}$/);

export type AppStatus = { pro: boolean; proUntil: string | null; remaining: number };

export const getAppStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId: string }) => ({ deviceId: deviceSchema.parse(input.deviceId) }))
  .handler(async ({ data }): Promise<AppStatus> => {
    const { getProUntil, getRemainingTries } = await import("./pro.server");
    const [proUntil, remaining] = await Promise.all([
      getProUntil(data.deviceId),
      getRemainingTries(data.deviceId),
    ]);
    return { pro: !!proUntil, proUntil, remaining };
  });

export type ActivateResult = { ok: true; proUntil: string } | { ok: false; message: string };

export const activateCode = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId: string; code: string }) => ({
    deviceId: deviceSchema.parse(input.deviceId),
    code: normalizeCode(z.string().max(40).parse(input.code)),
  }))
  .handler(async ({ data }): Promise<ActivateResult> => {
    if (!isValidCode(data.code)) {
      return { ok: false, message: "صيغة الكود غير صحيحة. مثال: TN-AB12-CD34" };
    }
    const { supabaseAdmin, getProUntil } = await import("./pro.server");
    const { data: row, error } = await supabaseAdmin
      .from("activation_codes")
      .select("*")
      .eq("code", data.code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { ok: false, message: "هذا الكود غير موجود. ثبّت فيه وعاود." };
    if (row.revoked) return { ok: false, message: "هذا الكود ملغى. تواصل معنا." };

    const now = new Date();
    if (row.device_id && row.device_id !== data.deviceId) {
      return { ok: false, message: "هذا الكود مفعل مسبقاً على جهاز آخر" };
    }
    const expired = row.expires_at && new Date(row.expires_at).getTime() <= now.getTime();
    if (row.activated_at && expired) {
      return { ok: false, message: "انتهت صلاحية هذا الكود. جدد اشتراكك بكود جديد." };
    }

    if (row.device_id === data.deviceId && row.expires_at) {
      const proUntil = (await getProUntil(data.deviceId)) ?? row.expires_at;
      return { ok: true, proUntil };
    }

    if (row.activated_at && row.expires_at) {
      // Previously activated, then unbound by the admin: bind to this device, keep its expiry.
      const { data: updated, error: upErr } = await supabaseAdmin
        .from("activation_codes")
        .update({ device_id: data.deviceId })
        .eq("id", row.id)
        .is("device_id", null)
        .select("id");
      if (upErr) throw new Error(upErr.message);
      if (!updated?.length) return { ok: false, message: "هذا الكود مفعل مسبقاً على جهاز آخر" };
    } else {
      const current = await getProUntil(data.deviceId);
      const expiresAt = computeNewExpiry(current ? new Date(current) : null, now);
      const { data: updated, error: upErr } = await supabaseAdmin
        .from("activation_codes")
        .update({
          device_id: data.deviceId,
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", row.id)
        .is("activated_at", null)
        .select("id");
      if (upErr) throw new Error(upErr.message);
      if (!updated?.length) return { ok: false, message: "هذا الكود مفعل مسبقاً على جهاز آخر" };
    }
    const proUntil = await getProUntil(data.deviceId);
    return { ok: true, proUntil: proUntil ?? now.toISOString() };
  });

const generateSchema = z.object({
  deviceId: deviceSchema,
  name: z.string().trim().min(1).max(150),
  price: z.string().trim().max(30),
  features: z.string().trim().max(2000),
  dialect: z.enum(["tn", "msa", "fr"]),
});

export type AdResult = {
  description: string;
  hashtags: string[];
  replies: { question: string; answer: string }[];
};

export type GenerateResult =
  | { ok: true; result: AdResult; remaining: number; pro: boolean }
  | { ok: false; reason: "limit" | "ai"; message: string };

const DIALECT_PROMPT: Record<"tn" | "msa" | "fr", string> = {
  tn: "الدارجة التونسية الطبيعية مكتوبة بالحروف العربية (كيف يحكيو التوانسة في فيسبوك وإنستغرام: برشا، توا، يعيشك، بالحق، زادة...)",
  msa: "العربية الفصحى السلسة والقريبة من القارئ التونسي",
  fr: "le français, ton commercial chaleureux adapté au marché tunisien",
};

export const generateAd = createServerFn({ method: "POST" })
  .inputValidator((input: z.input<typeof generateSchema>) => generateSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateResult> => {
    const { supabaseAdmin, getProUntil } = await import("./pro.server");
    const proUntil = await getProUntil(data.deviceId);
    const pro = !!proUntil;
    let remaining = FREE_DAILY_LIMIT;

    if (!pro) {
      const { data: used, error } = await supabaseAdmin.rpc("consume_free_try", {
        _device_id: data.deviceId,
        _limit: FREE_DAILY_LIMIT,
      });
      if (error) throw new Error(error.message);
      if (used === -1) {
        return {
          ok: false,
          reason: "limit",
          message: "كملت المحاولات المجانية متاع اليوم (3). اشترك في Pro وولّد بلا حدود!",
        };
      }
      remaining = Math.max(0, FREE_DAILY_LIMIT - (used ?? 0));
    }

    try {
      const { generateChatCompletion } = await import("@lovable.dev/ai-gateway");
      const completion = await generateChatCompletion({
        model: "google/gemini-3.8-flash",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `إنت خبير تسويق إلكتروني متخصص في السوق التونسي وفي متاجر فيسبوك وإنستغرام وتيك توك.
تكتب إعلانات تبيع وتجيب ردود. اكتب كل شيء بـ ${DIALECT_PROMPT[data.dialect]}.
Return JSON only with exactly this shape:
{"description": string, "hashtags": string[10], "replies": [{"question": string, "answer": string}] x3}
- description: وصف إعلاني جذاب ومقنع (80 إلى 140 كلمة) فيه إيموجيات مناسبة، يبدأ بجملة تشد الانتباه، يذكر السعر بالدينار التونسي (DT) والمميزات والتوصيل، ويختم بدعوة واضحة للطلب (call to action).
- hashtags: 10 هاشتاغات قوية ومتداولة للسوق التونسي، كل واحد يبدأ بـ # وبلا فراغات (مزيج عربي/فرنسي/إنجليزي مثل #تونس #Tunisie #livraison).
- replies: 3 ردود جاهزة ومقنعة على أكثر أسئلة الحرفاء تكرار (مثلاً السعر، التوصيل والمدة، الجودة/الضمان أو الدفع عند الاستلام)، كل رد لطيف ويقنع بالشراء.`,
          },
          {
            role: "user",
            content: `اسم المنتج: ${data.name}
السعر: ${data.price || "غير محدد"} DT
المميزات وتفاصيل التوصيل: ${data.features || "غير محددة"}`,
          },
        ],
      });
      const content = completion.choices?.[0]?.message?.content;
      const text = typeof content === "string" ? content : "";
      const parsed = JSON.parse(text.replace(/^```(?:json)?|```$/g, "").trim()) as Partial<AdResult>;
      const result: AdResult = {
        description: String(parsed.description ?? "").trim(),
        hashtags: (Array.isArray(parsed.hashtags) ? parsed.hashtags : [])
          .map((h) => String(h).trim().replace(/\s+/g, "_"))
          .filter(Boolean)
          .map((h) => (h.startsWith("#") ? h : `#${h}`))
          .slice(0, 10),
        replies: (Array.isArray(parsed.replies) ? parsed.replies : [])
          .map((r) => ({ question: String(r?.question ?? "").trim(), answer: String(r?.answer ?? "").trim() }))
          .filter((r) => r.answer)
          .slice(0, 3),
      };
      if (!result.description) throw new Error("empty result");
      return { ok: true, result, remaining, pro };
    } catch (err) {
      console.error("generateAd failed", err);
      if (!pro) await supabaseAdmin.rpc("refund_free_try", { _device_id: data.deviceId });
      return {
        ok: false,
        reason: "ai",
        message: "صار مشكل في التوليد. عاود جرّب بعد شوية (المحاولة ما تتحسبش).",
      };
    }
  });
