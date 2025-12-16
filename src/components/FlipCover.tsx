'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';

interface FlipCoverProps {
    isLocked: boolean;
    children: React.ReactNode;
}

export function FlipCover({ isLocked, children }: FlipCoverProps) {
    return (
        <div className="relative perspective-1000">
            {/* Button underneath */}
            <div className="relative z-0">
                {children}
            </div>

            {/* Safety Cover */}
            <AnimatePresence>
                {isLocked && (
                    <motion.div
                        className="absolute inset-0 z-10 overflow-hidden rounded-lg cursor-not-allowed"
                        initial={{ rotateX: -90 }}
                        animate={{ rotateX: 0 }}
                        exit={{ rotateX: -90 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 25,
                            mass: 1.2
                        }}
                        style={{
                            transformOrigin: 'top center',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {/* Cover surface */}
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-1 pt-8 pb-3"
                            style={{
                                background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.15), rgba(127, 29, 29, 0.2))',
                                backdropFilter: 'blur(4px)',
                                border: '2px solid rgba(239, 68, 68, 0.4)',
                                boxShadow: `
                                    inset 0 2px 4px rgba(255,255,255,0.05),
                                    inset 0 -2px 4px rgba(0,0,0,0.3),
                                    0 4px 8px rgba(0,0,0,0.4)
                                `,
                            }}
                        >
                            {/* Warning stripes */}
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    background: `repeating-linear-gradient(
                                        45deg,
                                        transparent,
                                        transparent 10px,
                                        rgba(239, 68, 68, 0.3) 10px,
                                        rgba(239, 68, 68, 0.3) 20px
                                    )`,
                                }}
                            />

                            {/* Lock icon - smaller with margin for visibility */}
                            <motion.div
                                className="mt-2"
                                animate={{
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Lock className="w-5 h-5 text-red-500" />
                            </motion.div>

                            {/* Warning text */}
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-red-400" />
                                <span className="font-mono text-xs tracking-[0.2em] text-red-400 uppercase">
                                    Safety Lock Active
                                </span>
                            </div>

                            <span className="font-mono text-[10px] tracking-wider text-red-500/60 uppercase text-center">
                                Complete all checks to unlock
                            </span>
                        </div>

                        {/* Hinge effect */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{
                                background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
