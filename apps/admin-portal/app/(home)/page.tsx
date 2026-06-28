"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useAuthStore } from "../store/useAuthStore";
import { useElectionStore } from "../store/useElectionStore";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Vote,
  Users,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  CalendarDays,
  Activity,
  Fingerprint,
} from "lucide-react";

export default function AdminHomePage() {
  const {
    profile,
    voters,
    officers,
    getRegisteredOfficers,
    getRegisteredVoters,
    getMeAdmin,
  } = useAuthStore();

  const { elections, getElections } = useElectionStore();

  useEffect(() => {
    getMeAdmin();
    getRegisteredOfficers();
    getRegisteredVoters();
    getElections();
  }, []);

  const activeElections = elections.filter(
    (election) => election.status === "ACTIVE",
  ).length;

  const stats = [
    {
      title: "Elections",
      value: elections.length,
      icon: Vote,
      description: "Total elections created",
    },
    {
      title: "Voters",
      value: voters.length,
      icon: Users,
      description: "Registered voters in system",
    },
    {
      title: "Officers",
      value: officers.length,
      icon: ShieldCheck,
      description: "Election officers available",
    },
    {
      title: "Active Elections",
      value: activeElections,
      icon: Activity,
      description: "Currently running elections",
    },
  ];

  const quickActions = [
    {
      title: "Live Dashboard",
      description: "Track turnout & telemetry",
      href: "/dashboard-live",
      icon: Activity,
    },
    {
      title: "Biometric Review",
      description: "Verify voter profiles",
      href: "/biometric-review",
      icon: Fingerprint,
    },
    {
      title: "Start Election",
      description: "Create a new election",
      href: "/election/create-election",
      icon: Vote,
    },
    {
      title: "Register Officer",
      description: "Add election officers",
      href: "/register-officers",
      icon: ShieldCheck,
    },
    {
      title: "Manage Voters",
      description: "View registered voters",
      href: "/register-voters",
      icon: Users,
    },
    {
      title: "Manage Elections",
      description: "View all elections",
      href: "/election",
      icon: CalendarDays,
    },
  ];

  return (
    <>
      <section>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back,{" "}
          <span className="text-primary">{profile?.firstName}</span>
        </h1>

        <p className="text-muted-foreground mt-2">
          Manage electoral activities across Ondo State from a centralized
          election management platform.
        </p>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 md:gap-6">
        {/* STATS */}
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title} className="@container/card">
              <CardHeader>
                <CardDescription>{stat.title}</CardDescription>

                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {stat.value}
                </CardTitle>

                <CardAction>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Icon className="size-4" />
                    Overview
                  </Badge>
                </CardAction>
              </CardHeader>

              <CardFooter className="text-sm text-muted-foreground">
                {stat.description}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* QUICK ACTIONS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl text-primary font-semibold">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Frequently used administrative actions.
          </p>
        </div>

        <div className="grid mt-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 md:gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.title} href={action.href}>
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between">
                      <div className="h-fit w-fit rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="size-6 text-primary" />
                      </div>

                      <ArrowRight className="size-5 text-muted-foreground" />
                    </div>

                    <div className="mt-6 space-y-2">
                      <h3 className="font-semibold text-base leading-none">
                        {action.title}
                      </h3>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
