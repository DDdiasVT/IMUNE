"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== "/login") {
      router.push("/login");
      return;
    }
    if (user && !profile && pathname !== "/setup-admin") {
      router.push("/setup-admin");
    }
  }, [user, profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Autenticando...</p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/login") return null;
  if (user && !profile && pathname !== "/setup-admin") return null;

  return <>{children}</>;
}
