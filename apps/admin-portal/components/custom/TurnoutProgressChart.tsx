import { GlassCard } from "./GlassCard";
import { Percent } from "lucide-react";

type TurnoutProgressChartProps = {
  percentage: number;
  votesCast: number;
  totalVoters: number;
};

export function TurnoutProgressChart({
  percentage,
  votesCast,
  totalVoters,
}: TurnoutProgressChartProps) {
  // SVG circular properties
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(percentage, 100) / 100);

  return (
    <GlassCard className="p-5 flex flex-col h-[280px]">
      {/* Title */}
      <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Percent size={16} className="text-primary" />
          Turnout Progress
        </h4>
        <span className="text-[10px] text-muted-foreground bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
          Real-time
        </span>
      </div>

      {/* Content Body */}
      <div className="flex-1 flex items-center justify-center gap-6 mt-1">
        {/* Radial Progress Circle */}
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              className="text-stone-100"
              stroke="currentColor"
              fill="none"
              strokeWidth="8"
              cx="50"
              cy="50"
              r={radius}
            />
            {/* Active Progress */}
            <circle
              className="text-primary transition-all duration-1000 ease-out"
              stroke="currentColor"
              fill="none"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              cx="50"
              cy="50"
              r={radius}
            />
          </svg>
          {/* Inner Centered Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-foreground tracking-tight">
              {percentage}%
            </span>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
              Turnout
            </span>
          </div>
        </div>

        {/* Text Statistics Details */}
        <div className="flex-1 flex flex-col justify-center space-y-3">
          <div className="bg-stone-50 border border-stone-100 p-2.5 rounded-lg">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
              Votes Synthesized
            </span>
            <span className="text-base font-extrabold text-foreground tracking-tight tabular-nums block mt-0.5">
              {votesCast.toLocaleString()}
            </span>
          </div>

          <div className="bg-stone-50 border border-stone-100 p-2.5 rounded-lg">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
              Registered Cohort
            </span>
            <span className="text-base font-extrabold text-stone-600 tracking-tight tabular-nums block mt-0.5">
              {totalVoters.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
