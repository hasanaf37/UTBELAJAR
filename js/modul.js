// ==============================================================================
// UTBELAJAR - SOAL MODUL & DIGITAL BOOK / PDF READER ENGINE
// Mendukung Baca Buku 2 Halaman, Lihat PDF Tanpa Unduh, & Unduh File PDF Asli
// Hanya ADMIN yang dapat Menambah, Mengubah, dan Menghapus Data
// ==============================================================================

(function () {
  const DEFAULT_PRODIS = [
    { id: "b1111111-1111-1111-1111-111111111111", code: "SI", name: "Sistem Informasi", description: "Studi rekayasa perangkat lunak, arsitektur data, dan transformasi digital." },
    { id: "b2222222-2222-2222-2222-222222222222", code: "MNJ", name: "Manajemen", description: "Fokus pada kepemimpinan strategis, manajemen operasional, dan pemasaran." },
    { id: "b3333333-3333-3333-3333-333333333333", code: "ILKOM", name: "Ilmu Komunikasi", description: "Kajian media massa, public relations, dan komunikasi organisasi digital." },
    { id: "b4444444-4444-4444-4444-444444444444", code: "AKT", name: "Akuntansi", description: "Penguasaan akuntansi keuangan, audit, sistem informasi akuntansi, dan perpajakan." },
  ];

  const DEFAULT_COURSES = [
    { id: "c1111111-1111-1111-1111-111111111111", study_program_id: "b1111111-1111-1111-1111-111111111111", code: "MSIM4201", name: "Analisis dan Perancangan Sistem", description: "Konsep siklus hidup pengembangan sistem (SDLC), pemodelan UML, dan use case diagram." },
    { id: "c2222222-2222-2222-2222-222222222222", study_program_id: "b1111111-1111-1111-1111-111111111111", code: "MSIM4202", name: "Sistem Basis Data", description: "Normalisasi data, Entity-Relationship Diagram (ERD), sintaks SQL, dan transaksi database." },
    { id: "c4444444-4444-4444-4444-444444444444", study_program_id: "b2222222-2222-2222-2222-222222222222", code: "EKMA4116", name: "Manajemen Strategik", description: "Analisis lingkungan bisnis, keunggulan bersaing, visi-misi korporasi, dan implementasi strategi." },
    { id: "c5555555-5555-5555-5555-555555555555", study_program_id: "b3333333-3333-3333-3333-333333333333", code: "SKOM4101", name: "Pengantar Ilmu Komunikasi", description: "Model komunikasi linear, transaksional, komunikasi massa, dan etika media digital." },
    { id: "c6666666-6666-6666-6666-666666666666", study_program_id: "b4444444-4444-4444-4444-444444444444", code: "EKMA4115", name: "Pengantar Akuntansi", description: "Persamaan dasar akuntansi, siklus jurnal umum, buku besar, neraca saldo, dan laporan keuangan." },
  ];

  const DEFAULT_MODULS = [
    {
      id: "mod-101",
      course_id: "c2222222-2222-2222-2222-222222222222",
      title: "Modul 01: Arsitektur Basis Data Relasional & Normalisasi",
      edition: "Modul 1-3 • Edisi 2026",
      pdf_data_url: "",
      pdf_external_url: "",
      spreads: [
        {
          leftTitle: "BAB 1: Konsep Model Relasional & Kunci Tabel",
          leftText:
            "Basis data relasional mengorganisasikan data ke dalam tabel-tabel dua dimensi yang terdiri dari baris (tuple/record) dan kolom (atribut).\n\n1. Primary Key (Kunci Utama): Atribut unik yang mengidentifikasi setiap baris secara spesifik dan tidak boleh bernilai NULL.\n2. Foreign Key (Kunci Tamu): Atribut pada suatu tabel yang merujuk pada Primary Key di tabel lain untuk menjaga integritas referensial.\n3. Entity-Relationship Diagram (ERD): Pemodelan visual hubungan antar entitas (One-to-One, One-to-Many, Many-to-Many).",
          rightTitle: "Soal Evaluasi Modul — Bagian 1",
          rightText:
            "SOAL 1:\nAtribut yang digunakan untuk menghubungkan tabel anak (child) ke tabel induk (parent) dalam basis data relasional disebut...\nA. Candidate Key\nB. Foreign Key\nC. Super Key\nD. Alternate Key\nKunci Jawaban: B (Foreign Key menjaga integritas referensial antar tabel).\n\nSOAL 2:\nKondisi di mana nilai Primary Key tidak boleh kosong disebut aturan...\nA. Entity Integrity\nB. Domain Integrity\nC. Referential Integrity\nD. User-Defined Integrity\nKunci Jawaban: A (Entity Integrity mewajibkan setiap PK bernilai unik dan tidak NULL).",
        },
        {
          leftTitle: "BAB 2: Tahapan Normalisasi Data (1NF, 2NF, 3NF)",
          leftText:
            "Normalisasi adalah proses dekomposisi tabel untuk menghilangkan redundansi data serta mencegah anomali (Insertion, Update, dan Deletion Anomaly).\n\n• Bentuk Normal Pertama (1NF): Setiap sel tabel hanya memuat satu nilai atomik (tunggal) dan tidak ada grup berulang.\n• Bentuk Normal Kedua (2NF): Memenuhi 1NF dan semua atribut non-kunci bergantung penuh pada Primary Key.\n• Bentuk Normal Ketiga (3NF): Memenuhi 2NF dan tidak terdapat ketergantungan transitif antar atribut non-kunci.",
          rightTitle: "Soal Evaluasi Modul — Bagian 2",
          rightText:
            "SOAL 3:\nApabila sebuah tabel masih memiliki atribut bernilai ganda (multi-valued attribute) dalam satu kolom, maka tabel tersebut belum memenuhi...\nA. 1NF (First Normal Form)\nB. 2NF (Second Normal Form)\nC. 3NF (Third Normal Form)\nD. BCNF\nKunci Jawaban: A (Syarat mutlak 1NF adalah nilai atomik).\n\nSOAL 4:\nPerintah DDL SQL untuk menambahkan kolom baru pada tabel yang sudah ada adalah...\nA. UPDATE TABLE\nB. INSERT COLUMN\nC. ALTER TABLE ... ADD\nD. MODIFY TABLE\nKunci Jawaban: C (ALTER TABLE digunakan untuk mengubah struktur tabel).",
        },
      ],
    },
    {
      id: "mod-102",
      course_id: "c1111111-1111-1111-1111-111111111111",
      title: "Modul 01: Siklus Hidup Pengembangan Sistem (SDLC) & UML",
      edition: "Modul 1-2 • Edisi 2026",
      pdf_data_url: "",
      pdf_external_url: "",
      spreads: [
        {
          leftTitle: "BAB 1: Tahapan SDLC & Analisis Kebutuhan",
          leftText:
            "System Development Life Cycle (SDLC) merupakan kerangka kerja terstruktur dalam merancang dan membangun sistem informasi.\n\n1. Perencanaan (Planning): Studi kelayakan teknis, ekonomi, dan operasional.\n2. Analisis (Analysis): Pengumpulan kebutuhan fungsional & non-fungsional yang dituangkan dalam dokumen SRS.\n3. Perancangan (Design): Pembuatan arsitektur antarmuka, skema database, dan diagram UML.\n4. Implementasi & Pengujian: Pengkodean perangkat lunak serta pengujian Black-Box dan White-Box.",
          rightTitle: "Soal Evaluasi Modul — SDLC & UML",
          rightText:
            "SOAL 1:\nDokumen spesifikasi resmi yang merangkum seluruh kebutuhan fungsional dan non-fungsional pengguna pada tahap analisis disebut...\nA. ERD Document\nB. SRS (Software Requirements Specification)\nC. User Manual\nD. Source Code\nKunci Jawaban: B (SRS mendokumentasikan spesifikasi kebutuhan sistem).\n\nSOAL 2:\nDiagram UML yang memvisualisasikan urutan interaksi pesan antar objek berdasarkan urutan waktu adalah...\nA. Sequence Diagram\nB. Class Diagram\nC. Use Case Diagram\nD. Deployment Diagram\nKunci Jawaban: A (Sequence Diagram fokus pada urutan waktu pengiriman pesan).",
        },
      ],
    },
    {
      id: "mod-103",
      course_id: "c4444444-4444-4444-4444-444444444444",
      title: "Modul 01: Formulasi Strategi Korporasi & Analisis SWOT",
      edition: "Modul 1-2 • Edisi 2026",
      pdf_data_url: "",
      pdf_external_url: "",
      spreads: [
        {
          leftTitle: "BAB 1: Manajemen Strategik & Matriks SWOT",
          leftText:
            "Manajemen strategik memadukan analisis lingkungan internal (Strengths & Weaknesses) dengan lingkungan eksternal (Opportunities & Threats).\n\n• Strategi SO (Agresif): Memanfaatkan kekuatan internal untuk merebut peluang pasar.\n• Strategi ST (Diversifikasi): Menggunakan kekuatan inti untuk meredam ancaman kompetitor.\n• Strategi WO (Turnaround): Memperbaiki kelemahan internal guna menangkap peluang baru.\n• Strategi WT (Defensif): Meminimalkan kelemahan sekaligus menghindari ancaman eksternal.",
          rightTitle: "Soal Evaluasi Modul — Manajemen Strategik",
          rightText:
            "SOAL 1:\nLima Kekuatan Porter (Porter's Five Forces) digunakan oleh perusahaan untuk menganalisis...\nA. Efisiensi gaji karyawan internal\nB. Daya tarik dan tingkat persaingan industri eksternal\nC. Pencatatan jurnal akuntansi harian\nD. Struktur jaringan komputer kantor\nKunci Jawaban: B (Model Porter mengevaluasi kekuatan persaingan industri).\n\nSOAL 2:\nStrategi bisnis yang berfokus menciptakan produk unik agar memiliki nilai tambah di mata konsumen disebut strategi...\nA. Cost Leadership\nB. Diferensiasi (Differentiation)\nC. Likuidasi\nD. Divestasi\nKunci Jawaban: B (Diferensiasi menekankan keunikan nilai produk).",
        },
      ],
    },
  ];

  let currentUser = null;
  let isAdmin = false;
  let selectedProdi = null;
  let selectedCourse = null;
  let activeModul = null;
  let activeSpreadIndex = 0;
  let activeBlobUrl = null;

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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    localStorage.setItem("utb_catalog_moduls", JSON.stringify(DEFAULT_MODULS));
    return [...DEFAULT_MODULS];
  }

  document.addEventListener("DOMContentLoaded", async () => {
    currentUser = await window.requireAuth();
    if (!currentUser) return;

    isAdmin = typeof window.isAdminUser === "function" && window.isAdminUser(currentUser);
    const adminPanel = document.getElementById("admin-modul-manager");

    if (isAdmin) {
      if (adminPanel) adminPanel.style.display = "block";
      initAdminModulController();
    } else {
      // Pastikan user selain Admin tidak bisa melihat atau mengakses form tambah/edit/hapus
      if (adminPanel) adminPanel.remove();
    }

    setupReaderNavigation();
    setStep(1);
    renderProdiStep();
  });

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
  }

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
              <span>${cCount || 1} Mata Kuliah Tersedia</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `;
      })
      .join("");

    grid.querySelectorAll(".selection-card").forEach((card) => {
      card.addEventListener("click", () => {
        const found = prodis.find((item) => item.id === card.dataset.prodiId);
        if (found) {
          selectedProdi = found;
          renderCourseStep(found);
        }
      });
    });
  }

  function renderCourseStep(prodi) {
    setStep(2);
    const heading = document.getElementById("modul-course-heading");
    if (heading) heading.textContent = `Mata Kuliah — ${prodi.name} (${prodi.code})`;

    const grid = document.getElementById("modul-course-grid");
    if (!grid) return;

    const allCourses = getCourses();
    let courses = allCourses.filter((c) => c.study_program_id === prodi.id);
    if (courses.length === 0) courses = allCourses;
    const moduls = getModuls();

    grid.innerHTML = courses
      .map((c) => {
        const mCount = moduls.filter((m) => m.course_id === c.id).length;
        return `
          <div class="selection-card" data-course-id="${c.id}">
            <div>
              <div class="selection-card-header">
                <span class="badge badge-primary">${window.escapeHtml(c.code)}</span>
                <span class="badge badge-success">${mCount || 1} Buku PDF</span>
              </div>
              <h3 class="selection-title">${window.escapeHtml(c.name)}</h3>
              <p class="selection-desc">${window.escapeHtml(c.description || "Modul dan soal evaluasi mata kuliah.")}</p>
            </div>
            <div class="selection-meta">
              <span>Buka Buku &amp; PDF Soal Modul</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `;
      })
      .join("");

    grid.querySelectorAll(".selection-card").forEach((card) => {
      card.addEventListener("click", () => {
        const found = courses.find((item) => item.id === card.dataset.courseId);
        if (found) {
          selectedCourse = found;
          openCourseReader(found);
        }
      });
    });
  }

  function openCourseReader(course) {
    setStep(3);
    const titleEl = document.getElementById("modul-reader-course-title");
    if (titleEl) titleEl.textContent = `${course.code} — ${course.name}`;

    const allModuls = getModuls();
    let courseModuls = allModuls.filter((m) => m.course_id === course.id);
    if (courseModuls.length === 0) {
      courseModuls = [
        {
          id: "mod-auto-" + course.id,
          course_id: course.id,
          title: `Modul Utama: ${course.name}`,
          edition: "Edisi 2026",
          pdf_data_url: "",
          pdf_external_url: "",
          spreads: [
            {
              leftTitle: `Ringkasan Materi ${course.name}`,
              leftText: `${course.description || "Materi inti perkuliahan mandiri."}\n\nPelajari konsep dasar, definisi struktural, dan kerangka analisis pada modul ini sebelum mengerjakan soal evaluasi di halaman sebelah kanan.`,
              rightTitle: `Soal Evaluasi Modul — ${course.code}`,
              rightText: `SOAL 1:\nFokus kajian utama dalam mata kuliah ${course.name} (${course.code}) mencakup...\nA. Pemahaman konsep teoretis dan studi kasus terapan\nB. Pengabaian standar prosedur akademik\nC. Penghapusan dokumentasi sistem\nD. Penyederhanaan tanpa evaluasi\nKunci Jawaban: A`,
            },
          ],
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

  function loadActiveModul(modul) {
    activeModul = modul;
    activeSpreadIndex = 0;

    const badgeEl = document.getElementById("reader-badge-edition");
    const titleEl = document.getElementById("reader-active-title");
    if (badgeEl) badgeEl.textContent = modul.edition || "MODUL PDF";
    if (titleEl) titleEl.textContent = modul.title;

    renderBookSpread();
    preparePdfSource(modul);
  }

  function formatBookParagraphs(rawText) {
    if (!rawText) return "<p>-</p>";
    return String(rawText)
      .split(/\n\n+/)
      .map((block) => {
        const escaped = window.escapeHtml(block.trim()).replace(/\n/g, "<br>");
        if (block.trim().startsWith("SOAL")) {
          return `<div class="book-question-card">${escaped}</div>`;
        }
        return `<p>${escaped}</p>`;
      })
      .join("");
  }

  function renderBookSpread() {
    if (!activeModul) return;
    const spreads =
      Array.isArray(activeModul.spreads) && activeModul.spreads.length > 0
        ? activeModul.spreads
        : [
            {
              leftTitle: activeModul.title,
              leftText: "Materi modul pembelajaran mandiri.",
              rightTitle: "Soal Evaluasi Modul",
              rightText: "Daftar soal evaluasi modul.",
            },
          ];

    if (activeSpreadIndex >= spreads.length) activeSpreadIndex = spreads.length - 1;
    if (activeSpreadIndex < 0) activeSpreadIndex = 0;

    const current = spreads[activeSpreadIndex];
    const leftPageNum = activeSpreadIndex * 2 + 1;
    const rightPageNum = activeSpreadIndex * 2 + 2;

    const leftCodeEl = document.getElementById("book-left-header-code");
    const rightEdEl = document.getElementById("book-right-header-edition");
    const leftBodyEl = document.getElementById("book-left-body");
    const rightBodyEl = document.getElementById("book-right-body");
    const leftNumEl = document.getElementById("book-left-page-num");
    const rightNumEl = document.getElementById("book-right-page-num");
    const indicatorEl = document.getElementById("book-spread-indicator");
    const prevBtn = document.getElementById("btn-book-prev-spread");
    const nextBtn = document.getElementById("btn-book-next-spread");

    if (leftCodeEl) leftCodeEl.textContent = selectedCourse ? `${selectedCourse.code} • ${selectedCourse.name}` : "MODUL KULIAH";
    if (rightEdEl) rightEdEl.textContent = activeModul.edition || "EDISI 2026";

    if (leftBodyEl) {
      leftBodyEl.innerHTML = `
        <h3>${window.escapeHtml(current.leftTitle || "Ringkasan Materi Modul")}</h3>
        ${formatBookParagraphs(current.leftText)}
      `;
    }

    if (rightBodyEl) {
      rightBodyEl.innerHTML = `
        <h3>${window.escapeHtml(current.rightTitle || "Soal Evaluasi Modul")}</h3>
        ${formatBookParagraphs(current.rightText)}
      `;
    }

    if (leftNumEl) leftNumEl.textContent = `Halaman ${leftPageNum}`;
    if (rightNumEl) rightNumEl.textContent = `Halaman ${rightPageNum}`;
    if (indicatorEl) {
      indicatorEl.textContent = `Lembar ${activeSpreadIndex + 1} dari ${spreads.length} (Halaman ${leftPageNum}–${rightPageNum})`;
    }
    if (prevBtn) prevBtn.disabled = activeSpreadIndex === 0;
    if (nextBtn) nextBtn.disabled = activeSpreadIndex >= spreads.length - 1;
  }

  let currentPdfZoom = 1.0;
  let activePdfDoc = null;

  if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  // Generator Dokumen PDF Multi-Halaman 100% Valid (%PDF-1.4)
  function buildRealPdfBlob(modul, course) {
    const cleanPdfText = (str) =>
      String(str || "")
        .replace(/[^\x20-\x7E\n]/g, " ")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");

    const wrapLines = (text, maxChars) => {
      const lines = [];
      String(text || "")
        .split(/\r?\n/)
        .forEach((para) => {
          if (!para.trim()) {
            lines.push("");
            return;
          }
          const words = para.trim().split(/\s+/);
          let currentLine = "";
          words.forEach((w) => {
            if ((currentLine + " " + w).trim().length > maxChars) {
              if (currentLine) lines.push(currentLine);
              currentLine = w;
            } else {
              currentLine = (currentLine + " " + w).trim();
            }
          });
          if (currentLine) lines.push(currentLine);
        });
      return lines;
    };

    const allLines = [];
    allLines.push(`UTBELAJAR - BUKU & SOAL MODUL DIGITAL`);
    allLines.push(`Mata Kuliah : ${course ? course.code + " - " + course.name : "Mata Kuliah"}`);
    allLines.push(`Judul Modul : ${modul.title}`);
    allLines.push(`Edisi       : ${modul.edition || "Edisi 2026"}`);
    allLines.push(`==============================================================================`);
    allLines.push(``);

    const spreads = Array.isArray(modul.spreads) ? modul.spreads : [];
    spreads.forEach((sp, idx) => {
      allLines.push(`[BAGIAN ${idx + 1}] ${sp.leftTitle || "Ringkasan Materi"}`);
      wrapLines(sp.leftText, 76).forEach((l) => allLines.push(l));
      allLines.push(``);
      allLines.push(`[SOAL EVALUASI ${idx + 1}] ${sp.rightTitle || "Latihan Soal Modul"}`);
      wrapLines(sp.rightText, 76).forEach((l) => allLines.push(l));
      allLines.push(``);
      allLines.push(`------------------------------------------------------------------------------`);
      allLines.push(``);
    });

    allLines.push(`Copyright HasanAF 2026 - UTBelajar`);

    const linesPerPage = 46;
    const pageChunks = [];
    for (let i = 0; i < allLines.length; i += linesPerPage) {
      pageChunks.push(allLines.slice(i, i + linesPerPage));
    }
    if (pageChunks.length === 0) pageChunks.push(["UTBelajar Modul PDF"]);

    const objects = [];
    // Obj 1: Catalog, Obj 2: Pages, Obj 3: Font
    objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    const kidsRefs = pageChunks.map((_, idx) => `${4 + idx * 2} 0 R`).join(" ");
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [${kidsRefs}] /Count ${pageChunks.length} >>\nendobj\n`);
    objects.push("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

    pageChunks.forEach((lines, idx) => {
      const pageObjNum = 4 + idx * 2;
      const contentObjNum = pageObjNum + 1;
      let streamContent = "BT\n/F1 10.5 Tf\n45 792 Td\n15 TL\n";
      lines.forEach((line) => {
        streamContent += `(${cleanPdfText(line)}) Tj T*\n`;
      });
      streamContent += `\n(--- Halaman ${idx + 1} dari ${pageChunks.length} | UTBelajar ---) Tj\nET`;

      objects.push(
        `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`
      );
      objects.push(
        `${contentObjNum} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`
      );
    });

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((obj) => {
      offsets.push(pdf.length);
      pdf += obj;
    });

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
  }

  function dataUrlToUint8Array(dataUrl) {
    try {
      const parts = String(dataUrl).split(",");
      const base64 = parts.length > 1 ? parts[1] : parts[0];
      const raw = atob(base64);
      const uint8 = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        uint8[i] = raw.charCodeAt(i);
      }
      return uint8;
    } catch (e) {
      return null;
    }
  }

  function renderFallbackA4Sheets(modul, course) {
    const stack = document.getElementById("pdf-canvas-stack");
    const pageInfoEl = document.getElementById("pdf-viewer-page-info");
    const iframe = document.getElementById("pdf-inline-iframe");
    if (!stack) return;
    if (iframe) iframe.style.display = "none";
    stack.style.display = "flex";

    const spreads = Array.isArray(modul.spreads) && modul.spreads.length > 0 ? modul.spreads : [];
    if (pageInfoEl) {
      pageInfoEl.textContent = `${spreads.length || 1} Halaman Lembar A4 (Siap Baca di HP & Desktop)`;
    }

    stack.innerHTML = spreads
      .map(
        (sp, idx) => `
      <div class="pdf-a4-sheet" style="transform: scale(${currentPdfZoom}); transform-origin: top center;">
        <div class="pdf-a4-header">
          <div>
            <div style="font-size: 0.75rem; font-weight: 800; color: var(--primary-blue); text-transform: uppercase;">
              DOKUMEN PDF SOAL MODUL • ${window.escapeHtml(course ? course.code + " - " + course.name : "UTBELAJAR")}
            </div>
            <div style="font-size: 1.05rem; font-weight: 800; color: var(--primary-navy);">
              ${window.escapeHtml(modul.title)}
            </div>
          </div>
          <span class="badge badge-blue">${window.escapeHtml(modul.edition || "Edisi 2026")} • Hal. ${idx + 1}</span>
        </div>
        <div class="book-page-content">
          <h3>${window.escapeHtml(sp.leftTitle || "Ringkasan Materi")}</h3>
          ${formatBookParagraphs(sp.leftText)}
          <hr style="border: none; border-top: 1.5px dashed #CBD5E1; margin: 1.25rem 0;">
          <h3>${window.escapeHtml(sp.rightTitle || "Latihan & Evaluasi Modul")}</h3>
          ${formatBookParagraphs(sp.rightText)}
        </div>
      </div>
    `
      )
      .join("");
  }

  async function renderPdfDocPages() {
    const stack = document.getElementById("pdf-canvas-stack");
    const pageInfoEl = document.getElementById("pdf-viewer-page-info");
    const zoomLabel = document.getElementById("pdf-zoom-level");
    if (zoomLabel) zoomLabel.textContent = `${Math.round(currentPdfZoom * 100)}%`;

    if (!activePdfDoc || !stack) {
      if (activeModul) renderFallbackA4Sheets(activeModul, selectedCourse);
      return;
    }

    stack.innerHTML = "";
    const totalPages = activePdfDoc.numPages;
    if (pageInfoEl) {
      pageInfoEl.textContent = `${totalPages} Halaman PDF • Terbaca Langsung di HP & Desktop`;
    }

    const viewportEl = document.getElementById("pdf-canvas-viewport");
    const availableWidth = Math.max(280, Math.min(820, (viewportEl?.clientWidth || window.innerWidth) - 32));
    const dpr = Math.min(window.devicePixelRatio || 1.5, 2.25);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await activePdfDoc.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const fitScale = (availableWidth / unscaledViewport.width) * currentPdfZoom;
      const viewport = page.getViewport({ scale: fitScale });

      const sheetWrapper = document.createElement("div");
      sheetWrapper.className = "pdf-page-sheet";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      sheetWrapper.appendChild(canvas);
      stack.appendChild(sheetWrapper);

      const pageBadge = document.createElement("div");
      pageBadge.className = "pdf-page-badge-num";
      pageBadge.textContent = `Halaman ${pageNum} dari ${totalPages}`;
      stack.appendChild(pageBadge);

      await page.render({
        canvasContext: ctx,
        viewport: page.getViewport({ scale: fitScale * dpr }),
      }).promise;
    }
  }

  async function preparePdfSource(modul) {
    if (activeBlobUrl) {
      URL.revokeObjectURL(activeBlobUrl);
      activeBlobUrl = null;
    }
    activePdfDoc = null;
    currentPdfZoom = 1.0;

    const stack = document.getElementById("pdf-canvas-stack");
    const iframe = document.getElementById("pdf-inline-iframe");
    const pageInfoEl = document.getElementById("pdf-viewer-page-info");
    if (stack) {
      stack.style.display = "flex";
      stack.innerHTML = `<div style="color:#E2E8F0; padding:2rem; text-align:center; font-weight:600;">⏳ Menyiapkan halaman PDF agar dapat dibaca langsung di layar Anda...</div>`;
    }
    if (iframe) iframe.style.display = "none";

    let pdfBytes = null;

    if (modul.pdf_data_url) {
      pdfBytes = dataUrlToUint8Array(modul.pdf_data_url);
      if (pdfBytes) {
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        activeBlobUrl = URL.createObjectURL(blob);
      }
    } else if (modul.pdf_external_url) {
      if (window.pdfjsLib) {
        try {
          activePdfDoc = await window.pdfjsLib.getDocument(modul.pdf_external_url).promise;
          await renderPdfDocPages();
          return;
        } catch (err) {
          // Jika URL eksternal diblokir CORS untuk canvas, gunakan Google Docs Embedded PDF Viewer agar tetap terbaca di HP
          if (stack) stack.style.display = "none";
          if (iframe) {
            iframe.style.display = "block";
            iframe.src = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(modul.pdf_external_url)}`;
          }
          if (pageInfoEl) pageInfoEl.textContent = "Penampil PDF Eksternal Aktif (Mobile & Desktop)";
          return;
        }
      }
    } else {
      const blob = buildRealPdfBlob(modul, selectedCourse);
      activeBlobUrl = URL.createObjectURL(blob);
      const ab = await blob.arrayBuffer();
      pdfBytes = new Uint8Array(ab);
    }

    if (pdfBytes && window.pdfjsLib) {
      try {
        activePdfDoc = await window.pdfjsLib.getDocument({ data: pdfBytes }).promise;
        await renderPdfDocPages();
        return;
      } catch (err) {
        console.warn("Fallback ke lembar A4 HTML:", err);
      }
    }

    renderFallbackA4Sheets(modul, selectedCourse);
  }

  function downloadActivePdf() {
    if (!activeModul) return;
    const safeName =
      (activeModul.title || "Soal-Modul-UTBelajar")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "") + ".pdf";

    let downloadHref = "";
    if (activeBlobUrl) {
      downloadHref = activeBlobUrl;
    } else if (activeModul.pdf_data_url) {
      downloadHref = activeModul.pdf_data_url;
    } else if (activeModul.pdf_external_url) {
      window.open(activeModul.pdf_external_url, "_blank");
      window.showToast("Membuka/mengunduh file PDF eksternal...", "info");
      return;
    } else {
      const blob = buildRealPdfBlob(activeModul, selectedCourse);
      activeBlobUrl = URL.createObjectURL(blob);
      downloadHref = activeBlobUrl;
    }

    const a = document.createElement("a");
    a.href = downloadHref;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.showToast(`Mengunduh "${safeName}"...`, "success");
  }

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

    const switchReaderView = (mode) => {
      const bookView = document.getElementById("view-open-book");
      const pdfView = document.getElementById("view-direct-pdf");
      const btnBook = document.getElementById("btn-mode-book");
      const btnPdf = document.getElementById("btn-mode-pdf");

      const isBook = mode === "book";
      if (bookView) bookView.style.display = isBook ? "block" : "none";
      if (pdfView) pdfView.style.display = isBook ? "none" : "block";
      btnBook?.classList.toggle("active", isBook);
      btnPdf?.classList.toggle("active", !isBook);

      if (!isBook) {
        renderPdfDocPages();
      }
    };

    document.getElementById("btn-mode-book")?.addEventListener("click", () => switchReaderView("book"));
    document.getElementById("btn-mode-pdf")?.addEventListener("click", () => switchReaderView("pdf"));
    document.getElementById("btn-book-switch-pdf")?.addEventListener("click", () => switchReaderView("pdf"));
    document.getElementById("btn-back-to-book-mode")?.addEventListener("click", () => switchReaderView("book"));

    document.getElementById("btn-pdf-zoom-in")?.addEventListener("click", () => {
      currentPdfZoom = Math.min(2.0, +(currentPdfZoom + 0.2).toFixed(2));
      renderPdfDocPages();
    });

    document.getElementById("btn-pdf-zoom-out")?.addEventListener("click", () => {
      currentPdfZoom = Math.max(0.6, +(currentPdfZoom - 0.2).toFixed(2));
      renderPdfDocPages();
    });

    document.getElementById("btn-pdf-zoom-reset")?.addEventListener("click", () => {
      currentPdfZoom = 1.0;
      renderPdfDocPages();
    });

    document.getElementById("btn-book-prev-spread")?.addEventListener("click", () => {
      if (activeSpreadIndex > 0) {
        activeSpreadIndex--;
        renderBookSpread();
      }
    });

    document.getElementById("btn-book-next-spread")?.addEventListener("click", () => {
      if (activeModul && Array.isArray(activeModul.spreads) && activeSpreadIndex < activeModul.spreads.length - 1) {
        activeSpreadIndex++;
        renderBookSpread();
      }
    });

    document.getElementById("btn-download-modul-pdf")?.addEventListener("click", downloadActivePdf);
    document.getElementById("btn-download-modul-pdf-bottom")?.addEventListener("click", downloadActivePdf);
  }

  // ============================================================================
  // PANEL MANAJEMEN KHUSUS ADMIN (TAMBAH, EDIT/UBAH, HAPUS)
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

    // 1. Form Prodi (Tambah & Edit)
    const formProdi = document.getElementById("form-madmin-prodi");
    const cancelProdiBtn = document.getElementById("btn-cancel-m-prodi");
    cancelProdiBtn?.addEventListener("click", () => {
      formProdi?.reset();
      document.getElementById("m-prodi-edit-id").value = "";
      document.getElementById("btn-submit-m-prodi").textContent = "+ Simpan Prodi";
      cancelProdiBtn.style.display = "none";
    });

    formProdi?.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = document.getElementById("m-prodi-edit-id")?.value;
      const code = document.getElementById("m-prodi-code")?.value.trim().toUpperCase();
      const name = document.getElementById("m-prodi-name")?.value.trim();
      const description = document.getElementById("m-prodi-desc")?.value.trim() || "Program studi digital.";
      if (!code || !name) return;

      const list = getProdis();
      if (editId) {
        const idx = list.findIndex((p) => p.id === editId);
        if (idx !== -1) list[idx] = { ...list[idx], code, name, description };
        window.showToast(`Program Studi "${name}" berhasil diperbarui!`, "success");
      } else {
        list.push({ id: "prodi-" + Date.now(), code, name, description });
        window.showToast(`Program Studi "${name}" berhasil ditambahkan!`, "success");
      }

      localStorage.setItem("utb_catalog_prodis", JSON.stringify(list));
      cancelProdiBtn?.click();
      renderAdminModulLists();
      renderProdiStep();
    });

    // 2. Form Mata Kuliah (Tambah & Edit)
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

    // 3. Form Buku & File PDF Modul (Tambah & Edit)
    const formModul = document.getElementById("form-madmin-modul");
    const cancelBookBtn = document.getElementById("btn-cancel-m-book");
    cancelBookBtn?.addEventListener("click", () => {
      formModul?.reset();
      document.getElementById("m-book-edit-id").value = "";
      document.getElementById("btn-submit-m-book").textContent = "+ Simpan Buku & PDF Modul";
      cancelBookBtn.style.display = "none";
    });

    formModul?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = document.getElementById("m-book-edit-id")?.value;
      const course_id = document.getElementById("m-book-course")?.value;
      const title = document.getElementById("m-book-title")?.value.trim();
      const edition = document.getElementById("m-book-edition")?.value.trim() || "Edisi 2026";
      const pdf_external_url = document.getElementById("m-book-pdf-url")?.value.trim() || "";
      const leftText = document.getElementById("m-book-left-content")?.value.trim() || "";
      const rightText = document.getElementById("m-book-right-content")?.value.trim() || "";
      const fileInput = document.getElementById("m-book-pdf-file");
      const file = fileInput?.files?.[0] || null;

      if (!course_id || !title) return;

      let pdf_data_url = "";
      if (file) {
        try {
          pdf_data_url = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Gagal membaca file PDF"));
            reader.readAsDataURL(file);
          });
        } catch (err) {
          window.showToast("Gagal membaca file PDF: " + err.message, "error");
          return;
        }
      }

      const list = getModuls();
      const spreadObj = [
        {
          leftTitle: `Materi Utama — ${title}`,
          leftText,
          rightTitle: `Soal Evaluasi Modul — ${title}`,
          rightText,
        },
      ];

      if (editId) {
        const idx = list.findIndex((m) => m.id === editId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            course_id,
            title,
            edition,
            pdf_data_url: pdf_data_url || list[idx].pdf_data_url || "",
            pdf_external_url: pdf_external_url || list[idx].pdf_external_url || "",
            spreads: spreadObj,
          };
        }
        window.showToast(`Buku Modul "${title}" berhasil diperbarui!`, "success");
      } else {
        list.push({
          id: "mod-" + Date.now(),
          course_id,
          title,
          edition,
          pdf_data_url,
          pdf_external_url,
          spreads: spreadObj,
        });
        window.showToast(`Buku & PDF Modul "${title}" berhasil ditambahkan!`, "success");
      }

      try {
        localStorage.setItem("utb_catalog_moduls", JSON.stringify(list));
      } catch (quotaErr) {
        window.showToast("Ukuran file PDF terlalu besar untuk penyimpanan browser lokal. Gunakan file < 3MB atau Link URL PDF.", "warning");
        return;
      }

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
        btn.addEventListener("click", () => {
          const updated = getProdis().filter((p) => p.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_prodis", JSON.stringify(updated));
          window.showToast("Program studi berhasil dihapus.", "info");
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

    // List 3: Buku & PDF Modul
    const modulListEl = document.getElementById("madmin-list-modul");
    if (modulListEl) {
      modulListEl.innerHTML = moduls
        .map((m) => {
          const cObj = courses.find((c) => c.id === m.course_id);
          const hasCustomPdf = Boolean(m.pdf_data_url || m.pdf_external_url);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0.95rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: 10px; gap: 0.75rem; flex-wrap: wrap;">
              <div>
                <div style="font-weight: 800; color: var(--primary-navy);">${window.escapeHtml(m.title)}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary);">
                  Mata Kuliah: <strong>${window.escapeHtml(cObj?.code || "-")} - ${window.escapeHtml(cObj?.name || "-")}</strong> • ${window.escapeHtml(m.edition || "Edisi 2026")} •
                  <span style="color: var(--success); font-weight: 700;">${hasCustomPdf ? "File PDF Kustom Terlampir" : "PDF Otomatis Siap Baca & Unduh"}</span>
                </div>
              </div>
              <div style="display: flex; gap: 0.4rem;">
                <button type="button" class="btn btn-soft btn-sm btn-preview-mbook" data-id="${m.id}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Buka Buku</button>
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
          const sp = item.spreads?.[0] || {};
          document.getElementById("m-book-edit-id").value = item.id;
          document.getElementById("m-book-course").value = item.course_id;
          document.getElementById("m-book-title").value = item.title;
          document.getElementById("m-book-edition").value = item.edition || "Edisi 2026";
          document.getElementById("m-book-pdf-url").value = item.pdf_external_url || "";
          document.getElementById("m-book-left-content").value = sp.leftText || "";
          document.getElementById("m-book-right-content").value = sp.rightText || "";
          document.getElementById("btn-submit-m-book").textContent = "Simpan Perubahan Modul";
          document.getElementById("btn-cancel-m-book").style.display = "inline-flex";
        });
      });

      modulListEl.querySelectorAll(".btn-del-mbook").forEach((btn) => {
        btn.addEventListener("click", () => {
          const updated = getModuls().filter((m) => m.id !== btn.dataset.id);
          localStorage.setItem("utb_catalog_moduls", JSON.stringify(updated));
          window.showToast("Buku & PDF Modul berhasil dihapus.", "info");
          renderAdminModulLists();
        });
      });
    }
  }
})();
