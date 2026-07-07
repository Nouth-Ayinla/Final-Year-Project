"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Map, Search, Info, TrendingUp, Vote, CheckCircle2 } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { axiosInstance } from "@/app/lib/axios";

type MapOverlay = {
  title: string;
  votes: number;
  leader: string;
  percentage: number;
  color: "primary" | "tertiary" | string;
};

type VoteDistributionMapProps = {
  mapImageUrl?: string; // Kept for backwards compatibility
  overlays: MapOverlay[];
};

const ONDO_LGAS = [
  { id: "akoko_nw", name: "Akoko North-West", points: "160,40 210,35 230,70 190,80 160,65" },
  { id: "akoko_ne", name: "Akoko North-East", points: "210,35 260,40 270,75 230,70" },
  { id: "akoko_sw", name: "Akoko South-West", points: "160,65 190,80 180,120 140,110" },
  { id: "akoko_se", name: "Akoko South-East", points: "190,80 230,70 270,75 250,115 210,120" },
  { id: "ose", name: "Ose", points: "270,75 320,85 350,170 320,240 280,225 280,180 250,115" },
  { id: "owo", name: "Owo", points: "180,120 210,120 250,115 280,180 280,225 230,240 200,190" },
  { id: "akure_n", name: "Akure North", points: "140,110 180,120 200,190 170,200 130,150" },
  { id: "ifedore", name: "Ifedore", points: "90,95 140,110 130,150 95,155 75,130" },
  { id: "akure_s", name: "Akure South", points: "95,155 130,150 170,200 160,235 115,220" },
  { id: "idanre", name: "Idanre", points: "160,235 170,200 200,190 230,240 280,225 320,240 290,320 200,330 160,270" },
  { id: "ile_oluji", name: "Ile Oluji/Okeigbo", points: "45,140 75,130 95,155 115,220 105,265 55,250 45,190" },
  { id: "ondo_w", name: "Ondo West", points: "55,250 105,265 100,310 60,325 40,290" },
  { id: "ondo_e", name: "Ondo East", points: "105,265 160,270 200,330 145,340 100,310" },
  { id: "odigbo", name: "Odigbo", points: "40,290 60,325 100,310 145,340 200,330 220,390 180,440 90,420 40,360" },
  { id: "okitipupa", name: "Okitipupa", points: "90,420 140,430 130,480 80,480 60,440" },
  { id: "irele", name: "Irele", points: "140,430 180,440 200,490 155,490 130,480" },
  { id: "ese_odo", name: "Ese Odo", points: "60,440 80,480 130,480 155,490 145,530 75,535 50,500" },
  { id: "ilaje", name: "Ilaje", points: "75,535 145,530 155,490 200,490 220,550 160,570 90,570 50,550" }
];

const normalizeLgaName = (name: string) => {
  if (!name) return "";
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
};

const DEFAULT_LEGEND_PARTIES = [
  { abbreviation: "APC", name: "All Progressives Congress", color: "#D95300" },
  { abbreviation: "PDP", name: "People's Democratic Party", color: "#0EA5E9" },
  { abbreviation: "LP", name: "Labour Party", color: "#22C55E" },
  { abbreviation: "NNPP", name: "New Nigeria People's Party", color: "#EAB308" },
  { abbreviation: "APGA", name: "All Progressives Grand Alliance", color: "#10B981" },
  { abbreviation: "SDP", name: "Social Democratic Party", color: "#EF4444" },
  { abbreviation: "YPP", name: "Young Progressives Party", color: "#8B5CF6" },
];

const getPartyColor = (party?: string, customParties: any[] = []) => {
  if (!party) return "#78716C";
  const upper = party.toUpperCase();
  
  // Check defaults
  const def = DEFAULT_LEGEND_PARTIES.find(d => d.abbreviation === upper);
  if (def) return def.color;

  // Check custom parties
  const custom = customParties.find(p => p.abbreviation.toUpperCase() === upper);
  if (custom) return custom.primaryColor;
  
  return "#78716C";
};

const getBoundingBox = (pointsStr: string) => {
  const pairs = pointsStr.trim().split(/\s+/);
  const xs = pairs.map((p) => parseFloat(p.split(",")[0]));
  const ys = pairs.map((p) => parseFloat(p.split(",")[1]));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export function VoteDistributionMap({ overlays }: VoteDistributionMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredLgaId, setHoveredLgaId] = useState<string | null>(null);
  const [selectedLgaId, setSelectedLgaId] = useState<string | null>(null);
  const [customParties, setCustomParties] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    votes: number;
    leader: string;
    percentage: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    votes: 0,
    leader: "",
    percentage: 0,
  });

  const listContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load custom parties and database wards on mount
  useEffect(() => {
    const stored = localStorage.getItem("registered_parties");
    if (stored) {
      try {
        setCustomParties(JSON.parse(stored));
      } catch (e) {}
    }

    const fetchWards = async () => {
      try {
        const res = await axiosInstance.get("/ward/list");
        if (res.data && res.data.success) {
          setWards(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch wards:", err);
      }
    };
    fetchWards();
  }, []);

  const allPartiesList = useMemo(() => {
    const combined = [...DEFAULT_LEGEND_PARTIES];
    for (const p of customParties) {
      if (!combined.some(d => d.abbreviation.toUpperCase() === p.abbreviation.toUpperCase())) {
        combined.push({
          abbreviation: p.abbreviation,
          name: p.name,
          color: p.primaryColor,
        });
      }
    }
    return combined;
  }, [customParties]);

  // Match the database overlay stats to our SVG geometry list
  const lgaData = useMemo(() => {
    return ONDO_LGAS.map((lga) => {
      const match = overlays.find(
        (o) => normalizeLgaName(o.title) === normalizeLgaName(lga.name)
      );
      return {
        ...lga,
        votes: match ? match.votes : 0,
        leader: match ? match.leader : "Pending",
        percentage: match ? match.percentage : 0,
      };
    });
  }, [overlays]);

  // Compute bounding box dynamic viewBox
  const defaultViewBox = "0 0 350 600";
  const viewBox = useMemo(() => {
    if (selectedLgaId) {
      const selectedLga = ONDO_LGAS.find((l) => l.id === selectedLgaId);
      if (selectedLga) {
        const { x, y, width, height } = getBoundingBox(selectedLga.points);
        const padding = 25;
        return `${x - padding} ${y - padding} ${width + padding * 2} ${height + padding * 2}`;
      }
    }
    return defaultViewBox;
  }, [selectedLgaId]);

  // Sort local governments by vote count (highest first)
  const sortedLgas = useMemo(() => {
    return [...lgaData].sort((a, b) => b.votes - a.votes);
  }, [lgaData]);

  // Filtered by search query
  const filteredLgas = useMemo(() => {
    return sortedLgas.filter((lga) =>
      lga.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedLgas, searchQuery]);

  // Scroll matching item into view in the sidebar list when map LGA is hovered
  useEffect(() => {
    if (hoveredLgaId && itemRefs.current[hoveredLgaId]) {
      itemRefs.current[hoveredLgaId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [hoveredLgaId]);

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip((prev) => ({
      ...prev,
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15,
    }));
  };

  const handlePolygonMouseEnter = (
    lga: typeof lgaData[number],
    e: React.MouseEvent<SVGPolygonElement>
  ) => {
    setHoveredLgaId(lga.id);
    setTooltip({
      visible: true,
      x: 0, // updated on mouseMove
      y: 0,
      title: lga.name,
      votes: lga.votes,
      leader: lga.leader,
      percentage: lga.percentage,
    });
  };

  const handlePolygonMouseLeave = () => {
    setHoveredLgaId(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const selectedLgaObj = useMemo(() => {
    return ONDO_LGAS.find(l => l.id === selectedLgaId);
  }, [selectedLgaId]);

  const activeWards = useMemo(() => {
    if (!selectedLgaObj) return [];
    return wards.filter(
      (w) => normalizeLgaName(w.lgaName) === normalizeLgaName(selectedLgaObj.name)
    );
  }, [selectedLgaObj, wards]);

  const isAnySelected = selectedLgaId !== null;

  return (
    <GlassCard className="rounded-xl overflow-hidden flex flex-col h-[650px] border border-border/80">
      {/* Card Header */}
      <div className="p-5 border-b border-border bg-card flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Map size={20} className="text-primary" />
            Ondo State LGA Telemetry Map
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive GIS overlay of local government reporting data.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Live Sync
          </span>
          <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-full border border-stone-200">
            18 LGAs
          </span>
        </div>
      </div>

      {/* Main Grid: Map & Sidebar List */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Map Container */}
        <div
          className="flex-1 relative bg-slate-50 flex items-center justify-center p-4 min-h-[300px] md:min-h-0"
          style={{
            backgroundImage: "radial-gradient(#e2e8f0 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Isolation Cancel/Return Button */}
          {selectedLgaId && (
            <button
              onClick={() => setSelectedLgaId(null)}
              className="absolute top-4 left-4 z-40 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              ← Return to State Map
            </button>
          )}

          {/* SVG Map of Ondo State */}
          <svg
            viewBox={viewBox}
            className="w-full h-full max-h-[500px] drop-shadow-lg select-none transition-all duration-500 ease-in-out"
            onMouseMove={handleMouseMove}
          >
            <g className="cursor-pointer">
              {lgaData.map((lga) => {
                const isHovered = hoveredLgaId === lga.id;
                const isSelected = selectedLgaId === lga.id;
                const isPending = lga.votes === 0;

                // Fills based on leading party and voting density
                let fill = "#f1f5f9"; // neutral
                let fillOpacity = 0.85;

                if (!isPending) {
                  fill = getPartyColor(lga.leader, customParties);
                  fillOpacity = 0.5 + (lga.percentage / 100) * 0.45;
                }

                // Opacity dimming if another LGA is isolated/focused
                const opacity = isAnySelected ? (isSelected ? 1.0 : 0.08) : fillOpacity;

                return (
                  <polygon
                    key={lga.id}
                    points={lga.points}
                    fill={fill}
                    fillOpacity={opacity}
                    stroke={isSelected ? "#b91c1c" : (isHovered ? "#1c1917" : "#cbd5e1")}
                    strokeWidth={isSelected ? 3.0 : (isHovered ? 2.5 : 1.2)}
                    className="transition-all duration-200 ease-out"
                    style={{
                      filter: isHovered ? "drop-shadow(0px 4px 10px rgba(0,0,0,0.15))" : "none",
                      transform: isHovered ? "scale(1.015)" : "scale(1)",
                      transformOrigin: "center",
                    }}
                    onMouseEnter={(e) => handlePolygonMouseEnter(lga, e)}
                    onMouseLeave={handlePolygonMouseLeave}
                    onClick={() => {
                      setSelectedLgaId(lga.id === selectedLgaId ? null : lga.id);
                    }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Floating Tooltip inside relative container */}
          {tooltip.visible && !selectedLgaId && (
            <div
              className="absolute pointer-events-none bg-card/95 backdrop-blur-md border border-border p-3.5 rounded-lg shadow-xl z-30 w-52 flex flex-col gap-1.5 transition-all duration-75"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <h4 className="font-bold text-sm text-foreground border-b border-border/60 pb-1 flex items-center gap-1">
                <Map size={14} className="text-primary" />
                {tooltip.title}
              </h4>
              {tooltip.votes > 0 ? (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Vote size={12} />
                      Votes Cast:
                    </span>
                    <span className="font-extrabold text-foreground">{tooltip.votes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp size={12} />
                      Lead Party:
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: getPartyColor(tooltip.leader, customParties) }}
                    >
                      {tooltip.leader}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Lead %:
                    </span>
                    <span className="font-extrabold text-foreground">{tooltip.percentage}%</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground italic py-1 flex items-center gap-1">
                  <Info size={12} />
                  No reports synced yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar List Column */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-stone-50/40 flex flex-col h-[300px] md:h-auto overflow-hidden">
          {/* Search bar inside Sidebar */}
          <div className="p-3 border-b border-border bg-card flex items-center gap-2 shrink-0">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter local government..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Scrollable list */}
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto p-2 space-y-1.5"
          >
            {selectedLgaId ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-stone-100/50 rounded-md">
                  <span className="font-bold text-stone-700 text-xs">Wards in {selectedLgaObj?.name}</span>
                  <span className="px-2 py-0.5 bg-stone-200 text-stone-800 text-[10px] font-bold rounded-full">
                    {activeWards.length}
                  </span>
                </div>
                {activeWards.length > 0 ? (
                  activeWards.map((ward) => (
                    <div
                      key={ward.id}
                      className="p-3 rounded-lg border border-border bg-card hover:bg-stone-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-foreground">{ward.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Code: {ward.code}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                        Active
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-10 italic">
                    No wards mapped yet in {selectedLgaObj?.name}.
                  </div>
                )}
              </div>
            ) : filteredLgas.length > 0 ? (
              filteredLgas.map((lga) => {
                const isHovered = hoveredLgaId === lga.id;
                const isSelected = selectedLgaId === lga.id;
                const isPending = lga.votes === 0;

                return (
                  <div
                    key={lga.id}
                    ref={(el) => {
                      itemRefs.current[lga.id] = el;
                    }}
                    onMouseEnter={() => setHoveredLgaId(lga.id)}
                    onMouseLeave={() => setHoveredLgaId(null)}
                    onClick={() => {
                      setSelectedLgaId(lga.id === selectedLgaId ? null : lga.id);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition-all duration-200 ${
                      isHovered
                        ? "border-primary bg-primary/5 shadow-sm scale-[0.99] translate-x-1"
                        : isSelected
                        ? "border-primary/80 bg-stone-100"
                        : "border-border bg-card hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold text-foreground">{lga.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {isPending ? (
                          "0 votes registered"
                        ) : (
                          <>
                            <span className="font-semibold text-foreground">
                              {lga.votes.toLocaleString()}
                            </span>{" "}
                            votes cast
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {isPending ? (
                        <span className="px-2 py-0.5 text-[9px] font-semibold text-stone-500 bg-stone-100 border border-stone-200 rounded-full">
                          Awaiting
                        </span>
                      ) : (
                        <>
                          <span
                            className="px-2 py-0.5 text-[9px] font-bold border rounded-full"
                            style={{
                              color: getPartyColor(lga.leader, customParties),
                              backgroundColor: `${getPartyColor(lga.leader, customParties)}15`,
                              borderColor: `${getPartyColor(lga.leader, customParties)}30`
                            }}
                          >
                            {lga.leader}
                          </span>
                          <span className="text-[10px] font-bold text-foreground">
                            {lga.percentage}% lead
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs text-muted-foreground py-10 italic">
                No matching LGAs found
              </div>
            )}
          </div>

          {/* Map Legend (Moved outside map to Sidebar bottom) */}
          <div className="p-3 border-t border-border bg-card shrink-0 text-[10px] flex flex-col gap-1.5">
            <p className="font-bold text-foreground border-b border-border pb-1">
              Party Colors
            </p>
            <div className="flex flex-wrap gap-x-2.5 gap-y-1 max-h-[60px] overflow-y-auto">
              {allPartiesList.map((party) => (
                <div key={party.abbreviation} className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded border border-black/10 shrink-0"
                    style={{ backgroundColor: party.color }}
                  ></span>
                  <span className="font-medium">{party.abbreviation}</span>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-stone-300 border border-black/10 animate-pulse shrink-0"></span>
                <span className="text-muted-foreground font-medium">Pending/No Votes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
