import { GlassCard } from "./GlassCard";
import { Vote } from "lucide-react";

type Party = {
  name: string;
  percentage: number;
  votes: number;
  color: "primary" | "tertiary" | "secondary" | "outline" | string;
};

type PartyPerformanceChartProps = {
  parties: Party[];
};

const getPartyColorClass = (partyName: string) => {
  switch (partyName?.toUpperCase()) {
    case "APC":
      return "bg-[#D95300]";
    case "PDP":
      return "bg-[#0EA5E9]";
    case "LP":
      return "bg-[#22C55E]";
    case "NNPP":
      return "bg-yellow-500";
    default:
      return "bg-stone-500";
  }
};

export function PartyPerformanceChart({ parties }: PartyPerformanceChartProps) {
  // If no party performance data exists, render an awaiting state
  const hasData = parties && parties.length > 0 && parties.some(p => p.votes > 0);

  return (
    <GlassCard className="p-5 flex flex-col">
      {/* Title */}
      <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Vote size={16} className="text-primary" />
          Party Performance Leaderboard
        </h4>
        <span className="text-[10px] text-muted-foreground bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
          Total votes
        </span>
      </div>

      <div className="space-y-4">
        {hasData ? (
          parties.map((party, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-foreground flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${getPartyColorClass(party.name)}`}></span>
                  {party.name}
                </span>
                <span className="text-foreground tracking-tight tabular-nums">
                  {party.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getPartyColorClass(party.name)}`}
                  style={{ width: `${party.percentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide">
                {party.votes.toLocaleString()} votes cast
              </p>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground italic flex flex-col items-center justify-center gap-2">
            Awaiting party telemetry data...
          </div>
        )}
      </div>
    </GlassCard>
  );
}
