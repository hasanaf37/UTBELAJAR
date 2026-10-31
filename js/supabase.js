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
          .select("id, name, code, is_active")
          .eq("is_active", true)
          .order("name", { ascending: true });

        if (!error && Array.isArray(data)) {
          const valid = data.filter((p) => !isSystemProdiRow(p));
          if (valid.length > 0) {
            return valid.map((p) => ({
              id: p.id,
              code: p.code,
              name: p.name.includes("(") ? p.name : `${p.name} (${p.code})`,
            }));
          }
          return [];
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

  // Helper deteksi baris penyimpanan katalog sistem (is_active: false & prefix _SYS_)
  function isSystemProdiRow(row) {
    if (!row) return true;
    const code = String(row.code || "");
    return row.is_active === false || code.startsWith("_SYS_") || code.startsWith("__SYS_");
  }

  function isCurrentSessionAdminSync() {
    try {
      const raw = localStorage.getItem("utb_local_session");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      const user = parsed?.user;
      if (!user) return false;
      if (typeof window.isAdminUser === "function") return window.isAdminUser(user);
      const role = user.user_metadata?.role || user.role || "";
      const name = String(user.user_metadata?.full_name || user.full_name || "").toLowerCase().trim();
      return role === "admin" || name === "admin";
    } catch (_) {
      return false;
    }
  }

  // Helper baca/tulis Key-Value Cloud pada kolom TEXT study_programs.description (is_active = false)
  // Menjamin sinkronisasi lintas perangkat (Laptop <-> HP) meskipun tabel courses/moduls belum dibuat di Supabase
  async function dbReadSysStore(sysCode) {
    if (!window.supabaseClient || !window.isSupabaseConfigured()) {
      return { exists: null, value: null };
    }
    try {
      const { data, error } = await window.supabaseClient
        .from("study_programs")
        .select("description")
        .eq("code", sysCode)
        .limit(1);

      if (error) return { exists: null, value: null };
      if (!Array.isArray(data) || data.length === 0) {
        return { exists: false, value: null };
      }
      const desc = data[0]?.description;
      if (typeof desc === "string" && desc.trim().length > 0) {
        return { exists: true, value: JSON.parse(desc) };
      }
      return { exists: false, value: null };
    } catch (err) {
      console.warn(`Gagal membaca cloud store (${sysCode}):`, err.message);
      return { exists: null, value: null };
    }
  }

  async function dbWriteSysStore(sysId, sysCode, valueObj) {
    if (!window.supabaseClient || !window.isSupabaseConfigured()) return false;
    try {
      const jsonStr = JSON.stringify(valueObj);
      const nowIso = new Date().toISOString();
      const { error } = await window.supabaseClient.from("study_programs").upsert(
        {
          id: sysId,
          code: sysCode,
          name: sysCode,
          description: jsonStr,
          is_active: false,
          updated_at: nowIso,
        },
        { onConflict: "code" }
      );

      if (error) {
        const { data: existing } = await window.supabaseClient
          .from("study_programs")
          .select("id")
          .eq("code", sysCode)
          .limit(1);

        if (existing && existing.length > 0) {
          await window.supabaseClient
            .from("study_programs")
            .update({ description: jsonStr, is_active: false, updated_at: nowIso })
            .eq("code", sysCode);
        } else {
          await window.supabaseClient.from("study_programs").insert({
            id: sysId,
            code: sysCode,
            name: sysCode,
            description: jsonStr,
            is_active: false,
          });
        }
      }
      return true;
    } catch (err) {
      console.warn(`Gagal menyimpan cloud store (${sysCode}):`, err.message);
      return false;
    }
  }

  // Default master daftar mata kuliah terpadu
  window.DEFAULT_COURSE_LIST = [
    {
      id: "c-msim4207-01",
      study_program_id: "b1111111-1111-1111-1111-111111111111",
      code: "MSIM4207",
      name: "Sistem Informasi dalam Bisnis",
      description: "Membahas konsep sistem informasi, tipe sistem (TPS, DSS, dll.), dan infrastruktur TI dalam organisasi bisnis.",
    },
    {
      id: "c1111111-1111-1111-1111-111111111111",
      study_program_id: "b1111111-1111-1111-1111-111111111111",
      code: "MSIM4201",
      name: "Analisis dan Perancangan Sistem",
      description: "Konsep siklus hidup pengembangan sistem (SDLC), pemodelan UML, dan use case diagram.",
    },
    {
      id: "c2222222-2222-2222-2222-222222222222",
      study_program_id: "b1111111-1111-1111-1111-111111111111",
      code: "MSIM4202",
      name: "Sistem Basis Data",
      description: "Normalisasi data, Entity-Relationship Diagram (ERD), sintaks SQL, dan transaksi database.",
    },
    {
      id: "c4444444-4444-4444-4444-444444444444",
      study_program_id: "b2222222-2222-2222-2222-222222222222",
      code: "EKMA4116",
      name: "Manajemen Strategik",
      description: "Analisis lingkungan bisnis, keunggulan bersaing, visi-misi korporasi, dan implementasi strategi.",
    },
    {
      id: "c5555555-5555-5555-5555-555555555555",
      study_program_id: "b3333333-3333-3333-3333-333333333333",
      code: "SKOM4101",
      name: "Pengantar Ilmu Komunikasi",
      description: "Model komunikasi linear, transaksional, komunikasi massa, dan etika media digital.",
    },
    {
      id: "c6666666-6666-6666-6666-666666666666",
      study_program_id: "b4444444-4444-4444-4444-444444444444",
      code: "EKMA4115",
      name: "Pengantar Akuntansi",
      description: "Persamaan dasar akuntansi, siklus jurnal umum, buku besar, neraca saldo, dan laporan keuangan.",
    },
  ];

  // Pastikan master prodi awal terisi bila tabel benar-benar kosong
  async function ensureStudyProgramsSeeded() {
    if (!window.supabaseClient || !window.isSupabaseConfigured()) return;
    try {
      const { data } = await window.supabaseClient
        .from("study_programs")
        .select("id, code, is_active")
        .eq("is_active", true)
        .limit(5);
      const realProdis = Array.isArray(data) ? data.filter((p) => !isSystemProdiRow(p)) : [];
      if (realProdis.length === 0) {
        const initMarker = await dbReadSysStore("_SYS_PR_");
        if (initMarker.exists === false) {
          await window.supabaseClient.from("study_programs").upsert(
            window.DEFAULT_PRODI_LIST.map((p) => ({ ...p, is_active: true }))
          );
          await dbWriteSysStore("b0000000-0000-4000-8000-000000000000", "_SYS_PR_", { seeded: true });
        }
      }
    } catch (_) {}
  }
  ensureStudyProgramsSeeded();

  // 7. SINKRONISASI PROGRAM STUDI (study_programs) SECARA LANGSUNG KE SUPABASE
  window.dbGetCatalogProdis = async function () {
    const localRaw = localStorage.getItem("utb_catalog_prodis");
    const hasLocal = localRaw !== null;
    let localList = [];
    try {
      localList = JSON.parse(localRaw || "[]");
    } catch (_) {}

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        const { data, error } = await window.supabaseClient
          .from("study_programs")
          .select("id, code, name, description, is_active, created_at")
          .eq("is_active", true)
          .order("name", { ascending: true });

        if (!error && Array.isArray(data)) {
          const cleanData = data.filter((p) => !isSystemProdiRow(p));
          localStorage.setItem("utb_catalog_prodis", JSON.stringify(cleanData));
          return cleanData;
        }
      } catch (err) {
        console.warn("Gagal mengambil study_programs dari Supabase:", err.message);
      }
    }

    if (!hasLocal && localList.length === 0) {
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

    const localList = JSON.parse(localStorage.getItem("utb_catalog_prodis") || "[]");
    const existingIdx = localList.findIndex((p) => p.code.toLowerCase() === item.code.toLowerCase());
    if (existingIdx !== -1) {
      localList[existingIdx] = { ...localList[existingIdx], ...item };
    } else {
      localList.push(item);
    }
    localStorage.setItem("utb_catalog_prodis", JSON.stringify(localList));

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        await dbWriteSysStore("b0000000-0000-4000-8000-000000000000", "_SYS_PR_", { seeded: true });
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

    // Hapus juga mata kuliah yang berada di bawah prodi tersebut agar sinkron di semua perangkat
    try {
      const currentCourses = await window.dbGetCatalogCourses();
      const remainingCourses = (Array.isArray(currentCourses) ? currentCourses : []).filter(
        (c) => c.study_program_id !== prodiId
      );
      localStorage.setItem("utb_catalog_courses", JSON.stringify(remainingCourses));
      await dbWriteSysStore("b0000000-0000-4000-8000-000000000001", "_SYS_MK_", remainingCourses);
    } catch (_) {}

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        await dbWriteSysStore("b0000000-0000-4000-8000-000000000000", "_SYS_PR_", { seeded: true });
        await window.supabaseClient.from("study_programs").delete().eq("id", prodiId);
      } catch (err) {
        console.warn("Gagal hapus prodi di Supabase:", err.message);
      }
    }
  };

  // 8. SINKRONISASI MATA KULIAH (courses) SECARA LANGSUNG KE SUPABASE CLOUD & LOCAL
  const SYS_MK_ID = "b0000000-0000-4000-8000-000000000001";
  const SYS_MK_CODE = "_SYS_MK_";
  const SYS_MOD_ID = "b0000000-0000-4000-8000-000000000002";
  const SYS_MOD_CODE = "_SYS_MOD_";
  const SYS_SET_ID = "b0000000-0000-4000-8000-000000000003";
  const SYS_SET_CODE = "_SYS_SET_";
  const SYS_QST_ID = "b0000000-0000-4000-8000-000000000004";
  const SYS_QST_CODE = "_SYS_QST_";
  const SYS_AI_ID = "b0000000-0000-4000-8000-000000000005";
  const SYS_AI_CODE = "_SYS_AI_";

  function readLocalCoursesWithSeedFallback() {
    const raw = localStorage.getItem("utb_catalog_courses");
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [...window.DEFAULT_COURSE_LIST];
  }

  window.dbGetCatalogCourses = async function () {
    const localRaw = localStorage.getItem("utb_catalog_courses");
    const hasLocal = localRaw !== null;
    let localList = [];
    if (hasLocal) {
      try {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) localList = parsed;
      } catch (_) {}
    }

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      // 1. Baca dari Cloud Store (_SYS_MK_) sebagai sumber kebenaran utama lintas perangkat (Laptop & HP)
      const cloudStore = await dbReadSysStore(SYS_MK_CODE);
      if (cloudStore.exists === true && Array.isArray(cloudStore.value)) {
        localStorage.setItem("utb_catalog_courses", JSON.stringify(cloudStore.value));
        return cloudStore.value;
      }

      // 2. Jika _SYS_MK_ belum pernah dibuat di Supabase, cek apakah tabel courses tersedia
      if (cloudStore.exists === false) {
        try {
          const { data, error } = await window.supabaseClient
            .from("courses")
            .select("id, study_program_id, code, name, description, created_at")
            .order("code", { ascending: true });

          if (!error && Array.isArray(data) && data.length > 0) {
            await dbWriteSysStore(SYS_MK_ID, SYS_MK_CODE, data);
            localStorage.setItem("utb_catalog_courses", JSON.stringify(data));
            return data;
          }
        } catch (_) {}

        // 3. Jika user saat ini adalah Admin dan sudah memiliki data lokal (misal setelah menghapus MK di laptop),
        //    langsung unggah ke Supabase Cloud agar perangkat lain (HP siswa) segera tersinkron!
        if (isCurrentSessionAdminSync() && hasLocal) {
          await dbWriteSysStore(SYS_MK_ID, SYS_MK_CODE, localList);
          return localList;
        }
      }
    }

    if (!hasLocal) {
      const seed = [...window.DEFAULT_COURSE_LIST];
      localStorage.setItem("utb_catalog_courses", JSON.stringify(seed));
      return seed;
    }
    return localList;
  };

  window.dbInsertCourse = async function (courseData) {
    const uuid = courseData.id && !courseData.id.startsWith("course-") && !courseData.id.startsWith("c-")
      ? courseData.id
      : generateUuid();

    const item = {
      id: uuid,
      study_program_id: courseData.study_program_id,
      code: String(courseData.code || "").trim().toUpperCase(),
      name: String(courseData.name || "").trim(),
      description: courseData.description || "Mata kuliah program sarjana.",
      created_at: new Date().toISOString(),
    };

    // Ambil daftar terkini (utamakan cloud bila ada, fallback ke lokal/default)
    let baseList = readLocalCoursesWithSeedFallback();
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      const cloudStore = await dbReadSysStore(SYS_MK_CODE);
      if (cloudStore.exists === true && Array.isArray(cloudStore.value)) {
        baseList = cloudStore.value;
      }
    }

    const existingIdx = baseList.findIndex((c) => String(c.code || "").toLowerCase() === item.code.toLowerCase());
    if (existingIdx !== -1) {
      baseList[existingIdx] = { ...baseList[existingIdx], ...item };
    } else {
      baseList.push(item);
    }

    localStorage.setItem("utb_catalog_courses", JSON.stringify(baseList));

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      await dbWriteSysStore(SYS_MK_ID, SYS_MK_CODE, baseList);
      try {
        await window.supabaseClient.from("courses").upsert(
          {
            id: item.id,
            study_program_id: item.study_program_id,
            code: item.code,
            name: item.name,
            description: item.description,
          },
          { onConflict: "study_program_id,code" }
        );
      } catch (_) {}
    }
    return item;
  };

  window.dbUpdateCourse = async function (courseId, updateData) {
    let baseList = readLocalCoursesWithSeedFallback();
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      const cloudStore = await dbReadSysStore(SYS_MK_CODE);
      if (cloudStore.exists === true && Array.isArray(cloudStore.value)) {
        baseList = cloudStore.value;
      }
    }

    const idx = baseList.findIndex((c) => c.id === courseId);
    if (idx !== -1) {
      baseList[idx] = { ...baseList[idx], ...updateData };
    }
    localStorage.setItem("utb_catalog_courses", JSON.stringify(baseList));

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      await dbWriteSysStore(SYS_MK_ID, SYS_MK_CODE, baseList);
      try {
        if (courseId && !courseId.startsWith("course-") && !courseId.startsWith("c-")) {
          await window.supabaseClient
            .from("courses")
            .update({
              study_program_id: updateData.study_program_id,
              code: updateData.code,
              name: updateData.name,
              description: updateData.description,
            })
            .eq("id", courseId);
        }
      } catch (_) {}
    }
  };

  window.dbDeleteCourse = async function (courseId, courseCode) {
    let baseList = readLocalCoursesWithSeedFallback();
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      const cloudStore = await dbReadSysStore(SYS_MK_CODE);
      if (cloudStore.exists === true && Array.isArray(cloudStore.value)) {
        baseList = cloudStore.value;
      }
    }

    const normCode = courseCode ? String(courseCode).trim().toUpperCase() : "";
    const updated = baseList.filter((c) => {
      if (courseId && c.id === courseId) return false;
      if (normCode && String(c.code || "").trim().toUpperCase() === normCode) return false;
      return true;
    });

    localStorage.setItem("utb_catalog_courses", JSON.stringify(updated));

    // Bersihkan juga modul & paket latihan yang merujuk pada mata kuliah ini (lokal & cloud)
    try {
      const localModulsRaw = localStorage.getItem("utb_catalog_moduls");
      if (localModulsRaw !== null) {
        const localModuls = JSON.parse(localModulsRaw);
        if (Array.isArray(localModuls)) {
          const filteredModuls = localModuls.filter((m) => m.course_id !== courseId);
          localStorage.setItem("utb_catalog_moduls", JSON.stringify(filteredModuls));
          if (typeof window.dbSaveCatalogModuls === "function") {
            await window.dbSaveCatalogModuls(filteredModuls);
          }
        }
      }

      const localSetsRaw = localStorage.getItem("utb_catalog_sets");
      if (localSetsRaw !== null) {
        const localSets = JSON.parse(localSetsRaw);
        if (Array.isArray(localSets)) {
          const filteredSets = localSets.filter((s) => s.course_id !== courseId);
          localStorage.setItem("utb_catalog_sets", JSON.stringify(filteredSets));
          if (typeof window.dbSaveCatalogSets === "function") {
            await window.dbSaveCatalogSets(filteredSets);
          }
        }
      }
    } catch (_) {}

    // Simpan daftar mata kuliah terbaru langsung ke Supabase Cloud (_SYS_MK_) & tabel courses (bila ada)
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      await dbWriteSysStore(SYS_MK_ID, SYS_MK_CODE, updated);
      try {
        let query = window.supabaseClient.from("courses").delete();
        if (courseId && !courseId.startsWith("course-") && !courseId.startsWith("c-")) {
          await query.eq("id", courseId);
        } else if (normCode) {
          await query.eq("code", normCode);
        }
      } catch (_) {}
    }
    return updated;
  };

  // 9. SINKRONISASI METADATA MODUL, PAKET LATIHAN, & BUTIR SOAL LINTAS PERANGKAT
  function sanitizeModulsForCloud(modulsList) {
    if (!Array.isArray(modulsList)) return [];
    return modulsList.map((m) => {
      const copy = { ...m };
      // Hindari menyimpan dataURL PDF base64 raksasa (>80KB) di indeks katalog ringan
      if (typeof copy.pdf_data_url === "string" && copy.pdf_data_url.length > 80000) {
        delete copy.pdf_data_url;
      }
      if (Array.isArray(copy.images)) {
        const totalImgLen = copy.images.reduce((acc, s) => acc + (typeof s === "string" ? s.length : 0), 0);
        if (totalImgLen > 450000) {
          copy.images = copy.images.filter((s) => typeof s === "string" && !s.startsWith("data:"));
        }
      }
      return copy;
    });
  }

  window.dbGetCatalogModuls = async function () {
    const localRaw = localStorage.getItem("utb_catalog_moduls");
    const hasLocal = localRaw !== null;
    let localList = null;
    if (hasLocal) {
      try {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) localList = parsed;
      } catch (_) {}
    }

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      const cloudStore = await dbReadSysStore(SYS_MOD_CODE);
      if (cloudStore.exists === true && Array.isArray(cloudStore.value)) {
        // Pertahankan gambar lokal / idb_key pada perangkat pengunggah jika ada
        const merged = cloudStore.value.map((cm) => {
          const localMatch = Array.isArray(localList) ? localList.find((lm) => lm.id === cm.id) : null;
          if (localMatch) {
            return {
              ...cm,
              idb_key: cm.idb_key || localMatch.idb_key || "",
              images: Array.isArray(cm.images) && cm.images.length > 0 ? cm.images : localMatch.images || [],
            };
          }
          return cm;
        });
        localStorage.setItem("utb_catalog_moduls", JSON.stringify(merged));
        return merged;
      } else if (cloudStore.exists === false && isCurrentSessionAdminSync() && Array.isArray(localList)) {
        await dbWriteSysStore(SYS_MOD_ID, SYS_MOD_CODE, sanitizeModulsForCloud(localList));
      }
    }
    return localList;
  };

  window.dbSaveCatalogModuls = async function (modulsList) {
    if (!Array.isArray(modulsList)) return;
    localStorage.setItem("utb_catalog_moduls", JSON.stringify(modulsList));
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      await dbWriteSysStore(SYS_MOD_ID, SYS_MOD_CODE, sanitizeModulsForCloud(modulsList));
    }
  };

  window.dbGetCatalogSets = async function () {
    const localRaw = localStorage.getItem("utb_catalog_sets");
    let localList = null;
    if (localRaw !== null) {
      try {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) localList = parsed;
      } catch (_) {}
    }

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      const cloudStore = await dbReadSysStore(SYS_SET_CODE);
      if (cloudStore.exists === true && Array.isArray(cloudStore.value)) {
        localStorage.setItem("utb_catalog_sets", JSON.stringify(cloudStore.value));
        return cloudStore.value;
      } else if (cloudStore.exists === false && isCurrentSessionAdminSync() && Array.isArray(localList)) {
        await dbWriteSysStore(SYS_SET_ID, SYS_SET_CODE, localList);
      }
    }
    return localList;
  };

  window.dbSaveCatalogSets = async function (setsList) {
    if (!Array.isArray(setsList)) return;
    localStorage.setItem("utb_catalog_sets", JSON.stringify(setsList));
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      await dbWriteSysStore(SYS_SET_ID, SYS_SET_CODE, setsList);
    }
  };

  window.dbGetCatalogQuestions = async function () {
    const localRaw = localStorage.getItem("utb_catalog_questions");
    let localList = null;
    if (localRaw !== null) {
      try {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) localList = parsed;
      } catch (_) {}
    }

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      const cloudStore = await dbReadSysStore(SYS_QST_CODE);
      if (cloudStore.exists === true && Array.isArray(cloudStore.value)) {
        localStorage.setItem("utb_catalog_questions", JSON.stringify(cloudStore.value));
        return cloudStore.value;
      } else if (cloudStore.exists === false && isCurrentSessionAdminSync() && Array.isArray(localList)) {
        await dbWriteSysStore(SYS_QST_ID, SYS_QST_CODE, localList);
      }
    }
    return localList;
  };

  window.dbSaveCatalogQuestions = async function (questionsList) {
    if (!Array.isArray(questionsList)) return;
    localStorage.setItem("utb_catalog_questions", JSON.stringify(questionsList));
    if (window.supabaseClient && window.isSupabaseConfigured()) {
      await dbWriteSysStore(SYS_QST_ID, SYS_QST_CODE, questionsList);
    }
  };

  // 10. Simpan Konfigurasi AI (OpenRouter / Gemini / OpenAI) ke Supabase agar siswa & seluruh perangkat bisa terhubung
  window.dbSaveAiConfig = async function (config) {
    if (!config) return;
    try {
      localStorage.setItem("utb_ai_config", JSON.stringify(config));

      if (window.supabaseClient && window.isSupabaseConfigured()) {
        // Simpan di kolom TEXT tak terbatas (_SYS_AI_) agar API Key panjang tidak terpotong VARCHAR(150)
        await dbWriteSysStore(SYS_AI_ID, SYS_AI_CODE, config);
      }
    } catch (err) {
      console.warn("Gagal menyimpan konfigurasi AI ke Supabase:", err.message);
    }
  };

  // 11. Ambil Konfigurasi AI dari Supabase (Memastikan siswa di HP/tablet terhubung ke agent OpenRouter yang sama)
  window.dbGetAiConfig = async function () {
    let localCfg = null;
    try {
      const raw = localStorage.getItem("utb_ai_config");
      if (raw) localCfg = JSON.parse(raw);
    } catch (_) {}

    if (window.supabaseClient && window.isSupabaseConfigured()) {
      try {
        const sysAi = await dbReadSysStore(SYS_AI_CODE);
        if (sysAi.exists === true && sysAi.value && typeof sysAi.value === "object") {
          const remoteCfg = sysAi.value;
          if (remoteCfg.apiKey || remoteCfg.provider === "custom" || remoteCfg.provider === "openrouter") {
            localStorage.setItem("utb_ai_config", JSON.stringify(remoteCfg));
            return remoteCfg;
          }
        }

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
