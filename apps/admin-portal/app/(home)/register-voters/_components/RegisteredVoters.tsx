"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/general/EmptyState";
import { useAuthStore } from "@/app/store/useAuthStore";
import { 
  Loader2, 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  FileText, 
  Clock, 
  Copy, 
  Check, 
  Fingerprint, 
  GraduationCap, 
  ShieldCheck, 
  Heart,
  Building2,
  Home,
  XIcon
} from "lucide-react";
import RevokeVoterAccess from "./RevokeVoterAccess";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

function DetailCard({ 
  icon, 
  label, 
  value, 
  className = "",
  isFullWidth = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  className?: string;
  isFullWidth?: boolean;
}) {
  return (
    <div className={`bg-white p-3 rounded-xl border border-slate-100 shadow-xs flex items-start gap-3 hover:border-slate-200/80 transition-all duration-200 ${isFullWidth ? "col-span-1 md:col-span-2" : "col-span-1"}`}>
      <div className="p-2 bg-slate-50 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5 min-w-0">
        <span className="text-xs font-semibold text-slate-400 block">{label}</span>
        <span className={`font-semibold text-slate-700 text-sm break-all ${className}`}>{value || "—"}</span>
      </div>
    </div>
  );
}

export default function RegisteredVoters() {
  const { voters, getRegisteredVoters, isGettingVoters } = useAuthStore();
  const [selectedVoter, setSelectedVoter] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "jurisdiction" | "audit">("profile");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getRegisteredVoters();
  }, [getRegisteredVoters]);

  useEffect(() => {
    if (selectedVoter === null) {
      setActiveTab("profile");
    }
  }, [selectedVoter]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex text-sm font-medium text-muted-foreground border-b pb-2 px-2">
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
        <div 
          key={voter.id} 
          onClick={() => setSelectedVoter(voter)}
          className="flex items-center py-3 border-b text-sm cursor-pointer hover:bg-slate-50/60 transition-colors px-2 rounded-lg"
        >
          <div className="w-1/3 font-mono font-medium text-primary hover:underline">{voter.voterId}</div>

          <div className="w-1/3 text-center">
            {voter.firstName} {voter.surname}
          </div>

          <div className="w-1/3 text-right" onClick={(e) => e.stopPropagation()}>
            <RevokeVoterAccess voter={voter} />
          </div>
        </div>
      ))}

      {/* Voter Details Sheet */}
      <Sheet open={selectedVoter !== null} onOpenChange={(open) => { if (!open) setSelectedVoter(null); }}>
        <SheetContent className="sm:max-w-md md:max-w-lg p-0 overflow-y-auto flex flex-col h-full bg-slate-50/50" showCloseButton={false}>
          {selectedVoter && (
            <div className="flex flex-col h-full">
              {/* Accessibility Headers */}
              <SheetHeader className="sr-only">
                <SheetTitle>Voter Profile Details</SheetTitle>
                <SheetDescription>Detailed registration record for voter ID: {selectedVoter.voterId}</SheetDescription>
              </SheetHeader>

              {/* Profile Header Block */}
              <div className="relative pb-6 bg-white border-b border-slate-100 shrink-0">
                {/* Gradient banner */}
                <div className="h-24 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-primary" />
                
                {/* Custom close button */}
                <SheetClose className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 p-2 rounded-full transition-all hover:scale-105 active:scale-95 duration-200">
                  <XIcon className="size-4" />
                </SheetClose>

                <div className="px-6 -mt-10 flex flex-col items-center">
                  {/* Photo container */}
                  <div className="relative">
                    {selectedVoter.profilePicture ? (
                      <img
                        src={selectedVoter.profilePicture}
                        alt="Voter Portrait"
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md transition-all duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-100 to-violet-100 flex items-center justify-center border-4 border-white shadow-md text-violet-700 text-2xl font-bold font-sans transition-all duration-300 hover:scale-105">
                        {selectedVoter.firstName[0]}{selectedVoter.surname[0]}
                      </div>
                    )}
                    
                    {/* Status badge Overlay */}
                    <span className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm border border-slate-100">
                      {selectedVoter.isActivated ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white" title="Active Account">
                          <ShieldCheck className="size-3.5" />
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white" title="Pending Activation">
                          <Clock className="size-3.5" />
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="mt-4 text-center space-y-1">
                    <h3 className="font-bold text-xl text-slate-800 tracking-tight">
                      {selectedVoter.firstName} {selectedVoter.otherName ? `${selectedVoter.otherName} ` : ""}{selectedVoter.surname}
                    </h3>
                    
                    {/* Voter ID pill */}
                    <div className="flex items-center justify-center gap-1.5">
                      <code className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {selectedVoter.voterId}
                      </code>
                      <button 
                        onClick={() => handleCopy(selectedVoter.voterId)}
                        className="text-slate-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-slate-100 active:scale-95 duration-100"
                        title="Copy Voter ID"
                      >
                        {copied ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="pt-2 flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        selectedVoter.isActivated 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${selectedVoter.isActivated ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        {selectedVoter.isActivated ? "Active / Verified" : "Pending Activation"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Controller */}
              <div className="px-6 pt-4 bg-white shrink-0">
                <div className="flex border-b border-slate-100 gap-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center ${
                      activeTab === "profile" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("jurisdiction")}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center ${
                      activeTab === "jurisdiction" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Jurisdiction
                  </button>
                  <button
                    onClick={() => setActiveTab("audit")}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center ${
                      activeTab === "audit" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Audit Log
                  </button>
                </div>
              </div>

              {/* Scrollable Tab Contents */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {activeTab === "profile" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailCard icon={<Mail className="size-4 text-primary/80" />} label="Email Address" value={selectedVoter.email} isFullWidth />
                      <DetailCard icon={<Calendar className="size-4 text-primary/80" />} label="Date of Birth" value={selectedVoter.DOB} />
                      <DetailCard icon={<User className="size-4 text-primary/80" />} label="Gender / Sex" value={selectedVoter.sex} className="capitalize" />
                      <DetailCard icon={<Heart className="size-4 text-primary/80" />} label="Marital Status" value={selectedVoter.maritalStatus} className="capitalize" />
                      <DetailCard icon={<GraduationCap className="size-4 text-primary/80" />} label="Education Level" value={selectedVoter.education} className="capitalize" />
                    </div>
                  </div>
                )}

                {activeTab === "jurisdiction" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Regional & Jurisdiction Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailCard icon={<MapPin className="size-4 text-indigo-500" />} label="State" value={selectedVoter.state} />
                      <DetailCard icon={<Building2 className="size-4 text-indigo-500" />} label="LGA" value={selectedVoter.LGA} />
                      <DetailCard icon={<FileText className="size-4 text-indigo-500" />} label="Ward" value={selectedVoter.ward} isFullWidth />
                      <DetailCard icon={<Home className="size-4 text-indigo-500" />} label="Residential Address" value={selectedVoter.residentialAddress} isFullWidth />
                    </div>
                  </div>
                )}

                {activeTab === "audit" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">System Audit & Timestamps</h4>
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                      <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 py-2">
                        <div className="relative">
                          <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-indigo-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          </span>
                          <div>
                            <span className="text-xs text-slate-400 block font-semibold">Enrolled On System</span>
                            <span className="font-semibold text-slate-700 text-sm">{new Date(selectedVoter.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 ${selectedVoter.isActivated ? "border-emerald-500" : "border-amber-500"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${selectedVoter.isActivated ? "bg-emerald-500" : "bg-amber-500"}`} />
                          </span>
                          <div>
                            <span className="text-xs text-slate-400 block font-semibold">Biometric Enrollment Status</span>
                            <span className="font-semibold text-slate-700 text-sm">
                              {selectedVoter.isActivated ? "Fully Enrolled & Activated" : "Activation Code Generated / Pending Initial Sign-in"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
