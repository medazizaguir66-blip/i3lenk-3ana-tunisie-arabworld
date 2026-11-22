import { Crown, Infinity as InfinityIcon, MessageSquareHeart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRO_PRICE_DT } from "@/lib/codes";

const BENEFITS = [
  { icon: InfinityIcon, title: "توليد بلا حدود", text: "إعلانات وردود قد ما تحب، كل نهار." },
  { icon: MessageSquareHeart, title: "بكل اللهجات", text: "دارجة، فصحى ولا فرنسية لكل منتجاتك." },
  { icon: Zap, title: "أولوية وسرعة", text: "نتائج أسرع وتجربة بلا انتظار." },
];

const STARS = [
  { top: "8%", left: "10%", d: "0s", s: 10 },
  { top: "18%", left: "86%", d: "0.6s", s: 8 },
  { top: "62%", left: "6%", d: "1.2s", s: 7 },
  { top: "80%", left: "90%", d: "0.3s", s: 11 },
  { top: "40%", left: "94%", d: "1.6s", s: 6 },
  { top: "90%", left: "30%", d: "0.9s", s: 8 },
];

export function ProCard({ onSubscribe, isPro }: { onSubscribe: () => void; isPro: boolean }) {
  return (
    <div className="gold-frame">
      <div className="relative overflow-hidden rounded-[calc(var(--radius)+6px)] bg-royal-deep px-5 pb-6 pt-7 text-royal-foreground">
        <div className="pointer-events-none absolute inset-0 bg-hero opacity-80" />
        {STARS.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className="animate-twinkle absolute text-gold"
            style={{ top: s.top, left: s.left, animationDelay: s.d, fontSize: s.s }}
          >
            ✦
          </span>
        ))}
        <div className="relative text-center">
          <div className="animate-crown mx-auto mb-2 grid size-16 place-items-center rounded-full bg-gold-gradient shadow-gold">
            <Crown className="size-8 text-gold-foreground" strokeWidth={2.2} />
          </div>
          <p className="text-xs font-medium tracking-wide text-gold">اشتراك</p>
          <h2 className="font-display text-3xl font-bold">
            <span className="text-gold-gradient">إعلانك عنّا Pro</span>
          </h2>
          <p className="mt-1 text-sm text-royal-foreground/75">كبّر مبيعاتك بلا ما تحسب المحاولات</p>
        </div>

        <ul className="relative mt-5 space-y-2.5">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 rounded-2xl bg-royal-foreground/5 p-3 ring-1 ring-gold/25">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-royal-foreground/70">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <Button variant="gold" size="xl" className="shine relative mt-5 w-full text-lg" onClick={onSubscribe}>
          {isPro ? "جدّد اشتراكك" : "اشترك تواً"} ({PRO_PRICE_DT} دينار/شهر)
        </Button>
      </div>
    </div>
  );
}
