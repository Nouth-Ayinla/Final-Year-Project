"use client";

import { useElectionStore } from "@/app/store/useElectionStore";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircleIcon,
  Vote,
  Loader2,
  Flag,
  Venus,
  MapPin,
  ArrowRight,
} from "lucide-react";
import DeleteCandidate from "./DeleteCandidate";
import { EmptyState } from "@/components/general/EmptyState";

interface Candidate {
  id: string;
  firstName: string;
  surname: string;
  otherName?: string | null;
  party?: string | { name: string } | null;
  electionId: string;
  state: string;
  imageUrl?: string | null;
  sex: string;
  _count: { votes: number };
}

interface Props {
  electionId: string;
}

export default function ElectionCandidateCard({ electionId }: Props) {
  const {
    CandidatesInElection,
    isGettingCandidatesInElection,
    GetCandidatesInElections,
  } = useElectionStore();

  const safeCandidates = Array.isArray(CandidatesInElection)
    ? CandidatesInElection
    : [];

  useEffect(() => {
    GetCandidatesInElections(electionId);
  }, [electionId, GetCandidatesInElections]);

  if (isGettingCandidatesInElection) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="size-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Fetching candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Candidates</h2>

        <Link
          href={`/election/${electionId}/candidate`}
          className={buttonVariants()}
        >
          <PlusCircleIcon className="mr-2 size-4" />
          Add Candidate
        </Link>
      </div>

      {safeCandidates.length === 0 ? (
        <EmptyState
          title="No Candidates Added"
          description="Add a candidate to this election."
          buttonText="Add Candidate"
          href={`/election/${electionId}/candidate`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeCandidates.map((candidate: Candidate) => {
            const fullName = `${candidate.surname} ${candidate.firstName} ${
              candidate.otherName || ""
            }`.trim();

            return (
              <Card
                key={candidate.id}
                className="group flex flex-col sm:flex-row items-center gap-5 p-4 border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden transition-all duration-300 hover:border-primary/30"
              >
                {/* Left: Circular Avatar with vote count and delete triggers */}
                <div className="relative shrink-0 mt-2 sm:mt-0">
                  <div className="relative h-20 w-20 rounded-full border border-border overflow-hidden shadow-inner bg-stone-50">
                    <Image
                      src={candidate.imageUrl || "/placeholder.png"}
                      alt={fullName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {/* Delete trigger floating */}
                  <div className="absolute -top-2 -left-2 scale-90">
                    <DeleteCandidate
                      candidate={{
                        id: candidate.id,
                        firstName: candidate.firstName,
                        surname: candidate.surname,
                        party:
                          typeof candidate.party === "object"
                            ? candidate.party?.name || "Independent"
                            : candidate.party || "Independent",
                      }}
                    />
                  </div>
                </div>

                {/* Middle Content: Name, Votes, Metadata */}
                <div className="flex-1 min-w-0 space-y-2 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-base font-extrabold text-foreground truncate">
                      {fullName}
                    </h4>
                    <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full self-center sm:self-auto shrink-0">
                      <Vote className="size-3.5" />
                      <span>{candidate._count?.votes ?? 0} votes</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50 text-[11px] leading-relaxed">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">Party</span>
                      <span className="font-semibold text-foreground truncate block">
                        {typeof candidate.party === "object"
                          ? candidate.party?.name
                          : candidate.party || "Independent"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">Gender</span>
                      <span className="font-semibold text-foreground block capitalize">
                        {candidate.sex.toLowerCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">State of Origin</span>
                      <span className="font-semibold text-foreground truncate block">
                        {candidate.state}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="shrink-0 w-full sm:w-auto">
                  <Link
                    href={`/election/${electionId}/candidate/${candidate.id}/edit`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "w-full sm:w-auto flex items-center justify-center gap-1.5",
                    })}
                  >
                    <span>Edit</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}