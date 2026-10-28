// ==============================================================================
// UTBELAJAR - AUTHENTICATION LOGIC (LOGIN NAMA & PASSWORD / DAFTAR NAMA, PRODI & PASSWORD)
// ==============================================================================

import { supabase, getCurrentSession } from "./supabase.js";
import { showToast, setButtonLoading, escapeHtml } from "./utils.js";
import { isSupabaseConfigured } from "./config.js";

// Daftar Program Studi Bawaan
const DEFAULT_PRODI_MAP = {
  "b1111111-1111-1111-1111-111111111111": "Sistem Informasi (SI)",
  "b2222222-2222-2222-2222-222222222222": "Manajemen (MNJ)",
  "b3333333-3333-3333-3333-333333333333": "Ilmu Komunikasi (ILKOM)",
  "b4444444-4444-4444-4444-444444444444": "Akuntansi (AKT)",
};

document.addEventListener("DOMContentLoaded", async () => {
  initPasswordToggles();

  // Jika di halaman auth (login/register), redirect jika user sudah login
  if (isAuthPage()) {
    await redirectIfAuth();
  }

  // Handle Login Form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  // Handle Register Form
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    await loadStudyProgramsDropdown();
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }
});

/**
 * Memeriksa apakah halaman saat ini adalah halaman login / register
 */
function isAuthPage() {
  const p = window.location.pathname.toLowerCase();
  return p.includes("login.html") || p.includes("register.html") || p.includes("index.html") || p.endsWith("/");
}

/**
 * Guard Halaman Publik: Arahkan ke dashboard jika pengguna sudah login
 */
export async function redirectIfAuth() {
  const session = await getCurrentSession();
  if (session && session.user) {
    window.location.replace("dashboard.html");
  }
}

/**
 * Guard Halaman Privat: Pastikan sesi valid sebelum membuka halaman internal
 */
export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session || !session.user) {
    const current = encodeURIComponent(window.location.pathname);
    window.location.replace(`index.html?redirect=${current}`);
    return null;
  }
  return session.user;
}

/**
 * Konversi Nama Pengguna menjadi format identifier internal untuk Supabase Auth
 */
function nameToAuthEmail(nama) {
  const normalized = String(nama || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${normalized || "user"}@utbelajar.app`;
}

/**
 * Inisialisasi tombol tampil/sembunyikan password
 */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".password-toggle-btn");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      if (!input) return;

      const isPassword = input.getAttribute("type") === "password";
      input.setAttribute("type", isPassword ? "text" : "password");

      btn.innerHTML = isPassword
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    });
  });
}

/**
 * Memuat opsi Program Studi ke form registrasi dari Supabase (jika sudah terhubung)
 */
async function loadStudyProgramsDropdown() {
  const selectEl = document.getElementById("program-studi-select");
  if (!selectEl || !isSupabaseConfigured()) return;

  try {
    const { data: prodis, error } = await supabase
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
  } catch (err) {
    console.warn("Menggunakan daftar program studi bawaan:", err.message);
  }
}

/**
 * Penanganan Submit Form Login (Nama & Password)
 */
async function handleLoginSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById("auth-alert");
  const submitBtn = document.getElementById("login-submit-btn");

  hideAlert(alertEl);

  const nama = document.getElementById("login-nama")?.value.trim();
  const password = document.getElementById("login-password")?.value;

  if (!nama || !password) {
    showAlert(alertEl, "Harap masukkan nama dan password Anda.", "error");
    return;
  }

  setButtonLoading(submitBtn, true, "Sedang Masuk...");

  try {
    if (isSupabaseConfigured()) {
      const email = nameToAuthEmail(nama);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error("Nama atau password yang Anda masukkan salah.");
      }
    } else {
      // Mode Lokal (ketika URL Supabase belum disetel)
      const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
      const matched = localUsers.find(
        (u) => u.full_name.toLowerCase() === nama.toLowerCase() && u.password === password
      );

      if (!matched) {
        throw new Error("Nama atau password tidak ditemukan. Silakan daftar terlebih dahulu.");
      }

      localStorage.setItem(
        "utb_local_session",
        JSON.stringify({
          user: {
            id: matched.id,
            email: nameToAuthEmail(matched.full_name),
            created_at: matched.created_at,
            user_metadata: {
              full_name: matched.full_name,
              program_studi_id: matched.program_studi_id,
              program_studi_name: matched.program_studi_name,
            },
          },
        })
      );
    }

    showToast("Berhasil masuk! Mengalihkan ke beranda...", "success");
    setTimeout(() => {
      window.location.replace("dashboard.html");
    }, 500);
  } catch (err) {
    showAlert(alertEl, err.message || "Gagal masuk. Silakan coba kembali.", "error");
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/**
 * Penanganan Submit Form Registrasi (Nama, Program Studi, Password)
 */
async function handleRegisterSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById("auth-alert");
  const submitBtn = document.getElementById("register-submit-btn");

  hideAlert(alertEl);

  const fullName = document.getElementById("reg-fullname")?.value.trim();
  const selectEl = document.getElementById("program-studi-select");
  const programStudiId = selectEl?.value || "";
  const programStudiName =
    selectEl?.options[selectEl.selectedIndex]?.text || DEFAULT_PRODI_MAP[programStudiId] || "Sistem Informasi";
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

  setButtonLoading(submitBtn, true, "Mendaftarkan...");

  try {
    if (isSupabaseConfigured()) {
      const email = nameToAuthEmail(fullName);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            program_studi_id: programStudiId,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          throw new Error("Nama tersebut sudah terdaftar. Silakan masuk atau gunakan nama lain.");
        }
        throw error;
      }

      if (data.session) {
        showToast("Pendaftaran berhasil! Mengalihkan...", "success");
        setTimeout(() => {
          window.location.replace("dashboard.html");
        }, 600);
      } else {
        showAlert(alertEl, "Akun berhasil dibuat! Silakan masuk.", "success");
        setTimeout(() => {
          window.location.replace("index.html");
        }, 1000);
      }
    } else {
      // Mode Lokal (ketika URL Supabase belum disetel)
      const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
      const exists = localUsers.some((u) => u.full_name.toLowerCase() === fullName.toLowerCase());
      if (exists) {
        throw new Error("Nama tersebut sudah terdaftar. Silakan langsung masuk.");
      }

      const newUser = {
        id: "local-" + Date.now(),
        full_name: fullName,
        program_studi_id: programStudiId,
        program_studi_name: programStudiName,
        password,
        created_at: new Date().toISOString(),
      };

      localUsers.push(newUser);
      localStorage.setItem("utb_local_users", JSON.stringify(localUsers));

      localStorage.setItem(
        "utb_local_session",
        JSON.stringify({
          user: {
            id: newUser.id,
            email: nameToAuthEmail(newUser.full_name),
            created_at: newUser.created_at,
            user_metadata: {
              full_name: newUser.full_name,
              program_studi_id: newUser.program_studi_id,
              program_studi_name: newUser.program_studi_name,
            },
          },
        })
      );

      showToast("Pendaftaran berhasil! Mengalihkan ke beranda...", "success");
      setTimeout(() => {
        window.location.replace("dashboard.html");
      }, 600);
    }
  } catch (err) {
    showAlert(alertEl, err.message || "Gagal mendaftar. Silakan coba kembali.", "error");
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/**
 * Tampilkan Alert Form
 */
function showAlert(element, message, type = "error") {
  if (!element) return;
  element.className = `auth-alert visible ${type}`;
  element.innerHTML = `
    <span>${
      type === "error"
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
    }</span>
    <span>${escapeHtml(message)}</span>
  `;
}

function hideAlert(element) {
  if (!element) return;
  element.className = "auth-alert";
  element.innerHTML = "";
}
