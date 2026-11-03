const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('scratch/stsi4207_questions.json', 'utf8'));

function escapeSql(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

let sql = `-- ==============================================================================
-- UTBELAJAR - SEED DATA BANK SOAL STSI4207 / MSIM4207 (SISTEM INFORMASI MANAJEMEN)
-- Modul 1 s.d. Modul 9 (Total 190 Butir Soal Terbagi 3 Paket)
-- Copyright HasanAF 2026
-- ==============================================================================

-- 1. Pastikan Program Studi Sistem Informasi terdaftar
INSERT INTO public.study_programs (id, code, name, description)
VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'SI', 'Sistem Informasi', 'Studi rekayasa perangkat lunak, arsitektur data, dan transformasi digital.')
ON CONFLICT (id) DO UPDATE 
SET code = EXCLUDED.code, name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. Pastikan Mata Kuliah Sistem Informasi Manajemen terdaftar
INSERT INTO public.courses (id, study_program_id, code, name, description)
VALUES 
  ('c-msim4207-01', 'b1111111-1111-1111-1111-111111111111', 'MSIM4207', 'Sistem Informasi Manajemen', 'Membahas konsep sistem informasi, model bisnis digital, infrastruktur TI, keamanan, basis data, DSS, dan perancangan sistem informasi.')
ON CONFLICT (id) DO UPDATE 
SET code = EXCLUDED.code, name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. Daftarkan 3 Paket Soal (Paket 1: Modul 1-3, Paket 2: Modul 4-6, Paket 3: Modul 7-9)
INSERT INTO public.question_sets (id, course_id, title, description, difficulty, duration_minutes, is_published)
VALUES
  ('set-stsi4207-m1-3', 'c-msim4207-01', 'Latihan Mandiri Modul 1 - 3', 'Paket latihan mandiri Modul 1 sampai 3 (Konsep SI dalam Bisnis, Kolaborasi & Keunggulan Strategis, serta Isu Sosial & Etika).', 'Menengah', 45, true),
  ('set-stsi4207-m4-6', 'c-msim4207-01', 'Latihan Mandiri Modul 4 - 6', 'Paket latihan mandiri Modul 4 sampai 6 (Infrastruktur TI & Jaringan, Keamanan SI, serta Manajemen Data & Pengetahuan).', 'Menengah', 40, true),
  ('set-stsi4207-m7-9', 'c-msim4207-01', 'Latihan Mandiri Modul 7 - 9', 'Paket latihan mandiri Modul 7 sampai 9 (Aplikasi Perusahaan & E-Commerce, DSS & Intelijen Bisnis, serta Pengembangan SI & Manajemen Proyek).', 'Menengah', 40, true)
ON CONFLICT (id) DO UPDATE 
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  duration_minutes = EXCLUDED.duration_minutes,
  is_published = EXCLUDED.is_published;

-- 4. Masukkan Seluruh 190 Butir Soal Lengkap Beserta Opsi, Kunci, dan Pembahasannya
`;

// Generate question inserts in batches of 25
const batchSize = 25;
for (let i = 0; i < questions.length; i += batchSize) {
  const batch = questions.slice(i, i + batchSize);
  sql += `\nINSERT INTO public.questions (id, question_set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, points)\nVALUES\n`;
  const rows = batch.map(q => {
    return `  (${escapeSql(q.id)}, ${escapeSql(q.question_set_id)}, ${escapeSql(q.question_text)}, ${escapeSql(q.option_a)}, ${escapeSql(q.option_b)}, ${escapeSql(q.option_c)}, ${escapeSql(q.option_d)}, ${escapeSql(q.correct_option)}, ${escapeSql(q.explanation)}, 1)`;
  });
  sql += rows.join(',\n') + '\n';
  sql += `ON CONFLICT (id) DO UPDATE SET\n  question_set_id = EXCLUDED.question_set_id,\n  question_text = EXCLUDED.question_text,\n  option_a = EXCLUDED.option_a,\n  option_b = EXCLUDED.option_b,\n  option_c = EXCLUDED.option_c,\n  option_d = EXCLUDED.option_d,\n  correct_option = EXCLUDED.correct_option,\n  explanation = EXCLUDED.explanation;\n`;
}

fs.writeFileSync('supabase/seed_stsi4207_3_packages.sql', sql, 'utf8');
console.log('Successfully written supabase/seed_stsi4207_3_packages.sql, size:', sql.length);
