'use client';

import { useEffect } from 'react';

export default function AuthBridge() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Check event.origin to only allow your vercel subdomains
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3005',
        'https://cortex-landing.vercel.app',
        'https://cortex-lexica.vercel.app',
        'https://cortex-synapse.vercel.app',
      ];

      if (!allowedOrigins.includes(event.origin)) return;

      if (event.data.type === 'GET_CORTEX_SESSION') {
        // We share the whole session or just the userId
        const userId = localStorage.getItem('cortex_user_id');
        const supabaseToken = localStorage.getItem('sb-token'); // Assuming you store it

        event.source?.postMessage(
          { type: 'CORTEX_SESSION_RESPONSE', userId, token: supabaseToken },
          { targetOrigin: event.origin }
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return null; // Invisible bridge
}
