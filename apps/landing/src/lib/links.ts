/** Where each app lives. Set per deployment; a missing one hides its button. */
const clean = (v: string | undefined) => (v ? v.replace(/\/+$/, '') : null);

export const LEXICA_URL = clean(process.env.NEXT_PUBLIC_LEXICA_URL) ?? 'https://cortex-lexica.vercel.app';
export const TEACH_URL = clean(process.env.NEXT_PUBLIC_TEACH_URL);
export const ORATIO_URL = clean(process.env.NEXT_PUBLIC_ORATIO_URL);
/** The pilot's email address, when set. */
export const CONTACT_MAILTO = process.env.NEXT_PUBLIC_CONTACT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}?subject=Thí%20điểm%20Cortex` : null;
/** Where "thí điểm" buttons go: the pilot page, which holds the email. */
export const CONTACT = '/thi-diem';
/** Public address of the site, for the sitemap and share cards. */
export const SITE_URL = clean(process.env.NEXT_PUBLIC_SITE_URL) ?? 'https://cortex-landing.vercel.app';
