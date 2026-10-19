-- ============================================
-- Oratio: answers and Chấm chéo (2026-10-19)
-- docs/ORATIO_REDESIGN.md §5.1, §5.2. Safe to run again.
--
--   1. answers: one row per spoken answer (solo or live), with the on-device
--      metrics and transcript. The audio stays on the learner's device
--      unless they send that answer to Chấm chéo.
--   2. answer_reviews: a peer's scores for a submitted answer.
--   3. review_claims: which answer a reviewer is listening to now, so two
--      people don't get the same one and audio links go only to them.
--   4. Storage bucket oratio-answers (private). Files are deleted after 30
--      days by /api/cron/expire-audio.
--
-- Everything is written by the app's server actions (service role) after
-- checking the user. Users read only their own rows.
-- ============================================

CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- NULL only for anchor answers (scored by a teacher, no owner)
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.ielts_questions(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL CHECK (char_length(question_text) <= 2000),
    part SMALLINT NOT NULL CHECK (part BETWEEN 1 AND 3),
    mode TEXT NOT NULL DEFAULT 'solo' CHECK (mode IN ('solo', 'live', 'anchor')),
    -- "Nói lại": the first take of the same question in this run
    retake_of UUID REFERENCES public.answers(id) ON DELETE SET NULL,

    -- On-device metrics
    duration_ms INTEGER NOT NULL CHECK (duration_ms BETWEEN 0 AND 600000),
    speaking_ms INTEGER NOT NULL DEFAULT 0 CHECK (speaking_ms >= 0),
    long_pauses INTEGER NOT NULL DEFAULT 0 CHECK (long_pauses >= 0),
    longest_pause_ms INTEGER NOT NULL DEFAULT 0 CHECK (longest_pause_ms >= 0),
    -- From the transcript (NULL when Whisper is off)
    word_count INTEGER CHECK (word_count >= 0),
    wpm NUMERIC(5,1),
    mean_run_words NUMERIC(5,1),
    fillers INTEGER CHECK (fillers >= 0),
    lexical_diversity NUMERIC(4,3),
    transcript TEXT CHECK (char_length(transcript) <= 8000),
    -- Words the learner has in Lexica that appear in the transcript
    lexica_words TEXT[] NOT NULL DEFAULT '{}',

    -- Chấm chéo
    submitted_at TIMESTAMPTZ,
    audio_path TEXT,
    audio_expires_at TIMESTAMPTZ,
    -- Anchor answers: the teacher's band per criterion
    anchor_scores JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (user_id IS NOT NULL OR mode = 'anchor'),
    CHECK (mode <> 'anchor' OR anchor_scores IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS answers_user_time_idx ON public.answers (user_id, created_at DESC);
-- The review queue: submitted answers, oldest first
CREATE INDEX IF NOT EXISTS answers_queue_idx ON public.answers (submitted_at) WHERE submitted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS answers_audio_expiry_idx ON public.answers (audio_expires_at) WHERE audio_path IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.answer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fluency NUMERIC(2,1) NOT NULL CHECK (fluency BETWEEN 1 AND 9),
    vocabulary NUMERIC(2,1) NOT NULL CHECK (vocabulary BETWEEN 1 AND 9),
    grammar NUMERIC(2,1) NOT NULL CHECK (grammar BETWEEN 1 AND 9),
    pronunciation NUMERIC(2,1) NOT NULL CHECK (pronunciation BETWEEN 1 AND 9),
    tags TEXT[] NOT NULL DEFAULT '{}',
    comment TEXT CHECK (char_length(comment) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (answer_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS answer_reviews_reviewer_idx ON public.answer_reviews (reviewer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.review_claims (
    answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (answer_id, reviewer_id)
);

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_claims ENABLE ROW LEVEL SECURITY;

-- Own answers only (Lexica also reads lexica_words from here). Reviews of
-- your answers come through a server action, without the reviewer's id.
DROP POLICY IF EXISTS "answers_select_own" ON public.answers;
CREATE POLICY "answers_select_own" ON public.answers
    FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "answer_reviews_select_own" ON public.answer_reviews;
CREATE POLICY "answer_reviews_select_own" ON public.answer_reviews
    FOR SELECT TO authenticated USING (reviewer_id = auth.uid());

-- No policy on review_claims: server only.
REVOKE INSERT, UPDATE, DELETE ON public.answers, public.answer_reviews, public.review_claims FROM anon, authenticated;
REVOKE SELECT ON public.review_claims FROM anon, authenticated;

-- Private bucket for answers sent to Chấm chéo (5 MB, audio only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('oratio-answers', 'oratio-answers', false, 5242880,
        ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav'])
ON CONFLICT (id) DO UPDATE
    SET public = false,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;
-- No storage.objects policies for this bucket: uploads use signed upload
-- URLs and playback uses short signed URLs, both made by the server.
