import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";

export function ResultCard({
  index,
  title,
  icon,
  copyValue,
  children,
  delay = 0,
}: {
  index: number;
  title: string;
  icon: ReactNode;
  copyValue: string;
  children: ReactNode;
  delay?: number;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <section
      className="animate-rise rounded-3xl bg-card p-5 shadow-card ring-1 ring-border"
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-royal text-royal-foreground">
            {icon}
          </span>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">0{index}</p>
            <h3 className="font-display text-base font-semibold leading-tight">{title}</h3>
          </div>
        </div>
        <Button
          size="sm"
          variant={copied ? "secondary" : "royal"}
          className="rounded-full px-4"
          onClick={async () => {
            await copyText(copyValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "تم" : "نسخ"}
        </Button>
      </header>
      {children}
    </section>
  );
}
