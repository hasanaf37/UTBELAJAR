// ==============================================================================
// UTBELAJAR - LATIHAN SOAL ENGINE (5 TAHAP LENGKAP & FILE:// / SUPABASE READY)
// ==============================================================================

(function () {
  const SEED_PRODIS = [
    { id: "b1111111-1111-1111-1111-111111111111", code: "SI", name: "Sistem Informasi", description: "Studi rekayasa perangkat lunak, arsitektur data, dan transformasi digital." },
    { id: "b2222222-2222-2222-2222-222222222222", code: "MNJ", name: "Manajemen", description: "Fokus pada kepemimpinan strategis, manajemen operasional, dan pemasaran." },
    { id: "b3333333-3333-3333-3333-333333333333", code: "ILKOM", name: "Ilmu Komunikasi", description: "Kajian media massa, public relations, dan komunikasi organisasi digital." },
    { id: "b4444444-4444-4444-4444-444444444444", code: "AKT", name: "Akuntansi", description: "Penguasaan akuntansi keuangan, audit, sistem informasi akuntansi, dan perpajakan." },
  ];

  const SEED_COURSES = [
    { id: "c1111111-1111-1111-1111-111111111111", study_program_id: "b1111111-1111-1111-1111-111111111111", code: "MSIM4201", name: "Analisis dan Perancangan Sistem", description: "Konsep siklus hidup pengembangan sistem (SDLC), pemodelan UML, dan use case diagram." },
    { id: "c2222222-2222-2222-2222-222222222222", study_program_id: "b1111111-1111-1111-1111-111111111111", code: "MSIM4202", name: "Sistem Basis Data", description: "Normalisasi data, Entity-Relationship Diagram (ERD), sintaks SQL, dan transaksi database." },
    { id: "c4444444-4444-4444-4444-444444444444", study_program_id: "b2222222-2222-2222-2222-222222222222", code: "EKMA4116", name: "Manajemen Strategik", description: "Analisis lingkungan bisnis, keunggulan bersaing, visi-misi korporasi, dan implementasi strategi." },
  ];

  const SEED_SETS = [
    { id: "d1111111-1111-1111-1111-111111111111", course_id: "c2222222-2222-2222-2222-222222222222", title: "Latihan Mandiri 01: Dasar SQL & Normalisasi", description: "Paket latihan soal komprehensif konsep dasar basis data relasional dan SQL.", difficulty: "Menengah", duration_minutes: 20 },
    { id: "d2222222-2222-2222-2222-222222222222", course_id: "c1111111-1111-1111-1111-111111111111", title: "Latihan Mandiri 01: SDLC & Diagram UML", description: "Uji pemahaman tentang metodologi Waterfall, Agile, Use Case, dan Class Diagram.", difficulty: "Mudah", duration_minutes: 15 },
    { id: "d3333333-3333-3333-3333-333333333333", course_id: "c4444444-4444-4444-4444-444444444444", title: "Latihan Mandiri 01: Analisis SWOT & Strategi", description: "Evaluasi pemahaman analisis SWOT dan strategi bisnis.", difficulty: "Menengah", duration_minutes: 20 },
  ];

  const SEED_QUESTIONS = [
    {
      id: "e1111111-1111-1111-1111-111111111111",
      question_set_id: "d1111111-1111-1111-1111-111111111111",
      question_text: "Kunci utama yang digunakan untuk menjamin keunikan identitas suatu baris (record) dalam sebuah tabel relasional disebut...",
      option_a: "Foreign Key",
      option_b: "Primary Key",
      option_c: "Candidate Key",
      option_d: "Super Key",
      correct_option: "B",
      explanation: "Primary Key adalah atribut atau kumpulan atribut yang secara unik mengidentifikasi setiap baris dalam tabel relasional.",
    },
    {
      id: "e2222222-2222-2222-2222-222222222222",
      question_set_id: "d1111111-1111-1111-1111-111111111111",
      question_text: "Suatu tabel dikatakan memenuhi Bentuk Normal Pertama (1NF) jika...",
      option_a: "Tidak memiliki ketergantungan transitif antar atribut non-kunci",
      option_b: "Semua atribut non-kunci bergantung penuh pada Primary Key",
      option_c: "Setiap kolom hanya berisi nilai tunggal (atomic) dan tidak ada grup perulangan",
      option_d: "Tabel telah terhubung dengan minimal 2 tabel relasi lain",
      correct_option: "C",
      explanation: "Syarat utama 1NF adalah menghilangkan multi-valued attributes atau repeating groups sehingga setiap sel hanya memiliki nilai atomik tunggal.",
    },
    {
      id: "e3333333-3333-3333-3333-333333333333",
      question_set_id: "d1111111-1111-1111-1111-111111111111",
      question_text: "Perintah SQL yang digunakan untuk menghapus baris data dari sebuah tabel dengan kriteria tertentu adalah...",
      option_a: "REMOVE FROM",
      option_b: "DELETE FROM",
      option_c: "DROP TABLE",
      option_d: "ALTER TABLE",
      correct_option: "B",
      explanation: "DELETE FROM digunakan untuk menghapus baris (data) di dalam tabel berdasarkan kondisi WHERE.",
    },
    {
      id: "e6666666-6666-6666-6666-666666666666",
      question_set_id: "d2222222-2222-2222-2222-222222222222",
      question_text: "Fase dalam SDLC di mana kebutuhan pengguna didefinisikan secara mendalam dan didokumentasikan dalam SRS disebut fase...",
      option_a: "Analisis Kebutuhan (Requirements Analysis)",
      option_b: "Implementasi & Pengkodean",
      option_c: "Pemeliharaan (Maintenance)",
      option_d: "Pengujian Sistem (Testing)",
      correct_option: "A",
      explanation: "Fase Analisis Kebutuhan berfokus pada pengumpulan informasi dari stakeholder dan merumuskan spesifikasi fitur sistem.",
    },
  ];

  let currentUser = null;
  let selectedProdi = null;
  let selectedCourse = null;
  let selectedSet = null;

  let currentQuestions = [];
  let currentQuestionIndex = 0;
  let userAnswers = {};
  let flaggedQuestions = new Set();

  let timerInterval = null;
  let remainingSeconds = 0;
  let totalDurationSeconds = 0;

  function getCatalogProdis() {
    const raw = localStorage.getItem("utb_catalog_prodis");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    localStorage.setItem("utb_catalog_prodis", JSON.stringify(SEED_PRODIS));
    return [...SEED_PRODIS];
  }

  function getCatalogCourses() {
    const raw = localStorage.getItem("utb_catalog_courses");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    localStorage.setItem("utb_catalog_courses", JSON.stringify(SEED_COURSES));
    return [...SEED_COURSES];
  }

  function getCatalogSets() {
    const raw = localStorage.getItem("utb_catalog_sets");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    localStorage.setItem("utb_catalog_sets", JSON.stringify(SEED_SETS));
    return [...SEED_SETS];
  }

  function getCatalogQuestions() {
    const raw = localStorage.getItem("utb_catalog_questions");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    localStorage.setItem("utb_catalog_questions", JSON.stringify(SEED_QUESTIONS));
    return [...SEED_QUESTIONS];
  }

  document.addEventListener("DOMContentLoaded", async () => {
    currentUser = await window.requireAuth();
    if (!currentUser) return;

    const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
    if (isAdmin) {
      initAdminLatihanManager();
    }

    updateStepperUI(1);
    await loadStudyPrograms();
    setupQuizControls();
  });

  function initAdminLatihanManager() {
    const managerEl = document.getElementById("admin-latihan-manager");
    if (!managerEl) return;
    managerEl.style.display = "block";

    const pageTitle = document.querySelector(".page-title");
    if (pageTitle) pageTitle.textContent = "Latihan Soal — Manajemen & Bank Soal (Admin)";

    const switchTab = (tabName) => {
      document.querySelectorAll(".admin-tab-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.tab === tabName);
      });
      ["prodi", "course", "set", "question"].forEach((t) => {
        const pane = document.getElementById(`admin-tab-${t}`);
        if (pane) pane.style.display = t === tabName ? "block" : "none";
      });
      const bodyEl = document.getElementById("admin-latihan-manager-body");
      if (bodyEl) bodyEl.style.display = "block";
    };

    document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    document.querySelectorAll(".btn-admin-open-tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.adminTab));
    });

    document.getElementById("btn-toggle-admin-manager-body")?.addEventListener("click", () => {
      const bodyEl = document.getElementById("admin-latihan-manager-body");
      if (bodyEl) {
        bodyEl.style.display = bodyEl.style.display === "none" ? "block" : "none";
      }
    });

    // Form 1: Tambah Program Studi
    document.getElementById("form-admin-prodi")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = document.getElementById("input-prodi-code")?.value.trim().toUpperCase();
      const name = document.getElementById("input-prodi-name")?.value.trim();
      const description = document.getElementById("input-prodi-desc")?.value.trim() || "Program studi digital UTBelajar.";
      if (!code || !name) return;

      const list = getCatalogProdis();
      list.push({
        id: "prodi-" + Date.now(),
        code,
        name,
        description,
      });
      localStorage.setItem("utb_catalog_prodis", JSON.stringify(list));
      e.target.reset();
      window.showToast(`Program Studi "${name}" berhasil ditambahkan!`, "success");
      renderAdminCatalogAll();
      loadStudyPrograms();
    });

    // Form 2: Tambah Mata Kuliah
    document.getElementById("form-admin-course")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const study_program_id = document.getElementById("input-course-prodi")?.value;
      const code = document.getElementById("input-course-code")?.value.trim().toUpperCase();
      const name = document.getElementById("input-course-name")?.value.trim();
      const description = document.getElementById("input-course-desc")?.value.trim() || "Mata kuliah program sarjana.";
      if (!study_program_id || !code || !name) return;

      const list = getCatalogCourses();
      list.push({
        id: "course-" + Date.now(),
        study_program_id,
        code,
        name,
        description,
      });
      localStorage.setItem("utb_catalog_courses", JSON.stringify(list));
      e.target.reset();
      window.showToast(`Mata Kuliah "${name}" (${code}) berhasil ditambahkan!`, "success");
      renderAdminCatalogAll();
      if (selectedProdi && selectedProdi.id === study_program_id) {
        loadCoursesForProdi(selectedProdi);
      }
    });

    // Form 3: Tambah Paket Soal
    document.getElementById("form-admin-set")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const course_id = document.getElementById("input-set-course")?.value;
      const title = document.getElementById("input-set-title")?.value.trim();
      const difficulty = document.getElementById("input-set-diff")?.value || "Menengah";
      const duration_minutes = Number(document.getElementById("input-set-duration")?.value) || 20;
      const description = document.getElementById("input-set-desc")?.value.trim() || "Paket latihan mandiri.";
      if (!course_id || !title) return;

      const list = getCatalogSets();
      list.push({
        id: "set-" + Date.now(),
        course_id,
        title,
        difficulty,
        duration_minutes,
        description,
      });
      localStorage.setItem("utb_catalog_sets", JSON.stringify(list));
      e.target.reset();
      window.showToast(`Paket Soal "${title}" berhasil ditambahkan!`, "success");
      renderAdminCatalogAll();
      if (selectedCourse && selectedCourse.id === course_id) {
        loadQuestionSets(selectedCourse);
      }
    });

    // Form 4: Tambah Butir Soal Pengerjaan
    document.getElementById("form-admin-question")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const question_set_id = document.getElementById("input-q-set")?.value;
      const correct_option = document.getElementById("input-q-correct")?.value || "B";
      const question_text = document.getElementById("input-q-text")?.value.trim();
      const option_a = document.getElementById("input-q-opta")?.value.trim();
      const option_b = document.getElementById("input-q-optb")?.value.trim();
      const option_c = document.getElementById("input-q-optc")?.value.trim();
      const option_d = document.getElementById("input-q-optd")?.value.trim();
      const explanation = document.getElementById("input-q-explanation")?.value.trim();

      if (!question_set_id || !question_text || !option_a || !option_b || !option_c || !option_d) return;

      const list = getCatalogQuestions();
      list.push({
        id: "q-" + Date.now(),
        question_set_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation: explanation || "Jawaban sesuai konsep materi modul.",
      });
      localStorage.setItem("utb_catalog_questions", JSON.stringify(list));
      e.target.reset();
      window.showToast("Butir soal pengerjaan berhasil disimpan ke paket!", "success");
      renderAdminCatalogAll();
    });

    renderAdminCatalogAll();
  }

  function renderAdminCatalogAll() {
    const prodis = getCatalogProdis();
    const courses = getCatalogCourses();
    const sets = getCatalogSets();
    const questions = getCatalogQuestions();

    const setElText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setElText("admin-count-prodi", prodis.length);
    setElText("admin-count-course", courses.length);
    setElText("admin-count-set", sets.length);
    setElText("admin-count-question", questions.length);

    // Populate selects
    const prodiSelect = document.getElementById("input-course-prodi");
    if (prodiSelect) {
      prodiSelect.innerHTML = prodis
        .map((p) => `<option value="${p.id}">${window.escapeHtml(p.name)} (${window.escapeHtml(p.code)})</option>`)
        .join("");
    }

    const courseSelect = document.getElementById("input-set-course");
    if (courseSelect) {
      courseSelect.innerHTML = courses
        .map((c) => `<option value="${c.id}">${window.escapeHtml(c.code)} — ${window.escapeHtml(c.name)}</option>`)
        .join("");
    }

    const setSelect = document.getElementById("input-q-set");
    if (setSelect) {
      setSelect.innerHTML = sets
        .map((s) => `<option value="${s.id}">${window.escapeHtml(s.title)} (${s.duration_minutes || 20} Menit)</option>`)
        .join("");
    }

    // Render List 1: Prodi
    const prodiListEl = document.getElementById("admin-list-prodi");
    if (prodiListEl) {
      prodiListEl.innerHTML = prodis
        .map(
          (p) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.9rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: 10px;">
            <div>
              <span class="badge badge-primary" style="margin-right: 0.5rem;">${window.escapeHtml(p.code)}</span>
              <strong style="color: var(--primary-navy);">${window.escapeHtml(p.name)}</strong>
              <span style="font-size: 0.8rem; color: var(--text-secondary); margin-left: 0.5rem;">— ${window.escapeHtml(
                p.description || ""
              )}</span>
            </div>
            <button type="button" class="btn btn-danger btn-sm btn-del-prodi" data-id="${p.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Hapus</button>
          </div>
        `
        )
        .join("");

      prodiListEl.querySelectorAll(".btn-del-prodi").forEach((btn) => {
        btn.addEventListener("click", () => {
          const updated = getCatalogProdis().filter((item) => item.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_prodis", JSON.stringify(updated));
          window.showToast("Program studi dihapus.", "info");
          renderAdminCatalogAll();
          loadStudyPrograms();
        });
      });
    }

    // Render List 2: Mata Kuliah
    const courseListEl = document.getElementById("admin-list-course");
    if (courseListEl) {
      courseListEl.innerHTML = courses
        .map((c) => {
          const parentProdi = prodis.find((p) => p.id === c.study_program_id);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.9rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: 10px;">
              <div>
                <span class="badge badge-primary" style="margin-right: 0.4rem;">${window.escapeHtml(c.code)}</span>
                <strong style="color: var(--primary-navy);">${window.escapeHtml(c.name)}</strong>
                <span style="font-size: 0.78rem; color: var(--text-secondary); margin-left: 0.5rem;">(Prodi: ${window.escapeHtml(
                  parentProdi?.name || "-"
                )})</span>
              </div>
              <button type="button" class="btn btn-danger btn-sm btn-del-course" data-id="${c.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Hapus</button>
            </div>
          `;
        })
        .join("");

      courseListEl.querySelectorAll(".btn-del-course").forEach((btn) => {
        btn.addEventListener("click", () => {
          const updated = getCatalogCourses().filter((item) => item.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_courses", JSON.stringify(updated));
          window.showToast("Mata kuliah dihapus.", "info");
          renderAdminCatalogAll();
        });
      });
    }

    // Render List 3: Paket Soal
    const setListEl = document.getElementById("admin-list-set");
    if (setListEl) {
      setListEl.innerHTML = sets
        .map((s) => {
          const parentCourse = courses.find((c) => c.id === s.course_id);
          const qCount = questions.filter((q) => q.question_set_id === s.id).length;
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.9rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: 10px; gap: 0.75rem;">
              <div>
                <strong style="color: var(--primary-navy);">${window.escapeHtml(s.title)}</strong>
                <div style="font-size: 0.78rem; color: var(--text-secondary);">
                  MK: ${window.escapeHtml(parentCourse?.name || "-")} • ${window.escapeHtml(s.difficulty)} • ${
            s.duration_minutes || 20
          } Menit • <strong>${qCount} Butir Soal</strong>
                </div>
              </div>
              <div style="display: flex; gap: 0.45rem;">
                <button type="button" class="btn btn-secondary btn-sm btn-test-set" data-id="${s.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Uji Pengerjaan</button>
                <button type="button" class="btn btn-danger btn-sm btn-del-set" data-id="${s.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Hapus</button>
              </div>
            </div>
          `;
        })
        .join("");

      setListEl.querySelectorAll(".btn-test-set").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetSet = sets.find((item) => item.id === btn.dataset.id);
          if (targetSet) {
            selectedSet = targetSet;
            selectedCourse = courses.find((c) => c.id === targetSet.course_id) || courses[0];
            startQuiz(selectedSet);
          }
        });
      });

      setListEl.querySelectorAll(".btn-del-set").forEach((btn) => {
        btn.addEventListener("click", () => {
          const updated = getCatalogSets().filter((item) => item.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_sets", JSON.stringify(updated));
          window.showToast("Paket soal dihapus.", "info");
          renderAdminCatalogAll();
        });
      });
    }

    // Render List 4: Butir Soal Pengerjaan
    const qListEl = document.getElementById("admin-list-question");
    if (qListEl) {
      qListEl.innerHTML = questions
        .map((q, idx) => {
          const parentSet = sets.find((s) => s.id === q.question_set_id);
          return `
            <div style="display: flex; align-items: flex-start; justify-content: space-between; padding: 0.75rem 0.9rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: 10px; gap: 1rem;">
              <div>
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary-blue); margin-bottom: 0.2rem;">
                  Soal #${idx + 1} • Paket: ${window.escapeHtml(parentSet?.title || "-")} • Kunci: Opsi ${window.escapeHtml(
            q.correct_option
          )}
                </div>
                <div style="font-weight: 700; color: var(--primary-navy); font-size: 0.88rem; margin-bottom: 0.25rem;">
                  ${window.escapeHtml(q.question_text)}
                </div>
                <div style="font-size: 0.76rem; color: var(--text-secondary);">
                  A: ${window.escapeHtml(q.option_a)} | B: ${window.escapeHtml(q.option_b)} | C: ${window.escapeHtml(
            q.option_c
          )} | D: ${window.escapeHtml(q.option_d)}
                </div>
              </div>
              <button type="button" class="btn btn-danger btn-sm btn-del-question" data-id="${q.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem; flex-shrink: 0;">Hapus</button>
            </div>
          `;
        })
        .join("");

      qListEl.querySelectorAll(".btn-del-question").forEach((btn) => {
        btn.addEventListener("click", () => {
          const updated = getCatalogQuestions().filter((item) => item.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_questions", JSON.stringify(updated));
          window.showToast("Butir soal dihapus.", "info");
          renderAdminCatalogAll();
        });
      });
    }
  }

  function updateStepperUI(step) {
    const steps = document.querySelectorAll(".step-item");
    steps.forEach((s) => {
      const sNum = Number(s.dataset.step);
      if (sNum <= step) s.classList.add("active");
      else s.classList.remove("active");
    });

    document.getElementById("step-prodi-container")?.style.setProperty("display", step === 1 ? "block" : "none");
    document.getElementById("step-course-container")?.style.setProperty("display", step === 2 ? "block" : "none");
    document.getElementById("step-set-container")?.style.setProperty("display", step === 3 ? "block" : "none");
    document.getElementById("step-runner-container")?.style.setProperty("display", step === 4 ? "block" : "none");
    document.getElementById("step-result-container")?.style.setProperty("display", step === 5 ? "block" : "none");
  }

  async function loadStudyPrograms() {
    const grid = document.getElementById("prodi-grid");
    if (!grid) return;

    let prodis = getCatalogProdis();
    if (window.supabaseClient) {
      try {
        const { data } = await window.supabaseClient
          .from("study_programs")
          .select("id, code, name, description")
          .eq("is_active", true)
          .order("name", { ascending: true });
        if (data && data.length > 0) prodis = data;
      } catch (_) {}
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
            <span class="badge badge-primary">${window.escapeHtml(p.code)}</span>
          </div>
          <h3 class="selection-title">${window.escapeHtml(p.name)}</h3>
          <p class="selection-desc">${window.escapeHtml(p.description || "Program studi digital.")}</p>
        </div>
        <div class="selection-meta">
          <span>Klik untuk pilih mata kuliah</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `
      )
      .join("");

    grid.querySelectorAll(".selection-card").forEach((card) => {
      card.addEventListener("click", () => {
        const pObj = prodis.find((item) => item.id === card.dataset.prodiId);
        if (pObj) {
          selectedProdi = pObj;
          loadCoursesForProdi(selectedProdi);
        }
      });
    });
  }

  async function loadCoursesForProdi(prodi) {
    updateStepperUI(2);
    const titleEl = document.getElementById("course-step-title");
    if (titleEl) titleEl.textContent = `Mata Kuliah — ${prodi.name}`;

    const grid = document.getElementById("course-grid");
    if (!grid) return;

    const allCourses = getCatalogCourses();
    let courses = allCourses.filter((c) => c.study_program_id === prodi.id);
    if (courses.length === 0) courses = allCourses;

    if (window.supabaseClient) {
      try {
        const { data } = await window.supabaseClient
          .from("courses")
          .select("id, code, name, description")
          .eq("study_program_id", prodi.id);
        if (data && data.length > 0) courses = data;
      } catch (_) {}
    }

    grid.innerHTML = courses
      .map(
        (c) => `
      <div class="selection-card" data-course-id="${c.id}">
        <div>
          <div class="selection-card-header">
            <span class="badge badge-primary">${window.escapeHtml(c.code)}</span>
          </div>
          <h3 class="selection-title">${window.escapeHtml(c.name)}</h3>
          <p class="selection-desc">${window.escapeHtml(c.description || "Mata kuliah program sarjana.")}</p>
        </div>
        <div class="selection-meta">
          <span>Pilih Paket Latihan</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `
      )
      .join("");

    grid.querySelectorAll(".selection-card").forEach((card) => {
      card.addEventListener("click", () => {
        const cObj = courses.find((item) => item.id === card.dataset.courseId);
        if (cObj) {
          selectedCourse = cObj;
          loadQuestionSets(selectedCourse);
        }
      });
    });
  }

  async function loadQuestionSets(course) {
    updateStepperUI(3);
    const titleEl = document.getElementById("set-step-title");
    if (titleEl) titleEl.textContent = `Paket Latihan — ${course.name} (${course.code})`;

    const listEl = document.getElementById("qset-list");
    if (!listEl) return;

    const allSets = getCatalogSets();
    let sets = allSets.filter((s) => s.course_id === course.id);
    if (sets.length === 0) sets = allSets;

    if (window.supabaseClient) {
      try {
        const { data } = await window.supabaseClient
          .from("question_sets")
          .select("id, title, description, difficulty, duration_minutes")
          .eq("course_id", course.id)
          .eq("is_published", true);
        if (data && data.length > 0) sets = data;
      } catch (_) {}
    }

    listEl.innerHTML = sets
      .map((s) => {
        const diffBadge =
          s.difficulty === "Mudah" ? "badge-success" : s.difficulty === "Sulit" ? "badge-danger" : "badge-warning";
        return `
        <div class="qset-card">
          <div class="qset-info">
            <h3>${window.escapeHtml(s.title)}</h3>
            <p>${window.escapeHtml(s.description || "Uji penguasaan konsep materi ini.")}</p>
            <div class="qset-badges">
              <span class="badge ${diffBadge}">${window.escapeHtml(s.difficulty)}</span>
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
        const sObj = sets.find((item) => item.id === btn.dataset.setId);
        if (sObj) {
          selectedSet = sObj;
          startQuiz(selectedSet);
        }
      });
    });
  }

  async function startQuiz(setObj) {
    const allQuestions = getCatalogQuestions();
    let questions = allQuestions.filter((q) => q.question_set_id === setObj.id);
    if (questions.length === 0) questions = allQuestions;

    if (window.supabaseClient) {
      try {
        const { data } = await window.supabaseClient
          .from("questions")
          .select("id, question_text, option_a, option_b, option_c, option_d, points")
          .eq("question_set_id", setObj.id);
        if (data && data.length > 0) questions = data;
      } catch (_) {}
    }

    currentQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = {};
    flaggedQuestions.clear();

    const durationMin = setObj.duration_minutes || 20;
    remainingSeconds = durationMin * 60;
    totalDurationSeconds = remainingSeconds;

    updateStepperUI(4);
    const titleEl = document.getElementById("quiz-set-title");
    if (titleEl) titleEl.textContent = setObj.title;

    renderPalette();
    renderActiveQuestion();
    startTimer();
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    const timerEl = document.getElementById("quiz-countdown-timer");

    function tick() {
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        submitQuizAttempt();
        return;
      }
      remainingSeconds--;
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      if (timerEl) {
        timerEl.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
        let classes = "palette-btn";
        if (idx === currentQuestionIndex) classes += " current";
        if (userAnswers[q.id]) classes += " answered";
        if (flaggedQuestions.has(q.id)) classes += " flagged";
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

    const progressText = document.getElementById("quiz-question-progress");
    if (progressText) progressText.textContent = `Soal ${currentQuestionIndex + 1} dari ${currentQuestions.length}`;

    const textEl = document.getElementById("quiz-question-text");
    if (textEl) textEl.textContent = q.question_text;

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
          <div class="option-text">${window.escapeHtml(opt.text)}</div>
        </div>
      `
        )
        .join("");

      optionsContainer.querySelectorAll(".option-item").forEach((item) => {
        item.addEventListener("click", () => {
          userAnswers[q.id] = item.dataset.opt;
          renderActiveQuestion();
          renderPalette();
        });
      });
    }

    const prevBtn = document.getElementById("btn-prev-question");
    const nextBtn = document.getElementById("btn-next-question");
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) nextBtn.style.display = currentQuestionIndex === currentQuestions.length - 1 ? "none" : "inline-flex";
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
      if (flaggedQuestions.has(q.id)) flaggedQuestions.delete(q.id);
      else flaggedQuestions.add(q.id);
      renderActiveQuestion();
      renderPalette();
    });

    document.getElementById("btn-finish-quiz")?.addEventListener("click", () => {
      const answeredCount = Object.keys(userAnswers).length;
      const modalBody = document.getElementById("submit-confirm-summary");
      if (modalBody) {
        modalBody.innerHTML = `Kamu telah menjawab <strong>${answeredCount}</strong> dari total <strong>${currentQuestions.length}</strong> soal. Kumpulkan sekarang?`;
      }
      window.openModal("modal-confirm-submit");
    });

    document.getElementById("btn-cancel-submit")?.addEventListener("click", () => {
      window.closeModal("modal-confirm-submit");
    });

    document.getElementById("btn-proceed-submit")?.addEventListener("click", async () => {
      window.closeModal("modal-confirm-submit");
      await submitQuizAttempt();
    });

    document.getElementById("crumb-back-prodi")?.addEventListener("click", () => updateStepperUI(1));
    document.getElementById("crumb-back-course")?.addEventListener("click", () => updateStepperUI(2));
  }

  async function submitQuizAttempt() {
    if (timerInterval) clearInterval(timerInterval);
    const durationSpent = Math.max(10, totalDurationSeconds - remainingSeconds);

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const review = [];

    currentQuestions.forEach((q) => {
      const sel = userAnswers[q.id] || null;
      const corr = q.correct_option || "B";
      const isCorr = sel === corr;
      if (!sel) unansweredCount++;
      else if (isCorr) correctCount++;
      else wrongCount++;

      review.push({
        question_id: q.id,
        selected_option: sel,
        correct_option: corr,
        is_correct: isCorr,
        explanation: q.explanation || "Pelajari kembali konsep dasar pada modul terkait.",
      });
    });

    const score = Math.round((correctCount / currentQuestions.length) * 100);
    const result = {
      score,
      correct_answers: correctCount,
      wrong_answers: wrongCount,
      unanswered_questions: unansweredCount,
      review,
    };

    // Simpan ke riwayat lokal untuk grafik dashboard
    const localKey = `utb_attempts_${currentUser.id}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    existing.unshift({
      id: "att-" + Date.now(),
      score,
      total_questions: currentQuestions.length,
      correct_answers: correctCount,
      wrong_answers: wrongCount,
      duration_seconds: durationSpent,
      completed_at: new Date().toISOString(),
      question_sets: {
        id: selectedSet.id,
        title: selectedSet.title,
        courses: {
          id: selectedCourse.id,
          name: selectedCourse.name,
          code: selectedCourse.code,
        },
      },
    });
    localStorage.setItem(localKey, JSON.stringify(existing));

    renderQuizResult(result, durationSpent);
  }

  function renderQuizResult(result, durationSpent) {
    updateStepperUI(5);
    document.getElementById("result-score-val").textContent = result.score;
    document.getElementById("result-correct-val").textContent = result.correct_answers;
    document.getElementById("result-wrong-val").textContent = result.wrong_answers;
    document.getElementById("result-unanswered-val").textContent = result.unanswered_questions;
    document.getElementById("result-duration-val").textContent = window.formatDuration(durationSpent);

    document.getElementById("btn-view-explanation")?.addEventListener("click", () => {
      const container = document.getElementById("result-review-section");
      if (!container) return;
      container.style.display = "block";
      container.innerHTML = result.review
        .map((r, idx) => {
          const qObj = currentQuestions.find((q) => q.id === r.question_id);
          return `
            <div class="review-item ${r.is_correct ? "correct" : "wrong"}">
              <strong>Soal #${idx + 1}</strong>
              <p>${window.escapeHtml(qObj?.question_text || "")}</p>
              <div>Jawaban Anda: <strong>${r.selected_option || "-"}</strong> | Kunci: <strong>${r.correct_option}</strong></div>
              <div class="explanation-box">${window.escapeHtml(r.explanation)}</div>
            </div>
          `;
        })
        .join("");
      container.scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("btn-retry-quiz")?.addEventListener("click", () => {
      if (selectedSet) startQuiz(selectedSet);
    });

    document.getElementById("btn-back-to-courses")?.addEventListener("click", () => {
      if (selectedProdi) loadCoursesForProdi(selectedProdi);
    });
  }
})();
