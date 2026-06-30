"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowLeft } from "lucide-react";

import RegisteredVoters from "./_components/RegisteredVoters";
import RegisterVoterForm from "./_components/RegisteredVotersForm";

function VotersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") || "approved";
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/register-voters?tab=${value}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Voters Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage election voters and control access to OndoDecide.
          </p>
        </div>

        {activeTab === "approved" ? (
          <Button
            onClick={() => handleTabChange("register")}
            className="flex items-center gap-2"
          >
            <UserPlus className="size-4" />
            Register Voter
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => handleTabChange("approved")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to List
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl h-11">
          <TabsTrigger
            value="approved"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Approved Voters
          </TabsTrigger>

          <TabsTrigger
            value="register"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Register Voter
          </TabsTrigger>
        </TabsList>

        {/* Approved Voters */}
        <TabsContent value="approved" className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Registered Voters</CardTitle>
              <CardDescription>
                View and manage all registered voters.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <RegisteredVoters />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Register Voter */}
        <TabsContent value="register" className="space-y-4">
          <RegisterVoterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function VotersPage() {
  return (
    <Suspense fallback={<div>Loading Voters Management...</div>}>
      <VotersPageContent />
    </Suspense>
  );
}
