'use client';

import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { StatusLED } from './StatusLED';
import { AlertTriangle } from 'lucide-react';

interface HeavySwitchProps {
    label: string;
    isOn: boolean;
    onToggle: () => void;
    onSound?: () => void;
    offSound?: () => void;
    checkedAt?: string;
}

export function HeavySwitch({ label, isOn, onToggle, onSound, offSound, checkedAt }: HeavySwitchProps) {
    const constraintsRef = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(isOn ? 40 : 0);
    const backgroundColor = useTransform(x, [0, 40], ['#1a1a1a', '#0d2818']);

    // Track if we're currently dragging
    const isDragging = useRef(false);

    const handleToggle = useCallback(() => {
        // Vibration feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Play sound
        if (isOn && offSound) {
            offSound();
        } else if (!isOn && onSound) {
            onSound();
        }

        onToggle();
    }, [isOn, onSound, offSound, onToggle]);

    const handleDragEnd = useCallback(() => {
        const currentX = x.get();
        const threshold = 20;

        // Determine if state should change based on drag position
        if (isOn && currentX < threshold) {
            // Was ON, dragged to OFF position
            handleToggle();
            animate(x, 0, { type: 'spring', stiffness: 300, damping: 20, mass: 1.5 });
        } else if (!isOn && currentX > threshold) {
            // Was OFF, dragged to ON position
            handleToggle();
            animate(x, 40, { type: 'spring', stiffness: 300, damping: 20, mass: 1.5 });
        } else {
            // Snap back to original position
            animate(x, isOn ? 40 : 0, { type: 'spring', stiffness: 300, damping: 20, mass: 1.5 });
        }

        isDragging.current = false;
    }, [isOn, x, handleToggle]);

    const handleClick = useCallback(() => {
        // Only toggle if we weren't dragging
        if (!isDragging.current) {
            handleToggle();
            animate(x, isOn ? 0 : 40, { type: 'spring', stiffness: 300, damping: 20, mass: 1.5 });
        }
    }, [isOn, x, handleToggle]);

    return (
        <motion.div
            className="flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300"
            style={{
                backgroundColor: isOn ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                borderColor: isOn ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                boxShadow: isOn
                    ? 'inset 0 0 20px rgba(34, 197, 94, 0.1), 0 4px 6px rgba(0,0,0,0.4)'
                    : 'inset 0 0 20px rgba(239, 68, 68, 0.1), 0 4px 6px rgba(0,0,0,0.4)',
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Status LED */}
            <StatusLED isOn={isOn} />

            {/* Label */}
            <div className="flex-1">
                <span className="font-mono text-sm tracking-[0.2em] uppercase text-zinc-300">
                    {label}
                </span>
                {isOn && checkedAt ? (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1"
                    >
                        <span className="text-xs text-green-500 tracking-wider font-mono">✓ CHECKED {checkedAt}</span>
                    </motion.div>
                ) : !isOn && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1"
                    >
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-500 tracking-wider">UNSECURED</span>
                    </motion.div>
                )}
            </div>

            {/* Heavy Toggle Switch - Now with drag support */}
            <button
                ref={constraintsRef}
                onClick={handleClick}
                className="relative w-20 h-10 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/50 touch-none"
                style={{
                    background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                    boxShadow: `
                        inset 0 2px 4px rgba(0,0,0,0.8),
                        inset 0 -1px 2px rgba(255,255,255,0.05),
                        0 4px 8px rgba(0,0,0,0.5)
                    `,
                }}
            >
                {/* Track */}
                <motion.div
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor }}
                    transition={{ duration: 0.3 }}
                />

                {/* Draggable Knob */}
                <motion.div
                    className="absolute top-1 left-1 w-8 h-8 rounded-full cursor-grab active:cursor-grabbing"
                    style={{
                        x,
                        background: isOn
                            ? 'linear-gradient(145deg, #2d5a3d, #1a3c28)'
                            : 'linear-gradient(145deg, #3a3a3a, #1a1a1a)',
                        boxShadow: isOn
                            ? `
                                0 2px 4px rgba(0,0,0,0.6),
                                0 0 10px rgba(34, 197, 94, 0.5),
                                inset 0 1px 2px rgba(255,255,255,0.1)
                            `
                            : `
                                0 2px 4px rgba(0,0,0,0.6),
                                inset 0 1px 2px rgba(255,255,255,0.05),
                                inset 0 -1px 2px rgba(0,0,0,0.3)
                            `,
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 40 }}
                    dragElastic={0}
                    dragMomentum={false}
                    onDragStart={() => { isDragging.current = true; }}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ scale: 1.05 }}
                >
                    {/* Knob texture */}
                    <div className="absolute inset-2 rounded-full border border-zinc-600/30" />
                </motion.div>

                {/* ON/OFF labels */}
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600">
                    OFF
                </span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-green-700">
                    ON
                </span>
            </button>
        </motion.div>
    );
}
