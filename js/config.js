// ==============================================================================
// UTBELAJAR - KONFIGURASI SUPABASE & APLIKASI
// Kompatibel penuh dengan file:// maupun Live Server (http://)
// ==============================================================================

const DEFAULT_SUPABASE_URL = "https://dfpyizwmzqmlbyapgrpg.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_0LjfAlCqmrtZsogMCEWamg_Xp2qef6D";

window.DEFAULT_SUPABASE_URL = DEFAULT_SUPABASE_URL;
window.DEFAULT_SUPABASE_ANON_KEY = DEFAULT_SUPABASE_ANON_KEY;

window.APP_CONFIG = {
  SUPABASE_URL:
    localStorage.getItem("utb_supabase_url") ||
    (window.__ENV__ && window.__ENV__.SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL,
  SUPABASE_ANON_KEY:
    localStorage.getItem("utb_supabase_anon_key") ||
    (window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) ||
    DEFAULT_SUPABASE_ANON_KEY,

  AI_FUNCTION_NAME: "ai-chat",
  APP_NAME: "UTBelajar",
  TAGLINE: "Belajar Lebih Cerdas, Raih Hasil Lebih Baik.",
  DISCLAIMER: "Copyright HasanAF 2026",
};

window.isSupabaseConfigured = function () {
  return (
    Boolean(window.APP_CONFIG.SUPABASE_URL) &&
    Boolean(window.APP_CONFIG.SUPABASE_ANON_KEY) &&
    !window.APP_CONFIG.SUPABASE_URL.includes("your-project-id") &&
    window.APP_CONFIG.SUPABASE_ANON_KEY.length > 15
  );
};

window.setSupabaseCredentials = function (url, anonKey, reloadPage) {
  const cleanUrl = (url || "").trim().replace(/\/+$/, "");
  const cleanKey = (anonKey || "").trim();
  if (cleanUrl) localStorage.setItem("utb_supabase_url", cleanUrl);
  if (cleanKey) localStorage.setItem("utb_supabase_anon_key", cleanKey);
  window.APP_CONFIG.SUPABASE_URL = cleanUrl || DEFAULT_SUPABASE_URL;
  window.APP_CONFIG.SUPABASE_ANON_KEY = cleanKey || DEFAULT_SUPABASE_ANON_KEY;
  if (typeof window.reinitSupabaseClient === "function") {
    window.reinitSupabaseClient();
  }
  if (reloadPage) {
    window.location.reload();
  }
};

window.resetSupabaseCredentials = function () {
  localStorage.removeItem("utb_supabase_url");
  localStorage.removeItem("utb_supabase_anon_key");
  window.APP_CONFIG.SUPABASE_URL = DEFAULT_SUPABASE_URL;
  window.APP_CONFIG.SUPABASE_ANON_KEY = DEFAULT_SUPABASE_ANON_KEY;
  if (typeof window.reinitSupabaseClient === "function") {
    window.reinitSupabaseClient();
  }
};
