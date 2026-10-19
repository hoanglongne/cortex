#!/usr/bin/env node
/**
 * Imports anchor answers for Chấm chéo (docs/ORATIO_REDESIGN.md §5.2): audio
 * a teacher has scored, mixed into the review queue to measure reviewers.
 *
 * Usage (from apps/oratio):
 *   NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *     node scripts/import-anchors.mjs path/to/anchors
 *
 * The folder holds the audio files and anchors.csv with the header
 *   file,part,question,fluency,vocabulary,grammar,pronunciation,duration_s
 * (whole bands 1–9; the question in double quotes if it has commas;
 * duration_s optional). Running it again re-imports only new files.
 */
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const dir = process.argv[2];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!dir || !url || !key) {
  console.error("Usage: NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/import-anchors.mjs <folder>");
  process.exit(1);
}

/** One CSV line into fields; handles "quoted, fields" and "" escapes. */
function parseLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') (cur += '"'), i++;
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") out.push(cur), (cur = "");
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const MIME = { ".webm": "audio/webm", ".ogg": "audio/ogg", ".m4a": "audio/mp4", ".mp4": "audio/mp4", ".mp3": "audio/mpeg", ".wav": "audio/wav" };
const CRITERIA = ["fluency", "vocabulary", "grammar", "pronunciation"];

const [header, ...lines] = readFileSync(join(dir, "anchors.csv"), "utf8").split(/\r?\n/).filter((l) => l.trim());
const cols = parseLine(header);
const admin = createClient(url, key, { auth: { persistSession: false } });

let added = 0;
for (const line of lines) {
  const row = Object.fromEntries(parseLine(line).map((v, i) => [cols[i], v]));
  const ext = extname(row.file).toLowerCase();
  const part = Number(row.part);
  const scores = Object.fromEntries(CRITERIA.map((c) => [c, Number(row[c])]));
  if (!MIME[ext] || ![1, 2, 3].includes(part) || !row.question || CRITERIA.some((c) => !Number.isInteger(scores[c]) || scores[c] < 1 || scores[c] > 9)) {
    console.error(`Skipped (check file type, part, question and bands): ${row.file}`);
    continue;
  }
  const path = `anchors/${row.file}`;
  const { data: existing } = await admin.from("answers").select("id").eq("audio_path", path).maybeSingle();
  if (existing) continue;

  const { error: upErr } = await admin.storage
    .from("oratio-answers")
    .upload(path, readFileSync(join(dir, row.file)), { contentType: MIME[ext], upsert: true });
  if (upErr) {
    console.error(`Upload failed for ${row.file}: ${upErr.message}`);
    continue;
  }
  const { error } = await admin.from("answers").insert({
    user_id: null,
    mode: "anchor",
    question_text: row.question,
    part,
    duration_ms: Math.round(Number(row.duration_s || 0) * 1000),
    anchor_scores: scores,
    submitted_at: new Date().toISOString(),
    audio_path: path,
  });
  if (error) console.error(`Insert failed for ${row.file}: ${error.message}`);
  else added++;
}
console.log(`Added ${added} anchor answers.`);
