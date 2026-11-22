// Builds the static export that Capacitor packages (docs/LEXICA_NATIVE_APP_PLAN.md, way B):
//   node scripts/build-native.mjs            -> out/
// The app has no server, so the route handlers (app/api) are set aside for the build and
// put back afterwards; the app reaches them on the web deployment through NEXT_PUBLIC_API_BASE.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const api = `${root}app/api`;
const aside = `${root}.native-aside-api`;

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
