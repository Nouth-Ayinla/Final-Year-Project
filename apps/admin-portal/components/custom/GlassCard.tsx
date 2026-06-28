import { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
};

export function GlassCard({
  children,
  className = "",
  title,
  subtitle,
}: GlassCardProps) {
  return (
    <div
      className={`bg-card/90 backdrop-blur-[12px] border border-border/80 rounded-xl ${className}`}
    >
      {title && (
        <div className="p-gutter border-b border-border/60 bg-muted/20">
          <h3 className="font-headline-sm text-foreground flex items-center gap-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-label-md text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
