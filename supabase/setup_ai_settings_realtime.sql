-- ==============================================================================
-- SKRIP SETUP TABEL KONFIGURASI AI UTBELAJAR (ai_settings) REALTIME
-- Menyimpan API Key, Provider, Model, dan Personalisasi (System Prompt)
-- Berlaku serentak untuk seluruh User & tersinkronisasi Realtime dengan Admin
-- ==============================================================================

-- 1. Buat Tabel Konfigurasi AI Terpusat
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
    model VARCHAR(100) NOT NULL DEFAULT 'gemini-2.0-flash',
    api_key TEXT DEFAULT '',
    custom_endpoint TEXT DEFAULT '',
    system_prompt TEXT DEFAULT 'Anda adalah Asisten Belajar Cerdas UTBelajar untuk mahasiswa Universitas Terbuka. Berikan penjelasan materi kuliah, panduan modul, latihan soal, dan tips belajar yang akurat, ramah, dan memotivasi.',
    temperature NUMERIC(3,2) DEFAULT 0.70,
    max_tokens INT DEFAULT 2048,
    is_active BOOLEAN DEFAULT true,
    updated_by TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Masukkan baris konfigurasi awal (Singleton / 1 Baris Utama 'default')
INSERT INTO public.ai_settings (id, provider, model, api_key, custom_endpoint, system_prompt)
VALUES (
    'default',
    'gemini',
    'gemini-2.0-flash',
    '',
    '',
    'Anda adalah Asisten Belajar Cerdas UTBelajar untuk mahasiswa Universitas Terbuka. Berikan penjelasan materi kuliah, panduan modul, latihan soal, dan tips belajar yang akurat, ramah, dan memotivasi.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Keamanan & Izin Akses (Row Level Security - RLS)
-- Mengizinkan seluruh user (siswa) membaca setting aktif, dan Admin memperbarui setting
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for ai_settings" ON public.ai_settings;
CREATE POLICY "Public read access for ai_settings"
    ON public.ai_settings FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin update access for ai_settings" ON public.ai_settings;
CREATE POLICY "Admin update access for ai_settings"
    ON public.ai_settings FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Pengaktifan Realtime Supabase (Supabase Realtime Replication)
-- REPLICA IDENTITY FULL memastikan payload perubahan terkirim lengkap ke seluruh browser
ALTER TABLE public.ai_settings REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'ai_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_settings;
    END IF;
END $$;
