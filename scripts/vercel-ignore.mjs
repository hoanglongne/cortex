#!/usr/bin/env node
/**
 * Vercel "Ignored Build Step" for the apps in this monorepo: exit 0 skips
 * the deployment, exit 1 builds it. Each app's vercel.json runs it from the
 * app's root directory:
 *
 *   "ignoreCommand": "node ../../scripts/vercel-ignore.mjs"
 *
 * An app builds only when something it uses changed since its last
 * deployment on this branch (VERCEL_GIT_PREVIOUS_SHA): its own folder, a
 * workspace package it depends on, or the root workspace files. Changes to
 * other apps, docs/, supabase/ or scripts/ do not deploy it.
 * When that commit is unknown (first deployment of a branch, history
 * rewritten), it builds: never skip by guessing.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const appDir = process.cwd();
const root = resolve(appDir, '../..');
const app = relative(root, appDir);

const build = (why) => {
    console.log(`[vercel-ignore] ${app}: building (${why}).`);
    process.exit(1);
};
const skip = (why) => {
    console.log(`[vercel-ignore] ${app}: skipping (${why}).`);
    process.exit(0);
};

const git = (...args) => execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();

const base = process.env.VERCEL_GIT_PREVIOUS_SHA;
if (!base) build('no previous deployment on this branch');
try {
    git('cat-file', '-e', `${base}^{commit}`);
} catch {
    build(`previous deployment ${base.slice(0, 7)} is not in the cloned history`);
}

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

const paths = [app, ...[...workspaceDeps(appDir)].map((p) => relative(root, p)), 'package.json', 'pnpm-workspace.yaml', 'turbo.json'];
const changed = git('diff', '--name-only', base, 'HEAD', '--', ...paths);
if (changed) build(`changed since ${base.slice(0, 7)}:\n${changed.split('\n').slice(0, 20).join('\n')}`);
skip(`nothing in ${paths.join(', ')} changed since ${base.slice(0, 7)}`);
