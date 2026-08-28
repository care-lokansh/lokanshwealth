import { cn } from "@/lib/utils";

interface Props {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
  className?: string;
  eyebrowClassName?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, center, className, eyebrowClassName }: Props) {
  return (
    <div className={cn(center && "mx-auto text-center", "max-w-2xl", className)}>
      <p className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground/0", center && "justify-center", eyebrowClassName)}>
        <span className="text-primary">{eyebrow}</span>
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
