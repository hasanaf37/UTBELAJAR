const fs = require('fs');

const currentQuestions = JSON.parse(fs.readFileSync('scratch/stsi4207_questions.json', 'utf8'));

// Fix duplicate id at index 68
if (currentQuestions[68] && currentQuestions[68].id === 'q-stsi4207-m1-tf2-09') {
  currentQuestions[68].id = 'q-stsi4207-m3-tf2-09';
}

const modul9Questions = [
  // Modul 9 Tes Formatif 1
  {
    id: 'q-stsi4207-m9-tf1-01',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'SDLC digunakan secara resmi sejak ....',
    option_a: '1960',
    option_b: '1970',
    option_c: '2010',
    option_d: '1980',
    correct_option: 'B',
    explanation: 'System Development Life Cycle (SDLC) mulai diperkenalkan dan digunakan secara formal dalam rekayasa perangkat lunak dan sistem informasi pada era tahun 1970-an.'
  },
  {
    id: 'q-stsi4207-m9-tf1-02',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Komputerisasi proses penggajian merupakan contoh ....',
    option_a: 'otomatisasi proses bisnis',
    option_b: 'rasionalisasi proses bisnis',
    option_c: 'perancangan ulang proses bisnis',
    option_d: 'pergeseran paradigma',
    correct_option: 'A',
    explanation: 'Mengubah proses penggajian manual menjadi terkomputerisasi merupakan bentuk otomatisasi proses bisnis standar.'
  },
  {
    id: 'q-stsi4207-m9-tf1-03',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Gojek merupakan contoh dari ....',
    option_a: 'otomatisasi proses bisnis',
    option_b: 'rasionalisasi proses bisnis',
    option_c: 'perancangan ulang proses bisnis',
    option_d: 'pergeseran paradigma',
    correct_option: 'D',
    explanation: 'Gojek merevolusi model industri transportasi dan pemesanan layanan on-demand, sehingga termasuk dalam kategori pergeseran paradigma (paradigm shift).'
  },
  {
    id: 'q-stsi4207-m9-tf1-04',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Pengembangan sistem pada masa tutup pembukuan tidak layak secara ....',
    option_a: 'teknis',
    option_b: 'hukum',
    option_c: 'ekonomis',
    option_d: 'jadwal',
    correct_option: 'D',
    explanation: 'Melakukan implementasi atau migrasi sistem bertepatan dengan masa tutup buku dapat mengganggu operasional vital, sehingga dinilai tidak layak dari aspek jadwal (schedule feasibility).'
  },
  {
    id: 'q-stsi4207-m9-tf1-05',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Jika suatu sistem informasi di perusahaan eceran membutuhkan komputer super, maka tidak layak secara ....',
    option_a: 'teknis',
    option_b: 'hukum',
    option_c: 'ekonomis',
    option_d: 'jadwal',
    correct_option: 'A',
    explanation: 'Penggunaan superkomputer pada toko ritel umum dinilai tidak layak secara teknis (technical feasibility) karena spesifikasi infrastruktur berlebihan dan tidak selaras dengan arsitektur teknis yang diperlukan.'
  },
  {
    id: 'q-stsi4207-m9-tf1-06',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Program penghitung pajak salah menerapkan tarif PPh Pasal 25 berarti tidak layak secara ....',
    option_a: 'teknis',
    option_b: 'hukum',
    option_c: 'ekonomis',
    option_d: 'jadwal',
    correct_option: 'B',
    explanation: 'Kesalahan penerapan aturan perpajakan yang sah melanggar regulasi perundang-undangan sehingga sistem dinilai tidak layak secara hukum (legal feasibility).'
  },
  {
    id: 'q-stsi4207-m9-tf1-07',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Pengembangan sistem informasi yang mahal dan lebih mahal daripada manfaatnya tidak layak secara ....',
    option_a: 'teknis',
    option_b: 'hukum',
    option_c: 'ekonomis',
    option_d: 'jadwal',
    correct_option: 'C',
    explanation: 'Apabila total estimasi biaya lebih besar dibandingkan nilai manfaat yang dihasilkan (cost > benefit), sistem dinyatakan tidak layak secara ekonomis (economic feasibility).'
  },
  {
    id: 'q-stsi4207-m9-tf1-08',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Pemangku kepentingan mana yang sebaiknya diikutsertakan dalam pengembangan sistem informasi ....',
    option_a: 'pemerintah',
    option_b: 'konsumen',
    option_c: 'pengguna',
    option_d: 'pemegang saham',
    correct_option: 'C',
    explanation: 'Pengguna langsung (end-users) memegang peranan krusial untuk memastikan antarmuka dan fungsionalitas sistem baru sesuai dengan proses bisnis nyata di lapangan.'
  },
  {
    id: 'q-stsi4207-m9-tf1-09',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Pemangku kepentingan yang terkait dengan kelayakan secara hukum ....',
    option_a: 'pemerintah',
    option_b: 'konsumen',
    option_c: 'pengguna',
    option_d: 'pemegang saham',
    correct_option: 'A',
    explanation: 'Lembaga pemerintah merupakan regulator yang menerbitkan regulasi, undang-undang, serta standar kepatuhan hukum yang harus dipatuhi sistem informasi.'
  },
  {
    id: 'q-stsi4207-m9-tf1-10',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Alat bantu aplikasi komputer untuk mengembangkan sistem informasi ....',
    option_a: 'CASE',
    option_b: 'CAST',
    option_c: 'CEASE',
    option_d: 'CARD',
    correct_option: 'A',
    explanation: 'CASE (Computer-Aided Software Engineering) merupakan perangkat lunak otomatisasi yang mendukung proses pemodelan, perancangan, dan pembangkitan kode sistem.'
  },
  // Modul 9 Tes Formatif 2
  {
    id: 'q-stsi4207-m9-tf2-01',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Ukuran kesuksesan proyek adalah ....',
    option_a: 'tepat waktu dan anggaran',
    option_b: 'anggaran dihabiskan',
    option_c: 'selesai lebih cepat',
    option_d: 'laporan lengkap',
    correct_option: 'A',
    explanation: 'Tolok ukur keberhasilan proyek secara umum diukur dari ketepatan waktu penyelesaian (on-time), kepatuhan terhadap alokasi anggaran (on-budget), serta kesesuaian dengan ruang lingkup (on-scope).'
  },
  {
    id: 'q-stsi4207-m9-tf2-02',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Yang bukan variabel utama keberhasilan proyek adalah ....',
    option_a: 'pemasok',
    option_b: 'risiko',
    option_c: 'waktu',
    option_d: 'kualitas',
    correct_option: 'A',
    explanation: 'Lima variabel utama dalam manajemen proyek adalah ruang lingkup (scope), waktu (time), biaya (cost), kualitas (quality), dan risiko (risk). Pemasok merupakan pihak eksternal, bukan variabel kendali inti proyek.'
  },
  {
    id: 'q-stsi4207-m9-tf2-03',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Keamanan sistem informasi masuk dalam kategori ....',
    option_a: 'must have',
    option_b: 'should have',
    option_c: 'could have',
    option_d: 'will not have',
    correct_option: 'A',
    explanation: 'Menggunakan metode prioritas MoSCoW, keamanan data dan akses sistem informasi merupakan kebutuhan mutlak/kritis (must have) yang tidak dapat ditiadakan.'
  },
  {
    id: 'q-stsi4207-m9-tf2-04',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Bagi perusahaan jasa, sistem informasi persediaan dagangan termasuk kategori ....',
    option_a: 'must have',
    option_b: 'should have',
    option_c: 'could have',
    option_d: 'will not have',
    correct_option: 'D',
    explanation: 'Karena perusahaan jasa tidak menjual persediaan barang fisik berwujud, sistem inventarisasi barang dagangan masuk ke dalam kategori tidak diperlukan (\'will not have\').'
  },
  {
    id: 'q-stsi4207-m9-tf2-05',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Bagi perusahaan dagang, sistem informasi persediaan dagangan termasuk kategori ....',
    option_a: 'must have',
    option_b: 'should have',
    option_c: 'could have',
    option_d: 'will not have',
    correct_option: 'A',
    explanation: 'Inti operasional perusahaan dagang bertumpu pada perputaran barang persediaan fisik, sehingga sistem informasi persediaan dagangan adalah syarat wajib (must have).'
  },
  {
    id: 'q-stsi4207-m9-tf2-06',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Bagi perusahaan konsultan manajemen, sistem informasi pengadaan barang termasuk kategori ....',
    option_a: 'must have',
    option_b: 'should have',
    option_c: 'could have',
    option_d: 'will not have',
    correct_option: 'C',
    explanation: 'Fokus bisnis konsultan manajemen adalah keahlian profesional dan layanan konsultasi non-fisik, sehingga pengadaan barang fisik hanya bernilai pendukung opsional (could have).'
  },
  {
    id: 'q-stsi4207-m9-tf2-07',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Yang menunjukkan rencana dan realisasi proyek ....',
    option_a: 'CPM',
    option_b: 'PERT',
    option_c: 'Gantt Chart',
    option_d: 'Chart of Account',
    correct_option: 'C',
    explanation: 'Gantt Chart menampilkan perbandingan visual secara berdampingan antara jadwal rencana kegiatan dan progres riil realisasi tahapan proyek pada lintasan waktu.'
  },
  {
    id: 'q-stsi4207-m9-tf2-08',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Yang tidak menunjukkan titik kritis suatu proyek ....',
    option_a: 'CPM',
    option_b: 'PERT',
    option_c: 'Gantt Chart',
    option_d: 'Chart of Account',
    correct_option: 'D',
    explanation: 'Chart of Account adalah daftar kode akun pembukuan akuntansi keuangan, bukan metodologi perencanaan jalur kritis (critical path) manajemen proyek.'
  },
  {
    id: 'q-stsi4207-m9-tf2-09',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Ukuran proyek dinilai dengan ....',
    option_a: 'estimasi',
    option_b: 'prediksi',
    option_c: 'biaya dan waktu pengerjaan',
    option_d: 'intuisi',
    correct_option: 'C',
    explanation: 'Besaran atau skala sebuah proyek dinilai secara kuantitatif melalui estimasi alokasi total biaya anggaran dan lama waktu pengerjaan proyek tersebut.'
  },
  {
    id: 'q-stsi4207-m9-tf2-10',
    question_set_id: 'set-stsi4207-m7-9',
    question_text: 'Potensi munculnya masalah yang mengganggu penyelesaian proyek adalah ....',
    option_a: 'risiko',
    option_b: 'biaya',
    option_c: 'waktu',
    option_d: 'tenaga',
    correct_option: 'A',
    explanation: 'Risiko proyek merupakan probabilitas timbulnya kejadian tak terduga yang dapat menghambat, menunda, atau menggagalkan ketercapaian target proyek.'
  }
];

// Combine all questions
const base170 = currentQuestions.filter(q => !q.id.startsWith('q-stsi4207-m9-'));
const all190 = [...base170, ...modul9Questions];

// Assign question_set_id
all190.forEach(q => {
  const match = q.id.match(/q-stsi4207-m(\d+)-/);
  if (match) {
    const modNum = parseInt(match[1], 10);
    if (modNum >= 1 && modNum <= 3) {
      q.question_set_id = 'set-stsi4207-m1-3';
    } else if (modNum >= 4 && modNum <= 6) {
      q.question_set_id = 'set-stsi4207-m4-6';
    } else if (modNum >= 7 && modNum <= 9) {
      q.question_set_id = 'set-stsi4207-m7-9';
    }
  }
});

const p1 = all190.filter(q => q.question_set_id === 'set-stsi4207-m1-3');
const p2 = all190.filter(q => q.question_set_id === 'set-stsi4207-m4-6');
const p3 = all190.filter(q => q.question_set_id === 'set-stsi4207-m7-9');

console.log('Total questions:', all190.length);
console.log('Paket 1 (Modul 1-3):', p1.length);
console.log('Paket 2 (Modul 4-6):', p2.length);
console.log('Paket 3 (Modul 7-9):', p3.length);

// Save to scratch/stsi4207_questions.json
fs.writeFileSync('scratch/stsi4207_questions.json', JSON.stringify(all190, null, 2), 'utf8');

// Save to js/stsi4207_questions.js
const jsContent = `/* ==============================================================================
   UTBELAJAR - BANK SOAL LENGKAP STSI4207 / MSIM4207 (SISTEM INFORMASI MANAJEMEN)
   Modul 1 s.d. Modul 9 (190 Butir Soal Terformat Sesuai Modul Resmi UT)
   Dibagi Menjadi 3 Paket Latihan Mandiri:
     1. Paket Modul 1 - 3 (70 Butir Soal)
     2. Paket Modul 4 - 6 (60 Butir Soal)
     3. Paket Modul 7 - 9 (60 Butir Soal)
   Abaikan Glosarium Modul 1 - 9 (Halaman 51 - 60).
   Copyright HasanAF 2026
   ============================================================================== */

window.STSI4207_PACKAGES = [
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
    description: "Paket latihan mandiri Modul 4 sampai 6 (Infrastruktur TI & Telekomunikasi, Keamanan Sistem Informasi, serta Manajemen Data & Pengetahuan).",
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
  }
];

window.STSI4207_QUESTIONS = ${JSON.stringify(all190, null, 2)};
`;

fs.writeFileSync('js/stsi4207_questions.js', jsContent, 'utf8');
console.log('Successfully written js/stsi4207_questions.js');
