// ==============================================================================
// UTBELAJAR - SUPABASE CLIENT INITIALIZATION & SESSION MANAGEMENT
// ==============================================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm";
import { APP_CONFIG, isSupabaseConfigured } from "./config.js";

let client = null;

try {
  client = createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} catch (error) {
  console.warn("Inisialisasi Supabase client:", error.message);
}

export const supabase = client;

/**
 * Mendapatkan sesi login aktif saat ini (mendukung Supabase Auth & sesi lokal jika Supabase belum disetel)
 */
export async function getCurrentSession() {
  // 1. Cek sesi lokal terlebih dahulu jika ada
  const localSessionRaw = localStorage.getItem("utb_local_session");
  if (localSessionRaw) {
    try {
      const parsed = JSON.parse(localSessionRaw);
      if (parsed && parsed.user) return parsed;
    } catch (_) {
      // Abaikan jika JSON tidak valid
    }
  }

  // 2. Cek sesi Supabase jika sudah dikonfigurasi
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ data: { session: null }, error: null }), 2500)
    );
    const result = await Promise.race([sessionPromise, timeoutPromise]);
    const session = result?.data?.session;
    return session || null;
  } catch (err) {
    console.warn("Gagal memeriksa sesi:", err.message);
    return null;
  }
}

/**
 * Mendapatkan user yang sedang login
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session ? session.user : null;
}
