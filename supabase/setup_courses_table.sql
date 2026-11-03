-- ==============================================================================
-- SKRIP PEMBUATAN TABEL MATA KULIAH (courses) DI SUPABASE
-- Jalankan di menu SQL Editor pada Dashboard Supabase Anda
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    study_program_id UUID REFERENCES public.study_programs(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(study_program_id, code)
);

CREATE INDEX IF NOT EXISTS idx_courses_study_program ON public.courses(study_program_id);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to courses" ON public.courses;
CREATE POLICY "Allow full access to courses"
    ON public.courses
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Isi awal Mata Kuliah untuk Program Studi Sistem Informasi (SI) bila SI tersedia
INSERT INTO public.courses (id, study_program_id, code, name, description)
SELECT * FROM (VALUES
    ('c-msim4207-01', 'b1111111-1111-1111-1111-111111111111'::UUID, 'MSIM4207', 'Sistem Informasi dalam Bisnis', 'Membahas konsep sistem informasi, tipe sistem (TPS, DSS, dll.), dan infrastruktur TI dalam organisasi bisnis.'),
    ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111'::UUID, 'MSIM4201', 'Analisis dan Perancangan Sistem', 'Konsep siklus hidup pengembangan sistem (SDLC), pemodelan UML, dan use case diagram.'),
    ('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111'::UUID, 'MSIM4202', 'Sistem Basis Data', 'Normalisasi data, Entity-Relationship Diagram (ERD), sintaks SQL, dan transaksi database.')
) AS v(id, study_program_id, code, name, description)
WHERE EXISTS (SELECT 1 FROM public.study_programs sp WHERE sp.id = v.study_program_id)
ON CONFLICT (study_program_id, code) DO NOTHING;
