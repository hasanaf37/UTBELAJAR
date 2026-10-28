// ==============================================================================
// UTBELAJAR - NAVIGATION & APP SHELL CONTROLLER (FILE:// & HTTP:// READY)
// ==============================================================================

(function () {
  function openMobileDrawer() {
    const sidebar = document.querySelector(".app-sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    if (!sidebar) return;

    sidebar.classList.add("mobile-open");
    if (overlay) overlay.classList.add("active");

    // Kunci scroll halaman belakang pada HP & tablet untuk menghindari bug
    document.body.classList.add("sidebar-open-locked");
    document.documentElement.classList.add("sidebar-open-locked");
  }

  function closeMobileDrawer() {
    const sidebar = document.querySelector(".app-sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    if (!sidebar) return;

    sidebar.classList.remove("mobile-open");
    if (overlay) overlay.classList.remove("active");

    // Buka kembali scroll halaman
    document.body.classList.remove("sidebar-open-locked");
    document.documentElement.classList.remove("sidebar-open-locked");
  }

  function initSidebar() {
    const sidebar = document.querySelector(".app-sidebar");
    const toggleBtn = document.querySelector(".sidebar-toggle-btn");

    if (!sidebar || !toggleBtn) return;

    const isCollapsed = localStorage.getItem("utb_sidebar_collapsed") === "true";
    if (isCollapsed) {
      sidebar.classList.add("collapsed");
    }

    toggleBtn.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        closeMobileDrawer();
        return;
      }
      sidebar.classList.toggle("collapsed");
      localStorage.setItem("utb_sidebar_collapsed", sidebar.classList.contains("collapsed"));
    });
  }

  function initMobileDrawer() {
    const sidebar = document.querySelector(".app-sidebar");
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    let overlay = document.querySelector(".sidebar-overlay");

    if (!sidebar) return;

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    if (mobileToggle) {
      mobileToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("mobile-open")) {
          closeMobileDrawer();
        } else {
          openMobileDrawer();
        }
      });
    }

    overlay.addEventListener("click", () => {
      closeMobileDrawer();
    });

    // Mencegah scroll tembus saat menyentuh overlay
    overlay.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    // Tutup drawer & kembalikan scroll saat navigasi diklik pada HP/tablet
    sidebar.querySelectorAll(".nav-item, .brand-link, .user-profile-btn").forEach((el) => {
      el.addEventListener("click", () => {
        if (window.innerWidth <= 1024) {
          closeMobileDrawer();
        }
      });
    });

    // Tutup drawer dengan tombol Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("mobile-open")) {
        closeMobileDrawer();
      }
    });

    // Kembalikan scroll saat layar diperbesar ke desktop (> 1024px)
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024 && sidebar.classList.contains("mobile-open")) {
        closeMobileDrawer();
      }
    });
  }

  function highlightActiveNav() {
    const currentPath = window.location.pathname.toLowerCase();
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
      if (!item.getAttribute("data-tooltip")) {
        const textEl = item.querySelector(".nav-text");
        if (textEl && textEl.textContent.trim()) {
          item.setAttribute("data-tooltip", textEl.textContent.trim());
        }
      }

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

  async function loadSidebarUserProfile() {
    const nameEl = document.querySelector(".sidebar-footer .user-name");
    const roleEl = document.querySelector(".sidebar-footer .user-role");
    const avatarEl = document.querySelector(".sidebar-footer .user-avatar");

    if (!nameEl) return;

    const session = await window.getCurrentSession();
    if (!session || !session.user) return;

    const user = session.user;

    try {
      let profile = null;
      if (window.supabaseClient && !String(user.id).startsWith("user-") && !String(user.id).startsWith("local-")) {
        const res = await window.supabaseClient
          .from("profiles")
          .select("full_name, avatar_url, study_programs(name)")
          .eq("id", user.id)
          .single();
        profile = res.data;
      }

      const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(user);
      const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Pengguna";
      const studyProgName = isAdmin
        ? "Administrator Sistem"
        : profile?.study_programs?.name || user.user_metadata?.program_studi_name || "Sistem Informasi (SI)";

      nameEl.textContent = isAdmin ? "Administrator (admin)" : fullName;
      if (roleEl) roleEl.textContent = studyProgName;

      const sessionTextEl = document.querySelector(".session-indicator span");
      if (sessionTextEl && isAdmin) {
        sessionTextEl.textContent = "Mode Admin Aktif";
      }

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
    } catch (_) {
      nameEl.textContent = user.user_metadata?.full_name || user.email?.split("@")[0] || "Siswa UTBelajar";
    }
  }

  window.handleLogout = async function () {
    try {
      if (typeof window.pingUserPresence === "function") {
        await window.pingUserPresence(false);
      }
      localStorage.removeItem("utb_local_session");
      if (window.supabaseClient) {
        await window.supabaseClient.auth.signOut();
      }
      window.showToast("Anda telah berhasil keluar.", "info");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 450);
    } catch (_) {
      window.location.href = "index.html";
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    initSidebar();
    initMobileDrawer();
    highlightActiveNav();
    await loadSidebarUserProfile();
  });

  document.addEventListener("click", (e) => {
    const logoutBtn = e.target.closest("#logout-btn, .btn-logout-trigger");
    if (logoutBtn) {
      e.preventDefault();
      window.handleLogout();
    }
  });
})();
