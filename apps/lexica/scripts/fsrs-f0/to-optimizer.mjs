// FSRS F1: turn the fitting rows in `learner_model_week` events into a review
// log CSV for the open-source fsrs-optimizer.
// Usage: node scripts/fsrs-f0/to-optimizer.mjs <events.json> > revlog.csv
// Rows are [word id, right 0/1, days since the previous review]. Times are
// rebuilt per learner and word from the gaps (the absolute dates are never
// sent), which is all the optimizer needs. Rating: 3 (good) or 1 (again).
import fs from 'node:fs';

const [file] = process.argv.slice(2);
if (!file) throw new Error('Usage: node scripts/fsrs-f0/to-optimizer.mjs <events.json>');
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const events = Array.isArray(raw) ? raw : raw.results ?? [];
const DAY = 86_400_000;
const clock = new Map();
let id = 0;
const lines = ['card_id,review_time,review_rating,review_state,review_duration'];
for (const e of events) {
    let rows;
    try {
        rows = JSON.parse(e.properties?.rows ?? '[]');
    } catch {
        continue;
    }
    for (const [word, right, gap] of rows) {
        const key = `${e.distinct_id}:${word}`;
        if (!clock.has(key)) clock.set(key, { card: ++id, t: 0 });
        const c = clock.get(key);
        c.t += Math.round(gap * DAY);
        lines.push(`${c.card},${c.t},${right ? 3 : 1},2,0`);
    }
}
process.stdout.write(lines.join('\n') + '\n');
