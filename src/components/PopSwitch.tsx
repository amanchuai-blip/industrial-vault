'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PopSwitchProps {
    label: string;
    isOn: boolean;
    onToggle: () => void;
    colorIndex: number;
    checkedAt?: string;
}

const colors = [
    { bg: 'from-pink-400 to-rose-500', checked: 'bg-pink-500' },
    { bg: 'from-purple-400 to-violet-500', checked: 'bg-purple-500' },
    { bg: 'from-blue-400 to-cyan-500', checked: 'bg-blue-500' },
    { bg: 'from-green-400 to-emerald-500', checked: 'bg-green-500' },
    { bg: 'from-yellow-400 to-orange-500', checked: 'bg-yellow-500' },
    { bg: 'from-teal-400 to-cyan-500', checked: 'bg-teal-500' },
];

export function PopSwitch({ label, isOn, onToggle, colorIndex, checkedAt }: PopSwitchProps) {
    const color = colors[colorIndex % colors.length];

    const handleClick = () => {
        // Vibration feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(30);
        }
        onToggle();
    };

    return (
        <motion.button
            onClick={handleClick}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${isOn
                    ? 'bg-white/90 shadow-lg'
                    : 'bg-white/60 hover:bg-white/70'
                }`}
            style={{
                boxShadow: isOn
                    ? '0 4px 20px rgba(0,0,0,0.1), 0 0 0 2px rgba(34, 197, 94, 0.3)'
                    : '0 2px 10px rgba(0,0,0,0.05)',
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Checkbox */}
            <motion.div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${isOn
                        ? `bg-gradient-to-br ${color.bg}`
                        : 'bg-gray-200'
                    }`}
                animate={isOn ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                } : {}}
                transition={{ duration: 0.4 }}
            >
                {isOn && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </motion.div>
                )}
            </motion.div>

            {/* Label */}
            <div className="flex-1 text-left">
                <span className={`font-medium text-base ${isOn ? 'text-gray-800' : 'text-gray-600'}`}>
                    {label}
                </span>
                {isOn && checkedAt && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-green-600 mt-0.5"
                    >
                        ✓ {checkedAt}
                    </motion.p>
                )}
            </div>

            {/* Status indicator */}
            {isOn && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                >
                    ✨
                </motion.span>
            )}
        </motion.button>
    );
}
