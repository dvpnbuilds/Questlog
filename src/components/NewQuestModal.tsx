/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { Rarity } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestCreated: (title: string, rarity: Rarity) => void;
}

export function NewQuestModal({ isOpen, onClose, onQuestCreated }: ModalProps) {
  const [title, setTitle] = useState('');
  const [rarity, setRarity] = useState<Rarity>('Common');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuestCreated(title, rarity);
    setTitle('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(34,211,238,0.1)] relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Quest</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-cyan-400 mb-2">Quest Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., Fix the CSS hydration error..."
                />
              </div>
              <div>
                <label className="block text-sm text-cyan-400 mb-2">Rarity</label>
                <div className="flex gap-2">
                  {(['Common', 'Rare', 'Epic'] as Rarity[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRarity(r)}
                      className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${rarity === r ? (r === 'Epic' ? 'bg-purple-600 border-purple-400' : r === 'Rare' ? 'bg-blue-600 border-blue-400' : 'bg-slate-600 border-slate-400') : 'bg-slate-950 border-slate-700 text-slate-500'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-500 transition-all">
                Create Quest
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
