// ==============================================================================
// UTBELAJAR - KERANGKA SOAL MODUL BERGAYA WEB BACA KOMIK (SCROLL KE BAWAH)
// Menampilkan Gambar JPG Hasil Scan CamScanner di Dalam PDF Secara Vertikal
// Mendukung Baca Tanpa Unduh, Zoom Layar, Unduh PDF Asli, & Upload PDF Baru
// ==============================================================================

(function () {
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
      name: "Sistem Informasi dalam Bisnis",
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

  // 3. DATA MASTER MODUL (Memuat File Scan CamScanner Asli: page-1.jpg, page-2.jpg, page-3.jpg)
  const DEFAULT_MODULS = [
    {
      id: "mod-msim4207-01",
      course_id: "c-msim4207-01",
      title: "MSIM4207 Modul 01: Sistem Informasi dalam Bisnis (Tes Formatif 1)",
      edition: "MSIM4207 | Modul 01",
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
  let selectedProdi = null;
  let selectedCourse = null;
  let activeModul = null;
  let activeBlobUrl = null;
  let currentComicZoom = 1.0;

  function getProdis() {
    try {
      const raw = localStorage.getItem("utb_catalog_prodis");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    localStorage.setItem("utb_catalog_prodis", JSON.stringify(DEFAULT_PRODIS));
    return [...DEFAULT_PRODIS];
  }

  function getCourses() {
    try {
      const raw = localStorage.getItem("utb_catalog_courses");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Pastikan mata kuliah MSIM4207 selalu ada di daftar teratas
          if (!parsed.some((c) => c.code === "MSIM4207" || c.id === "c-msim4207-01")) {
            parsed.unshift(DEFAULT_COURSES[0]);
            localStorage.setItem("utb_catalog_courses", JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (_) {}
    localStorage.setItem("utb_catalog_courses", JSON.stringify(DEFAULT_COURSES));
    return [...DEFAULT_COURSES];
  }

  function getModuls() {
    try {
      const raw = localStorage.getItem("utb_catalog_moduls");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Pastikan modul MSIM4207 selalu tersedia dengan file scan CamScanner asli
          const msimIdx = parsed.findIndex(
            (m) => m.id === "mod-msim4207-01" || (m.title && m.title.includes("MSIM4207"))
          );
          if (msimIdx === -1) {
            parsed.unshift(DEFAULT_MODULS[0]);
            localStorage.setItem("utb_catalog_moduls", JSON.stringify(parsed));
          } else {
            parsed[msimIdx] = {
              ...DEFAULT_MODULS[0],
              ...parsed[msimIdx],
              images: DEFAULT_MODULS[0].images,
              pdf_file_url: DEFAULT_MODULS[0].pdf_file_url,
            };
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
  document.addEventListener("DOMContentLoaded", async () => {
    currentUser = await window.requireAuth();
    if (!currentUser) return;

    if (typeof window.dbGetCatalogProdis === "function") {
      try {
        await window.dbGetCatalogProdis();
      } catch (_) {}
    }

    isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
    const adminPanel = document.getElementById("admin-modul-manager");

    if (isAdmin) {
      if (adminPanel) adminPanel.style.display = "block";
      initAdminModulController();
    } else {
      if (adminPanel) adminPanel.remove();
    }

    setupReaderNavigation();
    setStep(1);
    renderProdiStep();
  });

  // ============================================================================
  // STEPPER TAHAPAN (1. Prodi -> 2. Mata Kuliah -> 3. Baca Soal Modul)
  // ============================================================================
  function setStep(stepNum) {
    document.querySelectorAll("[data-mstep]").forEach((el) => {
      const n = Number(el.dataset.mstep);
      el.classList.toggle("active", n <= stepNum);
    });

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
  function renderCourseStep(prodi) {
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
  function openCourseReader(course) {
    setStep(3);
    const titleEl = document.getElementById("modul-reader-course-title");
    if (titleEl) titleEl.textContent = `${course.code} — ${course.name}`;

    const allModuls = getModuls();
    let courseModuls = allModuls.filter((m) => m.course_id === course.id);

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

    const pillsContainer = document.getElementById("modul-pills-container");
    if (pillsContainer) {
      pillsContainer.innerHTML = courseModuls
        .map(
          (m, idx) => `
          <button type="button" class="modul-pill-btn ${idx === 0 ? "active" : ""}" data-mid="${m.id}">
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

    loadActiveModul(courseModuls[0]);
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

    // KASUS 1: MODUL MEMILIKI DAFTAR GAMBAR SCAN ASLI (SEPERTI CAMSCANNER page-1.jpg, page-2.jpg, page-3.jpg)
    if (Array.isArray(modul.images) && modul.images.length > 0) {
      const total = modul.images.length;
      if (counterEl) counterEl.textContent = `${total} Halaman (Scan JPG)`;

      streamEl.innerHTML = modul.images
        .map(
          (imgSrc, idx) => `
        <div class="comic-page-frame" style="max-width: ${Math.round(820 * currentComicZoom)}px;">
          <img src="${imgSrc}" alt="Halaman ${idx + 1}" loading="lazy">
          <span class="comic-page-number-pill">Halaman ${idx + 1} / ${total}</span>
        </div>
      `
        )
        .join("");
      return;
    }

    // KASUS 2: MODUL MEMILIKI FILE PDF DI INDEXEDDB ATAU DATA URL (HASIL UPLOAD ADMIN)
    let pdfData = null;
    if (modul.idb_key) {
      const stored = await getFileFromIdb(modul.idb_key);
      if (stored instanceof Blob) {
        pdfData = await stored.arrayBuffer();
      } else if (stored) {
        pdfData = stored;
      }
    } else if (modul.pdf_data_url) {
      pdfData = modul.pdf_data_url;
    } else if (modul.pdf_file_url) {
      pdfData = modul.pdf_file_url;
    }

    if (pdfData && window.pdfjsLib) {
      try {
        const loadingTask = window.pdfjsLib.getDocument(pdfData);
        const pdfDoc = await loadingTask.promise;
        const total = pdfDoc.numPages;
        if (counterEl) counterEl.textContent = `${total} Halaman (PDF Scan)`;

        streamEl.innerHTML = "";

        for (let p = 1; p <= total; p++) {
          const page = await pdfDoc.getPage(p);
          const frame = document.createElement("div");
          frame.className = "comic-page-frame";
          frame.style.maxWidth = `${Math.round(820 * currentComicZoom)}px`;

          const canvas = document.createElement("canvas");
          frame.appendChild(canvas);

          const pill = document.createElement("span");
          pill.className = "comic-page-number-pill";
          pill.textContent = `Halaman ${p} / ${total}`;
          frame.appendChild(pill);

          streamEl.appendChild(frame);

          // Render halaman PDF ke canvas
          const unscaledViewport = page.getViewport({ scale: 1 });
          const targetW = Math.min(820, window.innerWidth - 32);
          const dpr = Math.min(window.devicePixelRatio || 1.5, 2);
          const fitScale = (targetW / unscaledViewport.width) * dpr;
          const viewport = page.getViewport({ scale: fitScale });

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";

          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport,
          }).promise;
        }
        return;
      } catch (err) {
        console.warn("Gagal merender PDF via pdfjs:", err);
      }
    }

    // KASUS 3: BELUM ADA FILE SCAN PADA MODUL INI
    if (counterEl) counterEl.textContent = "0 Halaman";
    streamEl.innerHTML = `
      <div style="background: #1E293B; color: #E2E8F0; padding: 2.5rem 1.5rem; border-radius: 12px; text-align: center; max-width: 600px; margin: 2rem auto;">
        <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">📄</div>
        <h3 style="color: #FFFFFF; font-size: 1.15rem; margin-bottom: 0.4rem;">Belum Ada File Scan Modul</h3>
        <p style="color: #94A3B8; font-size: 0.88rem; line-height: 1.6;">
          Modul ini belum memiliki lampiran file PDF/gambar hasil scan CamScanner.
          ${isAdmin ? 'Anda dapat mengunggah file PDF melalui panel <strong>"Manajemen Soal Modul"</strong> di atas.' : 'Silakan pilih mata kuliah <strong>MSIM4207</strong> untuk melihat contoh modul scan yang sudah tersedia.'}
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

    // 1. Jika ada file PDF tersimpan di IndexedDB
    if (activeModul.idb_key) {
      const stored = await getFileFromIdb(activeModul.idb_key);
      if (stored instanceof Blob) {
        triggerDownload(stored, safeName);
        return;
      }
    }

    // 2. Jika ada path file PDF asli (misal: assets/modul/MSIM4207-Modul-01.pdf)
    if (activeModul.pdf_file_url) {
      const a = document.createElement("a");
      a.href = activeModul.pdf_file_url;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.showToast(`Mengunduh file PDF "${safeName}"...`, "success");
      return;
    }

    // 3. Jika ada data URL PDF
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

    document.querySelector('[data-mstep="1"]')?.addEventListener("click", () => {
      setStep(1);
      renderProdiStep();
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

        if (files.length > 0) {
          const firstFile = files[0];
          if (firstFile.type === "application/pdf" || firstFile.name.toLowerCase().endsWith(".pdf")) {
            idbKey = "modul_pdf_" + newId;
            await saveFileToIdb(idbKey, firstFile);
          } else {
            for (let i = 0; i < files.length; i++) {
              const dataUrl = await new Promise((res) => {
                const r = new FileReader();
                r.onload = () => res(r.result);
                r.readAsDataURL(files[i]);
              });
              uploadedImages.push(dataUrl);
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
        };

        const list = getModuls();
        list.push(newModulObj);
        localStorage.setItem("utb_catalog_moduls", JSON.stringify(list));

        window.closeModal(modalUpload);
        window.showToast(`File PDF "${title}" berhasil diunggah!`, "success");

        // Perbarui daftar dan langsung buka modul baru yang diunggah
        renderAdminModulLists();
        if (selectedCourse && selectedCourse.id === course_id) {
          openCourseReader(selectedCourse);
          loadActiveModul(newModulObj);
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

      const confirmed = window.confirm(
        `Apakah Anda yakin ingin menghapus file PDF/Modul "${activeModul.title}"? Tindakan ini tidak dapat dibatalkan.`
      );
      if (!confirmed) return;

      if (activeModul.idb_key) {
        await deleteFileFromIdb(activeModul.idb_key);
      }

      const updated = getModuls().filter((m) => m.id !== activeModul.id);
      localStorage.setItem("utb_catalog_moduls", JSON.stringify(updated));

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

    formCourse?.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = document.getElementById("m-course-edit-id")?.value;
      const study_program_id = document.getElementById("m-course-prodi")?.value;
      const code = document.getElementById("m-course-code")?.value.trim().toUpperCase();
      const name = document.getElementById("m-course-name")?.value.trim();
      const description = document.getElementById("m-course-desc")?.value.trim() || "Mata kuliah program sarjana.";
      if (!study_program_id || !code || !name) return;

      const list = getCourses();
      if (editId) {
        const idx = list.findIndex((c) => c.id === editId);
        if (idx !== -1) list[idx] = { ...list[idx], study_program_id, code, name, description };
        window.showToast(`Mata Kuliah "${name}" berhasil diperbarui!`, "success");
      } else {
        list.push({ id: "course-" + Date.now(), study_program_id, code, name, description });
        window.showToast(`Mata Kuliah "${name}" berhasil ditambahkan!`, "success");
      }

      localStorage.setItem("utb_catalog_courses", JSON.stringify(list));
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

      const newId = editId || "mod-" + Date.now();
      let idbKey = null;
      let uploadedImages = [];

      // Proses file yang diupload (PDF atau beberapa file gambar JPG/PNG)
      if (files.length > 0) {
        const firstFile = files[0];
        if (firstFile.type === "application/pdf" || firstFile.name.toLowerCase().endsWith(".pdf")) {
          // File PDF: Simpan di IndexedDB
          idbKey = "modul_pdf_" + newId;
          await saveFileToIdb(idbKey, firstFile);
        } else {
          // File Gambar JPG / PNG: Baca sebagai data URL
          for (let i = 0; i < files.length; i++) {
            const dataUrl = await new Promise((res) => {
              const r = new FileReader();
              r.onload = () => res(r.result);
              r.readAsDataURL(files[i]);
            });
            uploadedImages.push(dataUrl);
          }
        }
      }

      const list = getModuls();
      if (editId) {
        const idx = list.findIndex((m) => m.id === editId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            course_id,
            title,
            edition,
            pdf_external_url: pdf_external_url || list[idx].pdf_external_url || "",
            idb_key: idbKey || list[idx].idb_key || "",
            images: uploadedImages.length > 0 ? uploadedImages : list[idx].images || [],
          };
        }
        window.showToast(`Modul "${title}" berhasil diperbarui!`, "success");
      } else {
        list.push({
          id: newId,
          course_id,
          title,
          edition,
          pdf_external_url,
          idb_key: idbKey,
          images: uploadedImages,
        });
        window.showToast(`Modul "${title}" berhasil diunggah!`, "success");
      }

      localStorage.setItem("utb_catalog_moduls", JSON.stringify(list));
      cancelBookBtn?.click();
      renderAdminModulLists();

      if (selectedCourse && selectedCourse.id === course_id) {
        openCourseReader(selectedCourse);
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
          const confirmed = window.confirm("Apakah Anda yakin ingin menghapus program studi ini dari database Supabase?");
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
        btn.addEventListener("click", () => {
          const updated = getCourses().filter((c) => c.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_courses", JSON.stringify(updated));
          window.showToast("Mata kuliah berhasil dihapus.", "info");
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
          if (item && item.idb_key) {
            await deleteFileFromIdb(item.idb_key);
          }
          const updated = getModuls().filter((m) => m.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_moduls", JSON.stringify(updated));
          window.showToast("Modul berhasil dihapus.", "info");
          renderAdminModulLists();
          if (selectedCourse) openCourseReader(selectedCourse);
        });
      });
    }
  }
})();
