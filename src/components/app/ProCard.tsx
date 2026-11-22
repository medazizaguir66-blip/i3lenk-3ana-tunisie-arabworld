import { Crown, Infinity as InfinityIcon, MessageSquareHeart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRO_PRICE_DT } from "@/lib/codes";

const BENEFITS = [
  { icon: InfinityIcon, title: "توليد بلا حدود", text: "إعلانات وردود قد ما تحب، كل نهار." },
  { icon: MessageSquareHeart, title: "بكل اللهجات", text: "دارجة، فصحى ولا فرنسية لكل منتجاتك." },
  { icon: Zap, title: "أولوية وسرعة", text: "نتائج أسرع وتجربة بلا انتظار." },
];

const STARS = [
  { top: "7%", left: "9%", d: "0s", s: 16 },
  { top: "16%", left: "86%", d: "0.6s", s: 12 },
  { top: "48%", left: "5%", d: "1.2s", s: 10 },
  { top: "78%", left: "92%", d: "0.3s", s: 14 },
  { top: "34%", left: "93%", d: "1.6s", s: 9 },
  { top: "93%", left: "22%", d: "0.9s", s: 11 },
];

export function ProCard({ onSubscribe, isPro }: { onSubscribe: () => void; isPro: boolean }) {
  return (
    <div className="gold-frame">
      <div className="shine relative overflow-hidden rounded-[calc(var(--radius)+6px)] bg-gold-card px-5 pb-6 pt-7 text-gold-foreground">
        {STARS.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className="animate-twinkle absolute text-card"
            style={{ top: s.top, left: s.left, animationDelay: s.d, fontSize: s.s }}
          >
            ✦
          </span>
        ))}
        <div className="relative text-center">
          <div className="animate-crown mx-auto mb-2 grid size-16 place-items-center rounded-full bg-royal-deep shadow-gold ring-4 ring-gold-bright/60">
            <Crown className="size-8 text-gold" strokeWidth={2.2} />
          </div>
          <p className="text-xs font-bold tracking-wide text-gold-foreground/70">اشتراك</p>
          <h2 className="font-display text-3xl font-bold text-royal-deep">إعلانك عنّا Pro 👑</h2>
          <p className="mt-1 text-sm font-medium text-gold-foreground/80">كبّر مبيعاتك بلا ما تحسب المحاولات</p>
        </div>

        <ul className="relative mt-5 space-y-2.5">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 rounded-2xl bg-card/45 p-3 ring-1 ring-card/60 backdrop-blur-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-royal-deep text-gold">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-royal-deep">{title}</p>
                <p className="text-xs font-medium text-gold-foreground/80">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <Button variant="crown" size="xl" className="shine relative mt-5 w-full text-lg" onClick={onSubscribe}>
          {isPro ? "جدّد اشتراكك" : "اشترك تواً"} ({PRO_PRICE_DT} دينار/شهر)
        </Button>
      </div>
    </div>
  );
}
