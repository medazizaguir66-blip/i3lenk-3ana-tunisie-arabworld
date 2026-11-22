import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Hash, Loader2, Megaphone, MessagesSquare, Settings, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ProCard } from "@/components/app/ProCard";
import { ProModal } from "@/components/app/ProModal";
import { ResultCard } from "@/components/app/ResultCard";
import { SettingsSheet } from "@/components/app/SettingsSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateAd, getAppStatus, type AdResult } from "@/lib/app.functions";
import { DIALECTS, FREE_DAILY_LIMIT, type Dialect } from "@/lib/codes";
import { getDeviceId } from "@/lib/device";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "إعلانك عنّا — إعلانك جاهز في ثواني والردود زادة" },
      {
        name: "description",
        content:
          "لأصحاب المتاجر الإلكترونية في تونس: ولّد وصف إعلاني، 10 هاشتاغات و3 ردود جاهزة على الحرفاء بالدارجة، الفصحى ولا الفرنسية.",
      },
      { property: "og:title", content: "إعلانك عنّا — إعلانك جاهز في ثواني" },
      {
        property: "og:description",
        content: "وصف إعلاني، هاشتاغات وردود جاهزة للمتاجر الإلكترونية في تونس بالذكاء الاصطناعي.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [proOpen, setProOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState("");
  const [dialect, setDialect] = useState<Dialect>("tn");
  const [result, setResult] = useState<AdResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => setDeviceId(getDeviceId()), []);

  const fetchStatus = useServerFn(getAppStatus);
  const generate = useServerFn(generateAd);

  const { data: status } = useQuery({
    queryKey: ["app-status", deviceId],
    queryFn: () => fetchStatus({ data: { deviceId: deviceId! } }),
    enabled: !!deviceId,
  });

  const mutation = useMutation({
    mutationFn: () =>
      generate({ data: { deviceId: deviceId!, name, price, features, dialect } }),
    onSuccess: (res) => {
      if (res.ok) {
        setResult(res.result);
        qc.setQueryData(["app-status", deviceId], (old: typeof status) =>
          old ? { ...old, remaining: res.remaining } : old,
        );
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      } else if (res.reason === "limit") {
        qc.setQueryData(["app-status", deviceId], (old: typeof status) =>
          old ? { ...old, remaining: 0 } : old,
        );
        toast.error(res.message);
        setProOpen(true);
      } else {
        toast.error(res.message);
      }
    },
    onError: () => toast.error("صار مشكل في الاتصال، عاود جرّب."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("اكتب اسم المنتج قبل");
      return;
    }
    if (status && !status.pro && status.remaining <= 0) {
      setProOpen(true);
      return;
    }
    mutation.mutate();
  };

  const remaining = status?.remaining ?? FREE_DAILY_LIMIT;

  return (
    <div className="min-h-dvh pb-10">
      {/* Hero */}
      <header className="bg-hero relative overflow-hidden px-5 pb-24 pt-5 text-royal-foreground">
        <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground shadow-gold">
              <Megaphone className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-bold">إعلانك عنّا</p>
              <p className="text-[11px] text-royal-foreground/70">لأصحاب المتاجر الإلكترونية في تونس</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="gold" size="sm" className="h-9 rounded-full px-4" onClick={() => setProOpen(true)}>
              Pro 👑
            </Button>
            <Button
              variant="glass"
              size="icon"
              className="rounded-full"
              aria-label="الإعدادات"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="!size-5" />
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-9 max-w-md">
          <h1 className="font-display text-[2.15rem] font-bold leading-[1.25]">
            إعلانك جاهز في ثواني،
            <br />
            <span className="text-gold-gradient">والردود زادة.</span>
          </h1>
          <p className="mt-3 text-sm text-royal-foreground/75">
            وصف يبيع، هاشتاغات تونسية وردود تقنع الحريف — بضغطة وحدة.
          </p>
        </div>
      </header>

      <main className="relative mx-auto -mt-16 max-w-md space-y-5 px-4">
        {/* Form card */}
        <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">تفاصيل المنتج</h2>
            {status?.pro ? (
              <span className="rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-gold-foreground">Pro 👑 بلا حدود</span>
            ) : (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {remaining}/{FREE_DAILY_LIMIT} محاولات اليوم
              </span>
            )}
          </div>

          <Field label="اسم المنتج" htmlFor="name">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ساعة ذكية Ultra 9"
              maxLength={150}
              className="h-12 rounded-2xl bg-muted/50 text-base"
            />
          </Field>

          <Field label="السعر بالدينار التونسي (DT)" htmlFor="price">
            <div className="relative">
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="89"
                inputMode="decimal"
                maxLength={30}
                className="h-12 rounded-2xl bg-muted/50 pe-14 text-base"
              />
              <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm font-bold text-royal">DT</span>
            </div>
          </Field>

          <Field label="المميزات وتفاصيل التوصيل" htmlFor="features">
            <Textarea
              id="features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="مقاومة للماء، بطارية 7 أيام... التوصيل لكل الولايات في 48 ساعة، الدفع عند الاستلام"
              maxLength={2000}
              rows={4}
              className="rounded-2xl bg-muted/50 text-base"
            />
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-semibold">اللهجة</p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="اللهجة">
              {(Object.keys(DIALECTS) as Dialect[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={dialect === d}
                  onClick={() => setDialect(d)}
                  className={cn(
                    "rounded-2xl border-2 px-2 py-2.5 text-xs font-semibold transition-all",
                    dialect === d
                      ? "border-royal bg-royal text-royal-foreground shadow-card"
                      : "border-border bg-card text-foreground hover:border-royal/40",
                  )}
                >
                  {DIALECTS[d]}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="hero" size="xl" className="w-full text-lg" disabled={mutation.isPending || !deviceId}>
            {mutation.isPending ? <Loader2 className="!size-5 animate-spin" /> : <Wand2 className="!size-5" />}
            {mutation.isPending ? "قاعد نكتب في إعلانك..." : "توليد الإعلان والردود"}
          </Button>
        </form>

        {/* Results */}
        {mutation.isPending && !result && <ResultsSkeleton />}
        {result && (
          <div ref={resultsRef} className="scroll-mt-4 space-y-4">
            <div className="flex items-center gap-2 px-1 pt-1">
              <Sparkles className="size-5 text-gold-deep" />
              <h2 className="font-display text-lg font-semibold">إعلانك جاهز!</h2>
            </div>
            <ResultCard index={1} title="الوصف الإعلاني" icon={<Megaphone className="size-4" />} copyValue={result.description}>
              <p className="whitespace-pre-line text-[15px] leading-7">{result.description}</p>
            </ResultCard>
            <ResultCard
              index={2}
              title="10 هاشتاغات للسوق التونسي"
              icon={<Hash className="size-4" />}
              copyValue={result.hashtags.join(" ")}
              delay={80}
            >
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((h) => (
                  <span key={h} dir="auto" className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                    {h}
                  </span>
                ))}
              </div>
            </ResultCard>
            <ResultCard
              index={3}
              title="3 ردود جاهزة على الحرفاء"
              icon={<MessagesSquare className="size-4" />}
              copyValue={result.replies.map((r) => `❓ ${r.question}\n✅ ${r.answer}`).join("\n\n")}
              delay={160}
            >
              <div className="space-y-3">
                {result.replies.map((r, i) => (
                  <div key={i} className="rounded-2xl bg-muted/60 p-3.5">
                    <p className="text-sm font-semibold text-royal">❓ {r.question}</p>
                    <p className="mt-1.5 text-[15px] leading-7">{r.answer}</p>
                  </div>
                ))}
              </div>
            </ResultCard>
          </div>
        )}

        <div className="pt-4">
          <ProCard isPro={!!status?.pro} onSubscribe={() => setProOpen(true)} />
        </div>

        <p className="pt-2 text-center text-xs text-muted-foreground">صُنع بحب للتجار التوانسة 🇹🇳</p>
      </main>

      <ProModal
        open={proOpen}
        onOpenChange={setProOpen}
        onEnterCode={() => {
          setProOpen(false);
          setSettingsOpen(true);
        }}
      />
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        deviceId={deviceId}
        status={status}
        onUpgrade={() => {
          setSettingsOpen(false);
          setProOpen(true);
        }}
      />
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse space-y-3 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
          <div className="h-5 w-1/3 rounded-full bg-muted" />
          <div className="h-3 w-full rounded-full bg-muted" />
          <div className="h-3 w-5/6 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}
