'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Terminal } from 'lucide-react';

interface StartupSequenceProps {
    onComplete: () => void;
}

const bootMessages = [
    { text: 'INITIALIZING SYSTEM...', delay: 0 },
    { text: 'LOADING SECURITY PROTOCOLS...', delay: 800 },
    { text: 'ESTABLISHING SECURE CONNECTION...', delay: 1600 },
    { text: 'VERIFYING INTEGRITY...', delay: 2400 },
    { text: 'SYSTEM READY', delay: 3200 },
];

export function StartupSequence({ onComplete }: StartupSequenceProps) {
    const [currentLine, setCurrentLine] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentLine >= bootMessages.length) {
            setTimeout(() => {
                setIsComplete(true);
                setTimeout(onComplete, 500);
            }, 800);
            return;
        }

        const message = bootMessages[currentLine];
        let charIndex = 0;
        setDisplayedText('');

        const typeInterval = setInterval(() => {
            if (charIndex < message.text.length) {
                setDisplayedText(message.text.substring(0, charIndex + 1));
                charIndex++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    setCurrentLine(prev => prev + 1);
                }, 400);
            }
        }, 30);

        return () => clearInterval(typeInterval);
    }, [currentLine, onComplete]);

    return (
        <AnimatePresence>
            {!isComplete && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="max-w-lg w-full px-8">
                        {/* Logo */}
                        <motion.div
                            className="flex items-center justify-center gap-4 mb-12"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Shield className="w-12 h-12 text-green-500" />
                            <div>
                                <h1 className="font-mono text-2xl tracking-[0.3em] text-zinc-200 uppercase">
                                    Industrial Vault
                                </h1>
                                <p className="font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase">
                                    Security Checklist v1.0
                                </p>
                            </div>
                        </motion.div>

                        {/* Terminal window */}
                        <div
                            className="rounded-lg overflow-hidden"
                            style={{
                                background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
                                border: '1px solid #2a2a2a',
                            }}
                        >
                            {/* Terminal header */}
                            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
                                <Terminal className="w-4 h-4 text-zinc-500" />
                                <span className="font-mono text-xs text-zinc-500 tracking-wider">
                                    BOOT SEQUENCE
                                </span>
                            </div>

                            {/* Terminal content */}
                            <div className="p-4 min-h-[200px]">
                                {bootMessages.slice(0, currentLine).map((msg, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-2 mb-2"
                                    >
                                        <span className="text-green-500 font-mono text-sm">[OK]</span>
                                        <span className="text-zinc-400 font-mono text-sm tracking-wider">
                                            {msg.text}
                                        </span>
                                    </motion.div>
                                ))}

                                {currentLine < bootMessages.length && (
                                    <div className="flex gap-2">
                                        <motion.span
                                            className="text-amber-500 font-mono text-sm"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                        >
                                            [...]
                                        </motion.span>
                                        <span className="text-zinc-300 font-mono text-sm tracking-wider">
                                            {displayedText}
                                            <motion.span
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                                className="inline-block w-2 h-4 bg-green-500 ml-1"
                                            />
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="px-4 pb-4">
                                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-green-500"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${(currentLine / bootMessages.length) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
