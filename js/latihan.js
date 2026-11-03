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
    { id: "c-msim4207-01", study_program_id: "b1111111-1111-1111-1111-111111111111", code: "MSIM4207", name: "Sistem Informasi Manajemen", description: "Membahas konsep sistem informasi, model bisnis digital, infrastruktur TI, keamanan, basis data, DSS, dan perancangan sistem informasi." },
    { id: "c1111111-1111-1111-1111-111111111111", study_program_id: "b1111111-1111-1111-1111-111111111111", code: "MSIM4201", name: "Analisis dan Perancangan Sistem", description: "Konsep siklus hidup pengembangan sistem (SDLC), pemodelan UML, dan use case diagram." },
    { id: "c2222222-2222-2222-2222-222222222222", study_program_id: "b1111111-1111-1111-1111-111111111111", code: "MSIM4202", name: "Sistem Basis Data", description: "Normalisasi data, Entity-Relationship Diagram (ERD), sintaks SQL, dan transaksi database." },
    { id: "c4444444-4444-4444-4444-444444444444", study_program_id: "b2222222-2222-2222-2222-222222222222", code: "EKMA4116", name: "Manajemen Strategik", description: "Analisis lingkungan bisnis, keunggulan bersaing, visi-misi korporasi, dan implementasi strategi." },
    { id: "c5555555-5555-5555-5555-555555555555", study_program_id: "b3333333-3333-3333-3333-333333333333", code: "SKOM4101", name: "Pengantar Ilmu Komunikasi", description: "Model komunikasi linear, transaksional, komunikasi massa, dan etika media digital." },
    { id: "c6666666-6666-6666-6666-666666666666", study_program_id: "b4444444-4444-4444-4444-444444444444", code: "EKMA4115", name: "Pengantar Akuntansi", description: "Persamaan dasar akuntansi, siklus jurnal umum, buku besar, neraca saldo, dan laporan keuangan." },
  ];

  const SEED_SETS = [
    {
      id: "set-stsi4207-m1-3",
      course_id: "c-msim4207-01",
      title: "Latihan Mandiri Modul 1 - 3",
      description: "Paket latihan mandiri Modul 1 sampai 3 (Konsep SI dalam Bisnis, Kolaborasi & Keunggulan Strategis, serta Isu Sosial & Etika).",
      difficulty: "Menengah",
      duration_minutes: 45,
      question_count: 70
    },
    {
      id: "set-stsi4207-m4-6",
      course_id: "c-msim4207-01",
      title: "Latihan Mandiri Modul 4 - 6",
      description: "Paket latihan mandiri Modul 4 sampai 6 (Infrastruktur TI & Jaringan, Keamanan SI, serta Manajemen Data & Pengetahuan).",
      difficulty: "Menengah",
      duration_minutes: 40,
      question_count: 60
    },
    {
      id: "set-stsi4207-m7-9",
      course_id: "c-msim4207-01",
      title: "Latihan Mandiri Modul 7 - 9",
      description: "Paket latihan mandiri Modul 7 sampai 9 (Aplikasi Perusahaan & E-Commerce, DSS & Intelijen Bisnis, serta Pengembangan SI & Manajemen Proyek).",
      difficulty: "Menengah",
      duration_minutes: 40,
      question_count: 60
    },
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
  let currentStep = 1;
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
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    localStorage.setItem("utb_catalog_prodis", JSON.stringify(SEED_PRODIS));
    return [...SEED_PRODIS];
  }

  function getCatalogCourses() {
    const raw = localStorage.getItem("utb_catalog_courses");
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    localStorage.setItem("utb_catalog_courses", JSON.stringify(SEED_COURSES));
    return [...SEED_COURSES];
  }

  function getCatalogSets() {
    let list = [];
    const raw = localStorage.getItem("utb_catalog_sets");
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } catch (_) {}
    }
    if (list.length === 0) {
      list = [...SEED_SETS];
    }

    // Bersihkan paket gabungan lama (Modul 1 - 8) yang berpotensi tersisa di cache pengguna
    list = list.filter((s) => s.id !== "d-stsi4207-m1-8" && !((s.title || "").includes("Modul 1 - 8")));

    // Pastikan 3 paket soal STSI4207 selalu terdaftar
    const packageSource = Array.isArray(window.STSI4207_PACKAGES) && window.STSI4207_PACKAGES.length > 0
      ? window.STSI4207_PACKAGES
      : SEED_SETS.filter((s) => s.id.startsWith("set-stsi4207-"));

    packageSource.forEach((pkg) => {
      const idx = list.findIndex((item) => item.id === pkg.id);
      if (idx === -1) {
        list.push(pkg);
      } else {
        list[idx] = { ...list[idx], ...pkg };
      }
    });

    list.sort((a, b) => getSetSortOrder(a) - getSetSortOrder(b));
    localStorage.setItem("utb_catalog_sets", JSON.stringify(list));
    return list;
  }

  function getCatalogQuestions() {
    let list = [];
    const raw = localStorage.getItem("utb_catalog_questions");
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } catch (_) {}
    }
    if (list.length === 0) {
      list = [...SEED_QUESTIONS];
    }

    // Perbarui question_set_id jika ada soal yang masih membawa ID paket gabungan lama
    list.forEach((q) => {
      if (q.question_set_id === "d-stsi4207-m1-8") {
        if (/-m[1-3]-/.test(q.id)) q.question_set_id = "set-stsi4207-m1-3";
        else if (/-m[4-6]-/.test(q.id)) q.question_set_id = "set-stsi4207-m4-6";
        else if (/-m[7-9]-/.test(q.id)) q.question_set_id = "set-stsi4207-m7-9";
      }
    });

    // Merge seluruh 190 butir soal STSI4207 jika ada
    if (Array.isArray(window.STSI4207_QUESTIONS) && window.STSI4207_QUESTIONS.length > 0) {
      const existingMap = new Map(list.map((q) => [q.id, q]));
      window.STSI4207_QUESTIONS.forEach((q) => {
        existingMap.set(q.id, q);
      });
      list = Array.from(existingMap.values());
    }
    localStorage.setItem("utb_catalog_questions", JSON.stringify(list));
    return list;
  }

  // Urutan paket latihan mandiri: Modul 1-3 di atas, 4-6 di bawahnya, 7-9 di bawahnya lagi
  function getSetSortOrder(setObj) {
    if (!setObj) return 99;
    const id = (setObj.id || "").toLowerCase();
    const title = (setObj.title || "").toLowerCase();

    if (id.includes("m1-3") || id.includes("m1_3") || title.includes("modul 1 - 3") || title.includes("modul 1-3") || title.includes("modul 1 s.d. 3") || title.includes("modul 1 s/d 3")) {
      return 1;
    }
    if (id.includes("m4-6") || id.includes("m4_6") || title.includes("modul 4 - 6") || title.includes("modul 4-6") || title.includes("modul 4 s.d. 6") || title.includes("modul 4 s/d 6")) {
      return 2;
    }
    if (id.includes("m7-9") || id.includes("m7_9") || title.includes("modul 7 - 9") || title.includes("modul 7-9") || title.includes("modul 7 s.d. 9") || title.includes("modul 7 s/d 9")) {
      return 3;
    }
    return 99;
  }

  // Helper resolusi butir soal per paket secara presisi & akurat
  function getQuestionsForSet(setObj) {
    if (!setObj) return [];
    const id = (setObj.id || "").toLowerCase();
    const title = (setObj.title || "").toLowerCase();

    const isM13 = id === "set-stsi4207-m1-3" || id.includes("m1-3") || id.includes("m1_3") ||
                  title.includes("modul 1 - 3") || title.includes("modul 1-3") || title.includes("modul 1 s.d. 3") || title.includes("modul 1 s/d 3");

    const isM46 = id === "set-stsi4207-m4-6" || id.includes("m4-6") || id.includes("m4_6") ||
                  title.includes("modul 4 - 6") || title.includes("modul 4-6") || title.includes("modul 4 s.d. 6") || title.includes("modul 4 s/d 6");

    const isM79 = id === "set-stsi4207-m7-9" || id.includes("m7-9") || id.includes("m7_9") ||
                  title.includes("modul 7 - 9") || title.includes("modul 7-9") || title.includes("modul 7 s.d. 9") || title.includes("modul 7 s/d 9");

    const pool = (Array.isArray(window.STSI4207_QUESTIONS) && window.STSI4207_QUESTIONS.length > 0)
      ? window.STSI4207_QUESTIONS
      : getCatalogQuestions();

    if (isM13) {
      return pool.filter((q) => q.question_set_id === "set-stsi4207-m1-3" || /-m[1-3]-/.test(q.id));
    }
    if (isM46) {
      return pool.filter((q) => q.question_set_id === "set-stsi4207-m4-6" || /-m[4-6]-/.test(q.id));
    }
    if (isM79) {
      return pool.filter((q) => q.question_set_id === "set-stsi4207-m7-9" || /-m[7-9]-/.test(q.id));
    }

    return pool.filter((q) => q.question_set_id === setObj.id);
  }

  let lastLatihanSyncAt = 0;
  async function syncLatihanCatalogFromCloud(forceRender = false) {
    const now = Date.now();
    if (!forceRender && now - lastLatihanSyncAt < 3000) return;
    lastLatihanSyncAt = now;

    try {
      await Promise.all([
        typeof window.dbGetCatalogProdis === "function" ? window.dbGetCatalogProdis() : Promise.resolve(),
        typeof window.dbGetCatalogCourses === "function" ? window.dbGetCatalogCourses() : Promise.resolve(),
        typeof window.dbGetCatalogSets === "function" ? window.dbGetCatalogSets() : Promise.resolve(),
        typeof window.dbGetCatalogQuestions === "function" ? window.dbGetCatalogQuestions() : Promise.resolve(),
      ]);
    } catch (_) {}

    if (forceRender) {
      const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
      if (isAdmin) renderAdminCatalogAll();

      const s1 = document.getElementById("step-prodi-container");
      const s2 = document.getElementById("step-course-container");
      const s3 = document.getElementById("step-set-container");
      if (s1 && s1.style.display !== "none") {
        await loadStudyPrograms();
      } else if (s2 && s2.style.display !== "none" && selectedProdi) {
        await loadCoursesForProdi(selectedProdi);
      } else if (s3 && s3.style.display !== "none" && selectedCourse) {
        await loadQuestionSets(selectedCourse);
      }
    }
  }

  // ============================================================================
  // ADMIN REALTIME EDIT MODALS & HANDLERS (PRODI, MATA KULIAH, PAKET SOAL)
  // ============================================================================
  function openEditProdiModal(prodiId) {
    const prodis = getCatalogProdis();
    const p = prodis.find((item) => item.id === prodiId);
    if (!p) return;

    const idEl = document.getElementById("edit-prodi-id");
    const codeEl = document.getElementById("edit-prodi-code");
    const nameEl = document.getElementById("edit-prodi-name");
    const descEl = document.getElementById("edit-prodi-desc");

    if (idEl) idEl.value = p.id;
    if (codeEl) codeEl.value = p.code || "";
    if (nameEl) nameEl.value = p.name || "";
    if (descEl) descEl.value = p.description || "";

    window.openModal("modal-edit-prodi");
  }

  function openEditCourseModal(courseId) {
    const courses = getCatalogCourses();
    const c = courses.find((item) => item.id === courseId);
    if (!c) return;

    const prodis = getCatalogProdis();
    const prodiSelect = document.getElementById("edit-course-prodi");
    if (prodiSelect) {
      prodiSelect.innerHTML = prodis
        .map((p) => `<option value="${p.id}" ${p.id === c.study_program_id ? "selected" : ""}>${window.escapeHtml(p.name)} (${window.escapeHtml(p.code)})</option>`)
        .join("");
    }

    const idEl = document.getElementById("edit-course-id");
    const codeEl = document.getElementById("edit-course-code");
    const nameEl = document.getElementById("edit-course-name");
    const descEl = document.getElementById("edit-course-desc");

    if (idEl) idEl.value = c.id;
    if (codeEl) codeEl.value = c.code || "";
    if (nameEl) nameEl.value = c.name || "";
    if (descEl) descEl.value = c.description || "";

    window.openModal("modal-edit-course");
  }

  function openEditSetModal(setId) {
    const sets = getCatalogSets();
    const s = sets.find((item) => item.id === setId);
    if (!s) return;

    const courses = getCatalogCourses();
    const courseSelect = document.getElementById("edit-set-course");
    if (courseSelect) {
      courseSelect.innerHTML = courses
        .map((c) => `<option value="${c.id}" ${c.id === s.course_id ? "selected" : ""}>${window.escapeHtml(c.code)} — ${window.escapeHtml(c.name)}</option>`)
        .join("");
    }

    const idEl = document.getElementById("edit-set-id");
    const titleEl = document.getElementById("edit-set-title");
    const diffEl = document.getElementById("edit-set-diff");
    const durEl = document.getElementById("edit-set-duration");
    const descEl = document.getElementById("edit-set-desc");

    if (idEl) idEl.value = s.id;
    if (titleEl) titleEl.value = s.title || "";
    if (diffEl) diffEl.value = s.difficulty || "Menengah";
    if (durEl) durEl.value = s.duration_minutes || 20;
    if (descEl) descEl.value = s.description || "";

    window.openModal("modal-edit-set");
  }

  function setupAdminEditFormListeners() {
    // 1. Submit Edit Program Studi
    document.getElementById("form-edit-prodi")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-prodi-id")?.value;
      const code = document.getElementById("edit-prodi-code")?.value.trim().toUpperCase();
      const name = document.getElementById("edit-prodi-name")?.value.trim();
      const description = document.getElementById("edit-prodi-desc")?.value.trim() || "";

      if (!id || !code || !name) return;

      const submitBtn = document.getElementById("btn-save-edit-prodi");
      window.setButtonLoading(submitBtn, true, "Menyimpan ke Supabase...");

      try {
        if (window.supabaseClient) {
          const { error } = await window.supabaseClient
            .from("study_programs")
            .update({ code, name, description, updated_at: new Date().toISOString() })
            .eq("id", id);
          if (error) console.warn("Supabase direct update study_programs:", error.message);
        }

        if (typeof window.dbUpdateProdi === "function") {
          await window.dbUpdateProdi(id, { code, name, description });
        } else {
          const list = getCatalogProdis();
          const idx = list.findIndex((item) => item.id === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], code, name, description };
            localStorage.setItem("utb_catalog_prodis", JSON.stringify(list));
          }
        }

        if (selectedProdi && selectedProdi.id === id) {
          selectedProdi = { ...selectedProdi, code, name, description };
        }

        window.closeModal("modal-edit-prodi");
        window.showToast(`Program Studi "${name}" berhasil diperbarui secara real-time!`, "success");

        renderAdminCatalogAll();
        await loadStudyPrograms();
      } catch (err) {
        window.showToast("Gagal menyimpan perubahan: " + err.message, "danger");
      } finally {
        window.setButtonLoading(submitBtn, false);
      }
    });

    // 2. Submit Edit Mata Kuliah
    document.getElementById("form-edit-course")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-course-id")?.value;
      const study_program_id = document.getElementById("edit-course-prodi")?.value;
      const code = document.getElementById("edit-course-code")?.value.trim().toUpperCase();
      const name = document.getElementById("edit-course-name")?.value.trim();
      const description = document.getElementById("edit-course-desc")?.value.trim() || "";

      if (!id || !study_program_id || !code || !name) return;

      const submitBtn = document.getElementById("btn-save-edit-course");
      window.setButtonLoading(submitBtn, true, "Menyimpan ke Supabase...");

      try {
        if (window.supabaseClient) {
          const { error } = await window.supabaseClient
            .from("courses")
            .update({ study_program_id, code, name, description, updated_at: new Date().toISOString() })
            .eq("id", id);
          if (error) console.warn("Supabase direct update courses:", error.message);
        }

        if (typeof window.dbUpdateCourse === "function") {
          await window.dbUpdateCourse(id, { study_program_id, code, name, description });
        } else {
          const list = getCatalogCourses();
          const idx = list.findIndex((item) => item.id === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], study_program_id, code, name, description };
            localStorage.setItem("utb_catalog_courses", JSON.stringify(list));
          }
        }

        if (selectedCourse && selectedCourse.id === id) {
          selectedCourse = { ...selectedCourse, study_program_id, code, name, description };
        }

        window.closeModal("modal-edit-course");
        window.showToast(`Mata Kuliah "${name}" berhasil diperbarui secara real-time!`, "success");

        renderAdminCatalogAll();
        if (selectedProdi) await loadCoursesForProdi(selectedProdi);
        else await loadStudyPrograms();
      } catch (err) {
        window.showToast("Gagal menyimpan perubahan: " + err.message, "danger");
      } finally {
        window.setButtonLoading(submitBtn, false);
      }
    });

    // 3. Submit Edit Paket Soal
    document.getElementById("form-edit-set")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-set-id")?.value;
      const course_id = document.getElementById("edit-set-course")?.value;
      const title = document.getElementById("edit-set-title")?.value.trim();
      const difficulty = document.getElementById("edit-set-diff")?.value;
      const duration_minutes = Number(document.getElementById("edit-set-duration")?.value) || 20;
      const description = document.getElementById("edit-set-desc")?.value.trim() || "";

      if (!id || !course_id || !title) return;

      const submitBtn = document.getElementById("btn-save-edit-set");
      window.setButtonLoading(submitBtn, true, "Menyimpan ke Supabase...");

      try {
        if (window.supabaseClient) {
          const { error } = await window.supabaseClient
            .from("question_sets")
            .upsert({
              id,
              course_id,
              title,
              description,
              difficulty,
              duration_minutes,
              is_published: true,
              updated_at: new Date().toISOString()
            });
          if (error) console.warn("Supabase upsert question_sets:", error.message);
        }

        const setsList = getCatalogSets();
        const idx = setsList.findIndex((item) => item.id === id);
        if (idx !== -1) {
          setsList[idx] = { ...setsList[idx], course_id, title, description, difficulty, duration_minutes };
        } else {
          setsList.push({ id, course_id, title, description, difficulty, duration_minutes });
        }
        localStorage.setItem("utb_catalog_sets", JSON.stringify(setsList));

        if (typeof window.dbSaveCatalogSets === "function") {
          await window.dbSaveCatalogSets(setsList);
        }

        if (Array.isArray(window.STSI4207_PACKAGES)) {
          const pkg = window.STSI4207_PACKAGES.find((p) => p.id === id);
          if (pkg) {
            pkg.title = title;
            pkg.description = description;
            pkg.difficulty = difficulty;
            pkg.duration_minutes = duration_minutes;
          }
        }

        if (selectedSet && selectedSet.id === id) {
          selectedSet = { ...selectedSet, course_id, title, description, difficulty, duration_minutes };
        }

        window.closeModal("modal-edit-set");
        window.showToast(`Paket Soal "${title}" berhasil diperbarui secara real-time!`, "success");

        renderAdminCatalogAll();
        if (selectedCourse) await loadQuestionSets(selectedCourse);
      } catch (err) {
        window.showToast("Gagal menyimpan perubahan: " + err.message, "danger");
      } finally {
        window.setButtonLoading(submitBtn, false);
      }
    });
  }

  // ============================================================================
  // INISIALISASI REALTIME SUPABASE UNTUK PERUBAHAN INSTAN DI SEMUA CLIENT
  // ============================================================================
  function initLatihanRealtimeSync() {
    if (!window.supabaseClient || typeof window.supabaseClient.channel !== "function") return;

    try {
      const channel = window.supabaseClient.channel("utb_latihan_realtime_channel");

      channel
        .on("postgres_changes", { event: "*", schema: "public", table: "study_programs" }, async () => {
          console.log("Supabase Realtime: study_programs berubah");
          await syncLatihanCatalogFromCloud(true);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, async () => {
          console.log("Supabase Realtime: courses berubah");
          await syncLatihanCatalogFromCloud(true);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "question_sets" }, async () => {
          console.log("Supabase Realtime: question_sets berubah");
          await syncLatihanCatalogFromCloud(true);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Supabase Realtime: Terhubung ke channel latihan soal.");
          }
        });
    } catch (err) {
      console.warn("Realtime subscription warning:", err);
    }

    // Dengarkan event storage untuk sinkronisasi antar-tab dalam browser yang sama
    window.addEventListener("storage", (e) => {
      if (e.key && e.key.startsWith("utb_catalog_")) {
        syncLatihanCatalogFromCloud(true);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    currentUser = await window.requireAuth();
    if (!currentUser) return;

    setupAdminEditFormListeners();
    initLatihanRealtimeSync();

    await syncLatihanCatalogFromCloud(false);

    const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
    if (isAdmin) {
      initAdminLatihanManager();
    }

    updateStepperUI(1);
    await loadStudyPrograms();
    setupQuizControls();

    // Auto-sinkronisasi ketika tab di HP / perangkat lain dibuka kembali
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") syncLatihanCatalogFromCloud(true);
    });
    window.addEventListener("focus", () => syncLatihanCatalogFromCloud(true));
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

    // Form 1: Tambah Program Studi (Langsung ke Supabase)
    document.getElementById("form-admin-prodi")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = document.getElementById("input-prodi-code")?.value.trim().toUpperCase();
      const name = document.getElementById("input-prodi-name")?.value.trim();
      const description = document.getElementById("input-prodi-desc")?.value.trim() || "Program studi digital UTBelajar.";
      if (!code || !name) return;

      const submitBtn = e.target.querySelector("button[type='submit']");
      window.setButtonLoading(submitBtn, true, "Menyimpan ke Supabase...");

      if (typeof window.dbInsertProdi === "function") {
        await window.dbInsertProdi({ code, name, description });
      } else {
        const list = getCatalogProdis();
        list.push({
          id: "prodi-" + Date.now(),
          code,
          name,
          description,
        });
        localStorage.setItem("utb_catalog_prodis", JSON.stringify(list));
      }

      window.setButtonLoading(submitBtn, false);
      e.target.reset();
      window.showToast(`Program Studi "${name}" berhasil disimpan ke Supabase!`, "success");
      renderAdminCatalogAll();
      await loadStudyPrograms();
    });

    // Form 2: Tambah Mata Kuliah
    document.getElementById("form-admin-course")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const study_program_id = document.getElementById("input-course-prodi")?.value;
      const code = document.getElementById("input-course-code")?.value.trim().toUpperCase();
      const name = document.getElementById("input-course-name")?.value.trim();
      const description = document.getElementById("input-course-desc")?.value.trim() || "Mata kuliah program sarjana.";
      if (!study_program_id || !code || !name) return;

      const submitBtn = e.target.querySelector('button[type="submit"]');
      window.setButtonLoading(submitBtn, true, "Menyimpan ke Supabase...");

      if (typeof window.dbInsertCourse === "function") {
        await window.dbInsertCourse({ study_program_id, code, name, description });
      } else {
        const list = getCatalogCourses();
        list.push({
          id: "course-" + Date.now(),
          study_program_id,
          code,
          name,
          description,
        });
        localStorage.setItem("utb_catalog_courses", JSON.stringify(list));
      }

      window.setButtonLoading(submitBtn, false);
      e.target.reset();
      window.showToast(`Mata Kuliah "${name}" (${code}) berhasil disimpan ke Supabase!`, "success");
      renderAdminCatalogAll();
      if (selectedProdi && selectedProdi.id === study_program_id) {
        loadCoursesForProdi(selectedProdi);
      }
    });

    // Form 3: Tambah Paket Soal
    document.getElementById("form-admin-set")?.addEventListener("submit", async (e) => {
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
      if (typeof window.dbSaveCatalogSets === "function") {
        await window.dbSaveCatalogSets(list);
      }
      e.target.reset();
      window.showToast(`Paket Soal "${title}" berhasil disimpan ke Supabase!`, "success");
      renderAdminCatalogAll();
      if (selectedCourse && selectedCourse.id === course_id) {
        loadQuestionSets(selectedCourse);
      }
    });

    // Form 4: Tambah Butir Soal Pengerjaan
    document.getElementById("form-admin-question")?.addEventListener("submit", async (e) => {
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
      if (typeof window.dbSaveCatalogQuestions === "function") {
        await window.dbSaveCatalogQuestions(list);
      }
      e.target.reset();
      window.showToast("Butir soal pengerjaan berhasil disimpan ke Supabase!", "success");
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
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="btn btn-secondary btn-sm btn-edit-prodi-admin" data-id="${p.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Edit</button>
              <button type="button" class="btn btn-danger btn-sm btn-del-prodi" data-id="${p.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Hapus</button>
            </div>
          </div>
        `
        )
        .join("");

      prodiListEl.querySelectorAll(".btn-edit-prodi-admin").forEach((btn) => {
        btn.addEventListener("click", () => openEditProdiModal(btn.dataset.id));
      });

      prodiListEl.querySelectorAll(".btn-del-prodi").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const prodiId = btn.dataset.id;
          const target = prodis.find((p) => p.id === prodiId);
          const pName = target ? target.name : "Program Studi";

          const confirmed = typeof window.showConfirmDialog === "function"
            ? await window.showConfirmDialog({
                title: "Hapus Program Studi",
                message: `Apakah Anda yakin ingin menghapus program studi <strong>"${window.escapeHtml(pName)}"</strong> dari database Supabase? Semua mata kuliah dan paket latihan terkait akan dihapus.`,
                confirmText: "Hapus Program Studi",
              })
            : window.confirm("Apakah Anda yakin ingin menghapus program studi ini dari database Supabase?");
          if (!confirmed) return;

          window.setButtonLoading(btn, true, "...");
          if (typeof window.dbDeleteProdi === "function") {
            await window.dbDeleteProdi(prodiId);
          } else {
            const updated = getCatalogProdis().filter((item) => item.id !== prodiId);
            localStorage.setItem("utb_catalog_prodis", JSON.stringify(updated));
          }
          window.showToast("Program studi berhasil dihapus dari Supabase.", "info");
          renderAdminCatalogAll();
          await loadStudyPrograms();
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
              <div style="display: flex; gap: 0.4rem;">
                <button type="button" class="btn btn-secondary btn-sm btn-edit-course-admin" data-id="${c.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Edit</button>
                <button type="button" class="btn btn-danger btn-sm btn-del-course" data-id="${c.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Hapus</button>
              </div>
            </div>
          `;
        })
        .join("");

      courseListEl.querySelectorAll(".btn-edit-course-admin").forEach((btn) => {
        btn.addEventListener("click", () => openEditCourseModal(btn.dataset.id));
      });

      courseListEl.querySelectorAll(".btn-del-course").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const courseId = btn.dataset.id;
          const target = courses.find((c) => c.id === courseId);
          const cName = target ? target.name : "Mata Kuliah";
          const cCode = target ? target.code : "";

          const confirmed = typeof window.showConfirmDialog === "function"
            ? await window.showConfirmDialog({
                title: "Hapus Mata Kuliah",
                message: `Apakah Anda yakin ingin menghapus mata kuliah <strong>"${window.escapeHtml(cName)}" (${window.escapeHtml(cCode)})</strong> dari database Supabase? Semua paket latihan di dalamnya akan dihapus.`,
                confirmText: "Hapus Mata Kuliah",
              })
            : window.confirm(
                `Apakah Anda yakin ingin menghapus mata kuliah "${cName}" (${cCode})? Tindakan ini akan menghapus data di Supabase dan paket latihan terkait.`
              );
          if (!confirmed) return;

          btn.disabled = true;
          btn.textContent = "...";

          if (typeof window.dbDeleteCourse === "function") {
            await window.dbDeleteCourse(courseId, cCode);
          } else {
            const updated = getCatalogCourses().filter((item) => item.id !== courseId && (!cCode || item.code !== cCode));
            localStorage.setItem("utb_catalog_courses", JSON.stringify(updated));
          }

          window.showToast(`Mata kuliah "${cName}" berhasil dihapus dari Supabase.`, "info");
          renderAdminCatalogAll();
          if (selectedProdi) loadCoursesForProdi(selectedProdi);
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
                <button type="button" class="btn btn-secondary btn-sm btn-edit-set-admin" data-id="${s.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Edit</button>
                <button type="button" class="btn btn-secondary btn-sm btn-test-set" data-id="${s.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Uji Pengerjaan</button>
                <button type="button" class="btn btn-danger btn-sm btn-del-set" data-id="${s.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Hapus</button>
              </div>
            </div>
          `;
        })
        .join("");

      setListEl.querySelectorAll(".btn-edit-set-admin").forEach((btn) => {
        btn.addEventListener("click", () => openEditSetModal(btn.dataset.id));
      });

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
        btn.addEventListener("click", async () => {
          const target = sets.find((item) => item.id === btn.dataset.id);
          const confirmed = typeof window.showConfirmDialog === "function"
            ? await window.showConfirmDialog({
                title: "Hapus Paket Soal",
                message: `Apakah Anda yakin ingin menghapus paket soal <strong>"${window.escapeHtml(target?.title || "Paket Soal")}"</strong> dari Supabase?`,
                confirmText: "Hapus Paket",
              })
            : window.confirm("Hapus paket soal ini?");
          if (!confirmed) return;

          const updated = getCatalogSets().filter((item) => item.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_sets", JSON.stringify(updated));
          if (typeof window.dbSaveCatalogSets === "function") {
            await window.dbSaveCatalogSets(updated);
          }
          window.showToast("Paket soal dihapus dari Supabase.", "info");
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
        btn.addEventListener("click", async () => {
          const confirmed = typeof window.showConfirmDialog === "function"
            ? await window.showConfirmDialog({
                title: "Hapus Butir Soal",
                message: "Apakah Anda yakin ingin menghapus butir soal ini secara permanen dari Supabase?",
                confirmText: "Hapus Soal",
              })
            : window.confirm("Hapus butir soal ini?");
          if (!confirmed) return;

          const updated = getCatalogQuestions().filter((item) => item.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_questions", JSON.stringify(updated));
          if (typeof window.dbSaveCatalogQuestions === "function") {
            await window.dbSaveCatalogQuestions(updated);
          }
          window.showToast("Butir soal dihapus dari Supabase.", "info");
          renderAdminCatalogAll();
        });
      });
    }
  }

  function updateStepperUI(step) {
    currentStep = step;
    const steps = document.querySelectorAll(".latihan-stepper .step-item");
    steps.forEach((s) => {
      const sNum = Number(s.dataset.step);
      const numEl = s.querySelector(".step-number");
      if (numEl) numEl.textContent = sNum; // Selalu nomor, tanpa tanda ceklis

      if (sNum === step) {
        s.classList.add("active");
        s.classList.remove("completed");
      } else if (sNum < step) {
        s.classList.add("completed");
        s.classList.remove("active");
      } else {
        s.classList.remove("active", "completed");
      }
    });

    // Update Mobile Status Bar & Progress Track
    const progressFill = document.getElementById("stepper-progress-fill");
    if (progressFill) progressFill.style.width = `${(step / 5) * 100}%`;
    const mobileBadge = document.getElementById("mobile-stepper-badge");
    if (mobileBadge) mobileBadge.textContent = `Tahap ${step} dari 5`;
    const stepLabels = ["Program Studi", "Mata Kuliah", "Paket Soal", "Pengerjaan", "Hasil & Pembahasan"];
    const mobileTitle = document.getElementById("mobile-stepper-title");
    if (mobileTitle) mobileTitle.textContent = stepLabels[step - 1] || "";

    // Smooth scroll active item into view on mobile
    const currentActiveItem = document.querySelector(`.latihan-stepper .step-item[data-step="${step}"]`);
    currentActiveItem?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

    document.getElementById("step-prodi-container")?.style.setProperty("display", step === 1 ? "block" : "none");
    document.getElementById("step-course-container")?.style.setProperty("display", step === 2 ? "block" : "none");
    document.getElementById("step-set-container")?.style.setProperty("display", step === 3 ? "block" : "none");
    document.getElementById("step-runner-container")?.style.setProperty("display", step === 4 ? "block" : "none");
    document.getElementById("step-result-container")?.style.setProperty("display", step === 5 ? "block" : "none");
  }

  async function loadStudyPrograms() {
    const grid = document.getElementById("prodi-grid");
    if (!grid) return;

    let prodis = [];
    if (typeof window.dbGetCatalogProdis === "function") {
      try {
        const cloudProdis = await window.dbGetCatalogProdis();
        if (Array.isArray(cloudProdis)) prodis = cloudProdis;
      } catch (_) {
        prodis = getCatalogProdis();
      }
    } else {
      prodis = getCatalogProdis();
    }

    if (prodis.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p style="color: var(--text-secondary);">Belum ada program studi yang tersedia.</p>
        </div>
      `;
      return;
    }

    const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
    grid.innerHTML = prodis
      .map(
        (p) => `
      <div class="selection-card" data-prodi-id="${p.id}">
        <div>
          <div class="selection-card-header">
            <div class="selection-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span class="badge badge-primary">${window.escapeHtml(p.code)}</span>
              ${
                isAdmin
                  ? `<button type="button" class="btn btn-secondary btn-sm btn-edit-prodi-nav" data-prodi-id="${p.id}" title="Edit Program Studi" style="padding: 0.2rem 0.55rem; font-size: 0.75rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.25rem; font-weight: 600;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>`
                  : ""
              }
            </div>
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

    grid.querySelectorAll(".btn-edit-prodi-nav").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditProdiModal(btn.dataset.prodiId);
      });
    });

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
    if (titleEl) {
      const hasCode = prodi.name && prodi.code && prodi.name.includes(`(${prodi.code})`);
      const label = hasCode ? prodi.name : `${prodi.name}${prodi.code ? ` (${prodi.code})` : ""}`;
      titleEl.textContent = `Mata Kuliah — ${label}`;
    }

    const grid = document.getElementById("course-grid");
    if (!grid) return;

    let allCourses = [];
    if (typeof window.dbGetCatalogCourses === "function") {
      try {
        const cloudCourses = await window.dbGetCatalogCourses();
        allCourses = Array.isArray(cloudCourses) ? cloudCourses : getCatalogCourses();
      } catch (_) {
        allCourses = getCatalogCourses();
      }
    } else {
      allCourses = getCatalogCourses();
    }

    const courses = allCourses.filter((c) => c.study_program_id === prodi.id);

    if (courses.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Belum ada mata kuliah yang terdaftar untuk program studi ini.</p>
        </div>
      `;
      return;
    }

    const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
    grid.innerHTML = courses
      .map(
        (c) => `
      <div class="selection-card" data-course-id="${c.id}">
        <div>
          <div class="selection-card-header">
            <div class="selection-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span class="badge badge-primary">${window.escapeHtml(c.code)}</span>
              ${
                isAdmin
                  ? `<button type="button" class="btn btn-secondary btn-sm btn-edit-course-nav" data-course-id="${c.id}" title="Edit Mata Kuliah" style="padding: 0.2rem 0.55rem; font-size: 0.75rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.25rem; font-weight: 600;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>`
                  : ""
              }
            </div>
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

    grid.querySelectorAll(".btn-edit-course-nav").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditCourseModal(btn.dataset.courseId);
      });
    });

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

    if (typeof window.dbGetCatalogSets === "function") {
      try {
        await window.dbGetCatalogSets();
      } catch (_) {}
    }

    const allSets = getCatalogSets();
    let sets = allSets.filter((s) => s.course_id === course.id);

    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from("question_sets")
          .select("id, course_id, title, description, difficulty, duration_minutes")
          .eq("course_id", course.id)
          .eq("is_published", true);
        if (!error && Array.isArray(data) && data.length > 0) sets = data;
      } catch (_) {}
    }

    const isSTSI = course.code === "MSIM4207" || course.code === "STSI4207" ||
      (course.name && course.name.toLowerCase().includes("sistem informasi manajemen"));

    if (isSTSI) {
      const officialSets = allSets.filter((s) => s.id.startsWith("set-stsi4207-") || s.course_id === "c-msim4207-01");
      if (officialSets.length >= 3) {
        sets = officialSets;
      } else if (sets.length === 0) {
        sets = officialSets;
      }
    }

    // Bersihkan paket gabungan lama jika tersisa
    sets = sets.filter((s) => s.id !== "d-stsi4207-m1-8" && !((s.title || "").includes("Modul 1 - 8")));

    if (sets.length === 0) {
      listEl.innerHTML = `
        <div class="card" style="text-align: center; padding: 2.5rem;">
          <p style="color: var(--text-secondary);">Belum ada paket latihan soal untuk mata kuliah <strong>${window.escapeHtml(course.name)}</strong>.</p>
        </div>
      `;
      return;
    }

    // Urutkan paket latihan secara konsisten:
    // 1. Modul 1 - 3 di paling atas
    // 2. Modul 4 - 6 di bawahnya
    // 3. Modul 7 - 9 di paling bawah
    sets.sort((a, b) => getSetSortOrder(a) - getSetSortOrder(b));

    const isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
    listEl.innerHTML = sets
      .map((s) => {
        const diffBadge =
          s.difficulty === "Mudah" ? "badge-success" : s.difficulty === "Sulit" ? "badge-danger" : "badge-warning";
        const questionsForThisSet = getQuestionsForSet(s);
        const qCount = questionsForThisSet.length || s.question_count || (s.id === "set-stsi4207-m1-3" ? 70 : s.id.startsWith("set-stsi4207-") ? 60 : 20);
        return `
        <div class="qset-card">
          <div class="qset-info">
            <h3>${window.escapeHtml(s.title)}</h3>
            <p>${window.escapeHtml(s.description || "Uji penguasaan konsep materi ini.")}</p>
            <div class="qset-badges">
              <span class="badge ${diffBadge}">${window.escapeHtml(s.difficulty)}</span>
              <span class="badge" style="background: #EEF2F6; color: var(--primary-blue); font-weight: 600;">${qCount} Butir Soal</span>
              <span class="badge" style="background: #F1F5F9; color: var(--text-secondary);">${s.duration_minutes || 20} Menit</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
            ${
              isAdmin
                ? `<button type="button" class="btn btn-secondary btn-sm btn-edit-set-nav" data-set-id="${s.id}" title="Edit Paket Soal" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.3rem; font-weight: 600;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Paket
                  </button>`
                : ""
            }
            <button class="btn btn-primary btn-sm btn-start-quiz" data-set-id="${s.id}">Mulai Latihan</button>
          </div>
        </div>
      `;
      })
      .join("");

    listEl.querySelectorAll(".btn-edit-set-nav").forEach((btn) => {
      btn.addEventListener("click", () => {
        openEditSetModal(btn.dataset.setId);
      });
    });

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
    let questions = getQuestionsForSet(setObj);

    // Jika online dan tabel Supabase questions memiliki soal spesifik untuk setObj.id
    if (window.supabaseClient && questions.length === 0) {
      try {
        const { data } = await window.supabaseClient
          .from("questions")
          .select("id, question_set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, points")
          .eq("question_set_id", setObj.id);
        if (data && data.length > 0) questions = data;
      } catch (_) {}
    }

    if (questions.length === 0) {
      const allQuestions = getCatalogQuestions();
      questions = allQuestions.filter((q) => q.question_set_id === setObj.id);
    }

    if (questions.length === 0) {
      window.showToast("Paket latihan ini belum memiliki butir soal.", "warning");
      return;
    }

    currentQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = {};
    flaggedQuestions.clear();

    const durationMin = setObj.duration_minutes || (questions.length >= 70 ? 45 : 40);
    remainingSeconds = durationMin * 60;
    totalDurationSeconds = remainingSeconds;

    updateStepperUI(4);
    const titleEl = document.getElementById("quiz-set-title");
    if (titleEl) titleEl.textContent = `${setObj.title} (${questions.length} Butir Soal)`;

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

    // Handler navigasi tahapan: HANYA BISA LANGSUNG KE KIRI, JIKA KE KANAN MUNCULKAN POPUP
    document.querySelectorAll(".latihan-stepper .step-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const targetStep = Number(item.dataset.step);
        if (!targetStep || targetStep === currentStep) return;

        // 1. HANYA BISA LANGSUNG KE KIRI (KEMBALI KE TAHAP SEBELUMNYA)
        if (targetStep < currentStep) {
          if (targetStep === 1) {
            updateStepperUI(1);
            await loadStudyPrograms();
          } else if (targetStep === 2) {
            updateStepperUI(2);
            if (selectedProdi) await loadCoursesForProdi(selectedProdi);
            else await loadStudyPrograms();
          } else if (targetStep === 3) {
            updateStepperUI(3);
            if (selectedCourse) await loadQuestionSets(selectedCourse);
          } else if (targetStep === 4) {
            updateStepperUI(4);
          }
          return;
        }

        // 2. JIKA KLIK KE KANAN (MAJU): BLOKIR & MUNCULKAN POPUP PERINGATAN
        if (currentStep === 1) {
          window.showToast("Pilih program studi dahulu", "info");
        } else if (currentStep === 2) {
          window.showToast("Pilih mata kuliah dahulu", "info");
        } else if (currentStep === 3) {
          window.showToast("Pilih paket soal dahulu", "info");
        } else if (currentStep === 4) {
          window.showToast("Selesaikan pengerjaan soal dahulu", "info");
        }
      });
    });
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
