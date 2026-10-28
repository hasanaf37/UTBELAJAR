// ==============================================================================
// UTBELAJAR - KONFIGURASI SUPABASE & APLIKASI
// ==============================================================================

// Konfigurasi Default Proyek Supabase
// Anda dapat memasukkan URL dan Anon Key proyek Supabase Anda di sini
// atau menyimpannya melalui localStorage pada halaman pengaturan/konsol browser.
const DEFAULT_SUPABASE_URL = "https://your-project-id.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOi...";

export const APP_CONFIG = {
  // Baca dari localStorage jika ada override dari developer, atau gunakan default
  SUPABASE_URL: localStorage.getItem("utb_supabase_url") || (window.__ENV__ && window.__ENV__.SUPABASE_URL) || DEFAULT_SUPABASE_URL,
  SUPABASE_ANON_KEY: localStorage.getItem("utb_supabase_anon_key") || (window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY,
  
  // Endpoint Edge Function untuk Asisten AI UTBelajar
  AI_FUNCTION_NAME: "ai-chat",
  
  APP_NAME: "UTBelajar",
  TAGLINE: "Belajar Lebih Cerdas, Raih Hasil Lebih Baik.",
  DISCLAIMER: "UTBelajar merupakan platform belajar independen dan bukan situs resmi Universitas Terbuka."
};

/**
 * Memeriksa apakah kredensial Supabase sudah dikonfigurasi dengan URL & Key nyata
 */
export function isSupabaseConfigured() {
  return (
    APP_CONFIG.SUPABASE_URL &&
    APP_CONFIG.SUPABASE_ANON_KEY &&
    !APP_CONFIG.SUPABASE_URL.includes("your-project-id") &&
    APP_CONFIG.SUPABASE_ANON_KEY.length > 20
  );
}

/**
 * Menyimpan kredensial konfigurasi kustom ke localStorage (memudahkan pengujian)
 */
export function setSupabaseCredentials(url, anonKey) {
  if (url) localStorage.setItem("utb_supabase_url", url);
  if (anonKey) localStorage.setItem("utb_supabase_anon_key", anonKey);
  window.location.reload();
}
