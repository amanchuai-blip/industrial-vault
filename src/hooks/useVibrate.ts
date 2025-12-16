'use client';

import { useCallback } from 'react';

export function useVibrate() {
    const vibrate = useCallback((duration: number = 50) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }, []);

    const vibratePattern = useCallback((pattern: number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }, []);

    return { vibrate, vibratePattern };
}
