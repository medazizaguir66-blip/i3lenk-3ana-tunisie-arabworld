import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Crown, KeyRound, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { activateCode, type AppStatus } from "@/lib/app.functions";
import { copyText } from "@/lib/clipboard";
import { daysLeft, FREE_DAILY_LIMIT, isValidCode, normalizeCode } from "@/lib/codes";

export function SettingsSheet({
  open,
  onOpenChange,
  deviceId,
  status,
  onUpgrade,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  deviceId: string | null;
  status: AppStatus | undefined;
  onUpgrade: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();
  const activate = useServerFn(activateCode);
  const mutation = useMutation({
    mutationFn: () => activate({ data: { deviceId: deviceId ?? "", code: normalizeCode(code) } }),
    onSuccess: (res) => {
      if (res.ok) {
        setError(null);
        setCode("");
        toast.success(`تم تفعيل Pro 👑 صالح ${daysLeft(res.proUntil, new Date())} يوم`);
        qc.invalidateQueries({ queryKey: ["app-status"] });
      } else {
        setError(res.message);
      }
    },
    onError: () => setError("صار مشكل، عاود جرّب."),
  });

  const proDays = status?.proUntil ? daysLeft(status.proUntil, new Date()) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-t-3xl px-5 pb-8">
        <SheetHeader className="text-start">
          <SheetTitle className="font-display text-xl">الإعدادات ⚙️</SheetTitle>
          <SheetDescription>اشتراكك وكود التفعيل</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          {status?.pro ? (
            <div className="flex items-center gap-3 rounded-2xl bg-gold-gradient p-4 text-gold-foreground shadow-gold">
              <Crown className="size-8 shrink-0" />
              <div>
                <p className="font-bold">Pro مفعّل 👑</p>
                <p className="text-sm">
                  باقي {proDays} يوم · ينتهي في{" "}
                  {new Date(status.proUntil!).toLocaleDateString("ar-TN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="size-6 text-royal" />
                <div>
                  <p className="font-semibold">الخطة المجانية</p>
                  <p className="text-sm text-muted-foreground">
                    باقيلك {status?.remaining ?? FREE_DAILY_LIMIT} من {FREE_DAILY_LIMIT} محاولات اليوم
                  </p>
                </div>
              </div>
              <Button variant="gold" size="sm" className="rounded-full" onClick={onUpgrade}>
                Pro 👑
              </Button>
            </div>
          )}

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              const normalized = normalizeCode(code);
              setCode(normalized);
              if (!isValidCode(normalized)) {
                setError("صيغة الكود غير صحيحة. مثال: TN-AB12-CD34");
                return;
              }
              mutation.mutate();
            }}
          >
            <label htmlFor="code" className="flex items-center gap-2 text-sm font-semibold">
              <KeyRound className="size-4" />
              {status?.pro ? "جدّد بكود جديد (تتزاد 30 يوم)" : "دخّل كود التفعيل"}
            </label>
            <Input
              id="code"
              dir="ltr"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="TN-XXXX-XXXX"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 14));
                setError(null);
              }}
              className="h-14 rounded-2xl text-center font-display text-xl tracking-[0.2em]"
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" variant="royal" size="xl" className="w-full" disabled={!deviceId || mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              تفعيل الكود
            </Button>
          </form>

          {deviceId && (
            <button
              type="button"
              onClick={() => copyText(deviceId, "تم نسخ معرّف الجهاز")}
              className="w-full rounded-xl bg-muted p-3 text-start text-xs text-muted-foreground"
            >
              معرّف جهازك (للمساعدة): <span dir="ltr" className="break-all font-mono">{deviceId.slice(0, 20)}…</span>
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
