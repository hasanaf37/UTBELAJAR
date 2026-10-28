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

  // ============================================================================
  // SINKRONISASI DATA DUA ARAH REAL-TIME DENGAN SUPABASE
  // ============================================================================

  // Helper: Generate UUIDv4 Valid Heksadesimal untuk PostgreSQL
  function generateUuid() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  window.generateUuid = generateUuid;

  // 1. Ambil seluruh data pengguna (Users & Admins) dari Supabase secara real-time
  window.dbGetUsers = async function () {
    const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
    if (!window.supabaseClient || !window.isSupabaseConfigured()) {
      return localUsers;
    }

    try {
      const { data: supaUsers, error: errUsers } = await window.supabaseClient
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: supaAdmins, error: errAdmins } = await window.supabaseClient
        .from("admins")
        .select("*");

      if (errUsers && errAdmins) {
        console.warn("Koneksi Supabase aktif namun query tabel belum berhasil:", errUsers?.message || errAdmins?.message);
        return localUsers;
      }

      const merged = [];

      // Masukkan akun admin dari tabel admins
      if (Array.isArray(supaAdmins) && supaAdmins.length > 0) {
        supaAdmins.forEach((a) => {
          if (a.username === "__system_ai_config__" || a.role === "system") return;
          merged.push({
            id: a.id,
            full_name: a.username || a.full_name || "admin",
            role: "admin",
            status: a.status || "Aktif",
            program_studi_id: "b1111111-1111-1111-1111-111111111111",
            program_studi_name: "Administrator Sistem",
            password: a.password || "HASANH1J1",
            created_at: a.created_at || new Date().toISOString(),
            last_active_at: a.last_login_at || a.created_at || new Date().toISOString(),
          });
        });
      } else {
        const localAdmin = localUsers.find((u) => u.role === "admin");
        if (localAdmin) merged.push(localAdmin);
      }

      // Masukkan akun mahasiswa dari tabel users
      if (Array.isArray(supaUsers)) {
        supaUsers.forEach((u) => {
          merged.push({
            id: u.id,
            full_name: u.full_name,
            role: u.role || "student",
            status: u.status || "Aktif",
            program_studi_id: u.program_studi_id,
            program_studi_name: u.program_studi_name || "Sistem Informasi (SI)",
            password: u.password,
            created_at: u.created_at,
            last_active_at: u.last_active_at || u.created_at,
          });
        });
      }

      if (merged.length > 0) {
        localStorage.setItem("utb_local_users", JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.warn("Gagal sinkronisasi data dari Supabase:", e.message);
    }

    return localUsers;
  };

  // 2. Tambah user baru (Langsung tersimpan di Supabase & Local)
  window.dbInsertUser = async function (userData) {
    const isRoleAdmin = userData.role === "admin" || userData.full_name.toLowerCase() === "admin";
    const uuid = userData.id && !userData.id.startsWith("user-") ? userData.id : generateUuid();
    userData.id = uuid;

    // Simpan ke local storage agar UI langsung responsif
    const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
    const existingIdx = localUsers.findIndex((u) => u.full_name.toLowerCase() === userData.full_name.toLowerCase());
    if (existingIdx !== -1) {
      localUsers[existingIdx] = { ...localUsers[existingIdx], ...userData };
    } else {
      localUsers.push(userData);
    }
    localStorage.setItem("utb_local_users", JSON.stringify(localUsers));

    // Kirim langsung ke Supabase
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        if (isRoleAdmin) {
          const { error } = await window.supabaseClient.from("admins").upsert({
            id: uuid,
            username: userData.full_name,
            full_name: userData.full_name,
            password: userData.password,
            role: "admin",
            status: userData.status || "Aktif",
            is_super_admin: true,
            created_at: userData.created_at || new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          }, { onConflict: "username" });
          if (error) console.warn("Supabase upsert admin:", error.message);
        } else {
          const { error } = await window.supabaseClient.from("users").upsert({
            id: uuid,
            full_name: userData.full_name,
            program_studi_id: userData.program_studi_id || null,
            program_studi_name: userData.program_studi_name || null,
            password: userData.password,
            role: "student",
            status: userData.status || "Aktif",
            created_at: userData.created_at || new Date().toISOString(),
            last_active_at: new Date().toISOString(),
          }, { onConflict: "full_name" });
          if (error) console.warn("Supabase upsert user:", error.message);
        }
      } catch (err) {
        console.warn("Gagal mengirim data baru ke Supabase:", err.message);
      }
    }

    return userData;
  };

  // 3. Ubah status user (Aktif / Nonaktif) langsung ke Supabase & Local
  window.dbUpdateUserStatus = async function (userId, fullName, newStatus) {
    const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
    const idx = localUsers.findIndex((u) => u.id === userId || u.full_name.toLowerCase() === (fullName || "").toLowerCase());
    if (idx !== -1) {
      localUsers[idx].status = newStatus;
      localStorage.setItem("utb_local_users", JSON.stringify(localUsers));
    }

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        await window.supabaseClient
          .from("users")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("full_name", fullName);

        await window.supabaseClient
          .from("admins")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("username", fullName);
      } catch (err) {
        console.warn("Gagal update status di Supabase:", err.message);
      }
    }
  };

  // 4. Hapus user langsung dari Supabase & Local
  window.dbDeleteUser = async function (userId, fullName) {
    const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
    const updated = localUsers.filter((u) => u.id !== userId && u.full_name.toLowerCase() !== (fullName || "").toLowerCase());
    localStorage.setItem("utb_local_users", JSON.stringify(updated));

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        await window.supabaseClient.from("users").delete().eq("full_name", fullName);
        await window.supabaseClient.from("admins").delete().eq("username", fullName);
      } catch (err) {
        console.warn("Gagal hapus user di Supabase:", err.message);
      }
    }
  };

  // 5. Hapus riwayat pengerjaan soal (quiz attempts) pengguna dari Supabase & Local
  window.dbDeleteQuizAttempts = async function (userId, attemptIds) {
    if (!userId || !Array.isArray(attemptIds) || attemptIds.length === 0) return;
    const strIds = attemptIds.map((id) => String(id));
    const localKey = `utb_attempts_${userId}`;
    const local = JSON.parse(localStorage.getItem(localKey) || "[]");
    const updated = local.filter((att, idx) => {
      const attId = String(att.id || `att-${idx}`);
      return !strIds.includes(attId);
    });
    localStorage.setItem(localKey, JSON.stringify(updated));

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        const realIds = attemptIds.filter((id) => id && !String(id).startsWith("att-"));
        if (realIds.length > 0) {
          await window.supabaseClient.from("quiz_attempts").delete().in("id", realIds);
        }
      } catch (err) {
        console.warn("Gagal hapus quiz_attempts di Supabase:", err.message);
      }
    }
  };

  // Default master daftar program studi
  window.DEFAULT_PRODI_LIST = [
    { id: "b1111111-1111-1111-1111-111111111111", code: "SI", name: "Sistem Informasi (SI)" },
    { id: "b2222222-2222-2222-2222-222222222222", code: "MNJ", name: "Manajemen (MNJ)" },
    { id: "b3333333-3333-3333-3333-333333333333", code: "ILKOM", name: "Ilmu Komunikasi (ILKOM)" },
    { id: "b4444444-4444-4444-4444-444444444444", code: "AKT", name: "Akuntansi (AKT)" },
  ];

  // Helper mengambil daftar program studi dari Supabase dengan fallback
  window.dbGetStudyPrograms = async function () {
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        const { data, error } = await window.supabaseClient
          .from("study_programs")
          .select("id, name, code")
          .eq("is_active", true)
          .order("name", { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((p) => ({
            id: p.id,
            code: p.code,
            name: p.name.includes("(") ? p.name : `${p.name} (${p.code})`,
          }));
        }
      } catch (_) {}
    }
    return window.DEFAULT_PRODI_LIST;
  };

  // 5. Update profil pengguna (Nama & Program Studi)
  window.dbUpdateUserProfile = async function (oldName, newName, prodiId, prodiName) {
    if (!oldName && !newName) return;
    const finalNewName = newName || oldName;
    const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
    const idx = localUsers.findIndex((u) => u.full_name.toLowerCase() === (oldName || "").toLowerCase());
    if (idx !== -1) {
      localUsers[idx].full_name = finalNewName;
      if (prodiId) localUsers[idx].program_studi_id = prodiId;
      if (prodiName) localUsers[idx].program_studi_name = prodiName;
      localStorage.setItem("utb_local_users", JSON.stringify(localUsers));
    }

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        const userPayload = {
          full_name: finalNewName,
          updated_at: new Date().toISOString(),
        };
        if (prodiId) userPayload.program_studi_id = prodiId;
        if (prodiName) userPayload.program_studi_name = prodiName;

        let { error: errUser } = await window.supabaseClient
          .from("users")
          .update(userPayload)
          .eq("full_name", oldName || finalNewName);

        // Jika foreign key ditolak (misal ID prodi belum ada di study_programs), retry dengan id null
        if (errUser && (errUser.code === "23503" || errUser.message?.includes("foreign key"))) {
          console.warn("Foreign key prodi ditolak, memperbarui dengan nama prodi saja:", errUser.message);
          const fallbackPayload = { ...userPayload, program_studi_id: null };
          await window.supabaseClient
            .from("users")
            .update(fallbackPayload)
            .eq("full_name", oldName || finalNewName);
        } else if (errUser) {
          console.warn("Update profil users di Supabase:", errUser.message);
        }

        await window.supabaseClient
          .from("admins")
          .update({
            full_name: finalNewName,
            username: finalNewName,
            updated_at: new Date().toISOString(),
          })
          .eq("username", oldName || finalNewName);
      } catch (err) {
        console.warn("Gagal update profil di Supabase:", err.message);
      }
    }
  };

  // 6. Admin Update Pengguna (Nama, Program Studi, Status, Password)
  window.dbAdminUpdateUser = async function (userId, data) {
    const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
    const idx = localUsers.findIndex(
      (u) => u.id === userId || (data.old_full_name && u.full_name.toLowerCase() === data.old_full_name.toLowerCase())
    );

    let isTargetAdmin = false;
    if (idx !== -1) {
      isTargetAdmin = localUsers[idx].role === "admin";
      localUsers[idx] = {
        ...localUsers[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      delete localUsers[idx].old_full_name;
      localStorage.setItem("utb_local_users", JSON.stringify(localUsers));
    }

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        if (isTargetAdmin || data.role === "admin") {
          const adminPayload = {
            updated_at: new Date().toISOString(),
          };
          if (data.full_name) {
            adminPayload.username = data.full_name;
            adminPayload.full_name = data.full_name;
          }
          if (data.status) adminPayload.status = data.status;
          if (data.password) adminPayload.password = data.password;

          await window.supabaseClient.from("admins").update(adminPayload).eq("id", userId);
        } else {
          const userPayload = {
            updated_at: new Date().toISOString(),
          };
          if (data.full_name) userPayload.full_name = data.full_name;
          if (data.program_studi_id) userPayload.program_studi_id = data.program_studi_id;
          if (data.program_studi_name) userPayload.program_studi_name = data.program_studi_name;
          if (data.status) userPayload.status = data.status;
          if (data.password) userPayload.password = data.password;

          // Update by id, fallback by old full_name
          let { error } = await window.supabaseClient.from("users").update(userPayload).eq("id", userId);
          if (error && (error.code === "23503" || error.message?.includes("foreign key"))) {
            const fallbackPayload = { ...userPayload, program_studi_id: null };
            await window.supabaseClient.from("users").update(fallbackPayload).eq("id", userId);
          } else if (error && data.old_full_name) {
            let res2 = await window.supabaseClient.from("users").update(userPayload).eq("full_name", data.old_full_name);
            if (res2.error && (res2.error.code === "23503" || res2.error.message?.includes("foreign key"))) {
              await window.supabaseClient.from("users").update({ ...userPayload, program_studi_id: null }).eq("full_name", data.old_full_name);
            }
          }
        }
      } catch (err) {
        console.warn("Gagal update user oleh admin di Supabase:", err.message);
      }
    }
  };

  // Pastikan master prodi selalu terisi di Supabase
  async function ensureStudyProgramsSeeded() {
    if (!window.supabaseClient || !window.isSupabaseConfigured()) return;
    try {
      const { data } = await window.supabaseClient.from("study_programs").select("id").limit(1);
      if (!data || data.length === 0) {
        await window.supabaseClient.from("study_programs").upsert(window.DEFAULT_PRODI_LIST);
      }
    } catch (_) {}
  }
  ensureStudyProgramsSeeded();

  // 7. SINKRONISASI PROGRAM STUDI (study_programs) SECARA LANGSUNG KE SUPABASE
  window.dbGetCatalogProdis = async function () {
    const localRaw = localStorage.getItem("utb_catalog_prodis");
    let localList = [];
    try {
      localList = JSON.parse(localRaw || "[]");
    } catch (_) {}

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        const { data, error } = await window.supabaseClient
          .from("study_programs")
          .select("id, code, name, description, is_active, created_at")
          .order("name", { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          localStorage.setItem("utb_catalog_prodis", JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("Gagal mengambil study_programs dari Supabase:", err.message);
      }
    }

    if (localList.length === 0) {
      localList = window.DEFAULT_PRODI_LIST.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name.includes("(") ? p.name.split(" (")[0] : p.name,
        description: `Program studi digital UTBelajar ${p.code}.`,
        is_active: true,
      }));
      localStorage.setItem("utb_catalog_prodis", JSON.stringify(localList));
    }
    return localList;
  };

  window.dbInsertProdi = async function (prodiData) {
    const uuid = prodiData.id && !prodiData.id.startsWith("prodi-") ? prodiData.id : generateUuid();
    const item = {
      id: uuid,
      code: String(prodiData.code || "").trim().toUpperCase(),
      name: String(prodiData.name || "").trim(),
      description: prodiData.description || "Program studi digital UTBelajar.",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update local storage
    const localList = JSON.parse(localStorage.getItem("utb_catalog_prodis") || "[]");
    const existingIdx = localList.findIndex((p) => p.code.toLowerCase() === item.code.toLowerCase());
    if (existingIdx !== -1) {
      localList[existingIdx] = { ...localList[existingIdx], ...item };
    } else {
      localList.push(item);
    }
    localStorage.setItem("utb_catalog_prodis", JSON.stringify(localList));

    // Kirim langsung ke Supabase
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        const { error } = await window.supabaseClient.from("study_programs").upsert({
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "code" });

        if (error) {
          console.warn("Supabase upsert study_programs:", error.message);
          await window.supabaseClient.from("study_programs").insert({
            id: item.id,
            code: item.code,
            name: item.name,
            description: item.description,
            is_active: true,
          });
        }
      } catch (err) {
        console.warn("Gagal mengirim prodi baru ke Supabase:", err.message);
      }
    }
    return item;
  };

  window.dbUpdateProdi = async function (prodiId, updateData) {
    const localList = JSON.parse(localStorage.getItem("utb_catalog_prodis") || "[]");
    const idx = localList.findIndex((p) => p.id === prodiId);
    if (idx !== -1) {
      localList[idx] = { ...localList[idx], ...updateData, updated_at: new Date().toISOString() };
      localStorage.setItem("utb_catalog_prodis", JSON.stringify(localList));
    }

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        await window.supabaseClient
          .from("study_programs")
          .update({
            code: updateData.code,
            name: updateData.name,
            description: updateData.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", prodiId);
      } catch (err) {
        console.warn("Gagal update prodi di Supabase:", err.message);
      }
    }
  };

  window.dbDeleteProdi = async function (prodiId) {
    const localList = JSON.parse(localStorage.getItem("utb_catalog_prodis") || "[]");
    const updated = localList.filter((p) => p.id !== prodiId);
    localStorage.setItem("utb_catalog_prodis", JSON.stringify(updated));

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        await window.supabaseClient.from("study_programs").delete().eq("id", prodiId);
      } catch (err) {
        console.warn("Gagal hapus prodi di Supabase:", err.message);
      }
    }
  };

  // 7. Simpan Konfigurasi AI (OpenRouter / Gemini / OpenAI) ke Supabase agar siswa & seluruh perangkat bisa terhubung
  window.dbSaveAiConfig = async function (config) {
    if (!config) return;
    try {
      localStorage.setItem("utb_ai_config", JSON.stringify(config));

      if (window.supabaseClient && window.isSupabaseConfigured()) {
        const configStr = JSON.stringify(config);
        const { data } = await window.supabaseClient
          .from("admins")
          .select("id")
          .eq("username", "__system_ai_config__")
          .limit(1);

        if (data && data.length > 0) {
          await window.supabaseClient
            .from("admins")
            .update({
              full_name: configStr,
              updated_at: new Date().toISOString(),
            })
            .eq("username", "__system_ai_config__");
        } else {
          await window.supabaseClient.from("admins").insert({
            id: "a0000000-0000-0000-0000-000000000099",
            username: "__system_ai_config__",
            full_name: configStr,
            password: "ai_config_data",
            role: "system",
            status: "Aktif",
            is_super_admin: false,
          });
        }
      }
    } catch (err) {
      console.warn("Gagal menyimpan konfigurasi AI ke Supabase:", err.message);
    }
  };

  // 8. Ambil Konfigurasi AI dari Supabase (Memastikan siswa di HP/tablet terhubung ke agent OpenRouter yang sama)
  window.dbGetAiConfig = async function () {
    let localCfg = null;
    try {
      const raw = localStorage.getItem("utb_ai_config");
      if (raw) localCfg = JSON.parse(raw);
    } catch (_) {}

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        const { data, error } = await window.supabaseClient
          .from("admins")
          .select("full_name")
          .eq("username", "__system_ai_config__")
          .limit(1);

        if (!error && data && data.length > 0 && data[0].full_name) {
          try {
            const remoteCfg = JSON.parse(data[0].full_name);
            if (remoteCfg && typeof remoteCfg === "object") {
              if (remoteCfg.apiKey || remoteCfg.provider === "custom" || remoteCfg.provider === "openrouter") {
                localStorage.setItem("utb_ai_config", JSON.stringify(remoteCfg));
                return remoteCfg;
              }
            }
          } catch (_) {}
        }

        if (localCfg && localCfg.apiKey) {
          window.dbSaveAiConfig(localCfg);
        }
      } catch (e) {
        console.warn("Gagal mengambil konfigurasi AI dari Supabase:", e.message);
      }
    }

    return localCfg;
  };
})();
