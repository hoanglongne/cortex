// Builds the static export that Capacitor packages (docs/LEXICA_NATIVE_APP_PLAN.md, way B):
//   node scripts/build-native.mjs            -> out/
// The app has no server, so the route handlers (app/api) are set aside for the build and
// put back afterwards; the app reaches them on the web deployment through NEXT_PUBLIC_API_BASE.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const api = `${root}app/api`;
const aside = `${root}.native-aside-api`;

// NEXT_PUBLIC_* values are baked into the bundle at build time, and the app has no server to
// read them from later. Without these, sign-in and speaking silently do not work in the app.
const REQUIRED = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_CORTEX_API_URL'];
const fromFiles = {};
for (const f of ['.env', '.env.production', '.env.local', '.env.production.local']) {
    const file = `${root}${f}`;
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && m[2]) fromFiles[m[1]] = m[2];
    }
}
const missing = REQUIRED.filter((k) => !process.env[k] && !fromFiles[k]);
if (missing.length && process.env.ALLOW_MISSING_ENV !== '1') {
    console.error(`Missing for the app build: ${missing.join(', ')}.\nPut the production values in apps/lexica/.env.production.local (not committed), or set ALLOW_MISSING_ENV=1 to build anyway.`);
    process.exit(1);
}

if (fs.existsSync(aside)) throw new Error(`${aside} exists: a previous build was cut short. Move it back to app/api first.`);
fs.renameSync(api, aside);
let status = 1;
try {
    fs.rmSync(`${root}out`, { recursive: true, force: true });
    const res = spawnSync('npx', ['next', 'build'], {
        cwd: root,
        stdio: 'inherit',
        env: { ...process.env, NATIVE_EXPORT: '1', NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE ?? 'https://lexica.cortexlearn.app' },
    });
    status = res.status ?? 1;
} finally {
    fs.renameSync(aside, api);
}
process.exit(status);
