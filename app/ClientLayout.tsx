"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  LayoutDashboard,
  History,
  BookOpen,
  Zap,
  LogOut,
  FileText,
  TrendingUp,
  Menu,
  X,
  ShieldCheck,
  Users,
  Map as MapIcon,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import VoltyAssistant from "@/components/VoltyAssistant";
import VoltyMascot from "@/components/VoltyMascot";
import { Toaster, toast } from "sonner";
import { useAppContext } from "./AppContext";

const MenuButton = ({ icon, label, active, onClick, isDarkMode }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${
      active
        ? "bg-[#1B7A8F] text-white shadow-lg translate-x-1"
        : `hover:bg-gray-500/5 ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`
    }`}
  >
    {icon} {label}
  </button>
);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { isDarkMode, toggleTheme, session, userRole, userUnit } =
    useAppContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);

    // Call Supabase signOut directly without blocking UI thread
    supabase.auth.signOut().then(() => {
      toast.success("Berhasil keluar.");
    });

    // Provide a dedicated 1.2s window for the smooth logout animation
    setTimeout(() => {
      setIsLoggingOut(false);
      router.push("/login");
    }, 1200);
  };

  // --- AUTO LOGOUT LOGIC ---
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isAuthPageContext = pathname === "/" || pathname === "/login";
    if (isAuthPageContext) return;

    const resetIdleTimeout = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

      // 15 Menit (15 * 60 * 1000 ms = 900000 ms) idle timeout
      idleTimeoutRef.current = setTimeout(() => {
        if (session) {
          toast.error("Sesi Anda telah berakhir karena tidak ada aktivitas.");
          handleLogout();
        }
      }, 900000);
    };

    // Listen to user activity
    window.addEventListener("mousemove", resetIdleTimeout);
    window.addEventListener("keydown", resetIdleTimeout);
    window.addEventListener("click", resetIdleTimeout);
    window.addEventListener("scroll", resetIdleTimeout);

    resetIdleTimeout();

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      window.removeEventListener("mousemove", resetIdleTimeout);
      window.removeEventListener("keydown", resetIdleTimeout);
      window.removeEventListener("click", resetIdleTimeout);
      window.removeEventListener("scroll", resetIdleTimeout);
    };
  }, [pathname, session]);

  const navigateTo = (path: string) => {
    setIsSidebarOpen(false);
    router.push(path);
  };

  const isAuthPage = pathname === "/" || pathname === "/login";

  return (
    <body
      suppressHydrationWarning
      className={`min-h-screen font-sans transition-colors duration-500 ${isDarkMode ? "bg-[#0f172a] text-slate-200 dark" : "bg-slate-100 text-slate-800"}`}
    >
      <Toaster position="top-center" richColors />

      {/* Modal Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`p-8 rounded-2xl max-w-sm w-full text-center ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <LogOut className="mx-auto mb-4 text-red-500" size={40} />
            <h3 className="text-xl font-bold mb-6">Keluar Akun?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY LOADING KELUAR */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm transition-all duration-300 transform-gpu">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FFD700] blur-2xl opacity-10 rounded-full animate-pulse transform-gpu"></div>
            <div className="w-40 h-40 relative z-10 drop-shadow-md transform-gpu">
              <VoltyMascot mood="happy" isSpeaking={false} isJumping={true} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-8 tracking-wider">
            PLN SMART
          </h3>
          <p className="text-[#1B7A8F] text-sm font-medium animate-pulse mt-2">
            Sedang keluar sistem...
          </p>
        </div>
      )}

      {!isAuthPage && (
        <>
          <VoltyAssistant activeField={null} onClose={() => {}} />

          {/* HEADER */}
          <header
            className={`fixed top-0 z-30 w-full h-16 px-4 flex items-center justify-between shadow-sm backdrop-blur-md ${isDarkMode ? "bg-slate-900/80" : "bg-white/80"}`}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-500/10 rounded-lg"
              >
                <Menu size={26} />
              </button>
              <div className="flex items-center gap-2">
                <Zap className="text-[#1B7A8F]" size={20} fill="#1B7A8F" />
                <h1 className="text-lg font-bold tracking-tight">
                  PLN <span className="text-[#F1C40F]">SMART</span>
                </h1>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p
                className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {session?.user?.email || "Memuat..."}
              </p>
              <p className="text-[10px] font-bold text-[#1B7A8F] uppercase tracking-wider">
                {userRole === "super_admin" ? "SUPER ADMIN" : userUnit}
              </p>
            </div>
          </header>

          <div
            className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            onClick={() => setIsSidebarOpen(false)}
          />

          <aside
            className={`fixed top-0 left-0 bottom-0 z-50 w-72 shadow-2xl transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isDarkMode ? "bg-[#1e293b]" : "bg-white"}`}
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-500/10">
              <h1
                className={`font-bold text-xl ${isDarkMode ? "text-white" : "text-[#1B7A8F]"}`}
              >
                PLN <span className="text-[#F1C40F]">SMART</span>
              </h1>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <MenuButton
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
                active={pathname === "/dashboard"}
                onClick={() => navigateTo("/dashboard")}
                isDarkMode={isDarkMode}
              />
              <MenuButton
                icon={<FileText size={20} />}
                label="Input DGA"
                active={pathname === "/input"}
                onClick={() => navigateTo("/input")}
                isDarkMode={isDarkMode}
              />
              <MenuButton
                icon={<TrendingUp size={20} />}
                label="Analisis Trending"
                active={pathname === "/trending"}
                onClick={() => navigateTo("/trending")}
                isDarkMode={isDarkMode}
              />
              <MenuButton
                icon={<History size={20} />}
                label="Riwayat"
                active={pathname === "/history"}
                onClick={() => navigateTo("/history")}
                isDarkMode={isDarkMode}
              />
              <MenuButton
                icon={<BookOpen size={20} />}
                label="Panduan"
                active={pathname === "/guide"}
                onClick={() => navigateTo("/guide")}
                isDarkMode={isDarkMode}
              />

              {userRole === "super_admin" && (
                <div className="pt-4 mt-4 border-t border-gray-500/20">
                  <p className="px-4 text-[10px] font-bold uppercase opacity-50 mb-2 tracking-widest">
                    Admin Area
                  </p>
                  <MenuButton
                    icon={<Users size={20} className="text-blue-500" />}
                    label="Manajemen User"
                    active={pathname === "/user-management"}
                    onClick={() => navigateTo("/user-management")}
                    isDarkMode={isDarkMode}
                  />
                  <MenuButton
                    icon={<MapIcon size={20} className="text-green-500" />}
                    label="Manajemen Unit"
                    active={pathname === "/unit-management"}
                    onClick={() => navigateTo("/unit-management")}
                    isDarkMode={isDarkMode}
                  />
                  <MenuButton
                    icon={<ShieldCheck size={20} className="text-purple-500" />}
                    label="Kelola Aset"
                    active={pathname === "/super-admin"}
                    onClick={() => navigateTo("/super-admin")}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}
            </nav>

            <div className="p-4 border-t border-gray-500/10 space-y-3">
              <ThemeToggle
                isDarkMode={isDarkMode ?? false}
                toggleTheme={toggleTheme ?? (() => {})}
              />
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 p-3 rounded-xl w-full transition"
              >
                <LogOut size={18} /> Keluar
              </button>
            </div>
          </aside>
        </>
      )}

      <main
        className={`${!isAuthPage ? "pt-20 pb-10 px-4 md:px-6" : ""} w-full min-h-screen transition-all duration-300 overflow-x-hidden`}
      >
        {children}
      </main>
    </body>
  );
}
