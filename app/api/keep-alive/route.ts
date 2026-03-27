import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Mengambil environment variables dari .env.local
// Gunakan tanda seru (!) untuk memberitahu TS bahwa variabel ini pasti ada
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Inisialisasi client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Endpoint GET /api/keep-alive
 * Digunakan untuk memicu aktivitas di Supabase agar proyek tidak di-pause (Free Tier).
 */
export async function GET() {
  try {
    // Melakukan query super ringan.
    // PENTING: Ganti 'users' dengan nama tabel asli di database PLN SMART Anda.
    const { data, error } = await supabase.from("users").select("id").limit(1);

    // Jika terjadi error dari sisi database (misal tabel tidak ditemukan)
    if (error) {
      throw error;
    }

    // Response Sukses
    return NextResponse.json(
      {
        status: "success",
        message: "Supabase PLN SMART is awake! ⚡",
        timestamp: new Date().toISOString(),
        data: data,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    // Type Guarding untuk ESLint: Memastikan error memiliki properti message
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";

    // Response Gagal
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal memicu aktivitas Supabase: " + errorMessage,
      },
      { status: 500 },
    );
  }
}
