-- Studio editors can read the notes sent from Lexica's "Góp ý" form
-- (GET /studio/feedback). Everyone else still cannot read the table.
-- Requires is_studio_editor() from migration_studio.sql. Idempotent.

drop policy if exists lexica_feedback_editors_read on public.lexica_feedback;
create policy lexica_feedback_editors_read on public.lexica_feedback
  for select to authenticated using (public.is_studio_editor());
