"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useElectionStore } from "@/app/store/useElectionStore";
import { EmptyState } from "@/components/general/EmptyState";
import { Loader2, Pencil, Calendar, PlusCircleIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteElection from "./_components/DeleteElection";
import { Card } from "@/components/ui/card";
import AdminGuard from "@/components/guard/AdminGuard";

export default function Election() {
  const { getElections, elections, isGettingElections } = useElectionStore();

  useEffect(() => {
    getElections();
  }, [getElections]);

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "default";
      case "CLOSED":
        return "destructive";
      case "DRAFT":
        return "secondary";
      case "UPCOMING":
        return "secondary";
      default:
        return "outline";
    }
  };

  const safeElections = Array.isArray(elections) ? elections : [];

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Elections
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Manage and monitor all elections.
              </p>
            </div>

            <Button asChild className="w-auto">
              <Link href="/election/create-election">
                <PlusCircleIcon className="mr-2 size-4" />
                Create Election
              </Link>
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="flex flex-col">
          <Card className="p-5 w-full">
            <p className="text-sm text-muted-foreground">Total Elections</p>
            <h2 className="mt-2 text-3xl font-bold">{safeElections.length}</h2>
          </Card>
        </div>

        {/* Loading */}
        {isGettingElections && (
          <Card className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </Card>
        )}

        {/* Empty State */}
        {!isGettingElections && safeElections.length === 0 && (
          <EmptyState
            title="No Registered Elections"
            description="No elections have been created yet."
            buttonText="Create Election"
            href="/election/create-election"
          />
        )}

        {/* Elections */}
        {!isGettingElections && safeElections.length > 0 && (
          <div className="space-y-4">
            {safeElections.map((election) => (
              <Card
                key={election.id}
                className="p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Election Details */}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold wrap-break-word">
                        {election.title}
                      </h3>

                      <Badge
                        variant={getStatusVariant(election.status)}
                        className={
                          election.status?.toUpperCase() === "ACTIVE"
                            ? "bg-green-600 text-white hover:bg-green-600"
                            : ""
                        }
                      >
                        {election.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4 shrink-0" />

                      <span className="wrap-break-word">
                        {new Date(election.startDate).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" → "}
                        {new Date(election.endDate).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-sm">
                      Total Votes:
                      <span className="ml-2 font-semibold text-primary">
                        {election._count.votes}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-center">
                    <Link
                      href={`/election/${election.id}/edit`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      <Pencil className="size-4" />
                    </Link>

                    <DeleteElection election={election} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
