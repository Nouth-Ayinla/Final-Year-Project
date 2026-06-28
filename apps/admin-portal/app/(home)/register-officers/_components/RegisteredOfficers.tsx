"use client";

import { useEffect } from "react";

import { EmptyState } from "@/components/general/EmptyState";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Loader2 } from "lucide-react";
import RevokeOfficerAccess from "./RevokeOfficerAccess";

export default function RegisteredOfficers() {
  const { officers, getRegisteredOfficers, isGettingOfficers } = useAuthStore();

  useEffect(() => {
    getRegisteredOfficers();
  }, [getRegisteredOfficers]);

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex text-sm font-medium text-muted-foreground border-b pb-2">
        <div className="w-1/3">Admin ID</div>
        <div className="w-1/3 text-center">Name</div>
        <div className="w-1/3 text-right">Action</div>
      </div>

      {/* Loading state */}
      {isGettingOfficers && (
        <div className="py-6 flex items-center justify-center w-full text-sm text-muted-foreground">
          <Loader2 className="animate-spin size-6 text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isGettingOfficers && officers.length === 0 && (
        <EmptyState
          title={"No Registered Officials"}
          description={
            "No officers have been registered. Register an election officer to see them here "
          }
          buttonText={"Register Officer"}
          href={"/register-officers?tab=register"}
        />
      )}

      {/* Data rows */}
      {officers.map((officer) => (
        <div
          key={officer.id}
          className="flex items-center py-3 border-b text-sm"
        >
          <div className="w-1/3">{officer.adminId}</div>

          <div className="w-1/3 text-center">
            {officer.firstName} {officer.surname}
          </div>

          <div className="w-1/3 text-right">
            <RevokeOfficerAccess officer={officer} />
          </div>
        </div>
      ))}
    </div>
  );
}
