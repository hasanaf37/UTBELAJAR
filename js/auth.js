// ==============================================================================
// UTBELAJAR - AUTHENTICATION LOGIC (TERHUBUNG KE SUPABASE & FILE:// READY)
// ==============================================================================

(function () {
  const DEFAULT_PRODI_MAP = {
    "b1111111-1111-1111-1111-111111111111": "Sistem Informasi (SI)",
    "b2222222-2222-2222-2222-222222222222": "Manajemen (MNJ)",
    "b3333333-3333-3333-3333-333333333333": "Ilmu Komunikasi (ILKOM)",
    "b4444444-4444-4444-4444-444444444444": "Akuntansi (AKT)",
  };

  const PRECONFIGURED_USERS = [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      full_name: "admin",
      role: "admin",
      status: "Aktif",
      program_studi_id: "b1111111-1111-1111-1111-111111111111",
      program_studi_name: "Administrator Sistem",
      password: "HASANH1J1",
      created_at: "2026-10-01T08:00:00.000Z",
      last_active_at: "2026-10-28T13:55:00.000Z",
    },
    {
      id: "5cc8eeab-1b7f-477a-ab66-4a9f041daf8d",
      full_name: "hasan",
      role: "student",
      status: "Aktif",
      program_studi_id: "b1111111-1111-1111-1111-111111111111",
      program_studi_name: "Sistem Informasi (SI)",
      password: "hasan123",
      created_at: "2026-10-20T06:17:02.948797Z",
      last_active_at: "2026-10-28T13:45:00.000Z",
    },
    {
      id: "u1111111-1111-1111-1111-111111111111",
      full_name: "Siti Aminah",
      role: "student",
      status: "Aktif",
      program_studi_id: "b2222222-2222-2222-2222-222222222222",
      program_studi_name: "Manajemen (MNJ)",
      password: "siti123",
      created_at: "2026-10-22T09:30:00.000Z",
      last_active_at: "2026-10-28T11:20:00.000Z",
    },
    {
      id: "u2222222-2222-2222-2222-222222222222",
      full_name: "Budi Santoso",
      role: "student",
      status: "Aktif",
      program_studi_id: "b1111111-1111-1111-1111-111111111111",
      program_studi_name: "Sistem Informasi (SI)",
      password: "budi123",
      created_at: "2026-10-24T14:15:00.000Z",
      last_active_at: "2026-10-27T19:40:00.000Z",
    },
    {
      id: "u3333333-3333-3333-3333-333333333333",
      full_name: "Rizky Pratama",
      role: "student",
      status: "Nonaktif",
      program_studi_id: "b4444444-4444-4444-4444-444444444444",
      program_studi_name: "Akuntansi (AKT)",
      password: "rizky123",
      created_at: "2026-10-15T10:00:00.000Z",
      last_active_at: "2026-10-19T16:10:00.000Z",
    },
  ];

  function ensureDefaultUsersSeeded() {
    try {
      const existing = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
      let changed = false;
      PRECONFIGURED_USERS.forEach((preset) => {
        const idx = existing.findIndex((u) => u.full_name.toLowerCase() === preset.full_name.toLowerCase());
        if (idx === -1) {
          existing.push(preset);
          changed = true;
        } else {
          if (preset.role === "admin" && existing[idx].role !== "admin") {
            existing[idx] = { ...preset, ...existing[idx], role: "admin", password: preset.password };
            changed = true;
          }
          if (!existing[idx].status) {
            existing[idx].status = preset.status || "Aktif";
            changed = true;
          }
          if (!existing[idx].last_active_at) {
            existing[idx].last_active_at = preset.last_active_at || existing[idx].created_at;
            changed = true;
          }
        }
      });
      if (changed) {
        localStorage.setItem("utb_local_users", JSON.stringify(existing));
      }

      // Seed riwayat pengerjaan contoh untuk laporan admin apabila belum ada
      if (!localStorage.getItem("utb_sample_attempts_seeded")) {
        const sampleMap = {
          "5cc8eeab-1b7f-477a-ab66-4a9f041daf8d": [
            {
              id: "att-seed-1",
              score: 90,
              total_questions: 10,
              correct_answers: 9,
              wrong_answers: 1,
              duration_seconds: 680,
              completed_at: "2026-10-28T07:30:00.000Z",
              question_sets: {
                id: "d1111111-1111-1111-1111-111111111111",
                title: "Latihan Mandiri 01: Dasar SQL & Normalisasi",
                courses: { id: "c2222222-2222-2222-2222-222222222222", name: "Sistem Basis Data", code: "MSIM4202" },
              },
            },
            {
              id: "att-seed-2",
              score: 80,
              total_questions: 10,
              correct_answers: 8,
              wrong_answers: 2,
              duration_seconds: 540,
              completed_at: "2026-10-27T14:20:00.000Z",
              question_sets: {
                id: "d2222222-2222-2222-2222-222222222222",
                title: "Latihan Mandiri 01: SDLC & Diagram UML",
                courses: { id: "c1111111-1111-1111-1111-111111111111", name: "Analisis dan Perancangan Sistem", code: "MSIM4201" },
              },
            },
          ],
          "u1111111-1111-1111-1111-111111111111": [
            {
              id: "att-seed-3",
              score: 85,
              total_questions: 10,
              correct_answers: 8,
              wrong_answers: 2,
              duration_seconds: 720,
              completed_at: "2026-10-28T10:15:00.000Z",
              question_sets: {
                id: "d3333333-3333-3333-3333-333333333333",
                title: "Latihan Mandiri 01: Analisis SWOT & Strategi",
                courses: { id: "c4444444-4444-4444-4444-444444444444", name: "Manajemen Strategik", code: "EKMA4116" },
              },
            },
          ],
          "u2222222-2222-2222-2222-222222222222": [
            {
              id: "att-seed-4",
              score: 75,
              total_questions: 8,
              correct_answers: 6,
              wrong_answers: 2,
              duration_seconds: 610,
              completed_at: "2026-10-27T18:50:00.000Z",
              question_sets: {
                id: "d1111111-1111-1111-1111-111111111111",
                title: "Latihan Mandiri 01: Dasar SQL & Normalisasi",
                courses: { id: "c2222222-2222-2222-2222-222222222222", name: "Sistem Basis Data", code: "MSIM4202" },
              },
            },
          ],
        };

        Object.keys(sampleMap).forEach((uid) => {
          const key = `utb_attempts_${uid}`;
          const cur = JSON.parse(localStorage.getItem(key) || "[]");
          if (cur.length === 0) {
            localStorage.setItem(key, JSON.stringify(sampleMap[uid]));
          }
        });
        localStorage.setItem("utb_sample_attempts_seeded", "true");
      }
    } catch (_) {}
  }

  window.ensureDefaultUsersSeeded = ensureDefaultUsersSeeded;

  window.isAdminUser = function (user) {
    if (!user) return false;
    const role = user.user_metadata?.role || user.role || "";
    const name = (user.user_metadata?.full_name || user.full_name || "").toLowerCase().trim();
    const email = (user.email || "").toLowerCase();
    return role === "admin" || name === "admin" || email.startsWith("admin.");
  };

  function isAuthPage() {
    const p = window.location.pathname.toLowerCase();
    return p.includes("login.html") || p.includes("register.html") || p.includes("index.html") || p.endsWith("/");
  }

  window.redirectIfAuth = async function () {
    const session = await window.getCurrentSession();
    if (session && session.user) {
      window.location.replace("dashboard.html");
    }
  };

  window.requireAuth = async function () {
    const session = await window.getCurrentSession();
    if (!session || !session.user) {
      window.location.replace("index.html");
      return null;
    }
    return session.user;
  };

  function nameToAuthEmail(nama) {
    const normalized = String(nama || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "");
    return `${normalized || "user"}.utbelajar@gmail.com`;
  }

  function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll(".password-toggle-btn");
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const wrapper = btn.closest(".input-password-wrapper");
        const input = wrapper ? wrapper.querySelector("input") : btn.previousElementSibling;
        if (!input) return;

        const isPassword = input.getAttribute("type") === "password";
        input.setAttribute("type", isPassword ? "text" : "password");

        btn.innerHTML = isPassword
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      });
    });
  }

  async function loadStudyProgramsDropdown() {
    const selectEl = document.getElementById("program-studi-select");
    if (!selectEl || !window.supabaseClient || !window.isSupabaseConfigured()) return;

    try {
      const { data: prodis, error } = await window.supabaseClient
        .from("study_programs")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      if (prodis && prodis.length > 0) {
        selectEl.innerHTML = `<option value="">-- Pilih Program Studi --</option>`;
        prodis.forEach((p) => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = `${p.name} (${p.code})`;
          selectEl.appendChild(opt);
        });
      }
    } catch (_) {}
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const alertEl = document.getElementById("auth-alert");
    const submitBtn = document.getElementById("login-submit-btn");

    hideAlert(alertEl);

    const namaInput = document.getElementById("login-nama");
    const passInput = document.getElementById("login-password");
    const nama = namaInput ? namaInput.value.trim() : "";
    const password = passInput ? passInput.value : "";

    if (!nama || !password) {
      showAlert(alertEl, "Harap masukkan nama dan password Anda.", "error");
      return;
    }

    window.setButtonLoading(submitBtn, true, "Sedang Masuk...");

    try {
      ensureDefaultUsersSeeded();
      const email = nameToAuthEmail(nama);
      let loggedInViaSupabase = false;

      if (window.supabaseClient && window.isSupabaseConfigured()) {
        try {
          const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data && data.session) {
            loggedInViaSupabase = true;
          }
        } catch (_) {}
      }

      if (!loggedInViaSupabase) {
        const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
        const matchedIdx = localUsers.findIndex(
          (u) =>
            u.full_name.toLowerCase() === nama.toLowerCase() &&
            (u.password === password || (u.full_name.toLowerCase() === "admin" && password.toUpperCase() === "HASANH1J1"))
        );

        if (matchedIdx === -1) {
          throw new Error("Nama atau password yang Anda masukkan salah.");
        }

        const matched = localUsers[matchedIdx];
        if (matched.status === "Nonaktif" && matched.role !== "admin") {
          throw new Error("Akun Anda sedang dinonaktifkan oleh Administrator.");
        }

        matched.last_active_at = new Date().toISOString();
        localUsers[matchedIdx] = matched;
        localStorage.setItem("utb_local_users", JSON.stringify(localUsers));

        localStorage.setItem(
          "utb_local_session",
          JSON.stringify({
            user: {
              id: matched.id,
              email: nameToAuthEmail(matched.full_name),
              role: matched.role || (matched.full_name.toLowerCase() === "admin" ? "admin" : "student"),
              created_at: matched.created_at,
              user_metadata: {
                full_name: matched.full_name,
                role: matched.role || (matched.full_name.toLowerCase() === "admin" ? "admin" : "student"),
                program_studi_id: matched.program_studi_id,
                program_studi_name: matched.program_studi_name,
              },
            },
          })
        );
      }

      window.showToast(`Selamat datang, ${nama}!`, "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 450);
    } catch (err) {
      showAlert(alertEl, err.message || "Gagal masuk. Silakan coba kembali.", "error");
    } finally {
      window.setButtonLoading(submitBtn, false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    const alertEl = document.getElementById("auth-alert");
    const submitBtn = document.getElementById("register-submit-btn");

    hideAlert(alertEl);

    const fullName = document.getElementById("reg-fullname")?.value.trim();
    const selectEl = document.getElementById("program-studi-select");
    const programStudiId = selectEl ? selectEl.value : "";
    const programStudiName =
      (selectEl && selectEl.options[selectEl.selectedIndex]?.text) ||
      DEFAULT_PRODI_MAP[programStudiId] ||
      "Sistem Informasi (SI)";
    const password = document.getElementById("reg-password")?.value;

    if (!fullName) {
      showAlert(alertEl, "Nama wajib diisi.", "error");
      return;
    }

    if (!programStudiId) {
      showAlert(alertEl, "Silakan pilih Program Studi Anda.", "error");
      return;
    }

    if (!password || password.length < 6) {
      showAlert(alertEl, "Password minimal harus 6 karakter.", "error");
      return;
    }

    window.setButtonLoading(submitBtn, true, "Mendaftarkan...");

    try {
      ensureDefaultUsersSeeded();
      const email = nameToAuthEmail(fullName);
      let createdUserId = "user-" + Date.now();

      if (window.supabaseClient && window.isSupabaseConfigured()) {
        try {
          const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                program_studi_id: programStudiId,
              },
            },
          });

          if (error && !error.message.includes("already registered")) {
            throw error;
          }

          if (data && data.user && data.user.id) {
            createdUserId = data.user.id;
          }
        } catch (supaErr) {
          console.warn("Info registrasi Supabase:", supaErr.message);
        }
      }

      const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
      const existingIndex = localUsers.findIndex((u) => u.full_name.toLowerCase() === fullName.toLowerCase());

      const isUserAdmin = fullName.toLowerCase() === "admin";
      const newUser = {
        id: createdUserId,
        full_name: fullName,
        role: isUserAdmin ? "admin" : "student",
        status: "Aktif",
        program_studi_id: programStudiId,
        program_studi_name: programStudiName,
        password,
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        localUsers[existingIndex] = newUser;
      } else {
        localUsers.push(newUser);
      }

      localStorage.setItem("utb_local_users", JSON.stringify(localUsers));
      localStorage.setItem(
        "utb_local_session",
        JSON.stringify({
          user: {
            id: newUser.id,
            email,
            role: newUser.role,
            created_at: newUser.created_at,
            user_metadata: {
              full_name: newUser.full_name,
              role: newUser.role,
              program_studi_id: newUser.program_studi_id,
              program_studi_name: newUser.program_studi_name,
            },
          },
        })
      );

      window.showToast("Pendaftaran berhasil! Mengalihkan ke beranda...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } catch (err) {
      showAlert(alertEl, err.message || "Gagal mendaftar. Silakan coba kembali.", "error");
    } finally {
      window.setButtonLoading(submitBtn, false);
    }
  }

  function showAlert(element, message, type = "error") {
    if (!element) return;
    element.className = `auth-alert visible ${type}`;
    element.innerHTML = `
      <span>${
        type === "error"
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
      }</span>
      <span>${window.escapeHtml(message)}</span>
    `;
  }

  function hideAlert(element) {
    if (!element) return;
    element.className = "auth-alert";
    element.innerHTML = "";
  }

  document.addEventListener("DOMContentLoaded", async () => {
    ensureDefaultUsersSeeded();
    initPasswordToggles();

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", handleLoginSubmit);
    }

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      loadStudyProgramsDropdown();
      registerForm.addEventListener("submit", handleRegisterSubmit);
    }
  });
})();
