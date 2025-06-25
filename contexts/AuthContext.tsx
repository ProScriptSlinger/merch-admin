"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AuthContextType {
  user: User | null;  
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabaseClient = createClientComponentClient();
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const signOut = useCallback(async () => {
    try {
      await supabaseClient.auth.signOut();
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, [router, supabaseClient.auth]);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      setSession(data.session);
      setUser(data.user);

      if (data.user) {
       
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (event === "SIGNED_IN") {
        const redirectTo = localStorage.getItem("redirectTo") || "/dashboard";

        localStorage.removeItem("redirectTo");
        if (window.location.pathname === "/auth") {
          router.push(redirectTo);
        }
      }

      if (event === "SIGNED_OUT") {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      signOut,
      refreshSession,
    }),
    [user, session, isLoading, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
