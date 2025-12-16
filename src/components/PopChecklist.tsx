'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Backpack, Settings, RotateCcw, Sparkles, Plus, Trash2, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PopSwitch } from './PopSwitch';

interface PopItem {
    id: string;
    label: string;
    isChecked: boolean;
    checkedAt?: string;
}

const STORAGE_KEY = 'pop-checklist-items';
const DEFAULT_ITEMS: PopItem[] = [
    { id: 'keys', label: '🔑 鍵', isChecked: false },
    { id: 'wallet', label: '👛 財布', isChecked: false },
    { id: 'phone', label: '📱 スマホ', isChecked: false },
    { id: 'charger', label: '🔌 充電器', isChecked: false },
    { id: 'earphones', label: '🎧 イヤホン', isChecked: false },
    { id: 'iccard', label: '💳 定期・ICカード', isChecked: false },
];

// Sortable wrapper for pop items
function SortablePopItem({
    id,
    children
}: {
    id: string;
    children: React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative">
            <div className="flex items-center gap-2">
                {/* Drag handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="touch-none p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {/* Content */}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function PopChecklist() {
    const [items, setItems] = useState<PopItem[]>(DEFAULT_ITEMS);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newItemLabel, setNewItemLabel] = useState('');

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch {
                // Use defaults
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const allChecked = items.every(item => item.isChecked);

    const toggleItem = useCallback((id: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newChecked = !item.isChecked;
                return {
                    ...item,
                    isChecked: newChecked,
                    checkedAt: newChecked ? new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : undefined,
                };
            }
            return item;
        }));
    }, []);

    const handleReset = useCallback(() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([30, 20, 30]);
        }
        setItems(prev => prev.map(item => ({ ...item, isChecked: false, checkedAt: undefined })));
    }, []);

    const handleAddItem = useCallback(() => {
        if (!newItemLabel.trim()) return;
        const newItem: PopItem = {
            id: `custom-${Date.now()}`,
            label: newItemLabel.trim(),
            isChecked: false,
        };
        setItems(prev => [...prev, newItem]);
        setNewItemLabel('');
    }, [newItemLabel]);

    const handleDeleteItem = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    // Handle drag end - reorder items
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(30);
            }

            setItems((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === active.id);
                const newIndex = prev.findIndex((item) => item.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    }, []);

    return (
        <div className="min-h-screen p-4 md:p-8" style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #ddd6fe 100%)',
        }}>
            <div className="max-w-md mx-auto">
                {/* Header */}
                <header className="text-center mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 mb-2"
                    >
                        <Backpack className="w-8 h-8 text-purple-500" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            忘れ物チェック
                        </h1>
                    </motion.div>
                    <p className="text-sm text-gray-600">
                        お出かけ前にチェック ✨
                    </p>
                </header>

                {/* Status */}
                <AnimatePresence mode="wait">
                    {allChecked && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white text-center shadow-lg"
                        >
                            <div className="flex items-center justify-center gap-2 text-lg font-bold">
                                <Sparkles className="w-5 h-5" />
                                準備完了！
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <p className="text-sm opacity-90 mt-1">全てのアイテムをチェックしました</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Checklist */}
                <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-4 shadow-xl mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600">
                            {items.filter(i => i.isChecked).length} / {items.length} 完了
                        </span>
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-2 rounded-xl transition-colors ${isEditMode ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Edit mode - Add item */}
                    <AnimatePresence>
                        {isEditMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4"
                            >
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newItemLabel}
                                        onChange={e => setNewItemLabel(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                                        placeholder="新しいアイテム..."
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    />
                                    <button
                                        onClick={handleAddItem}
                                        disabled={!newItemLabel.trim()}
                                        className="px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Items with DnD */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(item => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <SortablePopItem id={item.id}>
                                            {isEditMode ? (
                                                <div className="flex items-center gap-2 p-3 bg-white/80 rounded-xl">
                                                    <span className="flex-1 text-gray-700">{item.label}</span>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <PopSwitch
                                                    label={item.label}
                                                    isOn={item.isChecked}
                                                    onToggle={() => toggleItem(item.id)}
                                                    colorIndex={index}
                                                    checkedAt={item.checkedAt}
                                                />
                                            )}
                                        </SortablePopItem>
                                    </motion.div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                {/* Reset button */}
                <motion.button
                    onClick={handleReset}
                    className="w-full py-3 rounded-2xl bg-white/60 hover:bg-white/80 text-gray-600 font-medium flex items-center justify-center gap-2 transition-colors"
                    whileTap={{ scale: 0.98 }}
                >
                    <RotateCcw className="w-4 h-4" />
                    リセット
                </motion.button>
            </div>
        </div>
    );
}
