#!/usr/bin/env node
/**
 * Which Vercel apps need a deployment for a push to main: the apps whose
 * folder, workspace packages they depend on, or root workspace files changed
 * between two commits. Same rule as scripts/vercel-ignore.mjs, but run by
 * GitHub Actions so Vercel only ever receives a finished build (docs/DEPLOY.md).
 *
 *   node scripts/affected-apps.mjs <before-sha> <after-sha>
 *
 * Prints a JSON array like [{"app":"lexica","key":"LEXICA"}] (all apps when
 * the base commit is missing or unknown: never skip by guessing).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const git = (...args) => execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();

/** Folders of the workspace packages an app depends on, transitively. */
function workspaceDeps(dir, seen = new Set()) {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    const names = Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })
        .filter(([, v]) => String(v).startsWith('workspace:'))
        .map(([name]) => name);
    for (const folder of ['packages', 'apps']) {
        const parent = join(root, folder);
        if (!existsSync(parent)) continue;
        for (const entry of readdirSync(parent)) {
            const pj = join(parent, entry, 'package.json');
            if (!existsSync(pj)) continue;
            const name = JSON.parse(readFileSync(pj, 'utf8')).name;
            const path = join(parent, entry);
            if (names.includes(name) && !seen.has(path)) {
                seen.add(path);
                workspaceDeps(path, seen);
            }
        }
    }
    return seen;
}

/** Apps that have a Vercel project (a vercel.json in their folder). */
export const vercelApps = () =>
    readdirSync(join(root, 'apps'))
        .filter((a) => existsSync(join(root, 'apps', a, 'vercel.json')))
        .sort();

export function affected(before, after) {
    const apps = vercelApps();
    const all = apps.map((app) => ({ app, key: app.toUpperCase() }));
    if (!before || /^0+$/.test(before)) return all;
    try {
        git('cat-file', '-e', `${before}^{commit}`);
    } catch {
        return all;
    }
    return all.filter(({ app }) => {
        const dir = join(root, 'apps', app);
        const paths = [`apps/${app}`, ...[...workspaceDeps(dir)].map((p) => relative(root, p)), 'package.json', 'pnpm-workspace.yaml', 'turbo.json'];
        // Notes and plans (.md) change the repo, not the app
        return git('diff', '--name-only', before, after, '--', ...paths).split('\n').some((f) => f && !/\.(md|html)$/i.test(f));
    });
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
    const [, , before, after = 'HEAD'] = process.argv;
    console.log(JSON.stringify(affected(before, after)));
}
