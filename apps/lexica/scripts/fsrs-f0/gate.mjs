// FSRS F0 gate: read a PostHog export of `learner_model_week` events and say
// whether FSRS predicts better than SM-2 for enough learners to start F2.
// Usage: node scripts/fsrs-f0/gate.mjs <events.json>
// The export is a JSON array of events with `distinct_id` and `properties`
// (PostHog: Activity → filter event learner_model_week → Export JSON).
import fs from 'node:fs';
import { gate, MIN_ANSWERS, MIN_LEARNERS, MIN_WIN_SHARE } from '../../app/lib/learner/f0Gate.ts';

const [file] = process.argv.slice(2);
if (!file) throw new Error('Usage: node scripts/fsrs-f0/gate.mjs <events.json>');
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const events = (Array.isArray(raw) ? raw : raw.results ?? []).map((e) => ({
    learner: String(e.distinct_id ?? e.person_id ?? ''),
    n: Number(e.properties?.n ?? 0),
    ll_fsrs: Number(e.properties?.ll_fsrs ?? 0),
    ll_sm2: Number(e.properties?.ll_sm2 ?? 0),
}));
const r = gate(events);
const f = (x) => x.toFixed(4);
console.log(`Learners with ≥ ${MIN_ANSWERS} answers: ${r.learners} (need ≥ ${MIN_LEARNERS})`);
console.log(`FSRS better for: ${r.fsrsWins} (${(r.winShare * 100).toFixed(1)}%, need ≥ ${MIN_WIN_SHARE * 100}%)`);
console.log(`Mean log-loss gain per learner: ${f(r.meanGain)}, 95% CI [${f(r.ci[0])}, ${f(r.ci[1])}] (need > 0)`);
console.log(r.pass ? 'PASS: F2 can start (raise FSRS_ROLLOUT to 10).' : 'NOT YET: keep SM-2.');
