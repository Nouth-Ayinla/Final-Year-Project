import { Award, User } from "lucide-react";

type LeaderCardProps = {
  candidateName: string;
  partyName: string;
  votes: number;
  percentage: number;
  avatarUrl?: string;
};

export function LeaderCard({
  candidateName,
  partyName,
  votes,
  percentage,
  avatarUrl,
}: LeaderCardProps) {
  const hasActiveLeader = votes > 0 && candidateName !== "No Candidate" && candidateName !== "No Leader";

  // Initials generation
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Get background gradient based on winning party
  const getBgGradient = (party: string) => {
    switch (party?.toUpperCase()) {
      case "APC":
        return "bg-gradient-to-br from-[#E05A00] to-[#B83D00] text-white";
      case "PDP":
        return "bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] text-white";
      case "LP":
        return "bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white";
      default:
        return "bg-gradient-to-br from-primary to-primary/80 text-white";
    }
  };

  if (!hasActiveLeader) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-[250px] transition-all">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-5">
            <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 border border-stone-200 rounded-full text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
              AWAITING TELEMETRY
            </span>
            <Award size={36} className="text-stone-400 opacity-60" />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
              <User size={28} />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-800 leading-tight">No Leader Yet</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Awaiting live votes from polling units</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-stone-100 border border-stone-200 p-2.5 rounded-lg">
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Votes</p>
              <p className="text-sm font-extrabold text-stone-800 mt-0.5">0</p>
            </div>
            <div className="bg-stone-100 border border-stone-200 p-2.5 rounded-lg">
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Percentage</p>
              <p className="text-sm font-extrabold text-stone-800 mt-0.5">0.0%</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between h-[250px] transition-all duration-500 ${getBgGradient(partyName)}`}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            LIVE LEADER
          </span>
          <Award size={36} className="text-white/80 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden bg-white/90 flex items-center justify-center text-primary shrink-0 shadow-md">
            {avatarUrl ? (
              <img
                alt="Leading Candidate"
                src={avatarUrl}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-extrabold text-lg" style={{ color: getPartyColor(partyName) }}>
                {getInitials(candidateName)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-lg leading-tight tracking-tight text-white">{candidateName}</h3>
            <span className="inline-block mt-0.5 text-xs font-bold bg-white/25 px-2 py-0.5 rounded-md text-white border border-white/10 uppercase">
              {partyName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/15 p-2.5 rounded-lg border border-white/5 backdrop-blur-sm">
            <p className="text-[9px] text-white/80 uppercase font-bold tracking-wider">Votes</p>
            <p className="text-sm font-extrabold text-white mt-0.5 tabular-nums">
              {votes.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/15 p-2.5 rounded-lg border border-white/5 backdrop-blur-sm">
            <p className="text-[9px] text-white/80 uppercase font-bold tracking-wider">Percentage</p>
            <p className="text-sm font-extrabold text-white mt-0.5 tabular-nums">
              {percentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Decorative background shape */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );
}

// Inline helper for party colors to keep it self-contained
const getPartyColor = (party?: string) => {
  if (!party) return "#78716C";
  switch (party.toUpperCase()) {
    case "APC":
      return "#D95300";
    case "PDP":
      return "#0EA5E9";
    case "LP":
      return "#22C55E";
    default:
      return "#78716C";
  }
};
