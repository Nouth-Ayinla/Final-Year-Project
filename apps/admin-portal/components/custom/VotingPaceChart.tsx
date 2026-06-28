import { GlassCard } from "./GlassCard";
import { TrendingUp } from "lucide-react";

type VotingPaceData = {
  time: string;
  votes: number;
};

type VotingPaceChartProps = {
  data: VotingPaceData[];
  maxVotes?: number;
};

export function VotingPaceChart({
  data,
  maxVotes = 100,
}: VotingPaceChartProps) {
  const maxVotesInSeries = Math.max(...data.map((d) => d.votes));
  
  // Dynamic scale calculation to prevent dividing by zero
  const calculatedMax = maxVotesInSeries > 0 ? maxVotesInSeries * 1.25 : 10;

  const formatVotes = (votes: number) => {
    if (votes >= 1000) {
      return `${(votes / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    }
    return votes.toString();
  };

  return (
    <GlassCard className="p-5 flex flex-col h-[280px]">
      {/* Title */}
      <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <TrendingUp size={16} className="text-primary" />
          Voting Pace (Last 6 Hours)
        </h4>
        <span className="text-[10px] text-muted-foreground bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
          Live pace
        </span>
      </div>

      {/* Chart Body */}
      <div className="flex-1 relative flex items-end justify-between gap-3 px-1 mt-6 h-36">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="w-full border-t border-dashed border-stone-200"></div>
          <div className="w-full border-t border-dashed border-stone-200"></div>
          <div className="w-full border-t border-dashed border-stone-200"></div>
        </div>

        {/* Bars */}
        {data.map((item, idx) => {
          const isPeak = item.votes === maxVotesInSeries && maxVotesInSeries > 0;
          const heightPercent = Math.min(((item.votes / calculatedMax) * 100), 100);
          
          // Ensure a minimum visual height for zero values so the bar is interactable
          const visualHeight = item.votes > 0 ? `${heightPercent}%` : "6px";
          const barColor = item.votes > 0 
            ? "bg-gradient-to-t from-primary/90 to-primary" 
            : "bg-stone-200";

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center group relative h-full justify-end"
            >
              {/* Tooltip on hover or peak label */}
              {isPeak ? (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-white bg-primary rounded-full px-2 py-0.5 shadow-sm z-10 transition-all">
                  {formatVotes(item.votes)}
                </div>
              ) : (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-stone-700 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-10">
                  {formatVotes(item.votes)}
                </div>
              )}

              {/* Bar shape */}
              <div
                className={`w-full rounded-t-md relative transition-all duration-500 cursor-pointer ${barColor} group-hover:opacity-90`}
                style={{ height: visualHeight }}
              >
                {/* Subtle glow on peak bar */}
                {isPeak && (
                  <div className="absolute inset-0 rounded-t-md ring-2 ring-primary/30 animate-pulse"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between mt-3 text-[10px] font-bold text-muted-foreground px-1 border-t border-border/40 pt-2">
        {data.map((item, idx) => (
          <span key={idx} className="w-12 text-center">{item.time}</span>
        ))}
      </div>
    </GlassCard>
  );
}
