'use client';

import { useEffect } from 'react';

export default function AuthBridge() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: In production, check event.origin here
      if (event.data.type === 'GET_CORTEX_USER_ID') {
        const userId = localStorage.getItem('cortex_user_id');
        event.source?.postMessage(
          { type: 'CORTEX_USER_ID_RESPONSE', userId },
          { targetOrigin: event.origin }
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return null; // Invisible bridge
}
