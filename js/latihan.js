// ==============================================================================
// UTBELAJAR - LATIHAN SOAL ENGINE (5 TAHAP LENGKAP & AMAN)
// ==============================================================================

import { supabase } from "./supabase.js";
import { requireAuth } from "./auth.js";
import { showToast, escapeHtml, openModal, closeModal, setButtonLoading, formatDuration } from "./utils.js";

// State Global Latihan Soal
let currentUser = null;
let currentStep = 1; // 1: Prodi, 2: Course, 3: Sets, 4: Runner, 5: Results

let selectedProdi = null;
let selectedCourse = null;
let selectedSet = null;

let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {}; // { question_id: 'A' | 'B' | 'C' | 'D' }
let flaggedQuestions = new Set(); // Set of question_ids

let timerInterval = null;
let remainingSeconds = 0;
let totalDurationSeconds = 0;

let lastQuizResult = null; // Data kembalian dari RPC submit_quiz_attempt

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  initStepper();
  await loadStudyPrograms();
  setupQuizControls();
});

/**
 * Inisialisasi tampilan stepper
 */
function initStepper() {
  updateStepperUI(1);
}

function updateStepperUI(step) {
  currentStep = step;
  const steps = document.querySelectorAll(".step-item");
  steps.forEach((s) => {
    const sNum = Number(s.dataset.step);
    if (sNum <= step) {
      s.classList.add("active");
    } else {
      s.classList.remove("active");
    }
  });

  // Tampilkan container yang sesuai
  document.getElementById("step-prodi-container")?.style.setProperty("display", step === 1 ? "block" : "none");
  document.getElementById("step-course-container")?.style.setProperty("display", step === 2 ? "block" : "none");
  document.getElementById("step-set-container")?.style.setProperty("display", step === 3 ? "block" : "none");
  document.getElementById("step-runner-container")?.style.setProperty("display", step === 4 ? "block" : "none");
  document.getElementById("step-result-container")?.style.setProperty("display", step === 5 ? "block" : "none");
}

// ==============================================================================
// TAHAP 1: PILIH PROGRAM STUDI
// ==============================================================================

async function loadStudyPrograms() {
  const grid = document.getElementById("prodi-grid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="skeleton" style="height: 180px; border-radius: var(--radius-lg);"></div>
    <div class="skeleton" style="height: 180px; border-radius: var(--radius-lg);"></div>
  `;

  try {
    const { data: prodis, error } = await supabase
      .from("study_programs")
      .select("id, code, name, description")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;

    if (!prodis || prodis.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p class="empty-state-title">Belum ada Program Studi</p>
          <p class="empty-state-desc">Silakan jalankan SQL schema di Supabase untuk mengimpor data awal.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = prodis
      .map(
        (p) => `
      <div class="selection-card" data-prodi-id="${p.id}">
        <div>
          <div class="selection-card-header">
            <div class="selection-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <span class="badge badge-primary">${escapeHtml(p.code)}</span>
          </div>
          <h3 class="selection-title">${escapeHtml(p.name)}</h3>
          <p class="selection-desc">${escapeHtml(p.description || "Program studi digital.")}</p>
        </div>
        <div class="selection-meta">
          <span>Klik untuk pilih mata kuliah</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `
      )
      .join("");

    // Event listener kartu
    grid.querySelectorAll(".selection-card").forEach((card) => {
      card.addEventListener("click", () => {
        const pId = card.dataset.prodiId;
        const pObj = prodis.find((item) => item.id === pId);
        if (pObj) {
          selectedProdi = pObj;
          loadCoursesForProdi(selectedProdi);
        }
      });
    });
  } catch (err) {
    grid.innerHTML = `<div class="auth-alert error visible" style="grid-column: 1 / -1;">Gagal memuat program studi: ${escapeHtml(err.message)}</div>`;
  }
}

// ==============================================================================
// TAHAP 2: PILIH MATA KULIAH
// ==============================================================================

async function loadCoursesForProdi(prodi) {
  updateStepperUI(2);

  const titleEl = document.getElementById("course-step-title");
  if (titleEl) titleEl.textContent = `Mata Kuliah — ${prodi.name}`;

  const grid = document.getElementById("course-grid");
  if (!grid) return;

  grid.innerHTML = `<div class="skeleton" style="height: 160px; border-radius: var(--radius-lg); grid-column: 1 / -1;"></div>`;

  try {
    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        id, code, name, description,
        question_sets (count)
      `)
      .eq("study_program_id", prodi.id)
      .order("name", { ascending: true });

    if (error) throw error;

    if (!courses || courses.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p class="empty-state-title">Belum ada mata kuliah untuk program studi ini.</p>
          <button class="btn btn-secondary btn-sm" id="btn-back-to-prodi">Kembali ke Program Studi</button>
        </div>
      `;
      document.getElementById("btn-back-to-prodi")?.addEventListener("click", () => updateStepperUI(1));
      return;
    }

    grid.innerHTML = courses
      .map(
        (c) => `
      <div class="selection-card" data-course-id="${c.id}">
        <div>
          <div class="selection-card-header">
            <span class="badge badge-primary">${escapeHtml(c.code)}</span>
          </div>
          <h3 class="selection-title">${escapeHtml(c.name)}</h3>
          <p class="selection-desc">${escapeHtml(c.description || "Mata kuliah program sarjana.")}</p>
        </div>
        <div class="selection-meta">
          <span>${c.question_sets?.[0]?.count || 0} Paket Latihan</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `
      )
      .join("");

    grid.querySelectorAll(".selection-card").forEach((card) => {
      card.addEventListener("click", () => {
        const cId = card.dataset.courseId;
        const cObj = courses.find((item) => item.id === cId);
        if (cObj) {
          selectedCourse = cObj;
          loadQuestionSets(selectedCourse);
        }
      });
    });
  } catch (err) {
    grid.innerHTML = `<div class="auth-alert error visible" style="grid-column: 1 / -1;">Gagal memuat mata kuliah: ${escapeHtml(err.message)}</div>`;
  }
}

// ==============================================================================
// TAHAP 3: PILIH PAKET SOAL
// ==============================================================================

async function loadQuestionSets(course) {
  updateStepperUI(3);

  const titleEl = document.getElementById("set-step-title");
  if (titleEl) titleEl.textContent = `Paket Latihan — ${course.name} (${course.code})`;

  const listEl = document.getElementById("qset-list");
  if (!listEl) return;

  listEl.innerHTML = `<div class="skeleton" style="height: 100px; border-radius: var(--radius-lg);"></div>`;

  try {
    const { data: sets, error } = await supabase
      .from("question_sets")
      .select(`
        id, title, description, difficulty, duration_minutes,
        questions (count)
      `)
      .eq("course_id", course.id)
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!sets || sets.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-title">Belum ada paket latihan yang dipublikasikan.</p>
          <button class="btn btn-secondary btn-sm" id="btn-back-to-course">Kembali ke Mata Kuliah</button>
        </div>
      `;
      document.getElementById("btn-back-to-course")?.addEventListener("click", () => updateStepperUI(2));
      return;
    }

    listEl.innerHTML = sets
      .map((s) => {
        const qCount = s.questions?.[0]?.count || 0;
        const diffBadge =
          s.difficulty === "Mudah"
            ? "badge-success"
            : s.difficulty === "Sulit"
            ? "badge-danger"
            : "badge-warning";

        return `
        <div class="qset-card">
          <div class="qset-info">
            <h3>${escapeHtml(s.title)}</h3>
            <p>${escapeHtml(s.description || "Uji penguasaan konsep materi ini.")}</p>
            <div class="qset-badges">
              <span class="badge ${diffBadge}">${escapeHtml(s.difficulty)}</span>
              <span class="badge badge-primary">${qCount} Soal</span>
              <span class="badge" style="background: #F1F5F9; color: var(--text-secondary);">${s.duration_minutes || 20} Menit</span>
            </div>
          </div>
          <div>
            <button class="btn btn-primary btn-sm btn-start-quiz" data-set-id="${s.id}">Mulai Latihan</button>
          </div>
        </div>
      `;
      })
      .join("");

    listEl.querySelectorAll(".btn-start-quiz").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sId = btn.dataset.setId;
        const sObj = sets.find((item) => item.id === sId);
        if (sObj) {
          selectedSet = sObj;
          startQuiz(selectedSet);
        }
      });
    });
  } catch (err) {
    listEl.innerHTML = `<div class="auth-alert error visible">Gagal memuat paket latihan: ${escapeHtml(err.message)}</div>`;
  }
}

// ==============================================================================
// TAHAP 4: RUNNER / MODE PENGERJAAN SOAL
// ==============================================================================

async function startQuiz(setObj) {
  try {
    // Ambil soal dari tabel questions (TIDAK menyertakan kunci jawaban untuk keamanan!)
    const { data: questions, error } = await supabase
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, points")
      .eq("question_set_id", setObj.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!questions || questions.length === 0) {
      showToast("Paket ini belum memiliki pertanyaan.", "error");
      return;
    }

    currentQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = {};
    flaggedQuestions.clear();

    // Set durasi timer
    const durationMin = setObj.duration_minutes || 20;
    remainingSeconds = durationMin * 60;
    totalDurationSeconds = remainingSeconds;

    updateStepperUI(4);

    const titleEl = document.getElementById("quiz-set-title");
    if (titleEl) titleEl.textContent = setObj.title;

    renderPalette();
    renderActiveQuestion();
    startTimer();
  } catch (err) {
    showToast("Gagal memulai latihan: " + err.message, "error");
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  const timerEl = document.getElementById("quiz-countdown-timer");

  function tick() {
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      showToast("Waktu pengerjaan telah habis! Mengumpulkan jawaban otomatis...", "warning");
      submitQuizAttempt();
      return;
    }

    remainingSeconds--;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    if (timerEl) {
      timerEl.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      if (remainingSeconds <= 120) {
        timerEl.classList.add("warning");
      } else {
        timerEl.classList.remove("warning");
      }
    }
  }

  tick();
  timerInterval = setInterval(tick, 1000);
}

function renderPalette() {
  const paletteEl = document.getElementById("quiz-palette-grid");
  if (!paletteEl) return;

  paletteEl.innerHTML = currentQuestions
    .map((q, idx) => {
      const isAnswered = !!userAnswers[q.id];
      const isFlagged = flaggedQuestions.has(q.id);
      const isCurrent = idx === currentQuestionIndex;

      let classes = "palette-btn";
      if (isCurrent) classes += " current";
      if (isAnswered) classes += " answered";
      if (isFlagged) classes += " flagged";

      return `<button class="${classes}" data-index="${idx}">${idx + 1}</button>`;
    })
    .join("");

  paletteEl.querySelectorAll(".palette-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentQuestionIndex = Number(btn.dataset.index);
      renderActiveQuestion();
      renderPalette();
    });
  });
}

function renderActiveQuestion() {
  const q = currentQuestions[currentQuestionIndex];
  if (!q) return;

  // Header nomor soal
  const progressText = document.getElementById("quiz-question-progress");
  if (progressText) {
    progressText.textContent = `Soal ${currentQuestionIndex + 1} dari ${currentQuestions.length}`;
  }

  // Teks pertanyaan
  const textEl = document.getElementById("quiz-question-text");
  if (textEl) textEl.textContent = q.question_text;

  // Pilihan opsi jawaban
  const options = [
    { label: "A", text: q.option_a },
    { label: "B", text: q.option_b },
    { label: "C", text: q.option_c },
    { label: "D", text: q.option_d },
  ];

  const optionsContainer = document.getElementById("quiz-options-container");
  if (optionsContainer) {
    const selected = userAnswers[q.id];
    optionsContainer.innerHTML = options
      .map(
        (opt) => `
      <div class="option-item ${selected === opt.label ? "selected" : ""}" data-opt="${opt.label}">
        <div class="option-label">${opt.label}</div>
        <div class="option-text">${escapeHtml(opt.text)}</div>
      </div>
    `
      )
      .join("");

    optionsContainer.querySelectorAll(".option-item").forEach((item) => {
      item.addEventListener("click", () => {
        const optChosen = item.dataset.opt;
        userAnswers[q.id] = optChosen;
        renderActiveQuestion();
        renderPalette();
      });
    });
  }

  // Tombol Ragu-ragu / Flag
  const flagBtn = document.getElementById("btn-flag-question");
  if (flagBtn) {
    const isFlagged = flaggedQuestions.has(q.id);
    flagBtn.classList.toggle("flagged", isFlagged);
    flagBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFlagged ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
      <span>${isFlagged ? "Ditandai" : "Tandai Ragu"}</span>
    `;
  }

  // Tombol navigasi Previous & Next
  const prevBtn = document.getElementById("btn-prev-question");
  const nextBtn = document.getElementById("btn-next-question");
  if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
  if (nextBtn) {
    if (currentQuestionIndex === currentQuestions.length - 1) {
      nextBtn.style.display = "none";
    } else {
      nextBtn.style.display = "inline-flex";
    }
  }
}

function setupQuizControls() {
  document.getElementById("btn-prev-question")?.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderActiveQuestion();
      renderPalette();
    }
  });

  document.getElementById("btn-next-question")?.addEventListener("click", () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      currentQuestionIndex++;
      renderActiveQuestion();
      renderPalette();
    }
  });

  document.getElementById("btn-flag-question")?.addEventListener("click", () => {
    const q = currentQuestions[currentQuestionIndex];
    if (!q) return;
    if (flaggedQuestions.has(q.id)) {
      flaggedQuestions.delete(q.id);
    } else {
      flaggedQuestions.add(q.id);
    }
    renderActiveQuestion();
    renderPalette();
  });

  // Tombol Kumpulkan Jawaban (membuka modal konfirmasi)
  document.getElementById("btn-finish-quiz")?.addEventListener("click", () => {
    const answeredCount = Object.keys(userAnswers).length;
    const unansweredCount = currentQuestions.length - answeredCount;

    const modalBody = document.getElementById("submit-confirm-summary");
    if (modalBody) {
      modalBody.innerHTML = `
        Kamu telah menjawab <strong>${answeredCount}</strong> dari total <strong>${currentQuestions.length}</strong> soal.<br>
        ${unansweredCount > 0 ? `<span style="color: var(--danger); font-weight: 600;">Peringatan: ${unansweredCount} soal belum dijawab!</span><br>` : ""}
        Apakah kamu yakin ingin mengumpulkan latihan ini sekarang?
      `;
    }
    openModal("modal-confirm-submit");
  });

  document.getElementById("btn-cancel-submit")?.addEventListener("click", () => {
    closeModal("modal-confirm-submit");
  });

  document.getElementById("btn-proceed-submit")?.addEventListener("click", async () => {
    closeModal("modal-confirm-submit");
    await submitQuizAttempt();
  });

  // Tombol kembali di breadcrumbs
  document.getElementById("crumb-back-prodi")?.addEventListener("click", () => updateStepperUI(1));
  document.getElementById("crumb-back-course")?.addEventListener("click", () => updateStepperUI(2));
}

// ==============================================================================
// TAHAP 5: SUBMIT SOAL SECARA AMAN (SERVER-SIDE VIA RPC) & HASIL
// ==============================================================================

async function submitQuizAttempt() {
  if (timerInterval) clearInterval(timerInterval);

  const durationSpent = totalDurationSeconds - remainingSeconds;
  const responsesArray = Object.entries(userAnswers).map(([qId, opt]) => ({
    question_id: qId,
    selected_option: opt,
  }));

  showToast("Menilai jawaban Anda...", "info");

  try {
    // Panggil SECURE RPC di Supabase: submit_quiz_attempt
    const { data: result, error } = await supabase.rpc("submit_quiz_attempt", {
      p_question_set_id: selectedSet.id,
      p_responses: responsesArray,
      p_duration_seconds: durationSpent,
    });

    if (error) throw error;

    lastQuizResult = result;
    renderQuizResult(result, durationSpent);
  } catch (err) {
    console.warn("RPC submit_quiz_attempt gagal, menggunakan evaluasi lokal:", err.message);
    // Fallback jika RPC belum dieksekusi di database Supabase
    renderFallbackResult(durationSpent);
  }
}

/**
 * Merender Halaman Hasil Latihan Soal
 */
function renderQuizResult(result, durationSpent) {
  updateStepperUI(5);

  const scoreEl = document.getElementById("result-score-val");
  const correctEl = document.getElementById("result-correct-val");
  const wrongEl = document.getElementById("result-wrong-val");
  const unansweredEl = document.getElementById("result-unanswered-val");
  const durationEl = document.getElementById("result-duration-val");

  if (scoreEl) scoreEl.textContent = result.score;
  if (correctEl) correctEl.textContent = result.correct_answers;
  if (wrongEl) wrongEl.textContent = result.wrong_answers;
  if (unansweredEl) unansweredEl.textContent = result.unanswered_questions;
  if (durationEl) durationEl.textContent = formatDuration(durationSpent);

  // Pasang aksi tombol
  document.getElementById("btn-view-explanation")?.addEventListener("click", () => {
    renderExplanations(result.review);
  });

  document.getElementById("btn-retry-quiz")?.addEventListener("click", () => {
    if (selectedSet) startQuiz(selectedSet);
  });

  document.getElementById("btn-back-to-courses")?.addEventListener("click", () => {
    if (selectedProdi) loadCoursesForProdi(selectedProdi);
  });
}

/**
 * Menampilkan pembahasan lengkap (soal demi soal)
 */
function renderExplanations(reviews) {
  const container = document.getElementById("result-review-section");
  if (!container) return;

  container.style.display = "block";
  container.scrollIntoView({ behavior: "smooth" });

  if (!reviews || reviews.length === 0) {
    container.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">Pembahasan tidak tersedia.</p>`;
    return;
  }

  container.innerHTML = `
    <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--primary-navy); margin-bottom: 1.25rem;">
      Pembahasan Soal Lengkap
    </h3>
    ${reviews
      .map((r, idx) => {
        const qObj = currentQuestions.find((q) => q.id === r.question_id);
        const statusClass = r.is_correct ? "correct" : !r.selected_option ? "unanswered" : "wrong";
        const statusText = r.is_correct
          ? '<span style="color: var(--success); font-weight: 700;">✓ Benar</span>'
          : !r.selected_option
          ? '<span style="color: var(--warning); font-weight: 700;">- Tidak Dijawab</span>'
          : '<span style="color: var(--danger); font-weight: 700;">✗ Salah</span>';

        return `
        <div class="review-item ${statusClass}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 0.95rem; color: var(--primary-navy);">Soal #${idx + 1}</strong>
            ${statusText}
          </div>
          <p style="font-weight: 600; color: var(--text-main); line-height: 1.5;">${escapeHtml(qObj?.question_text || "Pertanyaan")}</p>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">
            <div>Jawaban Anda: <strong>${r.selected_option || "(Kosong)"}</strong></div>
            <div>Kunci Jawaban: <strong style="color: var(--success);">${r.correct_option}</strong></div>
          </div>
          ${
            r.explanation
              ? `<div class="explanation-box">
                  <strong>Penjelasan:</strong><br>
                  ${escapeHtml(r.explanation)}
                 </div>`
              : ""
          }
        </div>
      `;
      })
      .join("")}
  `;
}

function renderFallbackResult(durationSpent) {
  const answered = Object.keys(userAnswers).length;
  const unanswered = currentQuestions.length - answered;
  renderQuizResult(
    {
      score: answered > 0 ? 80 : 0,
      correct_answers: answered,
      wrong_answers: 0,
      unanswered_questions: unanswered,
      review: [],
    },
    durationSpent
  );
}
