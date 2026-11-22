import { Copy, Crown, Instagram, KeyRound, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { copyText } from "@/lib/clipboard";
import { INSTAGRAM_USERNAME, PAYMENT_NUMBER, PRO_PRICE_DT } from "@/lib/codes";

const SMS_BODY = `سلام، خلّصت ${PRO_PRICE_DT} دينار اشتراك Pro في "إعلانك عنّا". هاني باعثلك لقطة الدفع، يعيشك ابعثلي كود التفعيل.`;

function openInstagram() {
  const webUrl = `https://instagram.com/${INSTAGRAM_USERNAME}`;
  const start = Date.now();
  const fallback = window.setTimeout(() => {
    if (document.visibilityState === "visible" && Date.now() - start < 2500) {
      window.location.href = webUrl;
    }
  }, 1200);
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") window.clearTimeout(fallback);
    },
    { once: true },
  );
  window.location.href = `instagram://user?username=${INSTAGRAM_USERNAME}`;
}

function smsHref() {
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  return `sms:+216${PAYMENT_NUMBER}${isIOS ? "&" : "?"}body=${encodeURIComponent(SMS_BODY)}`;
}

export function ProModal({
  open,
  onOpenChange,
  onEnterCode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEnterCode: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-md gap-0 overflow-y-auto rounded-3xl border-0 p-0">
        <div className="relative overflow-hidden bg-gold-gradient px-6 pb-6 pt-8 text-center text-gold-foreground">
          <span aria-hidden className="animate-twinkle absolute start-6 top-5 text-sm">✦</span>
          <span aria-hidden className="animate-twinkle absolute end-12 bottom-4 text-xs" style={{ animationDelay: "0.8s" }}>✦</span>
          <div className="animate-crown mx-auto mb-2 grid size-14 place-items-center rounded-full bg-royal-deep text-gold shadow-gold">
            <Crown className="size-7" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold">اشترك في Pro 👑</DialogTitle>
          <DialogDescription className="mt-1 text-sm font-medium text-gold-foreground/80">
            {PRO_PRICE_DT} دينار للشهر · توليد بلا حدود
          </DialogDescription>
        </div>

        <div className="space-y-5 p-5">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-royal text-xs font-bold text-royal-foreground">1</span>
              <div className="flex-1">
                <p className="font-semibold">خلّص {PRO_PRICE_DT} دينار عبر D17 ولا Flouci على الرقم:</p>
                <button
                  type="button"
                  onClick={() => copyText(PAYMENT_NUMBER, "تم نسخ الرقم!")}
                  className="mt-2 flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-gold bg-accent px-4 py-3"
                >
                  <span dir="ltr" className="font-display text-2xl font-bold tracking-widest text-royal">
                    {PAYMENT_NUMBER}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-accent-foreground">
                    <Copy className="size-3.5" /> نسخ
                  </span>
                </button>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-royal text-xs font-bold text-royal-foreground">2</span>
              <p className="flex-1 pt-1 font-semibold">ابعثلنا لقطة شاشة (capture) متاع الدفع من هنا 👇</p>
            </li>
            <li className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-royal text-xs font-bold text-royal-foreground">3</span>
              <p className="flex-1 pt-1 font-semibold">توصلك كود التفعيل TN-XXXX-XXXX، دخّلو في الإعدادات ⚙️</p>
            </li>
          </ol>

          <div className="space-y-2.5">
            <div className="flex gap-2">
              <Button variant="royal" size="xl" className="flex-1" onClick={openInstagram}>
                <Instagram className="!size-5" />
                تواصل عبر إنستغرام
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="px-4"
                onClick={() => copyText(`@${INSTAGRAM_USERNAME}`)}
                aria-label="نسخ اسم الحساب"
              >
                <Copy className="!size-4" />
                <span className="text-xs">نسخ اسم الحساب</span>
              </Button>
            </div>
            <p dir="ltr" className="text-center text-xs text-muted-foreground">@{INSTAGRAM_USERNAME}</p>
            <Button asChild variant="hero" size="xl" className="w-full">
              <a href={smsHref()}>
                <MessageSquareText className="!size-5" />
                إرسال رسالة SMS
              </a>
            </Button>
          </div>

          <button
            type="button"
            onClick={onEnterCode}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-semibold text-secondary-foreground"
          >
            <KeyRound className="size-4" />
            عندي كود تفعيل
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
