// ==============================================================================
// UTBELAJAR - NAVIGATION & APP SHELL CONTROLLER
// ==============================================================================

import { supabase, getCurrentSession } from "./supabase.js";
import { showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initSidebar();
  initMobileDrawer();
  highlightActiveNav();
  await loadSidebarUserProfile();
});

/**
 * Inisialisasi collapse/expand sidebar dan preferensi localStorage
 */
function initSidebar() {
  const sidebar = document.querySelector(".app-sidebar");
  const toggleBtn = document.querySelector(".sidebar-toggle-btn");

  if (!sidebar || !toggleBtn) return;

  // Baca preferensi collapse sebelumnya
  const isCollapsed = localStorage.getItem("utb_sidebar_collapsed") === "true";
  if (isCollapsed) {
    sidebar.classList.add("collapsed");
  }

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    localStorage.setItem("utb_sidebar_collapsed", sidebar.classList.contains("collapsed"));
  });
}

/**
 * Inisialisasi drawer mobile untuk layar smartphone
 */
function initMobileDrawer() {
  const sidebar = document.querySelector(".app-sidebar");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  let overlay = document.querySelector(".sidebar-overlay");

  if (!mobileToggle || !sidebar) return;

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);
  }

  mobileToggle.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("active");
  });
}

/**
 * Memberikan active state pada menu yang sedang dibuka
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname.toLowerCase();
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    const href = item.getAttribute("href")?.toLowerCase();
    if (!href) return;

    if (
      (currentPath.endsWith(href) || (href === "dashboard.html" && currentPath.endsWith("/"))) &&
      !item.classList.contains("nav-profile")
    ) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/**
 * Memuat avatar dan nama user di bagian bawah sidebar
 */
async function loadSidebarUserProfile() {
  const nameEl = document.querySelector(".sidebar-footer .user-name");
  const roleEl = document.querySelector(".sidebar-footer .user-role");
  const avatarEl = document.querySelector(".sidebar-footer .user-avatar");

  if (!nameEl) return;

  const session = await getCurrentSession();
  if (!session || !session.user) return;

  const user = session.user;

  try {
    let profile = null;
    if (supabase && !String(user.id).startsWith("local-")) {
      const res = await supabase
        .from("profiles")
        .select("full_name, avatar_url, study_programs(name)")
        .eq("id", user.id)
        .single();
      profile = res.data;
    }

    const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Pengguna";
    const studyProgName =
      profile?.study_programs?.name || user.user_metadata?.program_studi_name || "Pelajar Mandiri";

    nameEl.textContent = fullName;
    if (roleEl) roleEl.textContent = studyProgName;

    if (avatarEl) {
      if (profile?.avatar_url) {
        avatarEl.innerHTML = `<img src="${profile.avatar_url}" alt="${fullName}" />`;
      } else {
        const initials = fullName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        avatarEl.textContent = initials || "U";
      }
    }
  } catch (err) {
    nameEl.textContent = user.user_metadata?.full_name || user.email?.split("@")[0] || "Siswa UTBelajar";
  }
}

/**
 * Fungsi logout global yang aman
 */
export async function handleLogout() {
  try {
    localStorage.removeItem("utb_local_session");
    if (supabase) {
      await supabase.auth.signOut();
    }
    showToast("Anda telah berhasil keluar.", "info");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 600);
  } catch (err) {
    console.error("Gagal keluar:", err.message);
    window.location.href = "index.html";
  }
}

// Pasang listener jika ada tombol logout
document.addEventListener("click", (e) => {
  const logoutBtn = e.target.closest("#logout-btn, .btn-logout-trigger");
  if (logoutBtn) {
    e.preventDefault();
    handleLogout();
  }
});
