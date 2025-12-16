'use client';

import { useEffect } from 'react';

export function usePWAUpdate() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('[PWA] Service Worker registered');

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute

                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[PWA] New version available, updating...');
                            // Automatically activate new version
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });

                // Reload when new version takes control
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (refreshing) return;
                    refreshing = true;
                    console.log('[PWA] New version activated, reloading...');
                    window.location.reload();
                });
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        };

        registerSW();
    }, []);
}
