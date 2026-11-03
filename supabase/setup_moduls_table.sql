-- ==============================================================================
-- SKRIP PEMBUATAN TABEL MODULS & STORAGE BUCKET FILE PDF DI SUPABASE
-- Jalankan di menu SQL Editor pada Dashboard Supabase Anda -> Klik Run
-- ==============================================================================

-- 1. Buat Tabel `moduls` (Daftar Buku / Soal Modul per Mata Kuliah)
CREATE TABLE IF NOT EXISTS public.moduls (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    edition VARCHAR(100) DEFAULT 'Modul 01',
    pdf_file_url TEXT,
    pdf_external_url TEXT,
    storage_path TEXT,
    cloud_file_id TEXT,
    cloud_chunks INTEGER DEFAULT 0,
    cloud_mime VARCHAR(100),
    images JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moduls_course_id ON public.moduls(course_id);

ALTER TABLE public.moduls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to moduls" ON public.moduls;
CREATE POLICY "Allow full access to moduls"
    ON public.moduls
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Buat Bucket Supabase Storage `modul-pdfs` untuk menyimpan file PDF asli
INSERT INTO storage.buckets (id, name, public)
VALUES ('modul-pdfs', 'modul-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Izin RLS pada Storage untuk Bucket `modul-pdfs` (Baca, Upload, Ubah, Hapus)
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
