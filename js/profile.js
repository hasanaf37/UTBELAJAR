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
      if (supaCard) supaCard.style.display = "block";
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
      const isPass = keyInput.type === "password";
      keyInput.type = isPass ? "text" : "password";
      toggleKeyBtn.innerHTML = isPass
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
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
      const isAdmin = currentUser.role === "admin" || currentUser.user_metadata?.role === "admin";
      const currentName = currentUser.user_metadata?.full_name || currentUser.full_name || "";

      if (window.supabaseClient && window.isSupabaseConfigured()) {
        try {
          if (isAdmin) {
            const { data } = await window.supabaseClient
              .from("admins")
              .select("id, username, full_name, created_at")
              .or(`username.eq.${currentName},full_name.eq.${currentName}`)
              .limit(1)
              .maybeSingle();

            if (data) {
              profile = {
                id: data.id,
                full_name: data.full_name || data.username,
                program_studi_id: "b1111111-1111-1111-1111-111111111111",
                program_studi_name: "Administrator Sistem",
                created_at: data.created_at,
              };
            }
          } else {
            const { data } = await window.supabaseClient
              .from("users")
              .select("id, full_name, program_studi_id, program_studi_name, created_at")
              .eq("full_name", currentName)
              .limit(1)
              .maybeSingle();

            if (data) {
              profile = {
                id: data.id,
                full_name: data.full_name,
                program_studi_id: data.program_studi_id,
                program_studi_name: data.program_studi_name,
                created_at: data.created_at,
              };
            }
          }
        } catch (_) {}
      }

      if (!profile) {
        const localUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
        const match = localUsers.find(
          (u) => (u.full_name && u.full_name.toLowerCase() === currentName.toLowerCase()) || u.id === currentUser.id
        );
        if (match) {
          profile = {
            id: match.id,
            full_name: match.full_name,
            program_studi_id: match.program_studi_id,
            program_studi_name: match.program_studi_name,
            created_at: match.created_at,
          };
        }
      }

      currentProfile = profile;

      const fullName = profile?.full_name || currentUser.user_metadata?.full_name || "Siswa UTBelajar";
      const email = currentUser.email || "-";
      const prodiName =
        profile?.program_studi_name || currentUser.user_metadata?.program_studi_name || "Sistem Informasi (SI)";
      const joinDate = window.formatDate(profile?.created_at || currentUser.created_at);

      const nameEl = document.getElementById("profile-fullname");
      const emailEl = document.getElementById("profile-email");
      const prodiTag = document.getElementById("profile-prodi-tag");
      const avatarEl = document.getElementById("profile-avatar-display");
      const detailProdi = document.getElementById("profile-detail-prodi");
      const detailJoined = document.getElementById("profile-detail-joined");

      if (nameEl) nameEl.textContent = fullName;
      if (emailEl) emailEl.textContent = email;
      if (prodiTag) prodiTag.textContent = prodiName;
      if (detailProdi) detailProdi.textContent = prodiName;
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

    editBtn.addEventListener("click", async () => {
      const nameInput = document.getElementById("edit-fullname-input");
      const prodiSelect = document.getElementById("edit-prodi-select");
      if (nameInput) nameInput.value = currentProfile?.full_name || currentUser.user_metadata?.full_name || "";

      if (prodiSelect) {
        prodiSelect.innerHTML = `<option value="">Memuat Program Studi...</option>`;
        const prodis =
          typeof window.dbGetStudyPrograms === "function"
            ? await window.dbGetStudyPrograms()
            : window.DEFAULT_PRODI_LIST || [];

        const currentProdiId = currentProfile?.program_studi_id || currentUser.user_metadata?.program_studi_id || "";
        const currentProdiName = (currentProfile?.program_studi_name || currentUser.user_metadata?.program_studi_name || "").toLowerCase();

        prodiSelect.innerHTML = prodis
          .map((p) => {
            const isMatch = (currentProdiId && p.id === currentProdiId) || (currentProdiName && p.name.toLowerCase().includes(currentProdiName));
            return `<option value="${p.id}" ${isMatch ? "selected" : ""}>${window.escapeHtml(p.name)}</option>`;
          })
          .join("");
      }

      window.openModal("modal-edit-profile");
    });

    modalClose?.addEventListener("click", () => {
      window.closeModal("modal-edit-profile");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newFullName = document.getElementById("edit-fullname-input")?.value.trim();
      const prodiSelect = document.getElementById("edit-prodi-select");
      const newProdiId = prodiSelect?.value || "";
      const newProdiName = (prodiSelect && prodiSelect.options[prodiSelect.selectedIndex]?.text) || "";

      if (!newFullName) return;

      const submitBtn = form.querySelector("button[type='submit']");
      window.setButtonLoading(submitBtn, true, "Menyimpan...");

      const oldFullName = currentUser.user_metadata?.full_name || currentUser.full_name || "";

      if (typeof window.dbUpdateUserProfile === "function") {
        await window.dbUpdateUserProfile(oldFullName, newFullName, newProdiId, newProdiName);
      }

      const localSessionRaw = localStorage.getItem("utb_local_session");
      if (localSessionRaw) {
        try {
          const parsed = JSON.parse(localSessionRaw);
          parsed.user.user_metadata.full_name = newFullName;
          if (newProdiId) parsed.user.user_metadata.program_studi_id = newProdiId;
          if (newProdiName) parsed.user.user_metadata.program_studi_name = newProdiName;
          localStorage.setItem("utb_local_session", JSON.stringify(parsed));
          currentUser = parsed.user;
        } catch (_) {}
      }

      window.setButtonLoading(submitBtn, false);
      window.showToast("Profil & Program Studi berhasil diperbarui ke Supabase!", "success");
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
