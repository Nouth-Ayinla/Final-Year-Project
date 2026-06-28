"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/useAuthStore";
import NotAdminRoute from "@/app/not-admin/page";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { authUser, isCheckingAuth } = useAuthStore();
  const router = useRouter();

  const isAuthorized = authUser?.role === "SUPER_ADMIN" || authUser?.role === "ELECTION_ADMIN" || (authUser?.role as any) === "ADMIN";

  useEffect(() => {
    if (!isCheckingAuth && (!authUser || !isAuthorized)) {
      router.replace("/not-admin");
    }
  }, [authUser, isCheckingAuth, router, isAuthorized]);

  if (isCheckingAuth) return null;

  if (!authUser || !isAuthorized) {
    return <NotAdminRoute />;
  }

  return <>{children}</>;
}