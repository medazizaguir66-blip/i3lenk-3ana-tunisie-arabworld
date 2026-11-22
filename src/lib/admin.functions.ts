import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { codeStatus, generateActivationCode, type CodeStatus } from "./codes";

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "ia-admin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
  };
}

type AdminSession = { unlocked?: boolean };

async function isUnlocked(): Promise<boolean> {
  const { useSession } = await import("@tanstack/react-start/server");
  const session = await useSession<AdminSession>(sessionConfig());
  return !!session.data.unlocked;
}

async function requireAdmin() {
  if (!(await isUnlocked())) throw new Error("UNAUTHORIZED");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function passwordMatches(input: string, expected: string): Promise<boolean> {
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export type AdminCode = {
  id: string;
  code: string;
  device_id: string | null;
  activated_at: string | null;
  expires_at: string | null;
  revoked: boolean;
  note: string | null;
  created_at: string;
  status: CodeStatus;
};

export type AdminData = { unlocked: false } | { unlocked: true; codes: AdminCode[] };

export const getAdminData = createServerFn({ method: "GET" }).handler(async (): Promise<AdminData> => {
  if (!(await isUnlocked())) return { unlocked: false };
  const admin = await requireAdmin();
  const { data, error } = await admin
    .from("activation_codes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  const now = new Date();
  return { unlocked: true, codes: (data ?? []).map((r) => ({ ...r, status: codeStatus(r, now) })) };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) => ({ password: z.string().max(200).parse(input.password) }))
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected) return { ok: false as const, message: "كلمة السر غير مضبوطة في الإعدادات." };
    if (!(await passwordMatches(data.password, expected))) {
      await new Promise((r) => setTimeout(r, 600));
      return { ok: false as const, message: "كلمة السر غالطة." };
    }
    const { useSession } = await import("@tanstack/react-start/server");
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { useSession } = await import("@tanstack/react-start/server");
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const adminCreateCode = createServerFn({ method: "POST" })
  .inputValidator((input: { note?: string }) => ({ note: z.string().trim().max(120).optional().parse(input.note) }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateActivationCode();
      const { error } = await admin.from("activation_codes").insert({ code, note: data.note || null });
      if (!error) return { code };
      if (error.code !== "23505") throw new Error(error.message);
    }
    throw new Error("تعذر توليد كود فريد، عاود.");
  });

const idSchema = z.object({ id: z.string().uuid() });

export const adminRevokeCode = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; revoked: boolean }) => ({
    ...idSchema.parse(input),
    revoked: z.boolean().parse(input.revoked),
  }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const { error } = await admin.from("activation_codes").update({ revoked: data.revoked }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminUnbindCode = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const { error } = await admin.from("activation_codes").update({ device_id: null }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
