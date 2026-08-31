'use client';

const SW_PATH = '/sw.js';

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SW_PATH).catch(() => {
      // Service worker registration failed; the app continues to work normally.
    });
  });
}
