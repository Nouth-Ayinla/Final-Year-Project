"use client";

import { useEffect } from "react";

import { EmptyState } from "@/components/general/EmptyState";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Loader2 } from "lucide-react";
import RevokeVoterAccess from "./RevokeVoterAccess";

export default function RegisteredVoters() {
  const { voters, getRegisteredVoters, isGettingVoters } = useAuthStore();

  useEffect(() => {
    getRegisteredVoters();
  }, [getRegisteredVoters]);

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex text-sm font-medium text-muted-foreground border-b pb-2">
        <div className="w-1/3">Voter ID</div>
        <div className="w-1/3 text-center">Name</div>
        <div className="w-1/3 text-right">Action</div>
      </div>

      {/* Loading state */}
      {isGettingVoters && (
        <div className="py-6 flex items-center justify-center w-full text-sm text-muted-foreground">
          <Loader2 className="animate-spin size-6 text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isGettingVoters && voters.length === 0 && (
        <EmptyState
          title={"No Registered Voters"}
          description={"No voters have been registered in the system yet."}
        />
      )}

      {/* Data rows */}
      {voters.map((voter) => (
        <div key={voter.id} className="flex items-center py-3 border-b text-sm">
          <div className="w-1/3">{voter.voterId}</div>

          <div className="w-1/3 text-center">
            {voter.firstName} {voter.surname}
          </div>

          <div className="w-1/3 text-right">
            <RevokeVoterAccess voter={voter} />
          </div>
        </div>
      ))}
    </div>
  );
}
