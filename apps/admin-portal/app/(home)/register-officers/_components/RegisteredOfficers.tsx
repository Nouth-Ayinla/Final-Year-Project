"use client";

import { useEffect } from "react";

import { EmptyState } from "@/components/general/EmptyState";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Loader2 } from "lucide-react";
import RevokeOfficerAccess from "./RevokeOfficerAccess";

const formatRole = (role: string) => {
  if (!role) return "N/A";
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-rose-50 text-rose-700 border-rose-200/60";
    case "ELECTION_ADMIN":
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    case "REGISTRATION_OFFICER":
      return "bg-blue-50 text-blue-700 border-blue-200/60";
    case "MONITORING_OFFICER":
      return "bg-purple-50 text-purple-700 border-purple-200/60";
    case "RESULTS_OFFICER":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200/60";
  }
};

export default function RegisteredOfficers() {
  const { officers, getRegisteredOfficers, isGettingOfficers } = useAuthStore();

  useEffect(() => {
    getRegisteredOfficers();
  }, [getRegisteredOfficers]);

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex text-sm font-medium text-muted-foreground border-b pb-2">
        <div className="w-[20%]">Admin ID</div>
        <div className="w-[35%]">Name</div>
        <div className="w-[30%] text-center">Role</div>
        <div className="w-[15%] text-right">Action</div>
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
          <div className="w-[20%] font-mono text-xs text-muted-foreground">{officer.adminId}</div>

          <div className="w-[35%] font-medium">
            {officer.firstName} {officer.surname}
          </div>

          <div className="w-[30%] flex justify-center">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(officer.role)}`}>
              {formatRole(officer.role)}
            </span>
          </div>

          <div className="w-[15%] text-right">
            <RevokeOfficerAccess officer={officer} />
          </div>
        </div>
      ))}
    </div>
  );
}
