import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetLiveElectionStats = async (req: Request, res: Response, next: NextFunction) => {
  const { electionId } = req.query;

  const normalizeKey = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "");

  try {
    let targetElection = null;

    if (electionId && typeof electionId === "string") {
      targetElection = await prisma.election.findUnique({
        where: { id: electionId },
      });
    } else {
      // Find the first ACTIVE election
      targetElection = await prisma.election.findFirst({
        where: { status: "ACTIVE" },
      });

      // If no ACTIVE election, find the most recently created election
      if (!targetElection) {
        targetElection = await prisma.election.findFirst({
          orderBy: { createdAt: "desc" },
        });
      }
    }

    const totalRegisteredVoters = await prisma.voter.count();

    if (!targetElection) {
      // Return empty stats structure if no election exists
      return res.status(200).json({
        success: true,
        data: {
          electionId: "",
          title: "No Election Configured",
          status: "DRAFT",
          votesCast: 0,
          totalRegisteredVoters,
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
        },
      });
    }

    const activeId = targetElection.id;

    // 1. Total votes cast in this election
    const votesCast = await prisma.vote.count({
      where: { electionId: activeId },
    });

    // 2. Real biometric verification failures and duplicate vote attempts
    const failedBiometricAttempts = await prisma.biometricAttempt.count({
      where: {
        electionId: activeId,
        status: "FAILED",
      },
    });

    const duplicateVoteAttempts = await prisma.duplicateVoteAttempt.count({
      where: {
        electionId: activeId,
      },
    });

    // 3. Voting pace data
    const votes = await prisma.vote.findMany({
      where: { electionId: activeId },
      select: { createdAt: true },
    });

    const intervals = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
    const paceMap = new Map(intervals.map((t) => [t, 0]));

    for (const vote of votes) {
      const hour = new Date(vote.createdAt).getHours();
      let timeBucket = "18:00";
      if (hour < 10) timeBucket = "08:00";
      else if (hour < 12) timeBucket = "10:00";
      else if (hour < 14) timeBucket = "12:00";
      else if (hour < 16) timeBucket = "14:00";
      else if (hour < 18) timeBucket = "16:00";

      paceMap.set(timeBucket, (paceMap.get(timeBucket) || 0) + 1);
    }

    const votingPaceData = Array.from(paceMap.entries()).map(([time, val]) => ({
      time,
      votes: val,
    }));

    // 4. Party performance data
    const candidateVotes = await prisma.vote.findMany({
      where: { electionId: activeId },
      include: {
        candidate: {
          select: {
            party: {
              select: {
                abbreviation: true,
              },
            },
          },
        },
      },
    });

    const partyVotesMap = new Map<string, number>();
    for (const vote of candidateVotes) {
      const party = vote.candidate.party.abbreviation;
      partyVotesMap.set(party, (partyVotesMap.get(party) || 0) + 1);
    }

    const partyColors: Record<string, "primary" | "secondary" | "tertiary" | "outline"> = {
      APC: "primary",
      PDP: "tertiary",
      LP: "secondary",
    };

    const partyPerformanceData = Array.from(partyVotesMap.entries()).map(([name, count]) => {
      const percentage = votesCast > 0 ? parseFloat(((count / votesCast) * 100).toFixed(1)) : 0;
      return {
        name,
        votes: count,
        percentage,
        color: partyColors[name] || "outline",
      };
    }).sort((a, b) => b.votes - a.votes);

    // 5. LGA Map Overlays
    const lgaVotes = await prisma.vote.findMany({
      where: { electionId: activeId },
      include: {
        voter: {
          select: {
            LGA: true,
            ward: true,
          },
        },
        candidate: {
          select: {
            party: {
              select: {
                abbreviation: true,
              },
            },
          },
        },
      },
    });

    const officialWards = await prisma.ward.findMany({
      select: {
        name: true,
        lgaName: true,
      },
    });

    const resolveWardName = (lgaName: string, wardName: string) => {
      const normalizedWard = normalizeKey(wardName);
      const normalizedLga = normalizeKey(lgaName);

      const exactMatch = officialWards.find(
        (ward) =>
          normalizeKey(ward.lgaName) === normalizedLga &&
          normalizeKey(ward.name) === normalizedWard,
      );

      if (exactMatch) {
        return exactMatch.name;
      }

      const fuzzyMatch = officialWards.find(
        (ward) =>
          normalizeKey(ward.lgaName) === normalizedLga &&
          (normalizedWard.includes(normalizeKey(ward.name)) ||
            normalizeKey(ward.name).includes(normalizedWard)),
      );

      return fuzzyMatch?.name || wardName;
    };


    const wardMap = new Map<
      string,
      {
        lgaName: string;
        wardName: string;
        total: number;
        partyCounts: Map<string, number>;
      }
    >();

    for (const vote of lgaVotes) {
      const lgaName = vote.voter.LGA || "Unknown LGA";
      const wardName = resolveWardName(lgaName, vote.voter.ward || "Unknown Ward");
      const party = vote.candidate.party.abbreviation;
      const key = `${lgaName}::${wardName}`;

      if (!wardMap.has(key)) {
        wardMap.set(key, {
          lgaName,
          wardName,
          total: 0,
          partyCounts: new Map(),
        });
      }

      const wardData = wardMap.get(key)!;
      wardData.total += 1;
      wardData.partyCounts.set(party, (wardData.partyCounts.get(party) || 0) + 1);
    }

    const wardStats = Array.from(wardMap.values()).map((data) => ({
      lgaName: data.lgaName,
      wardName: data.wardName,
      total: data.total,
      partyCounts: Object.fromEntries(data.partyCounts.entries()),
    }));
    const lgaMap = new Map<string, { total: number; partyCounts: Map<string, number> }>();
    for (const vote of lgaVotes) {
      const lga = vote.voter.LGA || "Unknown LGA";
      const party = vote.candidate.party.abbreviation;
      if (!lgaMap.has(lga)) {
        lgaMap.set(lga, { total: 0, partyCounts: new Map() });
      }
      const lgaData = lgaMap.get(lga)!;
      lgaData.total += 1;
      lgaData.partyCounts.set(party, (lgaData.partyCounts.get(party) || 0) + 1);
    }

    const mapOverlays = Array.from(lgaMap.entries()).map(([lgaName, data]) => {
      let leaderParty = "N/A";
      let maxVotes = 0;
      for (const [party, count] of data.partyCounts.entries()) {
        if (count > maxVotes) {
          maxVotes = count;
          leaderParty = party;
        }
      }
      const percentage = data.total > 0 ? Math.round((maxVotes / data.total) * 100) : 0;
      return {
        title: lgaName,
        votes: data.total,
        leader: leaderParty,
        percentage,
        color: partyColors[leaderParty] || "outline",
      };
    });

    // 6. Leader details
    const candidateStats = await prisma.vote.groupBy({
      by: ["candidateId"],
      where: { electionId: activeId },
      _count: {
        id: true,
      },
    });

    let leaderCandidateId = "";
    let maxCandidateVotes = 0;
    for (const stat of candidateStats) {
      if (stat._count.id > maxCandidateVotes) {
        maxCandidateVotes = stat._count.id;
        leaderCandidateId = stat.candidateId;
      }
    }

    let leader = {
      candidateName: "No Candidate",
      partyName: "N/A",
      votes: 0,
      percentage: 0,
    };

    if (leaderCandidateId) {
      const leaderCand = await prisma.candidate.findUnique({
        where: { id: leaderCandidateId },
        include: { party: true },
      });
      if (leaderCand) {
        leader = {
          candidateName: `${leaderCand.firstName} ${leaderCand.surname}`,
          partyName: `${leaderCand.party.abbreviation}`,
          votes: maxCandidateVotes,
          percentage: votesCast > 0 ? parseFloat(((maxCandidateVotes / votesCast) * 100).toFixed(1)) : 0,
        };
      }
    }

    // 7. Security alerts (fetched directly from the database table)
    const securityAlerts = await prisma.securityAlert.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return res.status(200).json({
      success: true,
      data: {
        electionId: activeId,
        title: targetElection.title,
        status: targetElection.status,
        votesCast,
        totalRegisteredVoters,
        failedBiometricAttempts,
        duplicateVoteAttempts,
        lastUpdatedAt: new Date().toISOString(),
        votingPaceData,
        partyPerformanceData,
        mapOverlays,
        wardStats,
        leader,
        securityAlerts,
      },
    });
  } catch (error) {
    console.error("Error fetching live election stats:", error);
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to fetch live election stats`));
  }
};
