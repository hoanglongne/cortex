import { arenaMyResults } from '../lib/classes';
import { useLexicaStore } from '../store/lexicaStore';

/** Class quizzes finished lately and not yet applied: into this student's review (lib/arenaReview.ts). */
export async function applyArenaResults(): Promise<{ again: number; recalled: number; queued: number }> {
    const results = await arenaMyResults();
    return useLexicaStore.getState().applyArena(results);
}
