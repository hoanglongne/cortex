import type { Branch } from './path';

/** The branch picked during onboarding, held until the path is set up after the level test. */
const KEY = 'lexica-branch-pick';

export function readBranchPick(): Branch | null {
    try {
        const v = localStorage.getItem(KEY);
        return v === 'cert' || v === 'talk' ? v : null;
    } catch {
        return null;
    }
}

export function writeBranchPick(branch: Branch) {
    try {
        localStorage.setItem(KEY, branch);
    } catch {
        // Private mode: the setup screen asks again.
    }
}
