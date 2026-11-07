-- "Tôi không chắc" for Chấm chéo (issue #130): a reviewer may say they could not
-- judge some of the four criteria (at most three). Those criteria are left out
-- of the answer's band and of the reviewer's reliability. Runs after
-- migration_2026_10_answers.sql. Safe to re-run.

alter table public.answer_reviews add column if not exists unsure text[] not null default '{}';

alter table public.answer_reviews drop constraint if exists answer_reviews_unsure_check;
alter table public.answer_reviews add constraint answer_reviews_unsure_check
  check (unsure <@ array['fluency', 'vocabulary', 'grammar', 'pronunciation']::text[] and cardinality(unsure) <= 3);
