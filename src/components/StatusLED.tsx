'use client';

import { motion } from 'framer-motion';

interface StatusLEDProps {
    isOn: boolean;
}

export function StatusLED({ isOn }: StatusLEDProps) {
    return (
        <div className="relative">
            {/* LED housing */}
            <div className="w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                {/* LED light */}
                <motion.div
                    className="w-full h-full rounded-full"
                    animate={{
                        backgroundColor: isOn ? '#22c55e' : '#450a0a',
                        boxShadow: isOn
                            ? '0 0 8px #22c55e, 0 0 16px #22c55e, inset 0 -1px 2px rgba(0,0,0,0.5)'
                            : 'inset 0 1px 3px rgba(0,0,0,0.8)',
                    }}
                    transition={{ duration: 0.2 }}
                />
            </div>
            {/* Glow effect */}
            {isOn && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-green-500"
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ filter: 'blur(4px)' }}
                />
            )}
        </div>
    );
}
