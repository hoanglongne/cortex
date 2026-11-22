/**
 * Where Lexica's own server routes (/api/...) live. On the web they are on the
 * same origin, so this is empty. In the packaged app (Capacitor, static export,
 * docs/LEXICA_NATIVE_APP_PLAN.md) there is no server inside the app, so the build
 * sets NEXT_PUBLIC_API_BASE to the web deployment ("https://lexica.cortexlearn.app").
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/+$/, '');

export const apiUrl = (path: string): string => `${API_BASE}${path}`;

/** Origins the packaged app runs from (Capacitor iOS and Android, and its dev server). */
export const APP_ORIGINS = ['capacitor://localhost', 'https://localhost', 'http://localhost'];
