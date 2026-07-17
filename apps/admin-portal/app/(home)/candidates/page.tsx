"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useElectionStore } from "@/app/store/useElectionStore";
import AdminGuard from "@/components/guard/AdminGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BadgeCheck,
  PlusCircle,
  Pencil,
  Loader2,
  Flag,
  MapPin,
  User,
  Vote,
  Sparkles,
  Search,
} from "lucide-react";
import DeleteCandidate from "./_components/DeleteCandidate";
import { EmptyState } from "@/components/general/EmptyState";
import { Input } from "@/components/ui/input";

export default function CandidatesManagementPage() {
  const {
    elections,
    getElections,
    isGettingElections,
    CandidatesInElection,
    isGettingCandidatesInElection,
    GetCandidatesInElections,
    parties,
    getParties,
  } = useElectionStore();

  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Load elections and parties on mount
  useEffect(() => {
    getElections().then((fetchedElections) => {
      const activeElection = fetchedElections.find((e: any) => e.status === "ACTIVE");
      if (activeElection) {
        setSelectedElectionId(activeElection.id);
      } else if (fetchedElections.length > 0) {
        setSelectedElectionId(fetchedElections[0].id);
      }
    });
    getParties();
  }, [getElections, getParties]);

  // Load candidates when election selection changes
  useEffect(() => {
    if (selectedElectionId) {
      GetCandidatesInElections(selectedElectionId);
    }
  }, [selectedElectionId, GetCandidatesInElections]);

  const selectedElection = elections.find((e) => e.id === selectedElectionId);

  // Filter candidates based on search
  const filteredCandidates = (CandidatesInElection || []).filter((candidate: any) => {
    const fullName = `${candidate.firstName} ${candidate.surname} ${candidate.otherName || ""}`.toLowerCase();
    const partyName = typeof candidate.party === "string" 
      ? candidate.party.toLowerCase()
      : (candidate.party?.name || "").toLowerCase();
    const lga = (candidate.LGA || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || partyName.includes(query) || lga.includes(query);
  });

  return (
    <AdminGuard>
      <div className="space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <BadgeCheck className="size-8 text-primary" />
              Candidate Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage candidates, deputies, profile images, and party representations.
            </p>
          </div>
        </div>

        {/* Election Selector Bar */}
        <Card className="border border-border/80 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex flex-col gap-1 w-full md:max-w-md">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Election
              </label>
              {isGettingElections ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Loading elections...
                </div>
              ) : (
                <Select
                  value={selectedElectionId}
                  onValueChange={setSelectedElectionId}
                >
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Choose an election to manage" />
                  </SelectTrigger>
                  <SelectContent>
                    {elections.map((election) => (
                      <SelectItem key={election.id} value={election.id}>
                        {election.title} ({election.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedElectionId && (
              <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 justify-end">
                <Link
                  href={`/election/${selectedElectionId}/candidate`}
                  className={buttonVariants({
                    className: "w-full md:w-auto",
                  })}
                >
                  <PlusCircle className="mr-2 size-4" />
                  Add Candidate
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedElectionId ? (
          <div className="space-y-6">
            {/* Search and stats bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/30 p-4 rounded-xl border border-border/50">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates by name, party, or LGA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>
                  Active Election:{" "}
                  <Badge variant={selectedElection?.status === "ACTIVE" ? "default" : "secondary"} className="ml-1.5 font-bold">
                    {selectedElection?.status}
                  </Badge>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  Candidates: <span className="font-semibold text-foreground">{(CandidatesInElection || []).length}</span>
                </div>
              </div>
            </div>

            {/* Candidates Grid */}
            {isGettingCandidatesInElection ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="size-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground animate-pulse">Loading candidate roster...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <EmptyState
                title={searchQuery ? "No search results" : "No Candidates Registered"}
                description={searchQuery ? "Try refining your query search phrase." : "This election does not have any candidates registered yet."}
                buttonText="Add Your First Candidate"
                href={`/election/${selectedElectionId}/candidate`}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map((candidate: any) => {
                  const fullName = `${candidate.surname} ${candidate.firstName} ${
                    candidate.otherName || ""
                  }`.trim();

                  // Map candidate party details to display correct primary colors
                  const matchedParty = parties.find(
                    (p) => 
                      p.abbreviation === candidate.party || 
                      p.id === candidate.partyId ||
                      p.name === candidate.party ||
                      (typeof candidate.party === "object" && p.id === candidate.party?.id)
                  );

                  const partyColor = matchedParty?.primaryColor || "#64748b";
                  const partyAbbr = matchedParty?.abbreviation || (typeof candidate.party === "string" ? candidate.party : candidate.party?.abbreviation || "IND");

                  return (
                    <Card
                      key={candidate.id}
                      className="group relative flex flex-col justify-between overflow-hidden border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
                    >
                      {/* Color strip indicating party brand color */}
                      <div 
                        className="h-1.5 w-full absolute top-0 left-0 transition-all duration-300 group-hover:h-2"
                        style={{ backgroundColor: partyColor }}
                      />

                      <CardHeader className="pt-6 pb-4">
                        <div className="flex items-start gap-4">
                          <div className="relative size-16 rounded-full border border-border overflow-hidden bg-muted shadow-inner flex-shrink-0">
                            <Image
                              src={candidate.imageUrl || "/placeholder.png"}
                              alt={fullName}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Badge 
                              style={{ 
                                backgroundColor: `${partyColor}15`, 
                                color: partyColor,
                                borderColor: `${partyColor}30` 
                              }}
                              variant="outline"
                              className="font-bold tracking-wide uppercase px-2 py-0.5 text-[10px]"
                            >
                              <Flag className="size-3 mr-1 inline" fill={partyColor} />
                              {partyAbbr}
                            </Badge>

                            <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-1">
                              {fullName}
                            </h3>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pb-6 pt-0">
                        {/* Summary details */}
                        <div className="grid grid-cols-2 gap-3 text-xs border-y border-border/50 py-3 my-2">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="size-3.5 text-primary/70" />
                            <span className="truncate">{candidate.LGA || "Statewide"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="size-3.5 text-primary/70" />
                            <span>{candidate.sex}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                            <Sparkles className="size-3.5 text-primary/70" />
                            <span className="truncate">{candidate.education} Education</span>
                          </div>
                        </div>

                        {/* Vote count & Action Buttons */}
                        <div className="flex items-center justify-between mt-2 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Vote className="size-4" />
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase leading-none">Votes Cast</p>
                              <p className="text-sm font-extrabold text-foreground tabular-nums mt-1">
                                {candidate._count?.votes || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/election/${selectedElectionId}/candidate/${candidate.id}/edit`}
                              className={buttonVariants({
                                variant: "outline",
                                size: "icon",
                              })}
                            >
                              <Pencil className="size-4" />
                            </Link>
                            <DeleteCandidate
                              candidate={{
                                id: candidate.id,
                                firstName: candidate.firstName,
                                surname: candidate.surname,
                                party: partyAbbr,
                              }}
                              onSuccess={() => GetCandidatesInElections(selectedElectionId)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="No Elections Found"
            description="Create an election first to begin managing candidates."
            buttonText="Create Election"
            href="/election/create-election"
          />
        )}
      </div>
    </AdminGuard>
  );
}
