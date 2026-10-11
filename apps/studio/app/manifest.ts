import type { MetadataRoute } from 'next';

/**
 * Installable Studio. On Android, the installed app shows up in the share
 * sheet ("Lexica Studio"), which opens /share with the shared link.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Lexica Studio',
        short_name: 'Studio',
        description: 'Biên tập Trend Drop cho Lexica',
        start_url: '/radar',
        scope: '/',
        display: 'standalone',
        background_color: '#0E0F11',
        theme_color: '#0E0F11',
        icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        share_target: {
            action: '/share',
            method: 'GET',
            params: { title: 'title', text: 'text', url: 'url' },
        },
    };
}
