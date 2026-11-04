import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.trim() || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
const base = /^https?:\/\//i.test(SITE) ? SITE : `https://${SITE}`;

/** Search engines may read the public pages; the study screens hold only the learner's own data. */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [{ userAgent: '*', allow: ['/', '/guide', '/privacy', '/terms'], disallow: ['/api/', '/me', '/class', '/join/', '/buddy', '/settings', '/stats'] }],
        sitemap: `${base}/sitemap.xml`,
    };
}
