"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import { VoteDistributionMap } from "@/components/custom/VoteDistributionMap";
import { VotingPaceChart } from "@/components/custom/VotingPaceChart";
import { TurnoutProgressChart } from "@/components/custom/TurnoutProgressChart";
import { PartyPerformanceChart } from "@/components/custom/PartyPerformanceChart";
import { LeaderCard } from "@/components/custom/LeaderCard";
import {
  SecurityMonitoringCard,
  type SecurityAlert,
} from "@/components/custom/SecurityMonitoringCard";
import { axiosInstance } from "@/app/lib/axios";

type CounterSnapshot = {
  votesCast: number;
  failedBiometricAttempts: number;
  duplicateVoteAttempts: number;
  lastUpdatedAt: string;
};

type LiveStats = {
  electionId: string;
  title: string;
  status: string;
  votesCast: number;
  totalRegisteredVoters: number;
  failedBiometricAttempts: number;
  duplicateVoteAttempts: number;
  lastUpdatedAt: string;
  votingPaceData: { time: string; votes: number }[];
  partyPerformanceData: {
    name: string;
    votes: number;
    percentage: number;
    color: "primary" | "tertiary" | "secondary" | "outline";
  }[];
  mapOverlays: {
    title: string;
    votes: number;
    leader: string;
    percentage: number;
    color: "primary" | "tertiary";
  }[];
  wardStats?: any[];
  leader: {
    candidateName: string;
    partyName: string;
    votes: number;
    percentage: number;
  };
  securityAlerts: any[];
};

export default function DashboardLivePage() {
  const { profile } = useAuthStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [stats, setStats] = useState<LiveStats>({
    electionId: "",
    title: "Live Operations",
    status: "DRAFT",
    votesCast: 0,
    totalRegisteredVoters: 0,
    failedBiometricAttempts: 0,
    duplicateVoteAttempts: 0,
    lastUpdatedAt: new Date().toISOString(),
    votingPaceData: [
      { time: "08:00", votes: 0 },
      { time: "10:00", votes: 0 },
      { time: "12:00", votes: 0 },
      { time: "14:00", votes: 0 },
      { time: "16:00", votes: 0 },
      { time: "18:00", votes: 0 },
    ],
    partyPerformanceData: [],
    mapOverlays: [],
    wardStats: [],
    leader: {
      candidateName: "No Candidate",
      partyName: "N/A",
      votes: 0,
      percentage: 0,
    },
    securityAlerts: [],
  });

  const fetchLiveStats = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const response = await axiosInstance.get("/election/live-stats");
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching live election stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch live stats on mount
  useEffect(() => {
    setLoading(true);
    fetchLiveStats();
  }, []);

  // Set up polling interval (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const turnoutPercentage = useMemo(() => {
    if (!stats.totalRegisteredVoters) return 0;
    return Math.round((stats.votesCast / stats.totalRegisteredVoters) * 100);
  }, [stats.votesCast, stats.totalRegisteredVoters]);

  const maxPaceVotes = useMemo(() => {
    const maxVal = Math.max(...stats.votingPaceData.map((d) => d.votes), 0);
    return maxVal > 0 ? maxVal * 1.2 : 100;
  }, [stats.votingPaceData]);

  // Format security alerts for UI component
  const uiSecurityAlerts = useMemo((): SecurityAlert[] => {
    if (!stats.securityAlerts || stats.securityAlerts.length === 0) return [];
    return stats.securityAlerts.map((alert: any) => {
      const minAgo = Math.round((Date.now() - new Date(alert.createdAt).getTime()) / 60000);
      let timeStr = "Just now";
      if (minAgo > 0) {
        timeStr = minAgo === 1 ? "1 min ago" : `${minAgo} mins ago`;
      }
      return {
        type: alert.type === "success" ? "success" : "warning",
        title: alert.title,
        description: alert.description,
        timestamp: timeStr,
      };
    });
  }, [stats.securityAlerts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading Live Operations Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Page header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary tracking-wider uppercase">
            {stats.title} ({stats.status})
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Live Operations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry and validation from live polling units.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => fetchLiveStats(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <RefreshCcw size={14} />
            )}
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Total votes</span>
          <span className="text-2xl font-extrabold text-primary tabular-nums my-2">
            {stats.votesCast.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground opacity-70">
            Updated {new Date(stats.lastUpdatedAt).toLocaleTimeString()}
          </span>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Turnout</span>
          <span className="text-2xl font-extrabold text-foreground tabular-nums my-2">
            {turnoutPercentage}%
          </span>
          <span className="text-[10px] text-muted-foreground opacity-70">
            of {stats.totalRegisteredVoters.toLocaleString()} registered
          </span>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Failed Biometrics</span>
          <span className="text-2xl font-extrabold text-amber-600 tabular-nums my-2">
            {stats.failedBiometricAttempts.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground opacity-70">
            Verification checks failed
          </span>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Duplicate Attempts</span>
          <span className="text-2xl font-extrabold text-rose-600 tabular-nums my-2">
            {stats.duplicateVoteAttempts.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground opacity-70">
            Prevented double-voting attempts
          </span>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Live Map */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <VoteDistributionMap
            mapImageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBC1hWpD2P6t1-jJrMpbcLO6YP14GUP3HTckMgpwG9YrcxNG0Ak0JOqHWjaMSV-eUjZAQ7438zyCTuNgJWjUG9rj3icY6mOVEi7dAI6V_Zndn2UvLNi3iPG1H0v5HXRSwtkra8oWO69L4P3YxPZ-cPqngqz7KTFkeUQmERWtDWQiRjMavbmkgrxRUV1dkpupOiYPoctAgOW9MRfUslr2GiV7lJmD7rxsTpaPMDOWu71F298D52AZIJW01KnXeuv-pMvR84tp0MKCNk"
            overlays={stats.mapOverlays}
            wardStats={stats.wardStats}
          />

          {/* Secondary Row: Performance Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VotingPaceChart data={stats.votingPaceData} maxVotes={maxPaceVotes} />
            <TurnoutProgressChart
              percentage={turnoutPercentage}
              votesCast={stats.votesCast}
              totalVoters={stats.totalRegisteredVoters}
            />
          </div>
        </div>

        {/* Side Analytics: Party Counts & Leaderboard */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <LeaderCard
            candidateName={stats.leader.candidateName}
            partyName={stats.leader.partyName}
            votes={stats.leader.votes}
            percentage={stats.leader.percentage}
          />
          <PartyPerformanceChart parties={stats.partyPerformanceData} />
          <SecurityMonitoringCard alerts={uiSecurityAlerts} />
        </div>
      </div>


      <footer className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 Ondo State Independent Electoral Commission (ODIEC). All election data is encrypted and verified via decentralized consensus.
        </p>
      </footer>
    </div>
  );
}
