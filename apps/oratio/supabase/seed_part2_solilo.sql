-- Part 2 topics from Solilo that Oratio did not have (issue #89). Non-destructive:
-- only rows not in ielts_questions yet (same part and text) are added. Safe to re-run.
-- The other ten of Solilo's twelve cue cards already have a close match in
-- seed_questions_v2.sql (a book, a teacher, an event, a decision, clothing, a
-- building, a surprise, a skill, a piece of technology, helping someone).
INSERT INTO public.ielts_questions (part, category, question_text, difficulty)
SELECT v.part, v.category, v.question_text, v.difficulty
FROM (VALUES
  (2, 'Experience', 'Describe an ambition you have not yet achieved. You should say: what the ambition is, why you have this ambition, what you have done to try to achieve it, and explain how you would feel if you achieved it.', 'medium'),
  (2, 'Place', 'Describe a place you visited that you found very beautiful. You should say: where the place was, when you went there, what you did there, and explain why you thought it was beautiful.', 'medium')
) AS v(part, category, question_text, difficulty)
WHERE NOT EXISTS (SELECT 1 FROM public.ielts_questions q WHERE q.part = v.part AND q.question_text = v.question_text);
