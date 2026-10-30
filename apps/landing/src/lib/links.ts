/** Where each app lives. Set per deployment; a missing one hides its button. */
const clean = (v: string | undefined) => (v ? v.replace(/\/+$/, '') : null);

export const LEXICA_URL = clean(process.env.NEXT_PUBLIC_LEXICA_URL) ?? 'https://cortex-lexica.vercel.app';
export const TEACH_URL = clean(process.env.NEXT_PUBLIC_TEACH_URL);
export const ORATIO_URL = clean(process.env.NEXT_PUBLIC_ORATIO_URL);
/** Where teachers and centers ask for the pilot. */
export const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}` : '/auth';
