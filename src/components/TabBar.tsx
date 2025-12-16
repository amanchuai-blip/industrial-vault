'use client';

import { motion } from 'framer-motion';
import { Shield, Backpack } from 'lucide-react';

interface TabBarProps {
    activeTab: 'vault' | 'items';
    onTabChange: (tab: 'vault' | 'items') => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
    const tabs = [
        { id: 'vault' as const, label: 'VAULT', icon: Shield },
        { id: 'items' as const, label: 'ITEMS', icon: Backpack },
    ];

    return (
        <div
            className="flex rounded-lg p-1 mb-6"
            style={{
                background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
                border: '1px solid #2a2a2a',
            }}
        >
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className="relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-mono text-xs tracking-[0.2em] uppercase transition-colors"
                        style={{
                            color: isActive ? '#22c55e' : '#737373',
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 rounded-md"
                                style={{
                                    background: 'linear-gradient(145deg, #1f1f1f, #151515)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
                                    border: '1px solid #2a2a2a',
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
