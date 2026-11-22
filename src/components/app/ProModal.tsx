import { Copy, Crown, Instagram, KeyRound, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { copyText } from "@/lib/clipboard";
import { INSTAGRAM_USERNAME, PAYMENT_NUMBER, PRO_DAYS, PRO_PRICE_DT } from "@/lib/codes";

const SMS_BODY = `سلام، حوّلت ${PRO_PRICE_DT} دينار اشتراك Pro في "إعلانك عنّا". هاني باعثلك لقطة الدفع، يعيشك ابعثلي كود التفعيل.`;

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
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-md gap-0 overflow-y-auto rounded-3xl border-2 border-gold bg-gold-soft p-0 shadow-gold">
        <div className="relative min-w-0 overflow-hidden bg-gold-card px-6 pb-6 pt-8 text-center text-gold-foreground">
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

        <div className="min-w-0 space-y-4 p-5">
          <p className="rounded-2xl border-2 border-gold-deep/35 bg-card/70 p-4 text-[15px] font-semibold leading-7">
            للاشتراك في النسخة المفتوحة (Pro) لمدة {PRO_DAYS} يوماً، قم بتحويل رصيد بقيمة{" "}
            <span className="text-gold-deep">{PRO_PRICE_DT} دينار</span> (Transfert de crédit أو بطاقة
            شحن) على الرقم{" "}
            <span dir="ltr" className="font-display font-bold tracking-wider text-royal">
              {PAYMENT_NUMBER}
            </span>
            ، ثم أرسل لنا رسالة SMS أو لقطة شاشة على إنستغرام لاستلام كود التفعيل فوراً
          </p>

          <button
            type="button"
            onClick={() => copyText(PAYMENT_NUMBER, "تم نسخ الرقم!")}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-gold-deep bg-card px-4 py-3"
          >
            <span className="shrink-0 text-xs font-semibold whitespace-nowrap text-muted-foreground">رقم التحويل</span>
            <span className="flex min-w-0 items-center gap-2">
              <span dir="ltr" className="font-display text-xl font-bold tracking-widest text-royal min-[380px]:text-2xl">
                {PAYMENT_NUMBER}
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-accent-foreground">
                <Copy className="size-3.5" /> نسخ
              </span>
            </span>
          </button>

          <div className="space-y-2.5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Button variant="crown" size="xl" className="min-w-0 px-3 text-[15px]" onClick={openInstagram}>
                <Instagram className="!size-5" />
                تواصل عبر إنستغرام
              </Button>
              <Button
                variant="gold"
                size="xl"
                className="h-14 w-[5.5rem] flex-col gap-0.5 whitespace-normal px-2 text-[11px] leading-tight"
                onClick={() => copyText(`@${INSTAGRAM_USERNAME}`)}
              >
                <Copy className="!size-4" />
                نسخ اسم الحساب
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

          <p className="text-center text-xs leading-5 text-muted-foreground">
            توصلك كود التفعيل <span dir="ltr" className="whitespace-nowrap">TN-XXXX-XXXX</span>، دخّلو في
            الإعدادات ⚙️
          </p>

          <button
            type="button"
            onClick={onEnterCode}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gold bg-card py-3 text-sm font-semibold text-gold-foreground"
          >
            <KeyRound className="size-4" />
            عندي كود تفعيل
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
