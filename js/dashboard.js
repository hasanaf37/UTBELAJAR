// ==============================================================================
// UTBELAJAR - DASHBOARD LOGIC & REALTIME CHARTS (FILE:// & HTTP:// READY)
// ==============================================================================

(function () {
  let user = null;
  let quizAttempts = [];
  let studySessions = [];
  let scoreChartInstance = null;
  let durationChartInstance = null;
  let courseDistributionChartInstance = null;
  let activeScoreFilter = "all";

  document.addEventListener("DOMContentLoaded", async () => {
    user = await window.requireAuth();
    if (!user) return;

    if (typeof window.ensureDefaultUsersSeeded === "function") {
      window.ensureDefaultUsersSeeded();
    }

    const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(user);
    const adminView = document.getElementById("admin-dashboard-view");
    const studentView = document.getElementById("student-dashboard-view");

    if (isAdmin && adminView && studentView) {
      studentView.style.display = "none";
      adminView.style.display = "block";
      const pageTitle = document.querySelector(".page-title");
      if (pageTitle) pageTitle.textContent = "Beranda Administrator — Laporan Pengguna";
      initAdminDashboard();
      return;
    }

    await loadDashboardData();
    setupFilterListeners();
  });

  function getCatalogCounts() {
    const sets = JSON.parse(localStorage.getItem("utb_catalog_sets") || "null");
    const questions = JSON.parse(localStorage.getItem("utb_catalog_questions") || "null");
    return {
      totalSets: Array.isArray(sets) ? sets.length : 3,
      totalQuestions: Array.isArray(questions) ? questions.length : 4,
    };
  }

  function initAdminDashboard() {
    renderAdminDashboard();

    document.getElementById("admin-user-search")?.addEventListener("input", renderAdminDashboard);
    document.getElementById("admin-user-status-filter")?.addEventListener("change", renderAdminDashboard);
    document.getElementById("btn-admin-refresh-users")?.addEventListener("click", () => {
      renderAdminDashboard();
      window.showToast("Laporan pengguna berhasil diperbarui.", "info");
    });

    document.getElementById("btn-admin-add-user")?.addEventListener("click", () => {
      document.getElementById("admin-add-user-form")?.reset();
      window.openModal("modal-admin-add-user");
    });

    document.getElementById("btn-cancel-admin-user")?.addEventListener("click", () => {
      window.closeModal("modal-admin-add-user");
    });

    document.getElementById("btn-close-admin-detail")?.addEventListener("click", () => {
      window.closeModal("modal-admin-user-detail");
    });

    document.getElementById("admin-add-user-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const uname = document.getElementById("admin-new-username")?.value.trim();
      const prodiSel = document.getElementById("admin-new-prodi");
      const prodiId = prodiSel?.value || "b1111111-1111-1111-1111-111111111111";
      const prodiName = prodiSel?.options[prodiSel.selectedIndex]?.text || "Sistem Informasi (SI)";
      const role = document.getElementById("admin-new-role")?.value || "student";
      const status = document.getElementById("admin-new-status")?.value || "Aktif";
      const password = document.getElementById("admin-new-password")?.value || "";

      if (!uname || password.length < 4) {
        window.showToast("Nama dan password wajib diisi dengan benar.", "error");
        return;
      }

      const users = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
      if (users.some((u) => u.full_name.toLowerCase() === uname.toLowerCase())) {
        window.showToast("Nama pengguna sudah terdaftar.", "warning");
        return;
      }

      users.push({
        id: "user-" + Date.now(),
        full_name: uname,
        role,
        status,
        program_studi_id: prodiId,
        program_studi_name: role === "admin" ? "Administrator Sistem" : prodiName,
        password,
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      });

      localStorage.setItem("utb_local_users", JSON.stringify(users));
      window.closeModal("modal-admin-add-user");
      window.showToast(`Pengguna "${uname}" berhasil ditambahkan!`, "success");
      renderAdminDashboard();
    });
  }

  function renderAdminDashboard() {
    const users = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
    const searchVal = (document.getElementById("admin-user-search")?.value || "").toLowerCase().trim();
    const statusFilter = document.getElementById("admin-user-status-filter")?.value || "all";

    let totalSystemAttempts = 0;
    let totalSystemQuestionsAnswered = 0;
    let sumAllScores = 0;
    let countAllScores = 0;

    const enrichedUsers = users.map((u) => {
      const attempts = JSON.parse(localStorage.getItem(`utb_attempts_${u.id}`) || "[]");
      const paketCount = attempts.length;
      let soalCount = 0;
      let scoreSum = 0;
      let durationSum = 0;

      attempts.forEach((a) => {
        soalCount += Number(a.total_questions) || 0;
        scoreSum += Number(a.score) || 0;
        durationSum += Number(a.duration_seconds) || 0;
        sumAllScores += Number(a.score) || 0;
        countAllScores++;
      });

      totalSystemAttempts += paketCount;
      totalSystemQuestionsAnswered += soalCount;

      const avgScore = paketCount > 0 ? Math.round(scoreSum / paketCount) : 0;
      const latestAttemptDate = attempts[0]?.completed_at || null;
      const lastActive = latestAttemptDate && latestAttemptDate > (u.last_active_at || "")
        ? latestAttemptDate
        : u.last_active_at || u.created_at;

      return {
        ...u,
        status: u.status || "Aktif",
        role: u.role || (u.full_name.toLowerCase() === "admin" ? "admin" : "student"),
        paketCount,
        soalCount,
        avgScore,
        durationSum,
        lastActive,
        attempts,
      };
    });

    const activeUsersCount = enrichedUsers.filter((u) => u.status === "Aktif").length;
    const { totalSets, totalQuestions } = getCatalogCounts();
    const globalAvgScore = countAllScores > 0 ? (sumAllScores / countAllScores).toFixed(1) : "0";

    setCounter("admin-stat-total-users", enrichedUsers.length);
    setCounter("admin-stat-active-users", `${activeUsersCount} User Berstatus Aktif`);
    setCounter("admin-stat-total-questions", `${totalQuestions} Soal`);
    setCounter("admin-stat-total-sets", `Dalam ${totalSets} Paket Latihan`);
    setCounter("admin-stat-total-attempts", `${totalSystemAttempts}x`);
    setCounter("admin-stat-answered-items", `${totalSystemQuestionsAnswered} Total Butir Soal Dijawab`);
    setCounter("admin-stat-avg-score", globalAvgScore);

    const filtered = enrichedUsers.filter((u) => {
      const matchesSearch =
        !searchVal ||
        u.full_name.toLowerCase().includes(searchVal) ||
        (u.program_studi_name || "").toLowerCase().includes(searchVal);
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const tbody = document.getElementById("admin-users-tbody");
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
            Tidak ada pengguna yang sesuai dengan filter pencarian.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map((u) => {
        const isUserAdmin = u.role === "admin";
        const isAktif = u.status === "Aktif";
        const initials = u.full_name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const scoreBadgeClass =
          u.avgScore >= 75 ? "badge-success" : u.avgScore >= 50 ? "badge-warning" : "badge";

        return `
          <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.15s;">
            <td style="padding: 0.9rem 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 36px; height: 36px; border-radius: 999px; background: ${
                  isUserAdmin ? "linear-gradient(135deg, #172554, #4169F5)" : "var(--soft-blue)"
                }; color: ${
                  isUserAdmin ? "#FFFFFF" : "var(--primary-blue)"
                }; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.82rem; flex-shrink: 0;">
                  ${window.escapeHtml(initials)}
                </div>
                <div>
                  <div style="font-weight: 700; color: var(--primary-navy); display: flex; align-items: center; gap: 0.4rem;">
                    <span>${window.escapeHtml(u.full_name)}</span>
                    ${
                      isUserAdmin
                        ? `<span class="badge badge-primary" style="font-size: 0.68rem; padding: 0.1rem 0.45rem;">ADMIN</span>`
                        : ""
                    }
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">ID: ${window.escapeHtml(
                    String(u.id).slice(0, 12)
                  )}</div>
                </div>
              </div>
            </td>
            <td style="padding: 0.9rem 0.75rem; font-weight: 600; color: var(--text-main);">
              ${window.escapeHtml(u.program_studi_name || "Sistem Informasi (SI)")}
            </td>
            <td style="padding: 0.9rem 0.75rem;">
              <span class="badge ${isAktif ? "badge-success" : "badge-danger"}" style="display: inline-flex; align-items: center; gap: 0.35rem;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
                ${window.escapeHtml(u.status)}
              </span>
            </td>
            <td style="padding: 0.9rem 0.75rem;">
              <div style="font-weight: 700; color: var(--primary-navy);">${u.soalCount} Butir Soal</div>
              <div style="font-size: 0.76rem; color: var(--text-secondary);">${u.paketCount} Paket Diselesaikan</div>
            </td>
            <td style="padding: 0.9rem 0.75rem;">
              <span class="badge ${scoreBadgeClass}" style="font-size: 0.82rem;">
                ${u.paketCount > 0 ? `${u.avgScore} / 100` : "Belum Latihan"}
              </span>
              <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 0.2rem;">
                Durasi: ${window.formatDuration(u.durationSum)}
              </div>
            </td>
            <td style="padding: 0.9rem 0.75rem; font-size: 0.8rem;">
              <div style="color: var(--text-main); font-weight: 600;">
                Aktif: ${window.formatDateTime(u.lastActive)}
              </div>
              <div style="color: var(--text-secondary); font-size: 0.74rem;">
                Daftar: ${window.formatDate(u.created_at)}
              </div>
            </td>
            <td style="padding: 0.9rem 0.75rem; text-align: right; white-space: nowrap;">
              <button class="btn btn-secondary btn-sm btn-admin-detail-user" data-uid="${u.id}" style="padding: 0.35rem 0.65rem; font-size: 0.76rem;">
                Detail
              </button>
              <button class="btn btn-secondary btn-sm btn-admin-toggle-status" data-uid="${u.id}" style="padding: 0.35rem 0.65rem; font-size: 0.76rem;">
                ${isAktif ? "Nonaktifkan" : "Aktifkan"}
              </button>
              ${
                !isUserAdmin
                  ? `<button class="btn btn-danger btn-sm btn-admin-delete-user" data-uid="${u.id}" style="padding: 0.35rem 0.65rem; font-size: 0.76rem;">Hapus</button>`
                  : ""
              }
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.querySelectorAll(".btn-admin-toggle-status").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.uid;
        const allUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
        const idx = allUsers.findIndex((item) => item.id === uid);
        if (idx !== -1) {
          if (allUsers[idx].role === "admin") {
            window.showToast("Status akun Administrator utama selalu Aktif.", "info");
            return;
          }
          allUsers[idx].status = allUsers[idx].status === "Nonaktif" ? "Aktif" : "Nonaktif";
          localStorage.setItem("utb_local_users", JSON.stringify(allUsers));
          window.showToast(`Status ${allUsers[idx].full_name} diubah menjadi ${allUsers[idx].status}.`, "success");
          renderAdminDashboard();
        }
      });
    });

    tbody.querySelectorAll(".btn-admin-delete-user").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.uid;
        const allUsers = JSON.parse(localStorage.getItem("utb_local_users") || "[]");
        const target = allUsers.find((item) => item.id === uid);
        if (!target) return;
        const updated = allUsers.filter((item) => item.id !== uid);
        localStorage.setItem("utb_local_users", JSON.stringify(updated));
        window.showToast(`Pengguna "${target.full_name}" telah dihapus.`, "info");
        renderAdminDashboard();
      });
    });

    tbody.querySelectorAll(".btn-admin-detail-user").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.uid;
        const uObj = enrichedUsers.find((item) => item.id === uid);
        if (!uObj) return;
        const titleEl = document.getElementById("admin-detail-user-title");
        const bodyEl = document.getElementById("admin-detail-user-body");
        if (titleEl) titleEl.textContent = `Laporan Detail — ${uObj.full_name}`;
        if (bodyEl) {
          const attRows =
            uObj.attempts.length === 0
              ? `<p style="color: var(--text-secondary); padding: 1rem 0;">Pengguna ini belum mengerjakan paket latihan soal.</p>`
              : uObj.attempts
                  .map(
                    (a, i) => `
                  <div style="padding: 0.75rem; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 700; color: var(--primary-navy);">${
                        i + 1
                      }. ${window.escapeHtml(a.question_sets?.title || "Paket Latihan Soal")}</div>
                      <div style="font-size: 0.78rem; color: var(--text-secondary);">
                        ${window.escapeHtml(a.question_sets?.courses?.name || "Mata Kuliah")} • ${
                      a.total_questions || 0
                    } Soal (Benar: ${a.correct_answers || 0}) • ${window.formatDateTime(a.completed_at)}
                      </div>
                    </div>
                    <span class="badge ${Number(a.score) >= 70 ? "badge-success" : "badge-warning"}">Skor ${
                      a.score
                    }</span>
                  </div>
                `
                  )
                  .join("");

          bodyEl.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem; background: var(--bg); padding: 0.85rem; border-radius: 12px;">
              <div><small style="color: var(--text-secondary);">Nama Pengguna</small><div style="font-weight: 700;">${window.escapeHtml(
                uObj.full_name
              )}</div></div>
              <div><small style="color: var(--text-secondary);">Program Studi</small><div style="font-weight: 700;">${window.escapeHtml(
                uObj.program_studi_name || "-"
              )}</div></div>
              <div><small style="color: var(--text-secondary);">Status &amp; Keaktifan</small><div style="font-weight: 700;">${
                uObj.status
              } (${window.formatDateTime(uObj.lastActive)})</div></div>
              <div><small style="color: var(--text-secondary);">Total Soal Dikerjakan</small><div style="font-weight: 700;">${
                uObj.soalCount
              } Soal (${uObj.paketCount} Paket)</div></div>
            </div>
            <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--primary-navy); margin-bottom: 0.5rem;">Riwayat Pengerjaan Soal</h4>
            ${attRows}
          `;
        }
        window.openModal("modal-admin-user-detail");
      });
    });
  }

  async function loadDashboardData() {
    try {
      let profile = null;
      if (window.supabaseClient) {
        try {
          const { data } = await window.supabaseClient
            .from("profiles")
            .select("full_name, program_studi_id, study_programs(name)")
            .eq("id", user.id)
            .single();
          profile = data;
        } catch (_) {}
      }

      updateGreeting(profile);

      // Ambil riwayat latihan dari Supabase atau localStorage
      if (window.supabaseClient) {
        try {
          const { data: attempts } = await window.supabaseClient
            .from("quiz_attempts")
            .select(`
              id, score, total_questions, correct_answers, wrong_answers, 
              duration_seconds, completed_at,
              question_sets (
                id, title,
                courses (
                  id, name, code
                )
              )
            `)
            .eq("user_id", user.id)
            .not("completed_at", "is", null)
            .order("completed_at", { ascending: false });

          if (attempts && attempts.length > 0) {
            quizAttempts = attempts;
          }
        } catch (_) {}
      }

      if (quizAttempts.length === 0) {
        const localAttempts = JSON.parse(localStorage.getItem(`utb_attempts_${user.id}`) || "[]");
        quizAttempts = localAttempts;
      }

      if (window.supabaseClient) {
        try {
          const { data: sessions } = await window.supabaseClient
            .from("study_sessions")
            .select("id, activity_type, duration_seconds, started_at")
            .eq("user_id", user.id)
            .order("started_at", { ascending: false });

          if (sessions && sessions.length > 0) {
            studySessions = sessions;
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn("Memuat data dashboard:", err.message);
    }

    renderStatCards();
    renderScoreProgressChart();
    renderDurationChart();
    renderCourseDistributionChart();
    renderRecentActivities();
    renderResumeLearningSection();
  }

  function updateGreeting(profile) {
    const greetingEl = document.getElementById("welcome-greeting-name");
    const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Siswa";
    if (greetingEl) {
      greetingEl.textContent = fullName;
    }
  }

  function renderStatCards() {
    const totalLatihan = quizAttempts.length;

    let totalScore = 0;
    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalQuizSeconds = 0;

    quizAttempts.forEach((att) => {
      totalScore += Number(att.score) || 0;
      totalCorrect += Number(att.correct_answers) || 0;
      totalQuestions += Number(att.total_questions) || 0;
      totalQuizSeconds += Number(att.duration_seconds) || 0;
    });

    const avgScore = totalLatihan > 0 ? (totalScore / totalLatihan).toFixed(1) : "0";
    const accuracyRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    let totalSessionSeconds = 0;
    studySessions.forEach((s) => {
      totalSessionSeconds += Number(s.duration_seconds) || 0;
    });

    const grandTotalSeconds = Math.max(totalQuizSeconds, totalSessionSeconds);

    setCounter("stat-total-latihan", totalLatihan);
    setCounter("stat-avg-score", avgScore);
    const timeEl = document.getElementById("stat-total-waktu");
    if (timeEl) timeEl.textContent = window.formatDuration(grandTotalSeconds);
    setCounter("stat-accuracy", `${accuracyRate}%`);
  }

  function setCounter(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value;
  }

  function renderScoreProgressChart() {
    const canvas = document.getElementById("scoreProgressChart");
    if (!canvas || typeof Chart === "undefined") return;

    let filtered = [...quizAttempts].reverse();
    const now = new Date();

    if (activeScoreFilter === "7d") {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((a) => new Date(a.completed_at) >= cutoff);
    } else if (activeScoreFilter === "30d") {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((a) => new Date(a.completed_at) >= cutoff);
    }

    const emptyPlaceholder = document.getElementById("score-chart-empty");

    if (filtered.length === 0) {
      if (scoreChartInstance) scoreChartInstance.destroy();
      if (emptyPlaceholder) emptyPlaceholder.style.display = "flex";
      canvas.style.display = "none";
      return;
    }

    if (emptyPlaceholder) emptyPlaceholder.style.display = "none";
    canvas.style.display = "block";

    const labels = filtered.map((a) => window.formatDate(a.completed_at));
    const scores = filtered.map((a) => Number(a.score));

    if (scoreChartInstance) scoreChartInstance.destroy();

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, "rgba(65, 105, 245, 0.25)");
    gradient.addColorStop(1, "rgba(65, 105, 245, 0.0)");

    scoreChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Nilai Latihan",
            data: scores,
            borderColor: "#4169F5",
            backgroundColor: gradient,
            borderWidth: 2.5,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: "#FFFFFF",
            pointBorderColor: "#4169F5",
            pointBorderWidth: 2,
            pointRadius: 4.5,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#172554",
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` Skor: ${ctx.parsed.y} / 100`,
            },
          },
        },
        scales: {
          y: { min: 0, max: 100, grid: { color: "#F1F5F9" } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  function renderDurationChart() {
    const canvas = document.getElementById("durationChart");
    if (!canvas || typeof Chart === "undefined") return;

    const emptyPlaceholder = document.getElementById("duration-chart-empty");

    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const last7Days = [];
    const minutesPerDay = [0, 0, 0, 0, 0, 0, 0];

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7Days.push({
        dateStr: d.toISOString().split("T")[0],
        label: dayNames[d.getDay()],
      });
    }

    [...quizAttempts, ...studySessions].forEach((item) => {
      const itemDate = (item.completed_at || item.started_at)?.split("T")[0];
      if (itemDate) {
        const dayIdx = last7Days.findIndex((d) => d.dateStr === itemDate);
        if (dayIdx !== -1) {
          minutesPerDay[dayIdx] += Math.max(1, Math.round((Number(item.duration_seconds) || 60) / 60));
        }
      }
    });

    const totalMin = minutesPerDay.reduce((a, b) => a + b, 0);

    if (totalMin === 0 && quizAttempts.length === 0) {
      if (durationChartInstance) durationChartInstance.destroy();
      if (emptyPlaceholder) emptyPlaceholder.style.display = "flex";
      canvas.style.display = "none";
      return;
    }

    if (emptyPlaceholder) emptyPlaceholder.style.display = "none";
    canvas.style.display = "block";

    if (durationChartInstance) durationChartInstance.destroy();

    const ctx = canvas.getContext("2d");
    durationChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: last7Days.map((d) => d.label),
        datasets: [
          {
            label: "Menit Belajar",
            data: minutesPerDay,
            backgroundColor: "#815CF8",
            borderRadius: 6,
            hoverBackgroundColor: "#6D28D9",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#172554",
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} Menit Belajar`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "#F1F5F9" } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  function renderCourseDistributionChart() {
    const canvas = document.getElementById("courseDistributionChart");
    if (!canvas || typeof Chart === "undefined") return;

    const emptyPlaceholder = document.getElementById("course-dist-empty");

    const courseCountMap = {};
    quizAttempts.forEach((att) => {
      const courseName = att.question_sets?.courses?.name || "Sistem Basis Data";
      courseCountMap[courseName] = (courseCountMap[courseName] || 0) + 1;
    });

    const labels = Object.keys(courseCountMap);
    const data = Object.values(courseCountMap);

    if (labels.length === 0) {
      if (courseDistributionChartInstance) courseDistributionChartInstance.destroy();
      if (emptyPlaceholder) emptyPlaceholder.style.display = "flex";
      canvas.style.display = "none";
      return;
    }

    if (emptyPlaceholder) emptyPlaceholder.style.display = "none";
    canvas.style.display = "block";

    if (courseDistributionChartInstance) courseDistributionChartInstance.destroy();

    const colors = ["#4169F5", "#815CF8", "#22C55E", "#F59E0B", "#06B6D4"];

    const ctx = canvas.getContext("2d");
    courseDistributionChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: "#FFFFFF",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
        cutout: "68%",
      },
    });
  }

  function renderRecentActivities() {
    const listEl = document.getElementById("recent-activity-list");
    if (!listEl) return;

    if (quizAttempts.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <div class="empty-state-icon" style="width: 44px; height: 44px; margin-bottom: 0.75rem;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <p class="empty-state-title" style="font-size: 0.95rem;">Belum ada aktivitas</p>
          <p class="empty-state-desc" style="font-size: 0.8rem; margin-bottom: 0;">Selesaikan latihan soal pertamamu untuk melihat riwayat aktivitas di sini.</p>
        </div>
      `;
      return;
    }

    const latest = quizAttempts.slice(0, 5);
    listEl.innerHTML = latest
      .map((att) => {
        const qsetTitle = att.question_sets?.title || "Latihan Mandiri";
        const courseCode = att.question_sets?.courses?.code || "KULIAH";
        const dateStr = window.formatDate(att.completed_at);
        const isHigh = Number(att.score) >= 70;

        return `
        <div class="activity-item">
          <div class="activity-main">
            <div class="activity-icon" style="background: ${isHigh ? "var(--success-bg)" : "var(--warning-bg)"}; color: ${isHigh ? "var(--success)" : "var(--warning)"};">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="activity-text">
              <h5>${window.escapeHtml(qsetTitle)}</h5>
              <span>${window.escapeHtml(courseCode)} • Selesai pada ${dateStr}</span>
            </div>
          </div>
          <div class="activity-score" style="color: ${isHigh ? "var(--success)" : "var(--warning)"};">
            ${att.score}
          </div>
        </div>
      `;
      })
      .join("");
  }

  function renderResumeLearningSection() {
    const container = document.getElementById("resume-learning-card");
    if (!container) return;

    if (quizAttempts.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2.5rem 1rem;">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <h4 class="empty-state-title">Mulai Petualangan Belajarmu!</h4>
          <p class="empty-state-desc">Pilih program studi dan mulai latihan soal interaktif pertama kamu sekarang.</p>
          <a href="latihan-soal.html" class="btn btn-primary btn-sm">Mulai Latihan Pertama</a>
        </div>
      `;
      return;
    }

    const lastAttempt = quizAttempts[0];
    const qset = lastAttempt.question_sets;
    const course = qset?.courses;

    container.innerHTML = `
      <div class="resume-course-info">
        <div class="resume-icon-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div class="resume-details">
          <h4>${window.escapeHtml(course?.name || "Mata Kuliah")}</h4>
          <p>${window.escapeHtml(qset?.title || "Paket Latihan Terakhir")}</p>
        </div>
      </div>

      <div class="resume-progress-container">
        <div class="resume-progress-header">
          <span>Nilai Terakhir: ${lastAttempt.score} / 100</span>
          <span>Akurasi ${Math.round((lastAttempt.correct_answers / (lastAttempt.total_questions || 1)) * 100)}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar-fill" style="width: ${Math.min(lastAttempt.score, 100)}%;"></div>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
        <a href="latihan-soal.html" class="btn btn-primary btn-sm">Lanjut Latihan Lainnya</a>
      </div>
    `;
  }

  function setupFilterListeners() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeScoreFilter = btn.dataset.filter || "all";
        renderScoreProgressChart();
      });
    });
  }
})();
