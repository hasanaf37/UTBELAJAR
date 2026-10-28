// ==============================================================================
// UTBELAJAR - USER PROFILE & ACCOUNT MANAGEMENT (FILE:// & HTTP:// READY)
// ==============================================================================

(function () {
  let currentUser = null;
  let currentProfile = null;

  document.addEventListener("DOMContentLoaded", async () => {
    currentUser = await window.requireAuth();
    if (!currentUser) return;

    await loadUserProfileData();
    await loadProfileStats();

    const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
    const supaCard = document.getElementById("supabase-status-card");
    const secStatusEl = document.getElementById("profile-security-status");

    if (isAdmin) {
      if (supaCard) supaCard.style.display = "flex";
      if (secStatusEl) secStatusEl.textContent = "Administrator (Akses Database Supabase)";
      setupSupabaseConfigCard();
    } else {
      if (supaCard) supaCard.remove();
      if (secStatusEl) secStatusEl.textContent = "Terlindungi & Terenkripsi";
    }

    setupEditProfileModal();
    setupLogoutModal();
  });

  function setupSupabaseConfigCard() {
    const urlInput = document.getElementById("input-supabase-url");
    const keyInput = document.getElementById("input-supabase-key");
    const toggleKeyBtn = document.getElementById("btn-toggle-supa-key-vis");
    const refreshBtn = document.getElementById("btn-refresh-supabase-status");
    const resetBtn = document.getElementById("btn-reset-supabase-config");
    const form = document.getElementById("supabase-config-form");

    if (urlInput) urlInput.value = window.APP_CONFIG?.SUPABASE_URL || "";
    if (keyInput) keyInput.value = window.APP_CONFIG?.SUPABASE_ANON_KEY || "";

    toggleKeyBtn?.addEventListener("click", () => {
      if (!keyInput) return;
      keyInput.type = keyInput.type === "password" ? "text" : "password";
    });

    refreshBtn?.addEventListener("click", async () => {
      window.setButtonLoading(refreshBtn, true, "Mengecek...");
      await runSupabaseStatusCheck(true);
      window.setButtonLoading(refreshBtn, false);
    });

    resetBtn?.addEventListener("click", async () => {
      if (typeof window.resetSupabaseCredentials === "function") {
        window.resetSupabaseCredentials();
      }
      if (urlInput) urlInput.value = window.APP_CONFIG?.SUPABASE_URL || "";
      if (keyInput) keyInput.value = window.APP_CONFIG?.SUPABASE_ANON_KEY || "";
      window.showToast("URL & API Key Supabase dikembalikan ke default.", "info");
      await runSupabaseStatusCheck(false);
    });

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newUrl = urlInput?.value.trim() || "";
      const newKey = keyInput?.value.trim() || "";

      if (!newUrl || !newKey) {
        window.showToast("URL dan API Key Supabase tidak boleh kosong.", "error");
        return;
      }

      const saveBtn = document.getElementById("btn-save-supabase-config");
      window.setButtonLoading(saveBtn, true, "Menyimpan...");
      try {
        if (typeof window.setSupabaseCredentials === "function") {
          window.setSupabaseCredentials(newUrl, newKey, false);
        }
        await runSupabaseStatusCheck(false);
        window.showToast("Konfigurasi URL & API Key Supabase berhasil disimpan!", "success");
      } finally {
        window.setButtonLoading(saveBtn, false);
      }
    });

    runSupabaseStatusCheck(false);
  }

  async function runSupabaseStatusCheck(showNotification) {
    const badgeEl = document.getElementById("supa-status-badge");
    const stateEl = document.getElementById("supa-info-state");
    const detailEl = document.getElementById("supa-info-detail");
    const latencyEl = document.getElementById("supa-info-latency");
    const checkedAtEl = document.getElementById("supa-info-checked-at");

    if (badgeEl) {
      badgeEl.className = "badge badge-warning";
      badgeEl.textContent = "Memeriksa Koneksi...";
    }

    if (typeof window.checkSupabaseConnection !== "function") return;
    const status = await window.checkSupabaseConnection();

    if (badgeEl) {
      badgeEl.className = status.connected ? "badge badge-success" : "badge badge-danger";
      badgeEl.textContent = status.connected ? "● Terhubung (Online)" : "● Terputus / Mode Lokal";
    }

    if (stateEl) {
      stateEl.textContent = status.statusText;
      stateEl.style.color = status.connected ? "var(--success)" : "var(--danger)";
    }
    if (detailEl) detailEl.textContent = status.detailText;
    if (latencyEl) latencyEl.textContent = `${status.latencyMs} ms`;
    if (checkedAtEl) checkedAtEl.textContent = window.formatDateTime(status.checkedAt);

    if (showNotification) {
      window.showToast(
        `Status Database: ${status.statusText} (${status.latencyMs} ms)`,
        status.connected ? "success" : "warning"
      );
    }
  }

  async function loadUserProfileData() {
    try {
      let profile = null;
      if (window.supabaseClient) {
        try {
          const { data } = await window.supabaseClient
            .from("profiles")
            .select("id, full_name, program_studi_id, avatar_url, created_at, study_programs(id, name, code)")
            .eq("id", currentUser.id)
            .single();
          profile = data;
        } catch (_) {}
      }

      currentProfile = profile;

      const fullName = profile?.full_name || currentUser.user_metadata?.full_name || "Siswa UTBelajar";
      const email = currentUser.email || "-";
      const prodiName =
        profile?.study_programs?.name || currentUser.user_metadata?.program_studi_name || "Sistem Informasi (SI)";
      const prodiCode = profile?.study_programs?.code ? ` (${profile.study_programs.code})` : "";
      const joinDate = window.formatDate(profile?.created_at || currentUser.created_at);

      const nameEl = document.getElementById("profile-fullname");
      const emailEl = document.getElementById("profile-email");
      const prodiTag = document.getElementById("profile-prodi-tag");
      const avatarEl = document.getElementById("profile-avatar-display");
      const detailProdi = document.getElementById("profile-detail-prodi");
      const detailJoined = document.getElementById("profile-detail-joined");

      if (nameEl) nameEl.textContent = fullName;
      if (emailEl) emailEl.textContent = email;
      if (prodiTag) prodiTag.textContent = prodiName + prodiCode;
      if (detailProdi) detailProdi.textContent = prodiName + prodiCode;
      if (detailJoined) detailJoined.textContent = joinDate;

      if (avatarEl) {
        const initials = fullName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        avatarEl.textContent = initials || "U";
      }
    } catch (err) {
      console.warn("Memuat profil:", err.message);
    }
  }

  async function loadProfileStats() {
    try {
      const localAttempts = JSON.parse(localStorage.getItem(`utb_attempts_${currentUser.id}`) || "[]");
      const totalAttempts = localAttempts.length;
      let totalScore = 0;
      let totalSeconds = 0;

      localAttempts.forEach((a) => {
        totalScore += Number(a.score) || 0;
        totalSeconds += Number(a.duration_seconds) || 0;
      });

      const avgScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0;

      const statAttEl = document.getElementById("pstat-attempts");
      const statScoreEl = document.getElementById("pstat-avg-score");
      const statTimeEl = document.getElementById("pstat-time");

      if (statAttEl) statAttEl.textContent = totalAttempts;
      if (statScoreEl) statScoreEl.textContent = avgScore;
      if (statTimeEl) statTimeEl.textContent = window.formatDuration(totalSeconds);
    } catch (_) {}
  }

  function setupEditProfileModal() {
    const editBtn = document.getElementById("btn-open-edit-profile");
    const modalClose = document.getElementById("btn-close-edit-modal");
    const form = document.getElementById("edit-profile-form");

    if (!editBtn || !form) return;

    editBtn.addEventListener("click", () => {
      const nameInput = document.getElementById("edit-fullname-input");
      if (nameInput) nameInput.value = currentProfile?.full_name || currentUser.user_metadata?.full_name || "";
      window.openModal("modal-edit-profile");
    });

    modalClose?.addEventListener("click", () => {
      window.closeModal("modal-edit-profile");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fullName = document.getElementById("edit-fullname-input")?.value.trim();
      if (!fullName) return;

      const localSessionRaw = localStorage.getItem("utb_local_session");
      if (localSessionRaw) {
        try {
          const parsed = JSON.parse(localSessionRaw);
          parsed.user.user_metadata.full_name = fullName;
          localStorage.setItem("utb_local_session", JSON.stringify(parsed));
          currentUser = parsed.user;
        } catch (_) {}
      }

      window.showToast("Profil berhasil diperbarui!", "success");
      window.closeModal("modal-edit-profile");
      await loadUserProfileData();
    });
  }

  function setupLogoutModal() {
    const triggerBtns = document.querySelectorAll(".btn-open-logout-modal");
    const cancelBtn = document.getElementById("btn-cancel-logout");
    const confirmBtn = document.getElementById("btn-confirm-logout");

    triggerBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        window.openModal("modal-logout-confirm");
      });
    });

    cancelBtn?.addEventListener("click", () => {
      window.closeModal("modal-logout-confirm");
    });

    confirmBtn?.addEventListener("click", async () => {
      window.closeModal("modal-logout-confirm");
      await window.handleLogout();
    });
  }
})();
