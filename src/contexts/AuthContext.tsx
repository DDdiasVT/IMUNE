"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: any;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isClient: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Resolve estado inicial imediatamente sem esperar pelo listener
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        if (mounted) setProfile(p);
      }
      if (mounted) setLoading(false);
    });

    // Escuta mudanças subsequentes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "INITIAL_SESSION") return; // já resolvido pelo getSession()

      const currentUser = session?.user ?? null;

      if (currentUser) {
        setLoading(true); // spinner enquanto busca perfil
        setUser(currentUser);
        const p = await fetchProfile(currentUser.id);
        if (mounted) {
          setProfile(p);
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // sem dependências — só executa uma vez

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isAdmin = profile?.role === "admin";
  const isClient = profile?.role === "client";

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, isAdmin, isClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
