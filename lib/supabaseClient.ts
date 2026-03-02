import { createClient } from "@supabase/supabase-js";

// Pastikan penulisan process.env sudah benar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validasi ketat sebelum memanggil createClient
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "FATAL: Supabase URL atau Key tidak ditemukan di environment variables. " +
      "Pastikan file .env.local sudah ada dan variabel diawali dengan NEXT_PUBLIC_",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: "pln-smart-trafo-auth",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
