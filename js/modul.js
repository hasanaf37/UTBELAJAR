// ==============================================================================
// UTBELAJAR - KERANGKA SOAL MODUL BERGAYA WEB BACA KOMIK (SCROLL KE BAWAH)
// Menampilkan Gambar JPG Hasil Scan CamScanner di Dalam PDF Secara Vertikal
// Mendukung Baca Tanpa Unduh, Zoom Layar, Unduh PDF Asli, & Upload PDF Baru
// ==============================================================================

(function () {
  if (typeof window !== "undefined" && window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions?.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  // 1. DATA MASTER PROGRAM STUDI
  const DEFAULT_PRODIS = [
    {
      id: "b1111111-1111-1111-1111-111111111111",
      code: "SI",
      name: "Sistem Informasi",
      description: "Studi rekayasa perangkat lunak, sistem informasi bisnis, basis data, dan transformasi digital.",
    },
    {
      id: "b2222222-2222-2222-2222-222222222222",
      code: "MNJ",
      name: "Manajemen",
      description: "Fokus pada kepemimpinan strategis, manajemen operasional, dan pemasaran.",
    },
    {
      id: "b3333333-3333-3333-3333-333333333333",
      code: "ILKOM",
      name: "Ilmu Komunikasi",
      description: "Kajian media massa, public relations, dan komunikasi organisasi digital.",
    },
    {
      id: "b4444444-4444-4444-4444-444444444444",
      code: "AKT",
      name: "Akuntansi",
      description: "Penguasaan akuntansi keuangan, audit, sistem informasi akuntansi, dan perpajakan.",
    },
  ];

  // 2. DATA MASTER MATA KULIAH (MSIM4207 Menjadi Mata Kuliah Utama untuk File Scan PDF)
  const DEFAULT_COURSES = [
    {
      id: "c-msim4207-01",
      study_program_id: "b1111111-1111-1111-1111-111111111111", // Sistem Informasi
      code: "MSIM4207",
      name: "Sistem Informasi Manajemen",
      description: "Membahas konsep sistem informasi, tipe sistem (TPS, DSS, dll.), dan infrastruktur TI dalam organisasi bisnis.",
    },
    {
      id: "c1111111-1111-1111-1111-111111111111",
      study_program_id: "b1111111-1111-1111-1111-111111111111",
      code: "MSIM4201",
      name: "Analisis dan Perancangan Sistem",
      description: "Konsep siklus hidup pengembangan sistem (SDLC), pemodelan UML, dan use case diagram.",
    },
    {
      id: "c2222222-2222-2222-2222-222222222222",
      study_program_id: "b1111111-1111-1111-1111-111111111111",
      code: "MSIM4202",
      name: "Sistem Basis Data",
      description: "Normalisasi data, Entity-Relationship Diagram (ERD), sintaks SQL, dan transaksi database.",
    },
    {
      id: "c4444444-4444-4444-4444-444444444444",
      study_program_id: "b2222222-2222-2222-2222-222222222222",
      code: "EKMA4116",
      name: "Manajemen Strategik",
      description: "Analisis lingkungan bisnis, keunggulan bersaing, visi-misi korporasi, dan implementasi strategi.",
    },
    {
      id: "c5555555-5555-5555-5555-555555555555",
      study_program_id: "b3333333-3333-3333-3333-333333333333",
      code: "SKOM4101",
      name: "Pengantar Ilmu Komunikasi",
      description: "Model komunikasi linear, transaksional, komunikasi massa, dan etika media digital.",
    },
    {
      id: "c6666666-6666-6666-6666-666666666666",
      study_program_id: "b4444444-4444-4444-4444-444444444444",
      code: "EKMA4115",
      name: "Pengantar Akuntansi",
      description: "Persamaan dasar akuntansi, siklus jurnal umum, buku besar, neraca saldo, dan laporan keuangan.",
    },
  ];

    // 3. DATA MASTER MODUL (Memuat File Scan CamScanner Asli & PDF Modul Terpisah 1-3, 4-6, 7-9, Lengkap)
  const DEFAULT_MODULS = [
    {
      id: "mod-msim4207-01-03",
      course_id: "c-msim4207-01",
      title: "MSIM4207 Modul 01 - 03: Sistem Informasi Manajemen",
      edition: "MSIM4207 | Modul 01 - 03 (18 Halaman)",
      pdf_file_url: "assets/modul/MSIM4207-Modul-01-03.pdf",
      pdf_data_url: "",
      images: [],
      page_count: 18,
    },
    {
      id: "mod-msim4207-04-06",
      course_id: "c-msim4207-01",
      title: "MSIM4207 Modul 04 - 06: Sistem Informasi Manajemen",
      edition: "MSIM4207 | Modul 04 - 06 (17 Halaman)",
      pdf_file_url: "assets/modul/MSIM4207-Modul-04-06.pdf",
      pdf_data_url: "",
      images: [],
      page_count: 17,
    },
    {
      id: "mod-msim4207-07-09",
      course_id: "c-msim4207-01",
      title: "MSIM4207 Modul 07 - 09: Sistem Informasi Manajemen",
      edition: "MSIM4207 | Modul 07 - 09 (15 Halaman)",
      pdf_file_url: "assets/modul/MSIM4207-Modul-07-09.pdf",
      pdf_data_url: "",
      images: [],
      page_count: 15,
    },
    {
      id: "mod-msim4207-full",
      course_id: "c-msim4207-01",
      title: "MSIM4207 Modul Lengkap (Modul 01 - 09)",
      edition: "MSIM4207 | Modul Lengkap (60 Halaman)",
      pdf_file_url: "assets/modul/Sistem-Informasi-Manajemen.pdf",
      pdf_data_url: "",
      images: [],
      page_count: 60,
    },
    {
      id: "mod-msim4207-01",
      course_id: "c-msim4207-01",
      title: "MSIM4207 Modul 01: Sistem Informasi dalam Bisnis (Scan CamScanner)",
      edition: "MSIM4207 | Modul 01 (Tes Formatif 1)",
      pdf_file_url: "assets/modul/MSIM4207-Modul-01.pdf",
      pdf_data_url: (typeof window !== "undefined" && window.DEFAULT_CAMSCANNER_PDF_DATA_URL) || "",
      images: [
        "assets/modul/page-1.jpg",
        "assets/modul/page-2.jpg",
        "assets/modul/page-3.jpg",
      ],
      page_count: 3,
    },
  ];

  // ============================================================================
  // INDEXEDDB STORAGE (Untuk Menyimpan File PDF Scan / Gambar Berukuran Besar)
  // ============================================================================
  const IDB_NAME = "utb_modul_storage";
  const IDB_STORE = "pdf_files";
  const inMemoryPdfCache = new Map();

  function getDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  async function saveFileToIdb(key, fileOrBlob) {
    try {
      const db = await getDb();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(fileOrBlob, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (_) {
      return false;
    }
  }

  async function getFileFromIdb(key) {
    try {
      const db = await getDb();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, "readonly");
        const req = tx.objectStore(IDB_STORE).get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (_) {
      return null;
    }
  }

  async function deleteFileFromIdb(key) {
    try {
      const db = await getDb();
      if (!db) return;
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(key);
    } catch (_) {}
  }

  // ============================================================================
  // STATE DAN GETTER DATA
  // ============================================================================
  let currentUser = null;
  let isAdmin = false;
  let currentModulStep = 1;
  let selectedProdi = null;
  let selectedCourse = null;
  let activeModul = null;
  let activeBlobUrl = null;
  let currentComicZoom = 1.0;

  function getProdis() {
    try {
      const raw = localStorage.getItem("utb_catalog_prodis");
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    localStorage.setItem("utb_catalog_prodis", JSON.stringify(DEFAULT_PRODIS));
    return [...DEFAULT_PRODIS];
  }

  function getCourses() {
    try {
      const raw = localStorage.getItem("utb_catalog_courses");
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    localStorage.setItem("utb_catalog_courses", JSON.stringify(DEFAULT_COURSES));
    return [...DEFAULT_COURSES];
  }

    function getModuls() {
    try {
      const raw = localStorage.getItem("utb_catalog_moduls");
      if (raw !== null) {
        let parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          let updated = false;
          // Pastikan seluruh DEFAULT_MODULS terdaftar jika belum ada
          DEFAULT_MODULS.forEach((defMod) => {
            const existingIdx = parsed.findIndex((m) => m && m.id === defMod.id);
            if (existingIdx === -1) {
              parsed.push({ ...defMod });
              updated = true;
            } else if (!parsed[existingIdx].pdf_file_url && defMod.pdf_file_url) {
              parsed[existingIdx].pdf_file_url = defMod.pdf_file_url;
              updated = true;
            }
          });

          // Urutan modul agar teratur: 01-03, 04-06, 07-09, Lengkap, 01 Scan
          const sortOrder = {
            "mod-msim4207-01-03": 1,
            "mod-msim4207-04-06": 2,
            "mod-msim4207-07-09": 3,
            "mod-msim4207-full": 4,
            "mod-msim4207-01": 5,
          };
          parsed.sort((a, b) => (sortOrder[a.id] || 99) - (sortOrder[b.id] || 99));

          if (updated) {
            localStorage.setItem("utb_catalog_moduls", JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (_) {}
    localStorage.setItem("utb_catalog_moduls", JSON.stringify(DEFAULT_MODULS));
    return [...DEFAULT_MODULS];
  }

  // ============================================================================
  // INISIALISASI HALAMAN
  // ============================================================================
  let lastCloudSyncAt = 0;
  async function syncCatalogFromSupabase(forceRender = false) {
    const now = Date.now();
    if (!forceRender && now - lastCloudSyncAt < 3000) return;
    lastCloudSyncAt = now;

    try {
      await Promise.all([
        typeof window.dbGetCatalogProdis === "function" ? window.dbGetCatalogProdis() : Promise.resolve(),
        typeof window.dbGetCatalogCourses === "function" ? window.dbGetCatalogCourses() : Promise.resolve(),
        typeof window.dbGetCatalogModuls === "function" ? window.dbGetCatalogModuls() : Promise.resolve(),
      ]);
    } catch (_) {}

    if (forceRender) {
      if (isAdmin) renderAdminModulLists();
      const s1 = document.getElementById("step-modul-prodi");
      const s2 = document.getElementById("step-modul-course");
      if (s1 && s1.style.display !== "none") {
        renderProdiStep();
      } else if (s2 && s2.style.display !== "none" && selectedProdi) {
        renderCourseStep(selectedProdi);
      }
    }
  }

  // Unggah otomatis file PDF lokal milik Admin yang belum tersinkron ke Cloud Supabase
  async function syncPendingAdminFilesToCloud() {
    if (!isAdmin || typeof window.dbUploadModulFile !== "function") return;
    try {
      const list = getModuls();
      let anySynced = false;

      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        if (!m || m.cloud_file_id || m.storage_path) continue;

        if (m.idb_key) {
          const localBlob = await getFileFromIdb(m.idb_key);
          if (localBlob instanceof Blob) {
            window.showToast(`Menyinkronkan PDF "${m.title}" ke Cloud Supabase...`, "info");
            const cloudMeta = await window.dbUploadModulFile(localBlob, "application/pdf");
            if (cloudMeta) {
              list[i] = { ...m, ...cloudMeta };
              anySynced = true;
            }
          }
        } else if (
          Array.isArray(m.images) &&
          m.images.some((src) => typeof src === "string" && src.startsWith("data:"))
        ) {
          const cloudMeta = await window.dbUploadModulFile(JSON.stringify(m.images), "application/x-utb-images");
          if (cloudMeta) {
            list[i] = { ...m, ...cloudMeta };
            anySynced = true;
          }
        }
      }

      if (anySynced) {
        localStorage.setItem("utb_catalog_moduls", JSON.stringify(list));
        if (typeof window.dbSaveCatalogModuls === "function") {
          await window.dbSaveCatalogModuls(list);
        }
        renderAdminModulLists();
        window.showToast("File PDF modul berhasil disinkronkan ke semua pengguna!", "success");
      }
    } catch (err) {
      console.warn("Gagal sinkronisasi otomatis PDF lokal ke Cloud:", err);
    }
  }


  // ============================================================================
  // SINKRONISASI REALTIME SUPABASE (study_programs, courses, moduls)
  // ============================================================================
  function initModulRealtimeSync() {
    if (!window.supabaseClient || typeof window.supabaseClient.channel !== "function") return;

    try {
      const channel = window.supabaseClient.channel("utb_soal_modul_realtime_channel");

      channel
        .on("postgres_changes", { event: "*", schema: "public", table: "study_programs" }, async () => {
          console.log("Supabase Realtime: study_programs berubah");
          await syncCatalogFromSupabase(true);
          if (currentModulStep === 1) renderProdiStep();
          renderAdminModulLists();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, async () => {
          console.log("Supabase Realtime: courses berubah");
          await syncCatalogFromSupabase(true);
          if (currentModulStep === 2 && selectedProdi) renderCourseStep(selectedProdi);
          renderAdminModulLists();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "moduls" }, async (payload) => {
          console.log("Supabase Realtime: moduls berubah", payload);
          await syncCatalogFromSupabase(true);
          renderAdminModulLists();
          if (currentModulStep === 3 && selectedCourse) {
            const allModuls = getModuls();
            const courseModuls = allModuls.filter((m) => m.course_id === selectedCourse.id);
            const targetModul = (payload.new && courseModuls.find((m) => m.id === payload.new.id)) ||
              (activeModul && courseModuls.find((m) => m.id === activeModul.id)) ||
              courseModuls[0];
            if (targetModul) {
              await openCourseReader(selectedCourse, targetModul.id);
            }
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Supabase Realtime: Terhubung ke channel soal modul.");
          }
        });
    } catch (err) {
      console.warn("Realtime subscription soal modul warning:", err);
    }

    // Dengarkan event storage untuk sinkronisasi antar-tab dalam browser yang sama
    window.addEventListener("storage", (e) => {
      if (e.key && e.key.startsWith("utb_catalog_")) {
        renderAdminModulLists();
        if (currentModulStep === 1) renderProdiStep();
        else if (currentModulStep === 2 && selectedProdi) renderCourseStep(selectedProdi);
        else if (currentModulStep === 3 && selectedCourse) {
          const allModuls = getModuls();
          const courseModuls = allModuls.filter((m) => m.course_id === selectedCourse.id);
          const stillExists = activeModul && courseModuls.some((m) => m.id === activeModul.id);
          openCourseReader(selectedCourse, stillExists ? activeModul.id : null);
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    currentUser = await window.requireAuth();
    if (!currentUser) return;

    if (typeof window.dbEnsureSystemStoreAccessible === 'function') await window.dbEnsureSystemStoreAccessible();
    await syncCatalogFromSupabase(false);
    initModulRealtimeSync();

    isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
    const adminPanel = document.getElementById("admin-modul-manager");

    if (isAdmin) {
      if (adminPanel) adminPanel.style.display = "block";
      initAdminModulController();
      // Sinkronkan otomatis bila ada PDF yang sebelumnya hanya tersimpan di browser Admin
      syncPendingAdminFilesToCloud();
    } else {
      if (adminPanel) adminPanel.remove();
    }

    setupReaderNavigation();
    setStep(1);
    renderProdiStep();

    // Auto-sinkronisasi ketika tab di HP / perangkat lain dibuka kembali
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") syncCatalogFromSupabase(true);
    });
    window.addEventListener("focus", () => syncCatalogFromSupabase(true));
  });

  // ============================================================================
  // STEPPER TAHAPAN (1. Prodi -> 2. Mata Kuliah -> 3. Baca Soal Modul)
  // ============================================================================
  function setStep(stepNum) {
    currentModulStep = stepNum;
    document.querySelectorAll("[data-mstep]").forEach((el) => {
      const n = Number(el.dataset.mstep);
      const numEl = el.querySelector(".step-number");
      if (numEl) numEl.textContent = n; // Selalu nomor, tanpa tanda ceklis

      if (n === stepNum) {
        el.classList.add("active");
        el.classList.remove("completed");
      } else if (n < stepNum) {
        el.classList.add("completed");
        el.classList.remove("active");
      } else {
        el.classList.remove("active", "completed");
      }
    });

    // Update Mobile Status Bar & Progress Track
    const progressFill = document.getElementById("modul-progress-fill");
    if (progressFill) progressFill.style.width = `${(stepNum / 3) * 100}%`;
    const mobileBadge = document.getElementById("modul-mobile-badge");
    if (mobileBadge) mobileBadge.textContent = `Tahap ${stepNum} dari 3`;
    const stepLabels = ["Pilih Program Studi", "Pilih Mata Kuliah", "Baca Soal Modul"];
    const mobileTitle = document.getElementById("modul-mobile-title");
    if (mobileTitle) mobileTitle.textContent = stepLabels[stepNum - 1] || "";

    const activeItem = document.querySelector(`[data-mstep="${stepNum}"]`);
    activeItem?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

    const s1 = document.getElementById("step-modul-prodi");
    const s2 = document.getElementById("step-modul-course");
    const s3 = document.getElementById("step-modul-reader");

    if (s1) s1.style.display = stepNum === 1 ? "block" : "none";
    if (s2) s2.style.display = stepNum === 2 ? "block" : "none";
    if (s3) s3.style.display = stepNum === 3 ? "block" : "none";

    const trackEl = document.querySelector(".comic-progress-track");
    const badgeEl = document.getElementById("comic-progress-badge");
    if (trackEl && stepNum !== 3) {
      trackEl.style.opacity = "0";
      if (badgeEl) badgeEl.classList.remove("visible");
      if (badgeHideTimer) clearTimeout(badgeHideTimer);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (stepNum === 3) {
      setTimeout(updateComicScrollProgress, 100);
    }
  }

  // TAHAP 1: PILIH PROGRAM STUDI
  function renderProdiStep() {
    const grid = document.getElementById("modul-prodi-grid");
    if (!grid) return;
    const prodis = getProdis();
    const courses = getCourses();

    grid.innerHTML = prodis
      .map((p) => {
        const cCount = courses.filter((c) => c.study_program_id === p.id).length;
        return `
          <div class="selection-card" data-prodi-id="${p.id}">
            <div>
              <div class="selection-card-header">
                <div class="selection-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <span class="badge badge-primary">${window.escapeHtml(p.code)}</span>
              </div>
              <h3 class="selection-title">${window.escapeHtml(p.name)}</h3>
              <p class="selection-desc">${window.escapeHtml(p.description || "Program studi digital.")}</p>
            </div>
            <div class="selection-meta">
              <span>${cCount} Mata Kuliah Tersedia</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `;
      })
      .join("");

    grid.querySelectorAll(".selection-card").forEach((card) => {
      card.addEventListener("click", () => {
        const found = prodis.find((p) => p.id === card.dataset.prodiId);
        if (found) {
          selectedProdi = found;
          renderCourseStep(found);
        }
      });
    });
  }

  // TAHAP 2: PILIH MATA KULIAH
  async function renderCourseStep(prodi) {
    setStep(2);
    const heading = document.getElementById("modul-course-heading");
    if (heading) {
      // Cegah duplikasi kode prodi jika prodi.name sudah mengandung "(SI)" atau kode lainnya
      const hasCodeInName = prodi.name && prodi.code && prodi.name.includes(`(${prodi.code})`);
      const prodiLabel = hasCodeInName ? prodi.name : `${prodi.name}${prodi.code ? ` (${prodi.code})` : ""}`;
      heading.textContent = `Pilih Mata Kuliah — ${prodiLabel}`;
    }

    const grid = document.getElementById("modul-course-grid");
    if (!grid) return;

    // Ambil data mata kuliah & modul terupdate dari Supabase
    try {
      await Promise.all([
        typeof window.dbGetCatalogCourses === "function" ? window.dbGetCatalogCourses() : Promise.resolve(),
        typeof window.dbGetCatalogModuls === "function" ? window.dbGetCatalogModuls() : Promise.resolve(),
      ]);
    } catch (_) {}

    const allCourses = getCourses();
    const courses = allCourses.filter((c) => c.study_program_id === prodi.id);
    const moduls = getModuls();

    if (courses.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">Belum ada mata kuliah yang terdaftar untuk program studi ini.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = courses
      .map((c) => {
        const mCount = moduls.filter((m) => m.course_id === c.id).length;
        return `
          <div class="selection-card" data-course-id="${c.id}">
            <div>
              <div class="selection-card-header">
                <div class="selection-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <span class="badge badge-primary">${window.escapeHtml(c.code)}</span>
              </div>
              <h3 class="selection-title">${window.escapeHtml(c.name)}</h3>
              <p class="selection-desc">${window.escapeHtml(c.description || "Mata kuliah program sarjana.")}</p>
            </div>
            <div class="selection-meta">
              <span>${mCount > 0 ? `${mCount} Modul Scan PDF Siap Baca` : "Tersedia Modul"}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `;
      })
      .join("");

    grid.querySelectorAll(".selection-card").forEach((card) => {
      card.addEventListener("click", () => {
        const found = courses.find((c) => c.id === card.dataset.courseId);
        if (found) {
          selectedCourse = found;
          openCourseReader(found);
        }
      });
    });
  }

  // TAHAP 3: BUKA PEMBACA WEB KOMIK SOAL MODUL
  async function openCourseReader(course, preferredModulId = null) {
    setStep(3);
    const titleEl = document.getElementById("modul-reader-course-title");
    if (titleEl) titleEl.textContent = `${course.code} — ${course.name}`;

    if (typeof window.dbGetCatalogModuls === "function") {
      try {
        await window.dbGetCatalogModuls();
      } catch (_) {}
    }

    const allModuls = getModuls();
    let courseModuls = allModuls.filter((m) => {
      if (!m) return false;
      if (m.course_id === course.id) return true;
      if (course.code && m.course_code && m.course_code.toUpperCase() === course.code.toUpperCase()) return true;
      if (course.code && m.edition && m.edition.toUpperCase().includes(course.code.toUpperCase())) return true;
      if (course.code && m.title && m.title.toUpperCase().includes(course.code.toUpperCase())) return true;
      return false;
    });

    // Fallback jika belum ada modul pada mata kuliah ini
    if (courseModuls.length === 0) {
      courseModuls = [
        {
          id: "mod-empty-" + course.id,
          course_id: course.id,
          title: `Modul 01: ${course.name}`,
          edition: `${course.code} | Modul 01`,
          images: [],
          page_count: 0,
        },
      ];
    }

    const initialTarget =
      (preferredModulId && courseModuls.find((m) => m.id === preferredModulId)) || courseModuls[0];

    const pillsContainer = document.getElementById("modul-pills-container");
    if (pillsContainer) {
      pillsContainer.innerHTML = courseModuls
        .map(
          (m) => `
          <button type="button" class="modul-pill-btn ${m.id === initialTarget.id ? "active" : ""}" data-mid="${m.id}">
            <span>📘 ${window.escapeHtml(m.title)}</span>
          </button>
        `
        )
        .join("");

      pillsContainer.querySelectorAll(".modul-pill-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          pillsContainer.querySelectorAll(".modul-pill-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const target = courseModuls.find((item) => item.id === btn.dataset.mid);
          if (target) loadActiveModul(target);
        });
      });
    }

    loadActiveModul(initialTarget);
  }

  // ============================================================================
  // LOAD MODUL DAN RENDER HALAMAN SEPERTI WEB BACA KOMIK SCROLL KE BAWAH
  // ============================================================================
  async function loadActiveModul(modul) {
    activeModul = modul;
    currentComicZoom = 1.0;

    const badgeEl = document.getElementById("reader-badge-edition");
    const titleEl = document.getElementById("reader-active-title");
    const counterEl = document.getElementById("comic-panel-counter");
    const zoomText = document.getElementById("comic-zoom-label");

    if (badgeEl) badgeEl.textContent = modul.edition || "MODUL 01";
    if (titleEl) titleEl.textContent = modul.title;
    if (zoomText) zoomText.textContent = "100%";

    // Perbarui visibilitas tombol aksi admin pada bar pembaca modul
    updateAdminReaderActions();

    await renderComicVerticalPages(modul);
    updateComicScrollProgress();
  }

  function updateAdminReaderActions() {
    const uploadBtn = document.getElementById("btn-admin-reader-upload");
    const deleteBtn = document.getElementById("btn-admin-reader-delete");

    if (uploadBtn) {
      uploadBtn.style.display = isAdmin ? "inline-flex" : "none";
    }

    if (deleteBtn) {
      // Tombol hapus hanya muncul untuk admin jika modul aktif adalah modul valid (bukan placeholder kosong)
      const isValidModul = activeModul && !String(activeModul.id || "").startsWith("mod-empty-");
      deleteBtn.style.display = isAdmin && isValidModul ? "inline-flex" : "none";
    }
  }

  async function renderComicVerticalPages(modul) {
    const streamEl = document.getElementById("comic-vertical-stream");
    const counterEl = document.getElementById("comic-panel-counter");
    if (!streamEl || !modul) return;

    streamEl.innerHTML = `
      <div style="color: #94A3B8; text-align: center; padding: 2.5rem 1rem; font-weight: 600;">
        ⏳ Menyiapkan halaman scan modul...
      </div>
    `;

    // KASUS 1: MODUL MEMILIKI DAFTAR GAMBAR SCAN ASLI (LOKAL ATAU CLOUD SUPABASE)
    let resolvedImages = Array.isArray(modul.images) && modul.images.length > 0 ? modul.images : null;
    if (!resolvedImages && modul.cloud_file_id && modul.cloud_mime === "application/x-utb-images") {
      const imgCacheKey = "cloud_img_" + modul.cloud_file_id;
      const cachedImgs = await getFileFromIdb(imgCacheKey);
      if (Array.isArray(cachedImgs) && cachedImgs.length > 0) {
        resolvedImages = cachedImgs;
      } else if (typeof window.dbDownloadModulFile === "function") {
        streamEl.innerHTML = `
          <div id="cloud-dl-status" style="color: #94A3B8; text-align: center; padding: 2.5rem 1rem; font-weight: 600;">
            ☁️ Mengunduh halaman scan modul dari Cloud Supabase (0%)...
          </div>
        `;
        const cloudRes = await window.dbDownloadModulFile(
          modul.cloud_file_id,
          modul.cloud_chunks,
          modul.cloud_mime,
          (pct) => {
            const st = document.getElementById("cloud-dl-status");
            if (st) st.textContent = `☁️ Mengunduh halaman scan modul dari Cloud Supabase (${pct}%)...`;
          }
        );
        if (cloudRes && Array.isArray(cloudRes.images) && cloudRes.images.length > 0) {
          resolvedImages = cloudRes.images;
          await saveFileToIdb(imgCacheKey, resolvedImages);
        }
      }
    }

    if (Array.isArray(resolvedImages) && resolvedImages.length > 0) {
      const total = resolvedImages.length;
      if (counterEl) counterEl.textContent = `${total} Halaman (Scan JPG)`;

      streamEl.innerHTML = resolvedImages
        .map(
          (imgSrc, idx) => `
        <div class="comic-page-frame" style="max-width: ${Math.round(820 * currentComicZoom)}px;">
          <img src="${imgSrc}" alt="${idx + 1}/${total}" loading="lazy">
          <span class="comic-page-number-pill">${idx + 1}/${total}</span>
        </div>
      `
        )
        .join("");
      return;
    }

        // KASUS 2: MODUL MEMILIKI FILE PDF (INDEXEDDB LOKAL, CLOUD SUPABASE, ATAU FILE BAWAAN)
    let pdfData = null;
    let fallbackBlob = null;

    // A. Periksa in-memory cache terlebih dahulu (instan tanpa lag setelah upload)
    if (inMemoryPdfCache.has(modul.id)) {
      const mem = inMemoryPdfCache.get(modul.id);
      if (mem instanceof Blob) {
        fallbackBlob = mem;
        pdfData = await mem.arrayBuffer();
      } else if (mem instanceof ArrayBuffer) {
        pdfData = mem;
      }
    } else if (modul.idb_key && inMemoryPdfCache.has(modul.idb_key)) {
      const mem = inMemoryPdfCache.get(modul.idb_key);
      if (mem instanceof Blob) {
        fallbackBlob = mem;
        pdfData = await mem.arrayBuffer();
      } else if (mem instanceof ArrayBuffer) {
        pdfData = mem;
      }
    }

    // B. Periksa IndexedDB
    if (!pdfData) {
      const cacheKey = "modul_pdf_" + (modul.id || modul.storage_path || modul.cloud_file_id || "default");
      const idbKeys = [
        modul.idb_key,
        cacheKey,
        "modul_pdf_" + (modul.id || ""),
        modul.cloud_file_id ? "cloud_pdf_" + modul.cloud_file_id : null,
        modul.storage_path ? "cloud_pdf_" + modul.storage_path : null,
      ].filter(Boolean);

      for (const k of idbKeys) {
        const stored = await getFileFromIdb(k);
        if (stored instanceof Blob) {
          fallbackBlob = stored;
          pdfData = await stored.arrayBuffer();
          inMemoryPdfCache.set(modul.id, pdfData);
          break;
        } else if (stored instanceof ArrayBuffer) {
          pdfData = stored;
          inMemoryPdfCache.set(modul.id, pdfData);
          break;
        }
      }
    }

    // C. Jika file PDF bersumber dari URL (Supabase Storage atau URL Eksternal)
    const effectivePdfUrl = modul.pdf_file_url || modul.pdf_external_url;
    if (!pdfData && effectivePdfUrl) {
      const isRemote = String(effectivePdfUrl).startsWith("http");
      if (isRemote) {
        streamEl.innerHTML = `
          <div id="cloud-dl-status" style="color: #94A3B8; text-align: center; padding: 2.5rem 1rem; font-weight: 600;">
            ☁️ Mengunduh file PDF modul dari Cloud Supabase...
          </div>
        `;
        try {
          const res = await fetch(effectivePdfUrl);
          if (res.ok) {
            const blob = await res.blob();
            fallbackBlob = blob;
            pdfData = await blob.arrayBuffer();
            inMemoryPdfCache.set(modul.id, pdfData);
            await saveFileToIdb("modul_pdf_" + (modul.id || "default"), blob);
          }
        } catch (fetchErr) {
          console.warn("Fetch langsung URL PDF gagal, mencoba Supabase Storage SDK:", fetchErr);
        }

        // Fallback SDK: Unduh langsung lewat Supabase Storage jika fetch publik ditolak / bucket ber-RLS
        if (!pdfData && modul.storage_path && window.supabaseClient && window.supabaseClient.storage) {
          try {
            const { data: sdkBlob, error: sdkErr } = await window.supabaseClient.storage
              .from("modul-pdfs")
              .download(modul.storage_path);
            if (!sdkErr && sdkBlob) {
              fallbackBlob = sdkBlob;
              pdfData = await sdkBlob.arrayBuffer();
              inMemoryPdfCache.set(modul.id, pdfData);
              await saveFileToIdb("modul_pdf_" + (modul.id || "default"), sdkBlob);
            }
          } catch (sdkErr) {
            console.warn("Supabase Storage SDK download error:", sdkErr);
          }
        }
      } else {
        try {
          const res = await fetch(effectivePdfUrl);
          if (res.ok) {
            const blob = await res.blob();
            fallbackBlob = blob;
            pdfData = await blob.arrayBuffer();
            inMemoryPdfCache.set(modul.id, pdfData);
          }
        } catch (_) {}
      }
    }

    // D. Jika file PDF tersimpan di Cloud Supabase Chunked Store (_P_...)
    if (!pdfData && modul.cloud_file_id && modul.cloud_mime !== "application/x-utb-images") {
      const pdfCacheKey = "cloud_pdf_" + modul.cloud_file_id;
      const cachedBlob = await getFileFromIdb(pdfCacheKey);
      if (cachedBlob instanceof Blob) {
        fallbackBlob = cachedBlob;
        pdfData = await cachedBlob.arrayBuffer();
        inMemoryPdfCache.set(modul.id, pdfData);
      } else if (typeof window.dbDownloadModulFile === "function") {
        streamEl.innerHTML = `
          <div id="cloud-dl-status" style="color: #94A3B8; text-align: center; padding: 2.5rem 1rem; font-weight: 600;">
            ☁️ Mengunduh file PDF modul dari Cloud Supabase (0%)...
          </div>
        `;
        const cloudRes = await window.dbDownloadModulFile(
          modul.cloud_file_id,
          modul.cloud_chunks,
          modul.cloud_mime || "application/pdf",
          (pct) => {
            const st = document.getElementById("cloud-dl-status");
            if (st) st.textContent = `☁️ Mengunduh file PDF modul dari Cloud Supabase (${pct}%)...`;
          }
        );
        if (cloudRes && cloudRes.blob instanceof Blob) {
          fallbackBlob = cloudRes.blob;
          await saveFileToIdb(pdfCacheKey, cloudRes.blob);
          await saveFileToIdb("modul_pdf_" + (modul.id || "default"), cloudRes.blob);
          pdfData = await cloudRes.blob.arrayBuffer();
          inMemoryPdfCache.set(modul.id, pdfData);
        }
      }
    }

    if (!pdfData && modul.pdf_data_url) {
      pdfData = modul.pdf_data_url;
    }
    if (!pdfData && effectivePdfUrl) {
      pdfData = effectivePdfUrl;
    }

    // Render halaman menggunakan PDF.js
    if (pdfData && window.pdfjsLib) {
      if (!window.pdfjsLib.GlobalWorkerOptions?.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      try {
        let docParam;
        if (pdfData instanceof ArrayBuffer || (pdfData && pdfData.buffer instanceof ArrayBuffer)) {
          const rawBuffer = pdfData instanceof ArrayBuffer ? pdfData : pdfData.buffer;
          docParam = {
            data: new Uint8Array(rawBuffer),
            cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
            cMapPacked: true,
          };
        } else if (typeof pdfData === "string" && pdfData.startsWith("data:")) {
          const b = base64ToBlobSafe(pdfData.split(",")[1] || "");
          const ab = await b.arrayBuffer();
          docParam = {
            data: new Uint8Array(ab),
            cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
            cMapPacked: true,
          };
        } else {
          docParam = {
            url: pdfData,
            cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
            cMapPacked: true,
          };
        }

        const loadingTask = window.pdfjsLib.getDocument(docParam);
        const pdfDoc = await loadingTask.promise;
        const total = pdfDoc.numPages;
        if (counterEl) counterEl.textContent = `${total} Halaman (PDF Scan)`;

        streamEl.innerHTML = "";

        for (let p = 1; p <= total; p++) {
          const frame = document.createElement("div");
          frame.className = "comic-page-frame";
          frame.style.maxWidth = `${Math.round(820 * currentComicZoom)}px`;

          const canvas = document.createElement("canvas");
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          frame.appendChild(canvas);

          const pill = document.createElement("span");
          pill.className = "comic-page-number-pill";
          pill.textContent = `${p}/${total}`;
          frame.appendChild(pill);

          streamEl.appendChild(frame);

          try {
            const page = await pdfDoc.getPage(p);
            const unscaledViewport = page.getViewport({ scale: 1 });
            const targetW = Math.min(820, window.innerWidth - 32);
            const dpr = Math.min(window.devicePixelRatio || 1.5, 2);
            const fitScale = (targetW / unscaledViewport.width) * dpr;
            const viewport = page.getViewport({ scale: fitScale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
              canvasContext: canvas.getContext("2d"),
              viewport,
            }).promise;
          } catch (pageErr) {
            console.warn(`Gagal merender halaman PDF ke-${p}:`, pageErr);
          }
        }
        return;
      } catch (err) {
        console.warn("Gagal merender PDF via pdfjs, mencoba tampilan langsung browser:", err);
      }
    }

    // Fallback: Tampilkan viewer PDF langsung browser via Object URL jika PDF.js gagal atau terhambat
    if (pdfData || fallbackBlob) {
      try {
        const finalBlob = fallbackBlob || (pdfData instanceof ArrayBuffer ? new Blob([pdfData], { type: "application/pdf" }) : null);
        if (finalBlob) {
          const blobUrl = URL.createObjectURL(finalBlob);
          if (counterEl) counterEl.textContent = "Dokumen PDF Siap";
          streamEl.innerHTML = `
            <div style="width: 100%; max-width: 900px; margin: 0 auto; padding: 1rem 0;">
              <iframe src="${blobUrl}#toolbar=1" style="width: 100%; height: 85vh; border: 1.5px solid var(--border); border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);" title="${window.escapeHtml(modul.title)}"></iframe>
            </div>
          `;
          return;
        }
      } catch (_) {}
    }

    // KASUS 3: BELUM ADA FILE SCAN PADA MODUL INI
    if (counterEl) counterEl.textContent = "0 Halaman";
    streamEl.innerHTML = `
      <div style="background: #1E293B; color: #E2E8F0; padding: 2.5rem 1.5rem; border-radius: 12px; text-align: center; max-width: 600px; margin: 2rem auto;">
        <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">📄</div>
        <h3 style="color: #FFFFFF; font-size: 1.15rem; margin-bottom: 0.4rem;">Belum Ada File Scan Modul</h3>
        <p style="color: #94A3B8; font-size: 0.88rem; line-height: 1.6;">
          Modul ini belum memiliki lampiran file PDF/gambar hasil scan CamScanner.
          ${isAdmin ? 'Anda dapat mengunggah file PDF melalui panel <strong>"Manajemen Soal Modul"</strong> di atas.' : 'Admin belum mengunggah file modul untuk mata kuliah ini.'}
        </p>
      </div>
    `;
  }

  // ============================================================================
  // UPDATE ZOOM HALAMAN KOMIK (➖, 100%, ➕, Reset)
  // ============================================================================
  function applyComicZoom(newZoom) {
    currentComicZoom = Math.min(2.0, Math.max(0.6, +newZoom.toFixed(2)));
    const zoomText = document.getElementById("comic-zoom-label");
    if (zoomText) zoomText.textContent = `${Math.round(currentComicZoom * 100)}%`;

    const targetWidth = Math.round(820 * currentComicZoom);
    document.querySelectorAll(".comic-page-frame").forEach((frame) => {
      frame.style.maxWidth = `${targetWidth}px`;
    });
    updateComicScrollProgress();
  }

  // ============================================================================
  // PROGRESS BAR SCROLL PEMBACA KOMIK (VERTIKAL DI KANAN KE BAWAH)
  // ============================================================================
  let badgeHideTimer = null;

  function updateComicScrollProgress() {
    const fillEl = document.getElementById("comic-progress-fill");
    const trackEl = document.querySelector(".comic-progress-track");
    const badgeEl = document.getElementById("comic-progress-badge");
    const wrapperEl = document.getElementById("comic-reader-wrapper");
    if (!fillEl || !wrapperEl) return;

    // Pastikan tahap baca modul sedang aktif
    const readerStep = document.getElementById("step-modul-reader");
    if (readerStep && readerStep.style.display === "none") {
      if (trackEl) trackEl.style.opacity = "0";
      if (badgeEl) badgeEl.classList.remove("visible");
      if (badgeHideTimer) clearTimeout(badgeHideTimer);
      return;
    }

    const rect = wrapperEl.getBoundingClientRect();
    const viewH = window.innerHeight || document.documentElement.clientHeight;
    const docScrollH = document.documentElement.scrollHeight || document.body.scrollHeight;
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

    // Deteksi mentok ke bawah (ujung akhir modul atau sudah mencapai footer)
    const isAtPageBottom = (viewH + scrollY) >= (docScrollH - 20);
    const isReaderBottomReached = rect.bottom <= (viewH + 40);

    // Tampilkan progress bar saat modul sedang dibaca atau saat mentok di footer
    const inView = rect.top < viewH && (rect.bottom > 20 || isAtPageBottom);
    if (trackEl) {
      trackEl.style.opacity = inView ? "1" : "0";
    }

    // Kalkulasi persentase pembacaan modul
    let pct = 0;
    if (isAtPageBottom || isReaderBottomReached) {
      // Pastikan selalu 100% saat mentok ke bawah meskipun ada elemen footer
      pct = 100;
    } else {
      const maxScrollable = Math.max(1, rect.height - viewH);
      const scrolled = Math.max(0, -rect.top);
      pct = Math.min(100, Math.max(0, Math.round((scrolled / maxScrollable) * 100)));
    }

    fillEl.style.height = `${pct}%`;
    if (badgeEl) {
      badgeEl.textContent = `${pct}%`;
      badgeEl.style.top = `clamp(14px, calc(${pct}vh - 12px), calc(100vh - 34px))`;

      if (inView && pct > 0) {
        // Tampilkan saat ada gerakan scroll
        badgeEl.classList.add("visible");
        if (badgeHideTimer) clearTimeout(badgeHideTimer);
        // Otomatis hilang setelah 0.5 detik (500 ms) jika tidak ada gerakan scroll
        badgeHideTimer = setTimeout(() => {
          badgeEl.classList.remove("visible");
        }, 500);
      } else {
        badgeEl.classList.remove("visible");
        if (badgeHideTimer) clearTimeout(badgeHideTimer);
      }
    }
  }

  window.addEventListener("scroll", updateComicScrollProgress, { passive: true });
  window.addEventListener("resize", updateComicScrollProgress, { passive: true });

  // ============================================================================
  // UNDUH FILE PDF ASLI
  // ============================================================================
  async function downloadActivePdf() {
    if (!activeModul) return;
    const safeName =
      (activeModul.title || "Soal-Modul-UTBelajar")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "") + ".pdf";

    // 1. Cek cache IndexedDB terlebih dahulu (lokal / hasil unduh sebelumnya)
    const cacheKeys = [
      activeModul.idb_key,
      "modul_pdf_" + (activeModul.id || ""),
      "cloud_pdf_" + (activeModul.id || ""),
      "cloud_pdf_" + (activeModul.storage_path || ""),
      "cloud_pdf_" + (activeModul.cloud_file_id || ""),
    ].filter(Boolean);

    for (const key of cacheKeys) {
      const stored = await getFileFromIdb(key);
      if (stored instanceof Blob) {
        triggerDownload(stored, safeName);
        window.showToast(`Mengunduh file PDF "${safeName}"...`, "success");
        return;
      }
    }

    // 2. Jika ada URL file PDF (Supabase Storage publik atau assets lokal)
    if (activeModul.pdf_file_url) {
      if (String(activeModul.pdf_file_url).startsWith("http")) {
        try {
          window.showToast(`Mengunduh file PDF "${safeName}" dari Cloud...`, "info");
          const res = await fetch(activeModul.pdf_file_url);
          if (res.ok) {
            const blob = await res.blob();
            await saveFileToIdb("modul_pdf_" + (activeModul.id || "default"), blob);
            triggerDownload(blob, safeName);
            window.showToast(`File PDF "${safeName}" berhasil diunduh!`, "success");
            return;
          }
        } catch (_) {}
      }
      const a = document.createElement("a");
      a.href = activeModul.pdf_file_url;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.showToast(`Mengunduh file PDF "${safeName}"...`, "success");
      return;
    }

    // 3. Jika file PDF berasal dari Cloud Supabase Chunked Store
    if (activeModul.cloud_file_id && activeModul.cloud_mime !== "application/x-utb-images") {
      const cacheKey = "cloud_pdf_" + activeModul.cloud_file_id;
      if (typeof window.dbDownloadModulFile === "function") {
        window.showToast("Mengambil file PDF dari Cloud Supabase...", "info");
        const cloudRes = await window.dbDownloadModulFile(
          activeModul.cloud_file_id,
          activeModul.cloud_chunks,
          activeModul.cloud_mime || "application/pdf"
        );
        if (cloudRes && cloudRes.blob instanceof Blob) {
          await saveFileToIdb(cacheKey, cloudRes.blob);
          await saveFileToIdb("modul_pdf_" + (activeModul.id || "default"), cloudRes.blob);
          triggerDownload(cloudRes.blob, safeName);
          window.showToast(`File PDF "${safeName}" berhasil diunduh!`, "success");
          return;
        }
      }
    }

    // 4. Jika ada data URL PDF
    if (activeModul.pdf_data_url) {
      triggerDownload(activeModul.pdf_data_url, safeName);
      return;
    }

    // 4. Jika ada link URL eksternal
    if (activeModul.pdf_external_url) {
      window.open(activeModul.pdf_external_url, "_blank");
      window.showToast("Membuka tautan PDF eksternal...", "info");
      return;
    }

    window.showToast("File PDF tidak ditemukan.", "warning");
  }

  function triggerDownload(blobOrHref, filename) {
    const isBlob = blobOrHref instanceof Blob;
    const url = isBlob ? URL.createObjectURL(blobOrHref) : blobOrHref;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (isBlob) {
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
    window.showToast(`Mengunduh "${filename}"...`, "success");
  }

  // ============================================================================
  // EVENT LISTENER NAVIGASI PEMBACA
  // ============================================================================
  function setupReaderNavigation() {
    document.getElementById("btn-modul-back-prodi")?.addEventListener("click", () => {
      setStep(1);
      renderProdiStep();
    });

    document.getElementById("btn-modul-back-course")?.addEventListener("click", () => {
      if (selectedProdi) renderCourseStep(selectedProdi);
      else setStep(1);
    });

    // Handler navigasi tahapan: HANYA BISA LANGSUNG KE KIRI, JIKA KE KANAN MUNCULKAN POPUP
    document.querySelectorAll(".latihan-stepper [data-mstep]").forEach((el) => {
      el.addEventListener("click", () => {
        const targetStep = Number(el.dataset.mstep);
        if (!targetStep || targetStep === currentModulStep) return;

        // 1. HANYA BISA LANGSUNG KE KIRI
        if (targetStep < currentModulStep) {
          if (targetStep === 1) {
            setStep(1);
            renderProdiStep();
          } else if (targetStep === 2) {
            setStep(2);
            if (selectedProdi) renderCourseStep(selectedProdi);
            else renderProdiStep();
          }
          return;
        }

        // 2. JIKA KLIK KE KANAN (MAJU): BLOKIR & MUNCULKAN POPUP PERINGATAN
        if (currentModulStep === 1) {
          window.showToast("Pilih program studi dahulu", "info");
        } else if (currentModulStep === 2) {
          window.showToast("Pilih mata kuliah dahulu", "info");
        }
      });
    });

    document.querySelector('[data-mstep="2"]')?.addEventListener("click", () => {
      if (selectedProdi) {
        renderCourseStep(selectedProdi);
      }
    });

    document.querySelector('[data-mstep="3"]')?.addEventListener("click", () => {
      if (selectedCourse) {
        openCourseReader(selectedCourse);
      }
    });

    // Kontrol Zoom
    document.getElementById("btn-comic-zoom-in")?.addEventListener("click", () => {
      applyComicZoom(currentComicZoom + 0.15);
    });

    document.getElementById("btn-comic-zoom-out")?.addEventListener("click", () => {
      applyComicZoom(currentComicZoom - 0.15);
    });

    document.getElementById("btn-comic-zoom-reset")?.addEventListener("click", () => {
      applyComicZoom(1.0);
    });

    // Tombol Scroll ke Atas
    document.getElementById("btn-comic-scroll-top")?.addEventListener("click", () => {
      document.getElementById("step-modul-reader")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Tombol Unduh PDF
    document.getElementById("btn-download-modul-pdf")?.addEventListener("click", downloadActivePdf);
    document.getElementById("btn-download-modul-pdf-bottom")?.addEventListener("click", downloadActivePdf);

    // Tombol Admin Quick Upload & Hapus Langsung di Layar Baca
    setupAdminReaderControls();
  }

  function setupAdminReaderControls() {
    const uploadBtn = document.getElementById("btn-admin-reader-upload");
    const deleteBtn = document.getElementById("btn-admin-reader-delete");
    const modalUpload = "modal-admin-quick-upload-modul";
    const formUpload = document.getElementById("form-quick-upload-modul");

    uploadBtn?.addEventListener("click", () => {
      if (!selectedCourse) {
        window.showToast("Mata kuliah belum dipilih.", "warning");
        return;
      }
      const courseNameInput = document.getElementById("quick-upload-course-name");
      const courseIdInput = document.getElementById("quick-upload-course-id");
      const titleInput = document.getElementById("quick-upload-title");
      const editionInput = document.getElementById("quick-upload-edition");
      const fileInput = document.getElementById("quick-upload-file");
      const urlInput = document.getElementById("quick-upload-url");

      if (courseNameInput) courseNameInput.value = `${selectedCourse.code} - ${selectedCourse.name}`;
      if (courseIdInput) courseIdInput.value = selectedCourse.id;

      // Hitung urutan modul berikutnya secara otomatis
      const existingModuls = getModuls().filter((m) => m.course_id === selectedCourse.id);
      const nextNum = existingModuls.length + 1;
      const numStr = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;

      if (titleInput) titleInput.value = `Modul ${numStr}: ${selectedCourse.name}`;
      if (editionInput) editionInput.value = `Modul ${numStr}`;
      if (fileInput) fileInput.value = "";
      if (urlInput) urlInput.value = "";

      window.openModal(modalUpload);
    });

    document.getElementById("btn-close-quick-upload-modal-x")?.addEventListener("click", () => {
      window.closeModal(modalUpload);
    });

    document.getElementById("btn-cancel-quick-upload")?.addEventListener("click", () => {
      window.closeModal(modalUpload);
    });

    formUpload?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const course_id = document.getElementById("quick-upload-course-id")?.value;
      const title = document.getElementById("quick-upload-title")?.value.trim();
      const edition = document.getElementById("quick-upload-edition")?.value.trim() || "Modul 01";
      const fileInput = document.getElementById("quick-upload-file");
      const pdf_external_url = document.getElementById("quick-upload-url")?.value.trim() || "";
      const submitBtn = document.getElementById("btn-submit-quick-upload");

      const files = fileInput?.files || [];
      if (!course_id || !title) return;
      if (files.length === 0 && !pdf_external_url) {
        window.showToast("Silakan pilih file PDF/gambar atau isi tautan PDF.", "warning");
        return;
      }

      window.setButtonLoading(submitBtn, true, "Mengunggah & Memproses PDF...");

      try {
        const newId = "mod-" + Date.now();
        let idbKey = null;
        let uploadedImages = [];
        let cloudMeta = null;

        if (files.length > 0) {
          const firstFile = files[0];
          if (firstFile.type === "application/pdf" || firstFile.name.toLowerCase().endsWith(".pdf")) {
            idbKey = "modul_pdf_" + newId;
            await saveFileToIdb(idbKey, firstFile);
            if (typeof window.dbUploadModulFile === "function") {
              cloudMeta = await window.dbUploadModulFile(firstFile, "application/pdf", (pct) => {
                window.setButtonLoading(submitBtn, true, `Sinkron Cloud (${pct}%)...`);
              });
            }
          } else {
            for (let i = 0; i < files.length; i++) {
              const dataUrl = await new Promise((res) => {
                const r = new FileReader();
                r.onload = () => res(r.result);
                r.readAsDataURL(files[i]);
              });
              uploadedImages.push(dataUrl);
            }
            if (uploadedImages.length > 0 && typeof window.dbUploadModulFile === "function") {
              cloudMeta = await window.dbUploadModulFile(
                JSON.stringify(uploadedImages),
                "application/x-utb-images",
                (pct) => {
                  window.setButtonLoading(submitBtn, true, `Sinkron Cloud (${pct}%)...`);
                }
              );
            }
          }
        }

        const newModulObj = {
          id: newId,
          course_id,
          title,
          edition,
          pdf_external_url,
          idb_key: idbKey,
          images: uploadedImages,
          ...(cloudMeta || {}),
        };

        const list = getModuls();
        list.push(newModulObj);
        localStorage.setItem("utb_catalog_moduls", JSON.stringify(list));
        if (typeof window.dbSaveCatalogModuls === "function") {
          await window.dbSaveCatalogModuls(list);
        }

        window.closeModal(modalUpload);
        window.showToast(`File PDF "${title}" berhasil diunggah & disinkronkan ke semua pengguna!`, "success");

        // Perbarui daftar dan langsung buka modul baru yang diunggah
        renderAdminModulLists();
        if (selectedCourse && selectedCourse.id === course_id) {
          await openCourseReader(selectedCourse, newModulObj.id);
        }
      } catch (err) {
        console.error("Gagal mengunggah file:", err);
        window.showToast("Gagal memproses file PDF: " + err.message, "danger");
      } finally {
        window.setButtonLoading(submitBtn, false);
      }
    });

    deleteBtn?.addEventListener("click", async () => {
      if (!activeModul || String(activeModul.id || "").startsWith("mod-empty-")) {
        window.showToast("Tidak ada file modul yang dipilih untuk dihapus.", "warning");
        return;
      }

      const confirmed = typeof window.showConfirmDialog === "function"
        ? await window.showConfirmDialog({
            title: "Hapus File PDF Modul",
            message: `Apakah Anda yakin ingin menghapus file PDF/Modul <strong>"${window.escapeHtml(activeModul.title)}"</strong>? Data scan dan file PDF lokal akan dibersihkan secara permanen.`,
            confirmText: "Hapus File PDF",
          })
        : window.confirm(
            `Apakah Anda yakin ingin menghapus file PDF/Modul "${activeModul.title}"? Tindakan ini tidak dapat dibatalkan.`
          );
      if (!confirmed) return;

      if (activeModul.idb_key) {
        await deleteFileFromIdb(activeModul.idb_key);
      }
      if (activeModul.cloud_file_id || activeModul.storage_path) {
        if (activeModul.cloud_file_id) {
          await deleteFileFromIdb("cloud_pdf_" + activeModul.cloud_file_id);
          await deleteFileFromIdb("cloud_img_" + activeModul.cloud_file_id);
        }
        if (typeof window.dbDeleteModulFile === "function") {
          await window.dbDeleteModulFile(
            activeModul.cloud_file_id,
            activeModul.cloud_chunks,
            activeModul.storage_path
          );
        }
      }

      const updated = getModuls().filter((m) => m.id !== activeModul.id);
      localStorage.setItem("utb_catalog_moduls", JSON.stringify(updated));
      if (typeof window.dbSaveCatalogModuls === "function") {
        await window.dbSaveCatalogModuls(updated);
      }

      window.showToast(`Modul "${activeModul.title}" telah dihapus.`, "info");
      renderAdminModulLists();

      if (selectedCourse) {
        openCourseReader(selectedCourse);
      }
    });
  }

  // ============================================================================
  // PANEL MANAJEMEN KHUSUS ADMIN (TAMBAH, EDIT, UPLOAD PDF, HAPUS)
  // ============================================================================
  function initAdminModulController() {
    const switchTab = (tabName) => {
      document.querySelectorAll(".modul-admin-tab-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.tab === tabName);
      });
      ["prodi", "course", "modul"].forEach((t) => {
        const pane = document.getElementById(`madmin-tab-${t}`);
        if (pane) pane.style.display = t === tabName ? "block" : "none";
      });
      const bodyEl = document.getElementById("admin-modul-manager-body");
      if (bodyEl) bodyEl.style.display = "block";
    };

    document.querySelectorAll(".modul-admin-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    document.querySelectorAll(".btn-modul-admin-tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.mtab));
    });

    document.getElementById("btn-toggle-modul-admin-body")?.addEventListener("click", () => {
      const bodyEl = document.getElementById("admin-modul-manager-body");
      if (bodyEl) bodyEl.style.display = bodyEl.style.display === "none" ? "block" : "none";
    });

    // 1. Form Prodi
    const formProdi = document.getElementById("form-madmin-prodi");
    const cancelProdiBtn = document.getElementById("btn-cancel-m-prodi");
    cancelProdiBtn?.addEventListener("click", () => {
      formProdi?.reset();
      document.getElementById("m-prodi-edit-id").value = "";
      document.getElementById("btn-submit-m-prodi").textContent = "+ Simpan Prodi";
      cancelProdiBtn.style.display = "none";
    });

    formProdi?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = document.getElementById("m-prodi-edit-id")?.value;
      const code = document.getElementById("m-prodi-code")?.value.trim().toUpperCase();
      const name = document.getElementById("m-prodi-name")?.value.trim();
      const description = document.getElementById("m-prodi-desc")?.value.trim() || "Program studi digital.";
      if (!code || !name) return;

      const submitBtn = document.getElementById("btn-submit-m-prodi");
      window.setButtonLoading(submitBtn, true, "Menyimpan ke Supabase...");

      if (editId) {
        if (typeof window.dbUpdateProdi === "function") {
          await window.dbUpdateProdi(editId, { code, name, description });
        } else {
          const list = getProdis();
          const idx = list.findIndex((p) => p.id === editId);
          if (idx !== -1) list[idx] = { ...list[idx], code, name, description };
          localStorage.setItem("utb_catalog_prodis", JSON.stringify(list));
        }
        window.showToast(`Program Studi "${name}" berhasil diperbarui di Supabase!`, "success");
      } else {
        if (typeof window.dbInsertProdi === "function") {
          await window.dbInsertProdi({ code, name, description });
        } else {
          const list = getProdis();
          list.push({ id: "prodi-" + Date.now(), code, name, description });
          localStorage.setItem("utb_catalog_prodis", JSON.stringify(list));
        }
        window.showToast(`Program Studi "${name}" berhasil ditambahkan ke Supabase!`, "success");
      }

      window.setButtonLoading(submitBtn, false);
      cancelProdiBtn?.click();
      renderAdminModulLists();
      renderProdiStep();
    });

    // 2. Form Mata Kuliah
    const formCourse = document.getElementById("form-madmin-course");
    const cancelCourseBtn = document.getElementById("btn-cancel-m-course");
    cancelCourseBtn?.addEventListener("click", () => {
      formCourse?.reset();
      document.getElementById("m-course-edit-id").value = "";
      document.getElementById("btn-submit-m-course").textContent = "+ Simpan MK";
      cancelCourseBtn.style.display = "none";
    });

    formCourse?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = document.getElementById("m-course-edit-id")?.value;
      const study_program_id = document.getElementById("m-course-prodi")?.value;
      const code = document.getElementById("m-course-code")?.value.trim().toUpperCase();
      const name = document.getElementById("m-course-name")?.value.trim();
      const description = document.getElementById("m-course-desc")?.value.trim() || "Mata kuliah program sarjana.";
      if (!study_program_id || !code || !name) return;

      const submitBtn = document.getElementById("btn-submit-m-course");
      window.setButtonLoading(submitBtn, true, "Menyimpan ke Supabase...");

      if (editId) {
        if (typeof window.dbUpdateCourse === "function") {
          await window.dbUpdateCourse(editId, { study_program_id, code, name, description });
        } else {
          const list = getCourses();
          const idx = list.findIndex((c) => c.id === editId);
          if (idx !== -1) list[idx] = { ...list[idx], study_program_id, code, name, description };
          localStorage.setItem("utb_catalog_courses", JSON.stringify(list));
        }
        window.showToast(`Mata Kuliah "${name}" berhasil diperbarui di Supabase!`, "success");
      } else {
        if (typeof window.dbInsertCourse === "function") {
          await window.dbInsertCourse({ study_program_id, code, name, description });
        } else {
          const list = getCourses();
          list.push({ id: "course-" + Date.now(), study_program_id, code, name, description });
          localStorage.setItem("utb_catalog_courses", JSON.stringify(list));
        }
        window.showToast(`Mata Kuliah "${name}" berhasil ditambahkan ke Supabase!`, "success");
      }

      window.setButtonLoading(submitBtn, false);
      cancelCourseBtn?.click();
      renderAdminModulLists();
      renderProdiStep();
    });

    // 3. Form Upload & Kelola File PDF Modul
    const formModul = document.getElementById("form-madmin-modul");
    const cancelBookBtn = document.getElementById("btn-cancel-m-book");
    cancelBookBtn?.addEventListener("click", () => {
      formModul?.reset();
      document.getElementById("m-book-edit-id").value = "";
      document.getElementById("btn-submit-m-book").textContent = "+ Upload & Simpan Modul";
      cancelBookBtn.style.display = "none";
    });

    formModul?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = document.getElementById("m-book-edit-id")?.value;
      const course_id = document.getElementById("m-book-course")?.value;
      const title = document.getElementById("m-book-title")?.value.trim();
      const edition = document.getElementById("m-book-edition")?.value.trim() || "Modul 01";
      const pdf_external_url = document.getElementById("m-book-pdf-url")?.value.trim() || "";
      const fileInput = document.getElementById("m-book-pdf-file");
      const files = fileInput?.files || [];

      if (!course_id || !title) return;

      const submitBookBtn = document.getElementById("btn-submit-m-book");
      window.setButtonLoading(submitBookBtn, true, "Mengunggah & Menyimpan ke Cloud...");

      try {
        const newId = editId || "mod-" + Date.now();
        let idbKey = null;
        let uploadedImages = [];
        let cloudMeta = null;

        // Proses file yang diupload (PDF atau beberapa file gambar JPG/PNG)
        if (files.length > 0) {
          const firstFile = files[0];
          if (firstFile.type === "application/pdf" || firstFile.name.toLowerCase().endsWith(".pdf")) {
            // File PDF: Simpan di IndexedDB & unggah ke Cloud Supabase
            idbKey = "modul_pdf_" + newId;
            await saveFileToIdb(idbKey, firstFile);
            if (typeof window.dbUploadModulFile === "function") {
              cloudMeta = await window.dbUploadModulFile(firstFile, "application/pdf", (pct) => {
                window.setButtonLoading(submitBookBtn, true, `Sinkron Cloud (${pct}%)...`);
              });
            }
          } else {
            // File Gambar JPG / PNG: Baca sebagai data URL & unggah ke Cloud Supabase
            for (let i = 0; i < files.length; i++) {
              const dataUrl = await new Promise((res) => {
                const r = new FileReader();
                r.onload = () => res(r.result);
                r.readAsDataURL(files[i]);
              });
              uploadedImages.push(dataUrl);
            }
            if (uploadedImages.length > 0 && typeof window.dbUploadModulFile === "function") {
              cloudMeta = await window.dbUploadModulFile(
                JSON.stringify(uploadedImages),
                "application/x-utb-images",
                (pct) => {
                  window.setButtonLoading(submitBookBtn, true, `Sinkron Cloud (${pct}%)...`);
                }
              );
            }
          }
        }

        const list = getModuls();
        if (editId) {
          const idx = list.findIndex((m) => m.id === editId);
          if (idx !== -1) {
            if (cloudMeta && list[idx].cloud_file_id && typeof window.dbDeleteModulFile === "function") {
              await window.dbDeleteModulFile(list[idx].cloud_file_id, list[idx].cloud_chunks);
            }
            list[idx] = {
              ...list[idx],
              course_id,
              title,
              edition,
              pdf_external_url: pdf_external_url || list[idx].pdf_external_url || "",
              idb_key: idbKey || list[idx].idb_key || "",
              images: uploadedImages.length > 0 ? uploadedImages : list[idx].images || [],
              ...(cloudMeta || {}),
            };
          }
          window.showToast(`Modul "${title}" berhasil diperbarui di Cloud Supabase!`, "success");
        } else {
          list.push({
            id: newId,
            course_id,
            title,
            edition,
            pdf_external_url,
            idb_key: idbKey,
            images: uploadedImages,
            ...(cloudMeta || {}),
          });
          window.showToast(`Modul "${title}" berhasil diunggah & disinkronkan ke semua pengguna!`, "success");
        }

        localStorage.setItem("utb_catalog_moduls", JSON.stringify(list));
        if (typeof window.dbSaveCatalogModuls === "function") {
          await window.dbSaveCatalogModuls(list);
        }
        cancelBookBtn?.click();
        renderAdminModulLists();

        if (selectedCourse && selectedCourse.id === course_id) {
          await openCourseReader(selectedCourse, newId);
        }
      } catch (err) {
        console.error("Gagal mengunggah modul:", err);
        window.showToast("Gagal mengunggah file modul: " + err.message, "danger");
      } finally {
        window.setButtonLoading(submitBookBtn, false);
      }
    });

    renderAdminModulLists();
  }

  function renderAdminModulLists() {
    if (!isAdmin) return;
    const prodis = getProdis();
    const courses = getCourses();
    const moduls = getModuls();

    const setTxt = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    setTxt("madmin-count-prodi", prodis.length);
    setTxt("madmin-count-course", courses.length);
    setTxt("madmin-count-modul", moduls.length);

    const prodiSel = document.getElementById("m-course-prodi");
    if (prodiSel) {
      prodiSel.innerHTML = prodis
        .map((p) => `<option value="${p.id}">${window.escapeHtml(p.name)} (${window.escapeHtml(p.code)})</option>`)
        .join("");
    }

    const courseSel = document.getElementById("m-book-course");
    if (courseSel) {
      courseSel.innerHTML = courses
        .map((c) => `<option value="${c.id}">${window.escapeHtml(c.code)} — ${window.escapeHtml(c.name)}</option>`)
        .join("");
    }

    // List 1: Prodi
    const prodiListEl = document.getElementById("madmin-list-prodi");
    if (prodiListEl) {
      prodiListEl.innerHTML = prodis
        .map(
          (p) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.9rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: 10px; gap: 0.75rem;">
            <div>
              <span class="badge badge-primary" style="margin-right: 0.45rem;">${window.escapeHtml(p.code)}</span>
              <strong style="color: var(--primary-navy);">${window.escapeHtml(p.name)}</strong>
              <span style="font-size: 0.8rem; color: var(--text-secondary); margin-left: 0.45rem;">— ${window.escapeHtml(p.description || "")}</span>
            </div>
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="btn btn-secondary btn-sm btn-edit-mprodi" data-id="${p.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Ubah</button>
              <button type="button" class="btn btn-danger btn-sm btn-del-mprodi" data-id="${p.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Hapus</button>
            </div>
          </div>
        `
        )
        .join("");

      prodiListEl.querySelectorAll(".btn-edit-mprodi").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = prodis.find((p) => p.id === btn.dataset.id);
          if (!item) return;
          document.getElementById("m-prodi-edit-id").value = item.id;
          document.getElementById("m-prodi-code").value = item.code;
          document.getElementById("m-prodi-name").value = item.name;
          document.getElementById("m-prodi-desc").value = item.description || "";
          document.getElementById("btn-submit-m-prodi").textContent = "Simpan Perubahan";
          document.getElementById("btn-cancel-m-prodi").style.display = "inline-flex";
        });
      });

      prodiListEl.querySelectorAll(".btn-del-mprodi").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const prodiId = btn.dataset.id;
          const target = prodis.find((p) => p.id === prodiId);
          const pName = target ? target.name : "Program Studi";

          const confirmed = typeof window.showConfirmDialog === "function"
            ? await window.showConfirmDialog({
                title: "Hapus Program Studi",
                message: `Apakah Anda yakin ingin menghapus program studi <strong>"${window.escapeHtml(pName)}"</strong> dari database Supabase? Semua mata kuliah di dalamnya akan terhapus.`,
                confirmText: "Hapus Program Studi",
              })
            : window.confirm("Apakah Anda yakin ingin menghapus program studi ini dari database Supabase?");
          if (!confirmed) return;

          window.setButtonLoading(btn, true, "...");
          if (typeof window.dbDeleteProdi === "function") {
            await window.dbDeleteProdi(prodiId);
          } else {
            const updated = getProdis().filter((p) => p.id !== prodiId);
            localStorage.setItem("utb_catalog_prodis", JSON.stringify(updated));
          }
          window.showToast("Program studi berhasil dihapus dari Supabase.", "info");
          renderAdminModulLists();
          renderProdiStep();
        });
      });
    }

    // List 2: Course
    const courseListEl = document.getElementById("madmin-list-course");
    if (courseListEl) {
      courseListEl.innerHTML = courses
        .map((c) => {
          const pObj = prodis.find((p) => p.id === c.study_program_id);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.9rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: 10px; gap: 0.75rem;">
              <div>
                <span class="badge badge-primary" style="margin-right: 0.45rem;">${window.escapeHtml(c.code)}</span>
                <strong style="color: var(--primary-navy);">${window.escapeHtml(c.name)}</strong>
                <span style="font-size: 0.78rem; color: var(--text-secondary); margin-left: 0.45rem;">(Prodi: ${window.escapeHtml(pObj?.name || "-")})</span>
              </div>
              <div style="display: flex; gap: 0.4rem;">
                <button type="button" class="btn btn-secondary btn-sm btn-edit-mcourse" data-id="${c.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Ubah</button>
                <button type="button" class="btn btn-danger btn-sm btn-del-mcourse" data-id="${c.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Hapus</button>
              </div>
            </div>
          `;
        })
        .join("");

      courseListEl.querySelectorAll(".btn-edit-mcourse").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = courses.find((c) => c.id === btn.dataset.id);
          if (!item) return;
          document.getElementById("m-course-edit-id").value = item.id;
          document.getElementById("m-course-prodi").value = item.study_program_id;
          document.getElementById("m-course-code").value = item.code;
          document.getElementById("m-course-name").value = item.name;
          document.getElementById("m-course-desc").value = item.description || "";
          document.getElementById("btn-submit-m-course").textContent = "Simpan Perubahan";
          document.getElementById("btn-cancel-m-course").style.display = "inline-flex";
        });
      });

      courseListEl.querySelectorAll(".btn-del-mcourse").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const courseId = btn.dataset.id;
          const target = courses.find((c) => c.id === courseId);
          const cName = target ? target.name : "Mata Kuliah";
          const cCode = target ? target.code : "";

          const confirmed = typeof window.showConfirmDialog === "function"
            ? await window.showConfirmDialog({
                title: "Hapus Mata Kuliah",
                message: `Apakah Anda yakin ingin menghapus mata kuliah <strong>"${window.escapeHtml(cName)}" (${window.escapeHtml(cCode)})</strong> dari database Supabase? Semua modul terkait akan ikut dihapus.`,
                confirmText: "Hapus Mata Kuliah",
              })
            : window.confirm(
                `Apakah Anda yakin ingin menghapus mata kuliah "${cName}" (${cCode})? Tindakan ini akan menghapus data di Supabase dan semua modul terkait.`
              );
          if (!confirmed) return;

          btn.disabled = true;
          btn.textContent = "...";

          if (typeof window.dbDeleteCourse === "function") {
            await window.dbDeleteCourse(courseId, cCode);
          } else {
            const updated = getCourses().filter((c) => c.id !== courseId && (!cCode || c.code !== cCode));
            localStorage.setItem("utb_catalog_courses", JSON.stringify(updated));
          }

          window.showToast(`Mata kuliah "${cName}" berhasil dihapus dari Supabase.`, "info");
          renderAdminModulLists();
          renderProdiStep();
        });
      });
    }

    // List 3: Modul
    const modulListEl = document.getElementById("madmin-list-modul");
    if (modulListEl) {
      modulListEl.innerHTML = moduls
        .map((m) => {
          const cObj = courses.find((c) => c.id === m.course_id);
          const hasImages = Array.isArray(m.images) && m.images.length > 0;
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0.95rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: 10px; gap: 0.75rem; flex-wrap: wrap;">
              <div>
                <div style="font-weight: 800; color: var(--primary-navy);">${window.escapeHtml(m.title)}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary);">
                  Mata Kuliah: <strong>${window.escapeHtml(cObj?.code || "-")} - ${window.escapeHtml(cObj?.name || "-")}</strong> • ${window.escapeHtml(m.edition || "Modul 01")} •
                  <span style="color: var(--success); font-weight: 700;">${hasImages ? `${m.images.length} Halaman Scan Siap Baca` : "File PDF Terlampir"}</span>
                </div>
              </div>
              <div style="display: flex; gap: 0.4rem;">
                <button type="button" class="btn btn-soft btn-sm btn-preview-mbook" data-id="${m.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Lihat Modul</button>
                <button type="button" class="btn btn-secondary btn-sm btn-edit-mbook" data-id="${m.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Ubah</button>
                <button type="button" class="btn btn-danger btn-sm btn-del-mbook" data-id="${m.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Hapus</button>
              </div>
            </div>
          `;
        })
        .join("");

      modulListEl.querySelectorAll(".btn-preview-mbook").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = moduls.find((m) => m.id === btn.dataset.id);
          if (!item) return;
          selectedCourse = courses.find((c) => c.id === item.course_id) || courses[0];
          openCourseReader(selectedCourse);
          loadActiveModul(item);
        });
      });

      modulListEl.querySelectorAll(".btn-edit-mbook").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = moduls.find((m) => m.id === btn.dataset.id);
          if (!item) return;
          document.getElementById("m-book-edit-id").value = item.id;
          document.getElementById("m-book-course").value = item.course_id;
          document.getElementById("m-book-title").value = item.title;
          document.getElementById("m-book-edition").value = item.edition || "Modul 01";
          document.getElementById("m-book-pdf-url").value = item.pdf_external_url || "";
          document.getElementById("btn-submit-m-book").textContent = "Simpan Perubahan";
          document.getElementById("btn-cancel-m-book").style.display = "inline-flex";
        });
      });

      modulListEl.querySelectorAll(".btn-del-mbook").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const item = moduls.find((m) => m.id === btn.dataset.id);
          const mTitle = item ? item.title : "Modul";

          const confirmed = typeof window.showConfirmDialog === "function"
            ? await window.showConfirmDialog({
                title: "Hapus File Modul",
                message: `Apakah Anda yakin ingin menghapus buku modul <strong>"${window.escapeHtml(mTitle)}"</strong>? Tindakan ini akan membersihkan data scan secara permanen.`,
                confirmText: "Hapus Modul",
              })
            : window.confirm(`Apakah Anda yakin ingin menghapus modul "${mTitle}"?`);
          if (!confirmed) return;

          btn.disabled = true;
          btn.textContent = "...";

          if (item && item.idb_key) {
            await deleteFileFromIdb(item.idb_key);
          }
          if (item && (item.cloud_file_id || item.storage_path)) {
            if (item.cloud_file_id) {
              await deleteFileFromIdb("cloud_pdf_" + item.cloud_file_id);
              await deleteFileFromIdb("cloud_img_" + item.cloud_file_id);
            }
            if (typeof window.dbDeleteModulFile === "function") {
              await window.dbDeleteModulFile(item.cloud_file_id, item.cloud_chunks, item.storage_path);
            }
          }
          const updated = getModuls().filter((m) => m.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_moduls", JSON.stringify(updated));
          if (typeof window.dbSaveCatalogModuls === "function") {
            await window.dbSaveCatalogModuls(updated);
          }
          window.showToast("Modul berhasil dihapus.", "info");
          renderAdminModulLists();
          if (selectedCourse) openCourseReader(selectedCourse);
        });
      });
    }
  }
})();
