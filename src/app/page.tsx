'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, RotateCcw, Zap, Settings } from 'lucide-react';
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
} from '@dnd-kit/sortable';
import { HeavySwitch } from '@/components/HeavySwitch';
import { FlipCover } from '@/components/FlipCover';
import { CRTOverlay } from '@/components/CRTOverlay';
import { StartupSequence } from '@/components/StartupSequence';
import { TabBar } from '@/components/TabBar';
import { ItemEditor } from '@/components/ItemEditor';
import { PopChecklist } from '@/components/PopChecklist';
import { SortableItem } from '@/components/SortableItem';
import { useVibrate } from '@/hooks/useVibrate';
import { usePWAUpdate } from '@/hooks/usePWAUpdate';

interface CheckItem {
  id: string;
  label: string;
  isOn: boolean;
  checkedAt?: string;
}

const STORAGE_KEY = 'industrial-vault-checks';
const ITEMS_KEY = 'industrial-vault-items';

const defaultItemLabels = [
  { id: 'door', label: 'DOOR LOCK' },
  { id: 'gas', label: 'GAS VALVE' },
  { id: 'window', label: 'WINDOW' },
  { id: 'power', label: 'AC POWER' },
];

// Audio context for generating sounds
const createAudioContext = () => {
  if (typeof window !== 'undefined') {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return null;
};

const playMechanicalClick = (isOn: boolean) => {
  const ctx = createAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(isOn ? 220 : 180, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(isOn ? 880 : 110, ctx.currentTime + 0.05);

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
};

const playUnlockSound = () => {
  const ctx = createAudioContext();
  if (!ctx) return;

  const frequencies = [440, 554, 659];
  frequencies.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);

    oscillator.start(ctx.currentTime + i * 0.1);
    oscillator.stop(ctx.currentTime + i * 0.1 + 0.3);
  });
};

function VaultChecklist() {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [itemLabels, setItemLabels] = useState(defaultItemLabels);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { vibratePattern } = useVibrate();

  // DnD sensors for keyboard and pointer (touch/mouse)
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

  // Handle drag end - reorder items
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Vibrate on successful reorder
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }

      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(prev, oldIndex, newIndex);
        return newItems;
      });

      setItemLabels((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  // Load item labels from localStorage
  useEffect(() => {
    const savedLabels = localStorage.getItem(ITEMS_KEY);
    if (savedLabels) {
      try {
        setItemLabels(JSON.parse(savedLabels));
      } catch { }
    }
  }, []);

  // Initialize items from labels and saved state
  useEffect(() => {
    setItems(prevItems => {
      // Get saved items from localStorage or use previous items
      let savedItems: CheckItem[] = prevItems;
      if (prevItems.length === 0) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            savedItems = JSON.parse(saved);
          } catch { }
        }
      }

      // Merge saved state with current labels
      return itemLabels.map(label => {
        const existing = savedItems.find(s => s.id === label.id);
        return {
          id: label.id,
          label: label.label,
          isOn: existing?.isOn ?? false,
          checkedAt: existing?.checkedAt,
        };
      });
    });
  }, [itemLabels]);

  // Save items to localStorage on change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  // Save labels to localStorage
  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(itemLabels));
  }, [itemLabels]);

  const allChecked = items.length > 0 && items.every(item => item.isOn);

  const toggleItem = useCallback((id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newIsOn = !item.isOn;
        playMechanicalClick(newIsOn);
        return {
          ...item,
          isOn: newIsOn,
          checkedAt: newIsOn ? new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : undefined,
        };
      }
      return item;
    }));
  }, []);

  const handleComplete = useCallback(() => {
    if (!allChecked) return;

    vibratePattern([100, 50, 100, 50, 200]);
    playUnlockSound();
    setIsCompleted(true);
  }, [allChecked, vibratePattern]);

  const handleReset = useCallback(() => {
    vibratePattern([50, 30, 50]);
    setItems(prev => prev.map(item => ({ ...item, isOn: false, checkedAt: undefined })));
    setIsCompleted(false);
  }, [vibratePattern]);

  const handleItemsChange = useCallback((newLabels: { id: string; label: string }[]) => {
    setItemLabels(newLabels);
  }, []);

  return (
    <>
      <CRTOverlay />

      <ItemEditor
        items={itemLabels}
        onItemsChange={handleItemsChange}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />

      <main className="min-h-screen min-h-[100dvh] p-4 md:p-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <header className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <Shield className="w-8 h-8 text-green-500" />
              <h1 className="font-mono text-xl md:text-2xl tracking-[0.3em] text-zinc-200 uppercase">
                Industrial Vault
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase"
            >
              Security Protocol Checklist
            </motion.p>
          </header>

          {/* Main Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="panel rounded-xl p-6 metal-texture"
          >
            {/* Panel Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="rivet" />
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
                    Ctrl Panel A
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                </button>
                <div className="rivet" />
              </div>
            </div>

            {/* Status Bar */}
            <div
              className="mb-6 p-3 rounded-lg flex items-center justify-between"
              style={{
                background: 'linear-gradient(145deg, #0a0a0a, #151515)',
                border: '1px solid #2a2a2a',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              <span className="font-mono text-xs tracking-wider text-zinc-500 uppercase">
                Status
              </span>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  animate={{
                    backgroundColor: allChecked ? '#22c55e' : '#ef4444',
                    boxShadow: allChecked
                      ? '0 0 8px #22c55e'
                      : '0 0 8px #ef4444',
                  }}
                />
                <span
                  className="font-mono text-xs tracking-wider uppercase"
                  style={{ color: allChecked ? '#22c55e' : '#ef4444' }}
                >
                  {allChecked ? 'SECURED' : 'UNSECURED'}
                </span>
              </div>
            </div>

            {/* Checklist Items */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 mb-6">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      <SortableItem id={item.id} isDarkMode={true}>
                        <HeavySwitch
                          label={item.label}
                          isOn={item.isOn}
                          onToggle={() => toggleItem(item.id)}
                          checkedAt={item.checkedAt}
                        />
                      </SortableItem>
                    </motion.div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-6" />

            {/* Complete Button with Safety Cover */}
            <AnimatePresence mode="wait">
              {!isCompleted ? (
                <FlipCover isLocked={!allChecked}>
                  <motion.button
                    onClick={handleComplete}
                    disabled={!allChecked}
                    className={`w-full py-4 rounded-lg font-mono text-sm tracking-[0.2em] uppercase transition-all ${allChecked
                      ? 'industrial-button-success text-white cursor-pointer'
                      : 'industrial-button text-zinc-500 cursor-not-allowed'
                      }`}
                    whileHover={allChecked ? { scale: 1.02 } : {}}
                    whileTap={allChecked ? { scale: 0.98 } : {}}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm All Secure
                    </span>
                  </motion.button>
                </FlipCover>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-6"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 0.5 }}
                    className="inline-block mb-3"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </motion.div>
                  <h2 className="font-mono text-base tracking-[0.3em] text-green-400 uppercase mb-1">
                    All Systems Secure
                  </h2>
                  <p className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase mb-4">
                    Completed at {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <motion.button
                    onClick={handleReset}
                    className="industrial-button px-6 py-3 rounded-lg font-mono text-xs tracking-[0.2em] uppercase text-zinc-400"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Rivets */}
            <div className="flex justify-between mt-4">
              <div className="rivet" />
              <div className="rivet" />
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'vault' | 'items'>('vault');
  const [showStartup, setShowStartup] = useState(true);

  // Register PWA and handle auto-updates
  usePWAUpdate();

  return (
    <>
      {showStartup && (
        <StartupSequence onComplete={() => setShowStartup(false)} />
      )}

      <div className={activeTab === 'vault' ? 'bg-[#0d0d0d] min-h-screen' : ''}>
        <div className="max-w-md mx-auto pt-4 px-4">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'vault' ? (
            <motion.div
              key="vault"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <VaultChecklist />
            </motion.div>
          ) : (
            <motion.div
              key="items"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PopChecklist />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
