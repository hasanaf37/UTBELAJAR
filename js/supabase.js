// ==============================================================================
// UTBELAJAR - SUPABASE CLIENT INITIALIZATION & SESSION MANAGEMENT
// ==============================================================================

(function () {
  function createSupabaseInstance() {
    try {
      if (window.supabase && typeof window.supabase.createClient === "function" && window.APP_CONFIG) {
        return window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
      }
    } catch (error) {
      console.warn("Inisialisasi Supabase client:", error.message);
    }
    return null;
  }

  window.supabaseClient = createSupabaseInstance();

  window.reinitSupabaseClient = function () {
    window.supabaseClient = createSupabaseInstance();
    return window.supabaseClient;
  };

  window.checkSupabaseConnection = async function () {
    const url = window.APP_CONFIG?.SUPABASE_URL || "";
    const key = window.APP_CONFIG?.SUPABASE_ANON_KEY || "";
    const startTime = performance.now();

    if (!url || !key || url.includes("your-project-id") || key.length < 15) {
      return {
        connected: false,
        authOk: false,
        dbOk: false,
        latencyMs: 0,
        statusText: "Belum Dikonfigurasi",
        detailText: "URL atau API Key Supabase belum diisi dengan benar.",
        checkedAt: new Date().toISOString(),
      };
    }

    let authOk = false;
    let dbOk = false;
    let detailMessages = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const authRes = await fetch(`${url}/auth/v1/settings`, {
        method: "GET",
        headers: { apikey: key },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (authRes.ok) {
        authOk = true;
        detailMessages.push("Auth API Aktif");
      } else {
        detailMessages.push(`Auth HTTP ${authRes.status}`);
      }
    } catch (err) {
      detailMessages.push("Gagal menghubungi endpoint Auth");
    }

    if (window.supabaseClient) {
      try {
        const { error } = await window.supabaseClient.from("study_programs").select("id").limit(1);
        if (!error) {
          dbOk = true;
          detailMessages.push("Tabel Database Siap");
        } else if (error.code === "PGRST205" || (error.message && error.message.includes("Could not find"))) {
          detailMessages.push("Server Terhubung (Skema SQL belum dijalankan)");
        } else {
          detailMessages.push(`REST API Terhubung (${error.code || "OK"})`);
        }
      } catch (_) {}
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const connected = authOk || dbOk;

    return {
      connected,
      authOk,
      dbOk,
      latencyMs,
      statusText: connected
        ? dbOk
          ? "Terhubung Penuh (Online)"
          : "Terhubung ke Server Supabase"
        : "Tidak Terhubung (Mode Fallback Lokal)",
      detailText: detailMessages.join(" • ") || "Tidak ada respons dari server",
      checkedAt: new Date().toISOString(),
    };
  };

  window.getCurrentSession = async function () {
    // 1. Cek sesi lokal terlebih dahulu
    const localSessionRaw = localStorage.getItem("utb_local_session");
    if (localSessionRaw) {
      try {
        const parsed = JSON.parse(localSessionRaw);
        if (parsed && parsed.user) return parsed;
      } catch (_) {}
    }

    // 2. Cek sesi Supabase jika client tersedia
    if (!window.supabaseClient || !window.isSupabaseConfigured()) return null;

    try {
      const sessionPromise = window.supabaseClient.auth.getSession();
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ data: { session: null }, error: null }), 2500)
      );
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      const session = result && result.data ? result.data.session : null;
      return session || null;
    } catch (err) {
      console.warn("Gagal memeriksa sesi:", err.message);
      return null;
    }
  };

  window.getCurrentUser = async function () {
    const session = await window.getCurrentSession();
    return session ? session.user : null;
  };
})();
