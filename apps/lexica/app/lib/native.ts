/**
 * The packaged app (Capacitor, docs/LEXICA_NATIVE_APP_PLAN.md): helpers with no
 * dependency on the native plugins, so they run and test anywhere.
 */

/** The hosts whose links open inside the app. */
const APP_HOSTS = ['lexica.cortexlearn.app'];

/**
 * Where an address opened from outside the app should land inside it: `lexica://join/ABC234`
 * or `https://lexica.cortexlearn.app/join/ABC234`. Pages that hold a code take it as a query
 * in the app, so the old path forms (the ones links already shared use) are translated.
 * Returns null for an address that is not ours.
 */
export function deepLinkTarget(raw: string): string | null {
    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return null;
    }
    let path: string;
    if (url.protocol === 'lexica:') path = `/${url.host}${url.pathname}`.replace(/\/+$/, '') || '/';
    else if ((url.protocol === 'https:' || url.protocol === 'http:') && APP_HOSTS.includes(url.hostname)) path = url.pathname.replace(/\/+$/, '') || '/';
    else return null;

    const seg = path.split('/').filter(Boolean).map((s) => decodeURIComponent(s));
    const one = (base: string, key: string, value: string) => `${base}?${new URLSearchParams({ [key]: value })}`;
    if (seg[0] === 'join' && seg[1]) return one('/join', 'code', seg[1]);
    if (seg[0] === 'score' && seg[1] && seg[1] !== 'view') return one('/score/view', 'code', seg[1]);
    if (seg[0] === 'read' && seg[1] && seg[1] !== 'view') return one('/read/view', 'id', seg[1]);
    if (seg[0] === 'play' && seg[1] && seg[1] !== 'game') return one('/play/game', 'g', seg[1]);
    if (seg[0] === 'class' && seg[1] === 'test' && seg[2]) return one('/class/test', 'id', seg[2]);
    if (seg[0] === 'buddy' && seg[1] === 'duel' && seg[2]) return one('/buddy/duel', 'id', seg[2]);
    return `${path}${url.search}`;
}
