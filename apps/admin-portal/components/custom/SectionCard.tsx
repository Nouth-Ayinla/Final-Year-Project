import Link from "next/link";
import type { AdminNavItem } from "@/lib/data/adminNavigation";

type SectionCardProps = {
  item: AdminNavItem;
};

export function SectionCard({ item }: SectionCardProps) {
  const Icon = item.icon;
  return (
    <article className="relative flex flex-col p-5 bg-white/80 backdrop-blur-[12px] border border-slate-200/80 rounded-xl shadow-sm hover:shadow-md transition-shadow hover:border-primary/20">
      <Link href={item.path} className="absolute inset-0 z-10" aria-label={item.label} />
      <div className="flex justify-between items-center mb-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon size={16} />
        </div>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{item.status}</span>
      </div>
      <h3 className="font-bold text-sm text-slate-800 mb-1">{item.label}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
    </article>
  );
}
