"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AppContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  session: any;
  userRole: string | null;
  userUnit: string | null;
  unitMapping: Record<string, any[]>;
  liveData: any[]; // History data
  loadingHistory: boolean;
  fetchHistory: () => Promise<void>;
  API_URL: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUnit, setUserUnit] = useState<string | null>(null);
  const [unitMapping, setUnitMapping] = useState<Record<string, any[]>>({});
  const [liveData, setLiveData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const API_URL = "http://127.0.0.1:8000";

  // --- Theme ---
  useEffect(() => {
    const saved = localStorage.getItem("pln-smart-trafo-darkmode");
    if (saved) setIsDarkMode(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "pln-smart-trafo-darkmode",
      JSON.stringify(isDarkMode),
    );
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // --- Auth & User Profile ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchUserProfile(s.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) fetchUserProfile(s.user.id);
      else {
        setUserRole(null);
        setUserUnit(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role, unit_ultg")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        setUserRole(data.role);
        setUserUnit(data.unit_ultg);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // --- Mapping Dinamis ---
  useEffect(() => {
    const loadMapping = async () => {
      try {
        const res = await fetch(`${API_URL}/master/hierarchy`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && Object.keys(data).length > 0) setUnitMapping(data);
      } catch (e) {
        console.warn("Backend offline/error:", e);
      }
    };
    loadMapping();
  }, []);

  // --- History Data (Live Data) ---
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("riwayat_uji")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      setLiveData(data || []);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchHistory();
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;
    const channel = supabase
      .channel("public:riwayat_uji")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "riwayat_uji" },
        () => fetchHistory(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        session,
        userRole,
        userUnit,
        unitMapping,
        liveData,
        loadingHistory,
        fetchHistory,
        API_URL,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
