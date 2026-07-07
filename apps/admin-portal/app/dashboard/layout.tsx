"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import Logo from "../../public/ondo state logo.png";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function DashboardClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  // 1. Trigger the cookie check immediately when an authenticated page mounts
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 2. Handle redirection once the backend responds
  useEffect(() => {
    if (!isCheckingAuth && !authUser) {
      router.push("/login");
    }
  }, [authUser, isCheckingAuth, router]);

  if (isCheckingAuth) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Logo with pulse effect */}
            <Image
               src={Logo}
               alt="OndoDecide Logo"
               width={72}
               height={72}
               className="animate-pulse object-contain"
               priority
             />
           </div>
 
           <div className="text-center space-y-1">
             <h2 className="text-xl font-semibold text-primary tracking-tight">
               OndoDecide
             </h2>
            <p className="text-sm text-muted-foreground">
              Securing your session...
            </p>
          </div>

          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
