'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

export default function EcosystemRewardListener() {
  useEffect(() => {
    // Connect to the Cortex Core API Socket server
    const socket = io('http://localhost:3001/events', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[Cortex] Connected to Real-time Reward System');
    });

    // Listen for milestone rewards (personal or ecosystem-wide)
    socket.on('user:milestone_reward', (data) => {
      console.log('[Cortex] Milestone Reached!', data);
      
      if (data.effect === 'confetti') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00ff00', '#00ffff', '#ffffff'],
        });
      }

      // Play sound if provided
      if (data.sound) {
        try {
          const audio = new Audio(`/sounds/${data.sound}.mp3`);
          audio.play().catch(() => console.warn('Audio play failed - user interaction might be required'));
        } catch (e) {
          console.error('Audio play error', e);
        }
      }
    });

    socket.on('ecosystem:milestone_reached', (data) => {
      console.log('[Cortex Ecosystem] Someone reached a milestone!', data);
      // We can add a toast notification here later
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null; // This is a logic-only component
}
