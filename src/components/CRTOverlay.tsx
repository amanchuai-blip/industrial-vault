'use client';

import { motion } from 'framer-motion';

export function CRTOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {/* Scanlines */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.5) 2px,
            rgba(0, 0, 0, 0.5) 4px
          )`,
                }}
            />

            {/* Moving scanline */}
            <motion.div
                className="absolute left-0 right-0 h-[2px] opacity-[0.08]"
                style={{
                    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)',
                }}
                animate={{
                    top: ['0%', '100%'],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
                }}
            />

            {/* Subtle noise texture */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Slight color fringing */}
            <div
                className="absolute inset-0 opacity-[0.01]"
                style={{
                    background: 'linear-gradient(90deg, rgba(255,0,0,0.1) 0%, transparent 3%, transparent 97%, rgba(0,0,255,0.1) 100%)',
                }}
            />
        </div>
    );
}
