"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useElectionStore } from "@/app/store/useElectionStore";

import { ArrowLeft, FileText, LayoutGrid, UsersIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import EditElectionForm from "./_components/EditElectionForm";
import { EmptyState } from "@/components/general/EmptyState";
import ElectionCandidateCard from "./_components/ElectionCandidateCard";
import AdminGuard from "@/components/guard/AdminGuard";

export default function EditElectionPage() {
  const { electionId } = useParams<{ electionId: string }>();

  const { elections, getElections, isGettingElections } = useElectionStore();

  useEffect(() => {
    if (elections.length === 0) {
      getElections();
    }
  }, [elections.length, getElections]);

  const election = elections.find((e) => e.id === electionId);

  if (isGettingElections && elections.length === 0) {
    return null;
  }

  if (!election) {
    return (
      <EmptyState
        title="Election not found"
        description="The election you are trying to edit does not exist."
        buttonText={"Back to Elections"}
        href="/election"
      />
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <Link
          href="/election"
          className={buttonVariants({
            variant: "outline",
          })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Elections
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Election</h1>

          <p className="text-muted-foreground mt-2">
            Manage election details and structure.
          </p>
        </div>

        <Tabs defaultValue="basic-info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic-info" className="gap-2">
              <FileText className="size-4" />
              Basic Information
            </TabsTrigger>

            <TabsTrigger value="election-candidates" className="gap-2">
              <UsersIcon className="size-4" />
              Election Candidates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info" className="mt-6">
            <Card className="w-full border border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>

                <CardDescription>
                  Update the election title, description and dates.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <EditElectionForm election={election} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="election-candidates" className="mt-6">
            <Card className="w-full border border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Election Candidates</CardTitle>

                <CardDescription>
                  Manage the candidates for this election, add new candidates or
                  remove existing ones.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ElectionCandidateCard electionId={electionId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
