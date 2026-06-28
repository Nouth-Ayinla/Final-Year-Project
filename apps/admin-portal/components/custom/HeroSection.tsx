type Stat = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
};

type HeroSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats: Array<Stat & { color?: "primary" | "tertiary" | "error" }>;
};

export function HeroSection({ eyebrow, title, description, stats }: HeroSectionProps) {
  return (
    <>
      <header className="page-header">
        <div className="page-header-text">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="page-header-title">{title}</h1>
          <p className="page-header-desc">{description}</p>
        </div>
      </header>

      <div className="kpi-strip">
        {stats.map((stat, idx) => (
          <div key={idx} className="kpi-tile">
            <span className="label">{stat.label}</span>
            <span className={`value ${stat.color === "primary" ? "accent" : ""}`}>{stat.value}</span>
            {stat.hint ? <span className="delta">{stat.hint}</span> : null}
          </div>
        ))}
      </div>
    </>
  );
}
