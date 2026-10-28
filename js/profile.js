// ==============================================================================
// UTBELAJAR - USER PROFILE & ACCOUNT MANAGEMENT
// ==============================================================================

import { supabase } from "./supabase.js";
import { requireAuth } from "./auth.js";
import { showToast, formatDate, formatDuration, escapeHtml, openModal, closeModal, setButtonLoading } from "./utils.js";
import { handleLogout } from "./navigation.js";

let currentUser = null;
let currentProfile = null;

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await loadUserProfileData();
  await loadProfileStats();
  setupEditProfileModal();
  setupLogoutModal();
});

/**
 * Memuat detail data profil pengguna
 */
async function loadUserProfileData() {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, program_studi_id, avatar_url, created_at, study_programs(id, name, code)")
      .eq("id", currentUser.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    currentProfile = profile;

    const fullName = profile?.full_name || currentUser.user_metadata?.full_name || "Siswa UTBelajar";
    const email = currentUser.email || "-";
    const prodiName = profile?.study_programs?.name || "Belum Dipilih";
    const prodiCode = profile?.study_programs?.code ? ` (${profile.study_programs.code})` : "";
    const joinDate = formatDate(profile?.created_at || currentUser.created_at);

    // Tampilkan di UI
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
    showToast("Gagal memuat profil: " + err.message, "error");
  }
}

/**
 * Memuat ringkasan statistik belajar pengguna
 */
async function loadProfileStats() {
  try {
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("score, duration_seconds")
      .eq("user_id", currentUser.id)
      .not("completed_at", "is", null);

    const totalAttempts = attempts ? attempts.length : 0;
    let totalScore = 0;
    let totalSeconds = 0;

    attempts?.forEach((a) => {
      totalScore += Number(a.score) || 0;
      totalSeconds += Number(a.duration_seconds) || 0;
    });

    const avgScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0;

    const statAttEl = document.getElementById("pstat-attempts");
    const statScoreEl = document.getElementById("pstat-avg-score");
    const statTimeEl = document.getElementById("pstat-time");

    if (statAttEl) statAttEl.textContent = totalAttempts;
    if (statScoreEl) statScoreEl.textContent = avgScore;
    if (statTimeEl) statTimeEl.textContent = formatDuration(totalSeconds);
  } catch (err) {
    console.warn("Gagal memuat statistik profil:", err.message);
  }
}

/**
 * Setup Modal Edit Profil
 */
async function setupEditProfileModal() {
  const editBtn = document.getElementById("btn-open-edit-profile");
  const modalClose = document.getElementById("btn-close-edit-modal");
  const form = document.getElementById("edit-profile-form");
  const prodiSelect = document.getElementById("edit-prodi-select");

  if (!editBtn || !form) return;

  // Isi dropdown program studi
  try {
    const { data: prodis } = await supabase
      .from("study_programs")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (prodis && prodiSelect) {
      prodiSelect.innerHTML = `<option value="">-- Pilih Program Studi --</option>`;
      prodis.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.code})`;
        prodiSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.warn("Gagal dropdown prodi edit:", err.message);
  }

  editBtn.addEventListener("click", () => {
    // Isi field dengan nilai saat ini
    const nameInput = document.getElementById("edit-fullname-input");
    const avatarInput = document.getElementById("edit-avatar-input");

    if (nameInput) nameInput.value = currentProfile?.full_name || currentUser.user_metadata?.full_name || "";
    if (avatarInput) avatarInput.value = currentProfile?.avatar_url || "";
    if (prodiSelect && currentProfile?.program_studi_id) {
      prodiSelect.value = currentProfile.program_studi_id;
    }

    openModal("modal-edit-profile");
  });

  modalClose?.addEventListener("click", () => {
    closeModal("modal-edit-profile");
  });

  // Submit update profil
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById("btn-save-profile");
    setButtonLoading(saveBtn, true, "Menyimpan...");

    const fullName = document.getElementById("edit-fullname-input")?.value.trim();
    const prodiId = document.getElementById("edit-prodi-select")?.value || null;
    const avatarUrl = document.getElementById("edit-avatar-input")?.value.trim() || null;

    if (!fullName) {
      showToast("Nama lengkap wajib diisi.", "error");
      setButtonLoading(saveBtn, false);
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: currentUser.id,
          full_name: fullName,
          program_studi_id: prodiId,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      showToast("Profil berhasil diperbarui!", "success");
      closeModal("modal-edit-profile");
      await loadUserProfileData();
    } catch (err) {
      showToast("Gagal menyimpan profil: " + err.message, "error");
    } finally {
      setButtonLoading(saveBtn, false);
    }
  });
}

/**
 * Setup Konfirmasi Logout Modal
 */
function setupLogoutModal() {
  const triggerBtns = document.querySelectorAll(".btn-open-logout-modal");
  const cancelBtn = document.getElementById("btn-cancel-logout");
  const confirmBtn = document.getElementById("btn-confirm-logout");

  triggerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal("modal-logout-confirm");
    });
  });

  cancelBtn?.addEventListener("click", () => {
    closeModal("modal-logout-confirm");
  });

  confirmBtn?.addEventListener("click", async () => {
    closeModal("modal-logout-confirm");
    await handleLogout();
  });
}
