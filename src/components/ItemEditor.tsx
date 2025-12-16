'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit3, Trash2 } from 'lucide-react';

interface Item {
    id: string;
    label: string;
}

interface ItemEditorProps {
    items: Item[];
    onItemsChange: (items: Item[]) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function ItemEditor({ items, onItemsChange, isOpen, onClose }: ItemEditorProps) {
    const [newItemLabel, setNewItemLabel] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingLabel, setEditingLabel] = useState('');

    const handleAddItem = useCallback(() => {
        if (!newItemLabel.trim()) return;

        const newItem: Item = {
            id: `custom-${Date.now()}`,
            label: newItemLabel.trim().toUpperCase(),
        };

        onItemsChange([...items, newItem]);
        setNewItemLabel('');
    }, [newItemLabel, items, onItemsChange]);

    const handleDeleteItem = useCallback((id: string) => {
        onItemsChange(items.filter(item => item.id !== id));
    }, [items, onItemsChange]);

    const handleStartEdit = useCallback((item: Item) => {
        setEditingId(item.id);
        setEditingLabel(item.label);
    }, []);

    const handleSaveEdit = useCallback(() => {
        if (!editingLabel.trim() || !editingId) return;

        onItemsChange(items.map(item =>
            item.id === editingId
                ? { ...item, label: editingLabel.trim().toUpperCase() }
                : item
        ));
        setEditingId(null);
        setEditingLabel('');
    }, [editingId, editingLabel, items, onItemsChange]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-md rounded-xl p-6"
                        style={{
                            background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                            border: '1px solid #2a2a2a',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-mono text-lg tracking-[0.2em] text-zinc-200 uppercase">
                                Edit Items
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        {/* Add new item */}
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newItemLabel}
                                onChange={e => setNewItemLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                                placeholder="NEW ITEM NAME..."
                                className="flex-1 px-4 py-3 rounded-lg font-mono text-sm tracking-wider uppercase bg-zinc-900 border border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-green-500"
                            />
                            <button
                                onClick={handleAddItem}
                                disabled={!newItemLabel.trim()}
                                className="px-4 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Items list */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-2 p-3 rounded-lg"
                                    style={{
                                        background: 'linear-gradient(145deg, #151515, #0a0a0a)',
                                        border: '1px solid #2a2a2a',
                                    }}
                                >
                                    {editingId === item.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingLabel}
                                                onChange={e => setEditingLabel(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                                                className="flex-1 px-3 py-2 rounded bg-zinc-800 font-mono text-sm tracking-wider uppercase text-zinc-200 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveEdit}
                                                className="p-2 rounded hover:bg-zinc-700 text-green-500"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-2 rounded hover:bg-zinc-700 text-zinc-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 font-mono text-sm tracking-wider uppercase text-zinc-300">
                                                {item.label}
                                            </span>
                                            <button
                                                onClick={() => handleStartEdit(item)}
                                                className="p-2 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-2 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {items.length === 0 && (
                            <p className="text-center text-zinc-500 font-mono text-sm py-8">
                                No items. Add one above.
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
