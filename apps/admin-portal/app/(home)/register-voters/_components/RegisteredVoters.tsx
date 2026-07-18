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
  XIcon,
  Search
} from "lucide-react";
import RevokeVoterAccess from "./RevokeVoterAccess";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className={`bg-card/50 p-3 rounded-xl border border-border/80 shadow-xs flex items-start gap-3 hover:border-primary/20 transition-all duration-200 ${isFullWidth ? "col-span-1 md:col-span-2" : "col-span-1"}`}>
      <div className="p-2 bg-muted rounded-lg shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5 min-w-0">
        <span className="text-xs font-semibold text-muted-foreground block">{label}</span>
        <span className={`font-semibold text-foreground text-sm break-all ${className}`}>{value || "—"}</span>
      </div>
    </div>
  );
}

export default function RegisteredVoters() {
  const { voters, getRegisteredVoters, isGettingVoters } = useAuthStore();
  const [selectedVoter, setSelectedVoter] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "jurisdiction" | "audit">("profile");
  const [copied, setCopied] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchQuery);
    setVisibleCount(10); // Reset visible count on new search
  };

  const filteredVoters = (voters || []).filter((voter: any) => {
    if (!activeSearch.trim()) return true;
    const query = activeSearch.toLowerCase().trim();
    const fullName = `${voter.firstName} ${voter.surname} ${voter.otherName || ""}`.toLowerCase();
    const voterId = (voter.voterId || "").toLowerCase();
    const lga = (voter.LGA || "").toLowerCase();
    const ward = (voter.ward || "").toLowerCase();
    return fullName.includes(query) || voterId.includes(query) || lga.includes(query) || ward.includes(query);
  });

  const visibleVoters = filteredVoters.slice(0, visibleCount);

  return (
    <div className="w-full space-y-4">
      {/* Search Input and Button */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search voters by name, ID, LGA, or ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-card"
          />
        </div>
        <Button type="submit" size="sm" className="h-9 px-4 shrink-0">
          Search
        </Button>
        {activeSearch && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-9 shrink-0"
            onClick={() => {
              setSearchQuery("");
              setActiveSearch("");
              setVisibleCount(10);
            }}
          >
            Clear
          </Button>
        )}
      </form>

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

      {/* Search empty results */}
      {!isGettingVoters && voters.length > 0 && filteredVoters.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground bg-stone-50/50 rounded-xl border border-dashed border-border/80">
          No voters found matching "{activeSearch}".
        </div>
      )}

      {/* Data rows */}
      {!isGettingVoters && visibleVoters.map((voter) => (
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

      {/* See More Button */}
      {!isGettingVoters && filteredVoters.length > visibleCount && (
        <div className="pt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="w-full max-w-xs font-semibold text-xs border-border/80 hover:bg-muted"
          >
            See More ({filteredVoters.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      {/* Voter Details Centered Dialog Card */}
      <Dialog open={selectedVoter !== null} onOpenChange={(open) => { if (!open) setSelectedVoter(null); }}>
        <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-y-auto flex flex-col max-h-[85vh] bg-card border border-border" showCloseButton={false}>
          {selectedVoter && (
            <div className="flex flex-col h-full">
              {/* Accessibility Headers */}
              <DialogHeader className="sr-only">
                <DialogTitle>Voter Profile Details</DialogTitle>
                <DialogDescription>Detailed registration record for voter ID: {selectedVoter.voterId}</DialogDescription>
              </DialogHeader>

              {/* Profile Header Block */}
              <div className="relative pb-6 bg-card border-b border-border shrink-0">
                {/* Gradient banner */}
                <div className="h-24 w-full bg-gradient-to-r from-primary/70 via-primary to-primary/95" />
                
                {/* Custom close button */}
                <DialogClose className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white border border-white/10 p-2 rounded-full transition-all hover:scale-105 active:scale-95 duration-200">
                  <XIcon className="size-4" />
                </DialogClose>

                <div className="px-6 -mt-10 flex flex-col items-center">
                  {/* Photo container */}
                  <div className="relative">
                    {selectedVoter.profilePicture ? (
                      <img
                        src={selectedVoter.profilePicture}
                        alt="Voter Portrait"
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-card shadow-md transition-all duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center border-4 border-card shadow-md text-primary text-2xl font-bold font-sans transition-all duration-300 hover:scale-105">
                        {selectedVoter.firstName[0]}{selectedVoter.surname[0]}
                      </div>
                    )}
                    
                    {/* Status badge Overlay */}
                    <span className="absolute -bottom-1 -right-1 p-1 bg-card rounded-full shadow-sm border border-border">
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
                    <h3 className="font-bold text-xl text-foreground tracking-tight">
                      {selectedVoter.firstName} {selectedVoter.otherName ? `${selectedVoter.otherName} ` : ""}{selectedVoter.surname}
                    </h3>
                    
                    {/* Voter ID pill */}
                    <div className="flex items-center justify-center gap-1.5">
                      <code className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {selectedVoter.voterId}
                      </code>
                      <button 
                        onClick={() => handleCopy(selectedVoter.voterId)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-muted active:scale-95 duration-100"
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
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${selectedVoter.isActivated ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        {selectedVoter.isActivated ? "Active / Verified" : "Pending Activation"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Controller */}
              <div className="px-6 pt-4 bg-card shrink-0">
                <div className="flex border-b border-border gap-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center ${
                      activeTab === "profile" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("jurisdiction")}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center ${
                      activeTab === "jurisdiction" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Jurisdiction
                  </button>
                  <button
                    onClick={() => setActiveTab("audit")}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center ${
                      activeTab === "audit" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personal Information</h4>
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Regional & Jurisdiction Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailCard icon={<MapPin className="size-4 text-primary/80" />} label="State" value={selectedVoter.state} />
                      <DetailCard icon={<Building2 className="size-4 text-primary/80" />} label="LGA" value={selectedVoter.LGA} />
                      <DetailCard icon={<FileText className="size-4 text-primary/80" />} label="Ward" value={selectedVoter.ward} isFullWidth />
                      <DetailCard icon={<Home className="size-4 text-primary/80" />} label="Residential Address" value={selectedVoter.residentialAddress} isFullWidth />
                    </div>
                  </div>
                )}

                {activeTab === "audit" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Audit & Timestamps</h4>
                    <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-4">
                      <div className="relative pl-6 border-l-2 border-border space-y-6 py-2">
                        <div className="relative">
                          <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-card border-2 border-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          </span>
                          <div>
                            <span className="text-xs text-muted-foreground block font-semibold">Enrolled On System</span>
                            <span className="font-semibold text-foreground text-sm">{new Date(selectedVoter.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-card border-2 ${selectedVoter.isActivated ? "border-emerald-500" : "border-amber-500"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${selectedVoter.isActivated ? "bg-emerald-500" : "bg-amber-500"}`} />
                          </span>
                          <div>
                            <span className="text-xs text-muted-foreground block font-semibold">Biometric Enrollment Status</span>
                            <span className="font-semibold text-foreground text-sm">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
