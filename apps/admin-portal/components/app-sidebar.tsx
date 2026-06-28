"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  User2,
  BoxIcon,
  UserCircle2Icon,
  ShieldCheck,
  Fingerprint,
  Flag,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/app/store/useAuthStore";
import Image from "next/image";
import Logo from "../public/ondo state logo.png";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authUser } = useAuthStore();
  let role = authUser?.role;
  if ((role as any) === "ADMIN") role = "SUPER_ADMIN";
  if ((role as any) === "OFFICER") role = "REGISTRATION_OFFICER";

  const allNavMain = [
    {
      title: "Live Dashboard",
      url: "/dashboard-live",
      icon: <LayoutDashboardIcon />,
      roles: ["SUPER_ADMIN", "ELECTION_ADMIN", "REGISTRATION_OFFICER", "MONITORING_OFFICER", "RESULTS_OFFICER"],
    },
    {
      title: "Register Officer",
      url: "/register-officers",
      icon: <User2 />,
      roles: ["SUPER_ADMIN"],
    },
    {
      title: "Voters",
      url: "/register-voters",
      icon: <User2 />,
      roles: ["SUPER_ADMIN", "REGISTRATION_OFFICER"],
    },
    {
      title: "Elections",
      url: "/election",
      icon: <BoxIcon />,
      roles: ["SUPER_ADMIN", "ELECTION_ADMIN"],
    },
    {
      title: "Parties",
      url: "/parties",
      icon: <Flag />,
      roles: ["SUPER_ADMIN", "ELECTION_ADMIN"],
    },
    {
      title: "Biometric Review",
      url: "/biometric-review",
      icon: <Fingerprint />,
      roles: ["SUPER_ADMIN", "REGISTRATION_OFFICER", "MONITORING_OFFICER"],
    },
    {
      title: "Audit Logs",
      url: "/audit-logs",
      icon: <ShieldCheck />,
      roles: ["SUPER_ADMIN", "ELECTION_ADMIN"],
    },
    {
      title: "Profile",
      url: "/profile",
      icon: <UserCircle2Icon />,
      roles: ["SUPER_ADMIN", "ELECTION_ADMIN", "REGISTRATION_OFFICER", "MONITORING_OFFICER", "RESULTS_OFFICER"],
    },
  ];

  const navMain = allNavMain.filter((item) => item.roles.includes(role ?? ""));

  const data = {
    user: {
      name: authUser?.firstName ?? "",
      email: authUser?.email ?? "",
      avatar: authUser?.profilePicture || undefined,
    },
    navMain,
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link
                href="/"
                className="flex items-center gap-3 transition-opacity hover:opacity-90"
              >
                <Image
                  src={Logo}
                  alt="OndoDecide Logo"
                  width={40}
                  height={40}
                  className="h-16 w-16 object-contain"
                />

                <span className="text-xl font-bold tracking-tight text-primary">
                  OndoDecide
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} role={authUser?.role} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
