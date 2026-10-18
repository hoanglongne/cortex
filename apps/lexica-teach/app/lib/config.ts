const isDev = process.env.NODE_ENV === 'development';

function base(value: string | undefined): string | null {
    const v = value?.trim().replace(/\/+$/, '');
    if (!v) return null;
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** The learning app: class links and the word list. */
export const LEXICA_URL = base(process.env.NEXT_PUBLIC_LEXICA_URL) ?? (isDev ? 'http://localhost:3001' : '');
/** This app, for invitation links. */
export const TEACH_URL = base(process.env.NEXT_PUBLIC_TEACH_URL) ?? (typeof window !== 'undefined' ? window.location.origin : '');
