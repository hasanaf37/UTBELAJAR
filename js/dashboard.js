// ==============================================================================
// UTBELAJAR - DASHBOARD LOGIC & REALTIME CHARTS
// ==============================================================================

import { supabase } from "./supabase.js";
import { requireAuth } from "./auth.js";
import { formatDate, formatDuration, escapeHtml } from "./utils.js";

let user = null;
let quizAttempts = [];
let studySessions = [];
let scoreChartInstance = null;
let durationChartInstance = null;
let courseDistributionChartInstance = null;
let activeScoreFilter = "all"; // '7d' | '30d' | 'all'

document.addEventListener("DOMContentLoaded", async () => {
  user = await requireAuth();
  if (!user) return;

  await loadDashboardData();
  setupFilterListeners();
});

/**
 * Mengambil data nyata milik user dari Supabase
 */
async function loadDashboardData() {
  try {
    // 1. Ambil Profil Pengguna
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, program_studi_id, study_programs(name)")
      .eq("id", user.id)
      .single();

    updateGreeting(profile);

    // 2. Ambil Riwayat Latihan Soal (quiz_attempts)
    const { data: attempts, error: attError } = await supabase
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

    if (attError) throw attError;
    quizAttempts = attempts || [];

    // 3. Ambil Sesi Belajar (study_sessions)
    const { data: sessions, error: sessError } = await supabase
      .from("study_sessions")
      .select("id, activity_type, duration_seconds, started_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    if (sessError) throw sessError;
    studySessions = sessions || [];

    // 4. Hitung dan Render Statistik
    renderStatCards();

    // 5. Render Grafik Chart.js
    renderScoreProgressChart();
    renderDurationChart();
    renderCourseDistributionChart();

    // 6. Render Riwayat Aktivitas & Lanjutkan Belajar
    renderRecentActivities();
    renderResumeLearningSection();
  } catch (err) {
    console.error("Gagal memuat data dashboard:", err.message);
  }
}

/**
 * Memperbarui sapaan dinamis
 */
function updateGreeting(profile) {
  const greetingEl = document.getElementById("welcome-greeting-name");
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Siswa";
  if (greetingEl) {
    greetingEl.textContent = fullName;
  }
}

/**
 * Menghitung dan merender 4 Kartu Statistik Utama
 */
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

  // Total durasi belajar (quiz + sesi belajar)
  let totalSessionSeconds = 0;
  studySessions.forEach((s) => {
    totalSessionSeconds += Number(s.duration_seconds) || 0;
  });

  const grandTotalSeconds = Math.max(totalQuizSeconds, totalSessionSeconds);

  // Animasi angka atau set teks
  setCounter("stat-total-latihan", totalLatihan);
  setCounter("stat-avg-score", avgScore);
  const timeEl = document.getElementById("stat-total-waktu");
  if (timeEl) timeEl.textContent = formatDuration(grandTotalSeconds);

  setCounter("stat-accuracy", `${accuracyRate}%`);
}

function setCounter(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = value;
}

/**
 * Grafik 1: Perkembangan Nilai Latihan Dari Waktu ke Waktu (Line Chart)
 */
function renderScoreProgressChart() {
  const canvas = document.getElementById("scoreProgressChart");
  if (!canvas || typeof Chart === "undefined") return;

  // Filter data berdasarkan rentang waktu
  let filtered = [...quizAttempts].reverse(); // Urutan kronologis
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

  const labels = filtered.map((a) => formatDate(a.completed_at));
  const scores = filtered.map((a) => Number(a.score));

  if (scoreChartInstance) {
    scoreChartInstance.destroy();
  }

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
          titleFont: { size: 12, weight: "bold", family: "Plus Jakarta Sans" },
          bodyFont: { size: 12, family: "Plus Jakarta Sans" },
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` Skor: ${ctx.parsed.y} / 100`,
          },
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: "#F1F5F9" },
          ticks: { font: { family: "Plus Jakarta Sans", size: 11 } },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "Plus Jakarta Sans", size: 11 } },
        },
      },
    },
  });
}

/**
 * Grafik 2: Durasi Belajar (Bar Chart)
 */
function renderDurationChart() {
  const canvas = document.getElementById("durationChart");
  if (!canvas || typeof Chart === "undefined") return;

  const emptyPlaceholder = document.getElementById("duration-chart-empty");

  // Kelompokkan durasi belajar 7 hari terakhir
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

  // Agregasi waktu latihan & sesi belajar
  [...quizAttempts, ...studySessions].forEach((item) => {
    const itemDate = (item.completed_at || item.started_at)?.split("T")[0];
    if (itemDate) {
      const dayIdx = last7Days.findIndex((d) => d.dateStr === itemDate);
      if (dayIdx !== -1) {
        minutesPerDay[dayIdx] += Math.round((Number(item.duration_seconds) || 0) / 60);
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
        y: {
          beginAtZero: true,
          grid: { color: "#F1F5F9" },
          ticks: { font: { family: "Plus Jakarta Sans", size: 11 } },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "Plus Jakarta Sans", size: 11 } },
        },
      },
    },
  });
}

/**
 * Grafik 3: Distribusi Mata Kuliah (Doughnut Chart)
 */
function renderCourseDistributionChart() {
  const canvas = document.getElementById("courseDistributionChart");
  if (!canvas || typeof Chart === "undefined") return;

  const emptyPlaceholder = document.getElementById("course-dist-empty");

  // Kelompokkan attempt berdasarkan nama mata kuliah
  const courseCountMap = {};
  quizAttempts.forEach((att) => {
    const courseName = att.question_sets?.courses?.name || "Lainnya";
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
        legend: {
          position: "bottom",
          labels: { font: { family: "Plus Jakarta Sans", size: 11 }, boxWidth: 12 },
        },
      },
      cutout: "68%",
    },
  });
}

/**
 * Daftar Riwayat Aktivitas Terbaru
 */
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
      const dateStr = formatDate(att.completed_at);
      const isHigh = Number(att.score) >= 70;

      return `
      <div class="activity-item">
        <div class="activity-main">
          <div class="activity-icon" style="background: ${isHigh ? "var(--success-bg)" : "var(--warning-bg)"}; color: ${isHigh ? "var(--success)" : "var(--warning)"};">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="activity-text">
            <h5>${escapeHtml(qsetTitle)}</h5>
            <span>${escapeHtml(courseCode)} • Selesai pada ${dateStr}</span>
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

/**
 * Kartu Lanjutkan Belajar
 */
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
        <h4>${escapeHtml(course?.name || "Mata Kuliah")}</h4>
        <p>${escapeHtml(qset?.title || "Paket Latihan Terakhir")}</p>
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

/**
 * Filter waktu untuk grafik nilai (7 hari, 30 hari, semua)
 */
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
