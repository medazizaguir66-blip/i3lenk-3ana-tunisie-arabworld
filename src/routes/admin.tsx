import { createFileRoute, useRouter } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Ban, Copy, KeyRound, Link2Off, Loader2, LogOut, Plus, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminCreateCode,
  adminLogin,
  adminLogout,
  adminRevokeCode,
  adminUnbindCode,
  getAdminData,
  type AdminCode,
} from "@/lib/admin.functions";
import { copyText } from "@/lib/clipboard";
import { daysLeft, type CodeStatus } from "@/lib/codes";
import { cn } from "@/lib/utils";

const adminQuery = queryOptions({ queryKey: ["admin-data"], queryFn: () => getAdminData() });

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — إعلانك عنّا" },
      { name: "description", content: "إدارة أكواد التفعيل لاشتراك Pro." },
      { property: "og:title", content: "لوحة التحكم — إعلانك عنّا" },
      { property: "og:description", content: "إدارة أكواد التفعيل لاشتراك Pro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQuery),
  component: AdminPage,
});

function AdminPage() {
  const { data } = useSuspenseQuery(adminQuery);
  return data.unlocked ? <Dashboard codes={data.codes} /> : <LoginForm />;
}

function LoginForm() {
  const login = useServerFn(adminLogin);
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="bg-hero flex min-h-dvh items-center justify-center px-5">
      <form
        className="w-full max-w-sm space-y-4 rounded-3xl bg-card p-6 shadow-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          const password = String(new FormData(e.currentTarget).get("password") ?? "");
          try {
            const res = await login({ data: { password } });
            if (res.ok) await qc.invalidateQueries({ queryKey: adminQuery.queryKey });
            else setError(res.message);
          } catch {
            setError("صار مشكل، عاود.");
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-royal text-gold">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="font-display text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">إعلانك عنّا · دخول المشرف</p>
        </div>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="كلمة السر"
          className="h-12 rounded-2xl text-base"
          onChange={() => setError(null)}
        />
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <Button type="submit" variant="royal" size="xl" className="w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          دخول
        </Button>
      </form>
    </div>
  );
}

const STATUS_LABEL: Record<CodeStatus, { label: string; cls: string }> = {
  unused: { label: "غير مستعمل", cls: "bg-secondary text-secondary-foreground" },
  active: { label: "مفعّل", cls: "bg-success text-success-foreground" },
  expired: { label: "منتهي", cls: "bg-muted text-muted-foreground" },
  unbound: { label: "مفكوك الارتباط", cls: "bg-accent text-accent-foreground" },
  revoked: { label: "ملغى", cls: "bg-destructive text-destructive-foreground" },
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-TN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Dashboard({ codes }: { codes: AdminCode[] }) {
  const qc = useQueryClient();
  const router = useRouter();
  const create = useServerFn(adminCreateCode);
  const revoke = useServerFn(adminRevokeCode);
  const unbind = useServerFn(adminUnbindCode);
  const logout = useServerFn(adminLogout);
  const [note, setNote] = useState("");
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CodeStatus | "all">("all");

  const refresh = () => qc.invalidateQueries({ queryKey: adminQuery.queryKey });

  const createMut = useMutation({
    mutationFn: () => create({ data: { note } }),
    onSuccess: async (res) => {
      setLastCode(res.code);
      setNote("");
      await copyText(res.code, "تم توليد الكود ونسخه!");
      refresh();
    },
    onError: () => toast.error("ما نجمناش نولّدو الكود"),
  });

  const actionMut = useMutation({
    mutationFn: async (a: { type: "revoke" | "restore" | "unbind"; id: string }) => {
      if (a.type === "unbind") return unbind({ data: { id: a.id } });
      return revoke({ data: { id: a.id, revoked: a.type === "revoke" } });
    },
    onSuccess: (_r, a) => {
      toast.success(a.type === "unbind" ? "تم فك الارتباط بالجهاز" : a.type === "revoke" ? "تم إلغاء الكود" : "تم استرجاع الكود");
      refresh();
    },
    onError: () => toast.error("صار مشكل"),
  });

  const stats = useMemo(() => {
    const s = { total: codes.length, active: 0, unused: 0, revoked: 0 };
    for (const c of codes) {
      if (c.status === "active") s.active++;
      if (c.status === "unused") s.unused++;
      if (c.status === "revoked") s.revoked++;
    }
    return s;
  }, [codes]);

  const filtered = codes.filter(
    (c) =>
      (filter === "all" || c.status === filter) &&
      (!query ||
        c.code.includes(query.toUpperCase()) ||
        (c.note ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (c.device_id ?? "").includes(query)),
  );
  const now = new Date();

  return (
    <div className="min-h-dvh pb-12">
      <header className="bg-hero px-5 pb-20 pt-6 text-royal-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs text-gold">إعلانك عنّا</p>
            <h1 className="font-display text-2xl font-bold">لوحة التحكم</h1>
          </div>
          <Button
            variant="glass"
            size="sm"
            className="rounded-full"
            onClick={async () => {
              await logout();
              await qc.invalidateQueries({ queryKey: adminQuery.queryKey });
              router.invalidate();
            }}
          >
            <LogOut /> خروج
          </Button>
        </div>
        <div className="mx-auto mt-5 grid max-w-5xl grid-cols-4 gap-2">
          {[
            { l: "الكل", v: stats.total },
            { l: "مفعّل", v: stats.active },
            { l: "جديد", v: stats.unused },
            { l: "ملغى", v: stats.revoked },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-royal-foreground/10 p-3 text-center ring-1 ring-royal-foreground/15">
              <p className="font-display text-2xl font-bold text-gold">{s.v}</p>
              <p className="text-[11px] text-royal-foreground/75">{s.l}</p>
            </div>
          ))}
        </div>
      </header>

      <main className="mx-auto -mt-14 max-w-5xl space-y-5 px-4">
        <section className="space-y-3 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <KeyRound className="size-5 text-royal" /> توليد كود جديد
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ملاحظة (اختياري): اسم الحريف أو رقمه"
              maxLength={120}
              className="h-12 rounded-2xl"
            />
            <Button variant="hero" size="xl" className="sm:w-56" onClick={() => createMut.mutate()} disabled={createMut.isPending}>
              {createMut.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
              توليد كود TN
            </Button>
          </div>
          {lastCode && (
            <button
              type="button"
              onClick={() => copyText(lastCode)}
              className="flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-gold bg-accent px-4 py-3"
            >
              <span dir="ltr" className="font-display text-2xl font-bold tracking-widest text-royal">
                {lastCode}
              </span>
              <span className="flex items-center gap-1 text-sm font-medium text-accent-foreground">
                <Copy className="size-4" /> نسخ
              </span>
            </button>
          )}
        </section>

        <section className="rounded-3xl bg-card p-4 shadow-card ring-1 ring-border">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-semibold">الأكواد</h2>
            <div className="relative sm:w-72">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث بالكود أو الملاحظة"
                className="h-10 rounded-full ps-9"
              />
            </div>
          </div>
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {(["all", "unused", "active", "expired", "unbound", "revoked"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                  filter === f ? "bg-royal text-royal-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {f === "all" ? "الكل" : STATUS_LABEL[f].label}
              </button>
            ))}
          </div>

          <div className="-mx-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs text-muted-foreground">
                  <th className="px-4 py-2 text-start font-medium">الكود</th>
                  <th className="px-2 py-2 text-start font-medium">الحالة</th>
                  <th className="px-2 py-2 text-start font-medium">التفعيل</th>
                  <th className="px-2 py-2 text-start font-medium">الانتهاء</th>
                  <th className="px-2 py-2 text-start font-medium">الجهاز</th>
                  <th className="px-2 py-2 text-start font-medium">ملاحظة</th>
                  <th className="px-4 py-2 text-start font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      ما فماش أكواد هنا. ولّد أول كود من الفوق.
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => copyText(c.code)} className="flex items-center gap-1.5 font-mono font-semibold text-royal" dir="ltr">
                        {c.code} <Copy className="size-3.5 opacity-60" />
                      </button>
                    </td>
                    <td className="px-2 py-3">
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_LABEL[c.status].cls)}>
                        {STATUS_LABEL[c.status].label}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">{fmt(c.activated_at)}</td>
                    <td className="px-2 py-3">
                      {fmt(c.expires_at)}
                      {c.status === "active" && (
                        <span className="ms-1 text-xs text-muted-foreground">({daysLeft(c.expires_at, now)} يوم)</span>
                      )}
                    </td>
                    <td className="max-w-[120px] truncate px-2 py-3 font-mono text-xs text-muted-foreground" dir="ltr" title={c.device_id ?? ""}>
                      {c.device_id ? `${c.device_id.slice(0, 12)}…` : "—"}
                    </td>
                    <td className="max-w-[140px] truncate px-2 py-3 text-muted-foreground" title={c.note ?? ""}>
                      {c.note ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {c.device_id && !c.revoked && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            disabled={actionMut.isPending}
                            onClick={() => {
                              if (confirm(`فك ارتباط ${c.code} بالجهاز؟ يولّي ينجم يتفعّل على جهاز آخر.`))
                                actionMut.mutate({ type: "unbind", id: c.id });
                            }}
                          >
                            <Link2Off /> فك الارتباط
                          </Button>
                        )}
                        {c.revoked ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="rounded-full"
                            disabled={actionMut.isPending}
                            onClick={() => actionMut.mutate({ type: "restore", id: c.id })}
                          >
                            <RotateCcw /> استرجاع
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-full"
                            disabled={actionMut.isPending}
                            onClick={() => {
                              if (confirm(`إلغاء الكود ${c.code}؟`)) actionMut.mutate({ type: "revoke", id: c.id });
                            }}
                          >
                            <Ban /> إلغاء
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
