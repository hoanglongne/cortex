import { notFound } from 'next/navigation';

/**
 * The /dev pages are tools for building Lexica (card fit, brand, learner model).
 * They are not for learners: in a production build they answer 404 unless
 * NEXT_PUBLIC_DEV_PAGES=on (issue #178).
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEV_PAGES !== 'on') notFound();
    return children;
}
