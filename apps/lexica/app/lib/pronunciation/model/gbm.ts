/**
 * The GOP regressor of the scoring model: gradient-boosted trees exported
 * from scikit-learn's HistGradientBoostingRegressor (scripts/pron-pack/build.py)
 * as plain arrays. Each row: the five GOP features, then a one-hot of the
 * phone's id. Pure.
 */

/** A split [feature, threshold, left, right, missingGoesLeft] or a leaf [-1, value]. */
export type GbmNode = [number, number, number, number, number] | [-1, number];

export interface Gbm {
    baseline: number;
    features: string[];
    /** Size of the one-hot after the features (the model's vocabulary). */
    classes: number;
    trees: GbmNode[][];
}

export function parseGbm(raw: unknown): Gbm | null {
    const g = raw as Partial<Gbm> | null;
    if (!g || typeof g.baseline !== 'number' || !Array.isArray(g.trees) || !Array.isArray(g.features) || typeof g.classes !== 'number') return null;
    return g as Gbm;
}

/** The score of one row given as its numeric features and the phone id. */
export function predict(gbm: Gbm, features: readonly number[], phoneId: number): number {
    const n = gbm.features.length;
    const value = (f: number) => (f < n ? features[f] : f - n === phoneId ? 1 : 0);
    let sum = gbm.baseline;
    for (const tree of gbm.trees) {
        let node = tree[0];
        while (node[0] !== -1) {
            const [f, threshold, left, right, missingLeft] = node as [number, number, number, number, number];
            const x = value(f);
            node = tree[Number.isNaN(x) ? (missingLeft ? left : right) : x <= threshold ? left : right];
        }
        sum += node[1];
    }
    return sum;
}
