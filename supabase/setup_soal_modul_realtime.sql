-- ==============================================================================
-- SKRIP RESMI SETUP SOAL MODUL BERSIH & REALTIME SUPABASE
-- Komponen: Program Studi, Mata Kuliah, dan Buku & PDF Modul (Tipe ID TEXT Fleksibel)
-- Jalankan skrip ini langsung di menu SQL Editor pada Dashboard Supabase Anda
-- ==============================================================================

-- 1. Pastikan ekstensi UUID aktif
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABEL 1: PROGRAM STUDI (study_programs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_programs_code ON public.study_programs(code);

-- ==============================================================================
-- 3. TABEL 2: MATA KULIAH (courses)
-- Menggunakan id TEXT agar mendukung ID custom seperti 'c-msim4207-01' maupun UUID
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    study_program_id UUID NOT NULL REFERENCES public.study_programs(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_prodi_course_code UNIQUE(study_program_id, code)
);

CREATE INDEX IF NOT EXISTS idx_courses_study_program ON public.courses(study_program_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(code);

-- ==============================================================================
-- 4. TABEL 3: BUKU & PDF MODUL (moduls)
-- Menggunakan id TEXT dan course_id TEXT agar sinkron instan dengan frontend
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.moduls (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    edition VARCHAR(100) DEFAULT 'Modul 01',
    pdf_file_url TEXT,
    pdf_external_url TEXT,
    storage_path TEXT,
    cloud_file_id TEXT,
    cloud_chunks INT DEFAULT 0,
    cloud_mime VARCHAR(100),
    images JSONB DEFAULT '[]'::jsonb,
    page_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moduls_course_id ON public.moduls(course_id);

-- Migrasi otomatis jika tabel courses atau moduls sebelumnya dibuat bertipe UUID
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE IF EXISTS public.moduls DROP CONSTRAINT IF EXISTS moduls_course_id_fkey;
        ALTER TABLE IF EXISTS public.courses ALTER COLUMN id TYPE TEXT USING id::TEXT;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'moduls' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE IF EXISTS public.moduls ALTER COLUMN id TYPE TEXT USING id::TEXT;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'moduls' AND column_name = 'course_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE IF EXISTS public.moduls ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
    END IF;

    -- Pasang kembali constraint foreign key jika belum terpasang
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' AND constraint_name = 'moduls_course_id_fkey'
    ) THEN
        ALTER TABLE public.moduls ADD CONSTRAINT moduls_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ==============================================================================
-- 5. KEAMANAN & AKSES (Row Level Security - RLS)
-- Memungkinkan Admin & User membaca serta menulis data secara instan
-- ==============================================================================
ALTER TABLE public.study_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moduls ENABLE ROW LEVEL SECURITY;

-- Policy Program Studi
DROP POLICY IF EXISTS "Public access for study_programs" ON public.study_programs;
CREATE POLICY "Public access for study_programs"
    ON public.study_programs FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Policy Mata Kuliah
DROP POLICY IF EXISTS "Public access for courses" ON public.courses;
CREATE POLICY "Public access for courses"
    ON public.courses FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Policy Modul
DROP POLICY IF EXISTS "Public access for moduls" ON public.moduls;
CREATE POLICY "Public access for moduls"
    ON public.moduls FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 6. STORAGE BUCKET: `modul-pdfs` (Untuk Menyimpan File Dokumen PDF Asli)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('modul-pdfs', 'modul-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read modul-pdfs" ON storage.objects;
CREATE POLICY "Public read modul-pdfs"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'modul-pdfs');

DROP POLICY IF EXISTS "Allow upload modul-pdfs" ON storage.objects;
CREATE POLICY "Allow upload modul-pdfs"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'modul-pdfs');

DROP POLICY IF EXISTS "Allow update modul-pdfs" ON storage.objects;
CREATE POLICY "Allow update modul-pdfs"
    ON storage.objects FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'modul-pdfs');

DROP POLICY IF EXISTS "Allow delete modul-pdfs" ON storage.objects;
CREATE POLICY "Allow delete modul-pdfs"
    ON storage.objects FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'modul-pdfs');

-- ==============================================================================
-- 7. PENGAKTIFAN REALTIME PENUH (SUPABASE REALTIME REPLICATION)
-- Agar perubahan dari sisi Admin Web / Supabase langsung terupdate detik itu juga
-- ==============================================================================
ALTER TABLE public.study_programs REPLICA IDENTITY FULL;
ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER TABLE public.moduls REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'study_programs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.study_programs;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'courses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'moduls'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.moduls;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_sets') THEN
        ALTER TABLE public.question_sets REPLICA IDENTITY FULL;
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'question_sets'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.question_sets;
        END IF;
    END IF;
END $$;


-- ==============================================================================
-- 8. AKTIFKAN BARIS PENYIMPANAN SISTEM & CHUNK PDF AGAR BISA DIBACA SEMUA PENGGUNA
-- ==============================================================================
UPDATE public.study_programs 
SET is_active = true 
WHERE code LIKE '_SYS_%' OR code LIKE '_P_%';


-- ==============================================================================
-- 9. DATA SEED BAWAAN MODUL & MATAKULIAH (TERMASUK MODUL 1-3, 4-6, 7-9 & LENGKAP)
-- ==============================================================================
INSERT INTO public.study_programs (id, code, name, description, is_active)
VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'SI', 'Sistem Informasi', 'Studi rekayasa perangkat lunak, sistem informasi bisnis, basis data, dan transformasi digital.', true),
  ('b2222222-2222-2222-2222-222222222222', 'MNJ', 'Manajemen', 'Fokus pada kepemimpinan strategis, manajemen operasional, dan pemasaran.', true),
  ('b3333333-3333-3333-3333-333333333333', 'ILKOM', 'Ilmu Komunikasi', 'Kajian media massa, public relations, dan komunikasi organisasi digital.', true),
  ('b4444444-4444-4444-4444-444444444444', 'AKT', 'Akuntansi', 'Penguasaan akuntansi keuangan, audit, sistem informasi akuntansi, dan perpajakan.', true)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

INSERT INTO public.courses (id, study_program_id, code, name, description)
VALUES 
  ('c-msim4207-01', 'b1111111-1111-1111-1111-111111111111', 'MSIM4207', 'Sistem Informasi Manajemen', 'Membahas konsep sistem informasi, tipe sistem (TPS, DSS, dll.), infrastruktur TI, dan model bisnis digital.')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.moduls (id, course_id, title, edition, pdf_file_url, page_count)
VALUES 
  ('mod-msim4207-01-03', 'c-msim4207-01', 'MSIM4207 Modul 01 - 03: Sistem Informasi Manajemen', 'MSIM4207 | Modul 01 - 03 (18 Halaman)', 'assets/modul/MSIM4207-Modul-01-03.pdf', 18),
  ('mod-msim4207-04-06', 'c-msim4207-01', 'MSIM4207 Modul 04 - 06: Sistem Informasi Manajemen', 'MSIM4207 | Modul 04 - 06 (17 Halaman)', 'assets/modul/MSIM4207-Modul-04-06.pdf', 17),
  ('mod-msim4207-07-09', 'c-msim4207-01', 'MSIM4207 Modul 07 - 09: Sistem Informasi Manajemen', 'MSIM4207 | Modul 07 - 09 (15 Halaman)', 'assets/modul/MSIM4207-Modul-07-09.pdf', 15),
  ('mod-msim4207-full', 'c-msim4207-01', 'MSIM4207 Modul Lengkap (Modul 01 - 09)', 'MSIM4207 | Modul Lengkap (60 Halaman)', 'assets/modul/Sistem-Informasi-Manajemen.pdf', 60),
  ('mod-msim4207-01', 'c-msim4207-01', 'MSIM4207 Modul 01: Sistem Informasi dalam Bisnis (Scan CamScanner)', 'MSIM4207 | Modul 01 (Tes Formatif 1)', 'assets/modul/MSIM4207-Modul-01.pdf', 3)
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title, edition = EXCLUDED.edition, pdf_file_url = EXCLUDED.pdf_file_url, page_count = EXCLUDED.page_count;
