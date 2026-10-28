-- ==============================================================================
-- SCHEMA UTBELAJAR - PLATFORM PEMBELAJARAN DIGITAL INDEPENDEN
-- Catatan Keamanan: TIDAK ADA kolom NIM / Nomor Mahasiswa pada skema ini.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: study_programs (Program Studi)
CREATE TABLE IF NOT EXISTS study_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABEL: profiles (Profil Pengguna, terhubung ke auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    program_studi_id UUID REFERENCES study_programs(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABEL: courses (Mata Kuliah)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_program_id UUID NOT NULL REFERENCES study_programs(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(study_program_id, code)
);

-- 5. TABEL: question_sets (Paket Latihan Soal)
CREATE TABLE IF NOT EXISTS question_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) DEFAULT 'Menengah' CHECK (difficulty IN ('Mudah', 'Menengah', 'Sulit')),
    duration_minutes INTEGER DEFAULT 30,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABEL: questions (Soal-soal Latihan)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_set_id UUID NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABEL: question_answers (Kunci Jawaban - Keamanan Khusus Server-side)
CREATE TABLE IF NOT EXISTS question_answers (
    question_id UUID PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. TABEL: quiz_attempts (Sesi Pengerjaan Latihan Pengguna)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_set_id UUID NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
    score NUMERIC(5,2) DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    unanswered_questions INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. TABEL: quiz_responses (Detail Jawaban per Soal pada Setiap Sesi)
CREATE TABLE IF NOT EXISTS quiz_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option CHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(attempt_id, question_id)
);

-- 10. TABEL: study_sessions (Pencatatan Aktivitas dan Waktu Belajar)
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 11. TABEL: ai_conversations (Sesi Percakapan Asisten AI)
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Percakapan Baru' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. TABEL: ai_messages (Pesan dalam Percakapan Asisten AI)
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEX UNTUK PERFORMA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_courses_study_program ON courses(study_program_id);
CREATE INDEX IF NOT EXISTS idx_question_sets_course ON question_sets(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_set ON questions(question_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_set ON quiz_attempts(question_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_attempt ON quiz_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON ai_messages(conversation_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Aktifkan RLS di setiap tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- 1. profiles: Pengguna hanya dapat membaca dan mengubah profilnya sendiri
CREATE POLICY "Profiles are viewable by owner" 
    ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles can be updated by owner" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles can be inserted by owner" 
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. study_programs: Publik dan pengguna dapat melihat program studi aktif
CREATE POLICY "Public can view active study programs" 
    ON study_programs FOR SELECT USING (is_active = true);

-- 3. courses: Publik dan pengguna dapat membaca mata kuliah
CREATE POLICY "Public can view courses" 
    ON courses FOR SELECT USING (true);

-- 4. question_sets: Pengguna dapat melihat paket latihan yang dipublikasikan
CREATE POLICY "Public can view published question sets" 
    ON question_sets FOR SELECT USING (is_published = true);

-- 5. questions: Pengguna terautentikasi dapat melihat soal
CREATE POLICY "Authenticated users can view questions" 
    ON questions FOR SELECT TO authenticated USING (true);

-- 6. question_answers: SANGAT DIBATASI.
-- TIDAK ADA SELECT policy untuk publik / authenticated biasa!
-- Kunci jawaban hanya dapat dibaca melalui Server Function (SECURITY DEFINER)
-- Ini mencegah pengguna membongkar kunci jawaban dari inspect element/query browser.

-- 7. quiz_attempts: Pengguna hanya dapat membaca dan memanipulasi riwayatnya sendiri
CREATE POLICY "Users can view own quiz attempts" 
    ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz attempts" 
    ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts" 
    ON quiz_attempts FOR UPDATE USING (auth.uid() = user_id);

-- 8. quiz_responses: Pengguna hanya dapat melihat respons latihan miliknya
CREATE POLICY "Users can view own quiz responses" 
    ON quiz_responses FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quiz_attempts 
            WHERE quiz_attempts.id = quiz_responses.attempt_id 
            AND quiz_attempts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own quiz responses" 
    ON quiz_responses FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_attempts 
            WHERE quiz_attempts.id = quiz_responses.attempt_id 
            AND quiz_attempts.user_id = auth.uid()
        )
    );

-- 9. study_sessions: Pengguna hanya dapat melihat dan menambah waktu belajar miliknya
CREATE POLICY "Users can view own study sessions" 
    ON study_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own study sessions" 
    ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. ai_conversations: Pengguna hanya dapat mengelola percakapannya sendiri
CREATE POLICY "Users can view own ai conversations" 
    ON ai_conversations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai conversations" 
    ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai conversations" 
    ON ai_conversations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai conversations" 
    ON ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- 11. ai_messages: Pengguna hanya dapat mengakses pesan di percakapan miliknya
CREATE POLICY "Users can view own ai messages" 
    ON ai_messages FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_messages.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own ai messages" 
    ON ai_messages FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_messages.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 0. Trigger otomatis konfirmasi akun saat daftar menggunakan Nama & Password
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email_confirmed_at IS NULL THEN
        NEW.email_confirmed_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user();

-- Konfirmasi seluruh akun yang sudah terdaftar sebelumnya (termasuk user hasan)
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- 1. Trigger untuk sinkronisasi profil baru saat user mendaftar di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, program_studi_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Siswa UTBelajar'),
        (new.raw_user_meta_data->>'program_studi_id')::UUID
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. SECURE RPC: submit_quiz_attempt
-- Menilai jawaban di sisi server secara aman tanpa membocorkan kunci ke frontend
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
    p_question_set_id UUID,
    p_responses JSONB, -- Array of objects: [{"question_id": "...", "selected_option": "A"}]
    p_duration_seconds INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_attempt_id UUID;
    v_total_questions INTEGER := 0;
    v_correct_count INTEGER := 0;
    v_wrong_count INTEGER := 0;
    v_unanswered_count INTEGER := 0;
    v_score NUMERIC(5,2) := 0;
    v_item JSONB;
    v_q_id UUID;
    v_selected CHAR(1);
    v_correct CHAR(1);
    v_is_correct BOOLEAN;
    v_result_responses JSONB := '[]'::JSONB;
    v_explanation TEXT;
    v_q_record RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Pengguna belum terautentikasi';
    END IF;

    -- Hitung total soal pada paket ini
    SELECT COUNT(*) INTO v_total_questions
    FROM questions
    WHERE question_set_id = p_question_set_id;

    IF v_total_questions = 0 THEN
        RAISE EXCEPTION 'Paket soal tidak memiliki pertanyaan';
    END IF;

    -- Buat record attempt baru
    INSERT INTO quiz_attempts (
        user_id,
        question_set_id,
        total_questions,
        duration_seconds,
        started_at,
        completed_at
    ) VALUES (
        v_user_id,
        p_question_set_id,
        v_total_questions,
        p_duration_seconds,
        NOW() - (p_duration_seconds || ' seconds')::INTERVAL,
        NOW()
    ) RETURNING id INTO v_attempt_id;

    -- Evaluasi setiap soal dalam paket
    FOR v_q_record IN 
        SELECT q.id, q.explanation, qa.correct_option 
        FROM questions q
        LEFT JOIN question_answers qa ON qa.question_id = q.id
        WHERE q.question_set_id = p_question_set_id
    LOOP
        v_selected := NULL;
        v_correct := v_q_record.correct_option;
        v_explanation := v_q_record.explanation;

        -- Cari apakah user memilih jawaban untuk soal ini
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_responses)
        LOOP
            IF (v_item->>'question_id')::UUID = v_q_record.id THEN
                v_selected := v_item->>'selected_option';
                EXIT;
            END IF;
        END LOOP;

        IF v_selected IS NULL OR v_selected = '' THEN
            v_unanswered_count := v_unanswered_count + 1;
            v_is_correct := false;
        ELSIF v_selected = v_correct THEN
            v_correct_count := v_correct_count + 1;
            v_is_correct := true;
        ELSE
            v_wrong_count := v_wrong_count + 1;
            v_is_correct := false;
        END IF;

        -- Catat jawaban ke quiz_responses
        INSERT INTO quiz_responses (
            attempt_id,
            question_id,
            selected_option,
            is_correct
        ) VALUES (
            v_attempt_id,
            v_q_record.id,
            v_selected,
            v_is_correct
        );

        -- Bangun objek detail jawaban untuk pembahasan
        v_result_responses := v_result_responses || jsonb_build_object(
            'question_id', v_q_record.id,
            'selected_option', v_selected,
            'correct_option', v_correct,
            'is_correct', v_is_correct,
            'explanation', v_explanation
        );
    END LOOP;

    -- Hitung skor: (benar / total) * 100
    IF v_total_questions > 0 THEN
        v_score := ROUND((v_correct_count::NUMERIC / v_total_questions::NUMERIC) * 100, 2);
    END IF;

    -- Update skor akhir pada quiz_attempts
    UPDATE quiz_attempts
    SET 
        score = v_score,
        correct_answers = v_correct_count,
        wrong_answers = v_wrong_count,
        unanswered_questions = v_unanswered_count
    WHERE id = v_attempt_id;

    -- Catat juga ke study_sessions secara otomatis
    INSERT INTO study_sessions (
        user_id,
        activity_type,
        duration_seconds,
        started_at,
        ended_at
    ) VALUES (
        v_user_id,
        'Latihan Soal: ' || (SELECT title FROM question_sets WHERE id = p_question_set_id),
        p_duration_seconds,
        NOW() - (p_duration_seconds || ' seconds')::INTERVAL,
        NOW()
    );

    -- Kembalikan ringkasan hasil latihan
    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'score', v_score,
        'total_questions', v_total_questions,
        'correct_answers', v_correct_count,
        'wrong_answers', v_wrong_count,
        'unanswered_questions', v_unanswered_count,
        'duration_seconds', p_duration_seconds,
        'review', v_result_responses
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- DATA AWAL (SEED DATA REALISTIS UNTUK PEMBELAJARAN)
-- ==============================================================================

-- 1. Program Studi
INSERT INTO study_programs (id, code, name, description) VALUES
('b1111111-1111-1111-1111-111111111111', 'SI', 'Sistem Informasi', 'Studi rekayasa perangkat lunak, arsitektur data, dan transformasi digital.'),
('b2222222-2222-2222-2222-222222222222', 'MNJ', 'Manajemen', 'Fokus pada kepemimpinan strategis, manajemen operasional, dan pemasaran.'),
('b3333333-3333-3333-3333-333333333333', 'ILKOM', 'Ilmu Komunikasi', 'Kajian media massa, public relations, dan komunikasi organisasi digital.'),
('b4444444-4444-4444-4444-444444444444', 'AKT', 'Akuntansi', 'Penguasaan akuntansi keuangan, audit, sistem informasi akuntansi, dan perpajakan.')
ON CONFLICT (code) DO NOTHING;

-- 2. Mata Kuliah (Sistem Informasi)
INSERT INTO courses (id, study_program_id, code, name, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'MSIM4201', 'Analisis dan Perancangan Sistem', 'Konsep siklus hidup pengembangan sistem (SDLC), pemodelan UML, dan use case diagram.'),
('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'MSIM4202', 'Sistem Basis Data', 'Normalisasi data, Entity-Relationship Diagram (ERD), sintaks SQL, dan transaksi database.'),
('c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'MSIM4301', 'Rekayasa Perangkat Lunak', 'Metodologi Agile, Scrum, manajemen kualitas software, dan testing otomatis.'),
-- Mata Kuliah (Manajemen)
('c4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'EKMA4116', 'Manajemen Strategik', 'Analisis lingkungan bisnis, keunggulan bersaing, visi-misi korporasi, dan implementasi strategi.'),
('c5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 'EKMA4215', 'Manajemen Operasi', 'Perencanaan kapasitas produksi, supply chain management, dan manajemen persediaan.')
ON CONFLICT (study_program_id, code) DO NOTHING;

-- 3. Paket Latihan Soal
INSERT INTO question_sets (id, course_id, title, description, difficulty, duration_minutes, is_published) VALUES
('d1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 'Latihan Mandiri 01: Dasar SQL & Normalisasi', 'Paket latihan soal komprehensif konsep dasar basis data relasional, bentuk normalisasi (1NF-3NF), dan query SQL.', 'Menengah', 20, true),
('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Latihan Mandiri 01: SDLC & Diagram UML', 'Uji pemahaman tentang metodologi Waterfall, Agile, Use Case, dan Class Diagram.', 'Mudah', 15, true),
('d3333333-3333-3333-3333-333333333333', 'c4444444-4444-4444-4444-444444444444', 'Latihan Mandiri 01: Analisis SWOT & Strategi', 'Evaluasi pemahaman analisis SWOT, Five Forces Porter, dan strategi diferensiasi.', 'Menengah', 25, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Soal Latihan untuk Paket Basis Data (d1111111-1111-1111-1111-111111111111)
INSERT INTO questions (id, question_set_id, question_text, option_a, option_b, option_c, option_d, explanation, points) VALUES
(
    'e1111111-1111-1111-1111-111111111111',
    'd1111111-1111-1111-1111-111111111111',
    'Kunci utama yang digunakan untuk menjamin keunikan identitas suatu baris (record) dalam sebuah tabel relasional disebut...',
    'Foreign Key',
    'Primary Key',
    'Candidate Key',
    'Super Key',
    'Primary Key adalah atribut atau kumpulan atribut yang secara unik mengidentifikasi setiap baris dalam tabel relasional.',
    20
),
(
    'e2222222-2222-2222-2222-222222222222',
    'd1111111-1111-1111-1111-111111111111',
    'Suatu tabel dikatakan memenuhi Bentuk Normal Pertama (1NF) jika...',
    'Tidak memiliki ketergantungan transitif antar atribut non-kunci',
    'Semua atribut non-kunci bergantung penuh pada Primary Key',
    'Setiap kolom hanya berisi nilai tunggal (atomic) dan tidak ada grup perulangan',
    'Tabel telah terhubung dengan minimal 2 tabel relasi lain',
    'Syarat utama 1NF adalah menghilangkan multi-valued attributes atau repeating groups sehingga setiap sel hanya memiliki nilai atomik tunggal.',
    20
),
(
    'e3333333-3333-3333-3333-333333333333',
    'd1111111-1111-1111-1111-111111111111',
    'Perintah SQL yang digunakan untuk menghapus baris data dari sebuah tabel dengan kriteria tertentu adalah...',
    'REMOVE FROM',
    'DELETE FROM',
    'DROP TABLE',
    'ALTER TABLE',
    'DELETE FROM digunakan untuk menghapus baris (data) di dalam tabel berdasarkan kondisi WHERE, sedangkan DROP TABLE menghapus seluruh struktur tabel.',
    20
),
(
    'e4444444-4444-4444-4444-444444444444',
    'd1111111-1111-1111-1111-111111111111',
    'Klausa SQL apa yang digunakan untuk mengelompokkan baris yang memiliki nilai sama dalam kolom tertentu sebelum dilakukan fungsi agregat seperti COUNT atau SUM?',
    'ORDER BY',
    'SORT BY',
    'GROUP BY',
    'HAVING',
    'Klausa GROUP BY digunakan untuk mengelompokkan baris berdasarkan satu atau beberapa kolom, biasanya dikombinasikan dengan fungsi agregasi.',
    20
),
(
    'e5555555-5555-5555-5555-555555555555',
    'd1111111-1111-1111-1111-111111111111',
    'Sifat ACID pada transaksi basis data yang menjamin bahwa perubahan data yang telah di-commit akan bertahan permanen bahkan jika sistem mengalami crash disebut...',
    'Atomicity',
    'Consistency',
    'Isolation',
    'Durability',
    'Durability (Ketahanan) menjamin bahwa begitu suatu transaksi berhasil di-commit, perubahannya akan tersimpan secara permanen di media penyimpanan.',
    20
)
ON CONFLICT (id) DO NOTHING;

-- 5. Kunci Jawaban untuk Paket Soal Basis Data (HANYA diakses via server / RPC submit_quiz_attempt)
INSERT INTO question_answers (question_id, correct_option) VALUES
('e1111111-1111-1111-1111-111111111111', 'B'),
('e2222222-2222-2222-2222-222222222222', 'C'),
('e3333333-3333-3333-3333-333333333333', 'B'),
('e4444444-4444-4444-4444-444444444444', 'C'),
('e5555555-5555-5555-5555-555555555555', 'D')
ON CONFLICT (question_id) DO NOTHING;

-- Soal untuk SDLC & Diagram UML (d2222222-2222-2222-2222-222222222222)
INSERT INTO questions (id, question_set_id, question_text, option_a, option_b, option_c, option_d, explanation, points) VALUES
(
    'e6666666-6666-6666-6666-666666666666',
    'd2222222-2222-2222-2222-222222222222',
    'Fase dalam SDLC di mana kebutuhan pengguna didefinisikan secara mendalam dan didokumentasikan dalam Software Requirements Specification (SRS) disebut fase...',
    'Analisis Kebutuhan (Requirements Analysis)',
    'Implementasi & Pengkodean',
    'Pemeliharaan (Maintenance)',
    'Pengujian Sistem (Testing)',
    'Fase Analisis Kebutuhan berfokus pada pengumpulan informasi dari stakeholder dan merumuskan spesifikasi fitur sistem.',
    25
),
(
    'e7777777-7777-7777-7777-777777777777',
    'd2222222-2222-2222-2222-222222222222',
    'Dalam Unified Modeling Language (UML), diagram yang digunakan untuk memvisualisasikan interaksi antara aktor eksternal dengan kapabilitas sistem adalah...',
    'Deployment Diagram',
    'Use Case Diagram',
    'State Machine Diagram',
    'Component Diagram',
    'Use Case Diagram menggambarkan fungsi-fungsi yang disediakan oleh sistem dari sudut pandang interaksi aktor luar.',
    25
),
(
    'e8888888-8888-8888-8888-888888888888',
    'd2222222-2222-2222-2222-222222222222',
    'Hubungan ketergantungan di mana sebuah use case secara otomatis dan wajib menyertakan fungsionalitas dari use case lain dilambangkan dengan relasi...',
    '<<extend>>',
    '<<include>>',
    '<<generalize>>',
    '<<association>>',
    'Relasi <<include>> menunjukkan bahwa suatu use case secara eksplisit dan wajib mengeksekusi perilaku dari use case lain yang di-include.',
    25
),
(
    'e9999999-9999-9999-9999-999999999999',
    'd2222222-2222-2222-2222-222222222222',
    'Pendekatan pengembangan perangkat lunak yang bersifat iteratif, mengutamakan kolaborasi tim, dan merespons perubahan secara fleksibel dikenal sebagai metodologi...',
    'Waterfall Klasik',
    'V-Model',
    'Agile Development',
    'Cleanroom Software Engineering',
    'Agile menekankan siklus rilis yang pendek (sprint), adaptasi terhadap kebutuhan baru, dan komunikasi aktif dengan klien.',
    25
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_answers (question_id, correct_option) VALUES
('e6666666-6666-6666-6666-666666666666', 'A'),
('e7777777-7777-7777-7777-777777777777', 'B'),
('e8888888-8888-8888-8888-888888888888', 'B'),
('e9999999-9999-9999-9999-999999999999', 'C')
ON CONFLICT (question_id) DO NOTHING;

-- Sinkronisasi profil untuk user yang telah terdaftar (termasuk user hasan)
INSERT INTO public.profiles (id, full_name, program_studi_id)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', 'hasan'),
    COALESCE((u.raw_user_meta_data->>'program_studi_id')::UUID, 'b1111111-1111-1111-1111-111111111111'::UUID)
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

