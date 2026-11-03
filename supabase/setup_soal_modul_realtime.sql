-- ==============================================================================
-- SKRIP RESMI SETUP SOAL MODUL BERSIH & REALTIME SUPABASE
-- Komponen: Program Studi, Mata Kuliah, dan Buku & PDF Modul
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
-- Relasi langsung ke study_programs (ON DELETE CASCADE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- Relasi langsung ke courses (ON DELETE CASCADE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.moduls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
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
-- 6. PENGAKTIFAN REALTIME PENUH (SUPABASE REALTIME REPLICATION)
-- Agar perubahan dari sisi Admin Web / Supabase langsung terupdate detik itu juga
-- ==============================================================================
-- REPLICA IDENTITY FULL memastikan payload DELETE/UPDATE memuat data lengkap
ALTER TABLE public.study_programs REPLICA IDENTITY FULL;
ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER TABLE public.moduls REPLICA IDENTITY FULL;

-- Daftarkan ketiga tabel ke publikasi realtime Supabase
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

    -- Daftarkan juga question_sets jika tabel sudah dibuat
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
