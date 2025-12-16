'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    isDarkMode?: boolean;
}

export function SortableItem({ id, children, isDarkMode = true }: SortableItemProps) {
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
                <motion.button
                    {...attributes}
                    {...listeners}
                    className={`touch-none p-2 rounded-lg transition-colors cursor-grab active:cursor-grabbing ${isDarkMode
                            ? 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <GripVertical className="w-4 h-4" />
                </motion.button>

                {/* Content */}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
