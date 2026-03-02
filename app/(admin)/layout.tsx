"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // 1. Cek apakah user sedang login
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // 2. Ambil role user dari tabel profiles
      const { data, error } = await (supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single() as any);

      if (error || data?.role !== "super_admin") {
        // Jika bukan super_admin, tendang kembali ke dashboard
        router.push("/dashboard");
      } else {
        // Jika lolos, izinkan akses
        setIsAuthorized(true);
      }
    };

    checkAdminAccess();
  }, [router]);

  // Tampilkan layar loading saat sedang mengecek hak akses
  if (isAuthorized === null) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="animate-spin text-[#1B7A8F]" size={40} />
        <p className="font-bold animate-pulse">
          Memverifikasi Hak Akses Admin...
        </p>
      </div>
    );
  }

  // Jika hak akses valid, tampilkan halaman admin-nya (super-admin, unit, atau user)
  return <div className="admin-wrapper relative">{children}</div>;
}
