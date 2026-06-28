"use client";

import { useAuthStore } from "@/app/store/useAuthStore";
import { useEffect } from "react";
import Image from "next/image";
import {
  Loader2,
  Mail,
  User,
  MapPin,
  GraduationCap,
  Heart,
  Calendar,
  Shield,
} from "lucide-react";
import { EmptyState } from "@/components/general/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const { isGettingAdmin, profile, getMeAdmin } = useAuthStore();

  useEffect(() => {
    getMeAdmin();
  }, [getMeAdmin]);

  if (isGettingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="No Profile Available"
        description="Go to admin to create profile"
        buttonText="Back to home"
        href="/"
      />
    );
  }

  const fullName = `${profile.firstName} ${
    profile.otherName ? profile.otherName + " " : ""
  }${profile.surname}`;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ================= PROFILE HEADER ================= */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-border shadow-lg">
            <Image
              src={profile.profilePicture || "/placeholder.png"}
              alt={fullName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {fullName}
              </h1>

              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 w-fit mx-auto md:mx-0">
                <Shield className="size-4" />
                {profile.role}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-muted-foreground">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <User className="size-4" />
                <span className="font-mono">{profile.adminId}</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="size-4" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PERSONAL DETAILS */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <Info
                icon={<User className="size-4" />}
                label="Gender"
                value={profile.sex}
              />

              <Info
                icon={<Calendar className="size-4" />}
                label="Date of Birth"
                value={new Date(profile.DOB).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />

              <Info
                icon={<Heart className="size-4" />}
                label="Marital Status"
                value={profile.maritalStatus}
              />

              <Info
                icon={<GraduationCap className="size-4" />}
                label="Education Level"
                value={profile.education}
              />
            </CardContent>
          </Card>

          {/* CONTACT INFORMATION */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Contact & Regional Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="size-4 text-primary" />
                  <p className="text-sm font-medium">Residential Address</p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  {profile.residentialAddress}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Info
                  icon={<MapPin className="size-4" />}
                  label="LGA"
                  value={profile.LGA}
                />

                <Info
                  icon={<MapPin className="size-4" />}
                  label="State"
                  value={profile.state}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="text-xs uppercase tracking-wider font-semibold">
          {label}
        </p>
      </div>

      <p className="text-sm font-medium capitalize">
        {value || "Not Provided"}
      </p>
    </div>
  );
}
