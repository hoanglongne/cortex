import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.trim() || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
const base = (/^https?:\/\//i.test(SITE) ? SITE : `https://${SITE}`).replace(/\/+$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
    return ['/', '/guide', '/privacy', '/terms', '/feedback'].map((path) => ({ url: `${base}${path}` }));
}
