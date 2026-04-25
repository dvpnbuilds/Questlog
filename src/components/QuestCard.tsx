/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import type { Quest } from '../types';

const rarityColors: Record<string, string> = {
  Common: 'border-slate-700',
  Rare: 'border-blue-500/40',
  Epic: 'border-purple-500/40',
  Legendary: 'border-amber-400/60',
};

const rarityTagColors: Record<string, string> = {
  Common: 'bg-slate-600',
  Rare: 'bg-blue-600',
  Epic: 'bg-purple-500',
  Legendary: 'bg-amber-500',
};

export function QuestCard({ quest, onClick }: { quest: Quest; onClick: () => void }) {
  const isCompleted = quest.status === 'completed';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isCompleted ? 1 : 1.02 }}
      onClick={onClick}
      className={`p-5 rounded-xl border shadow-xl cursor-pointer flex flex-col h-full ${isCompleted ? 'grayscale opacity-60 bg-slate-950 border-slate-800' : (quest.category === 'Architect' ? 'border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-amber-900/10' : `bg-slate-900/60 ${rarityColors[quest.rarity]}`)}`}
    >
      <div className="mb-4">
        <div className="flex gap-2 mb-3">
            <div className={`text-[10px] px-2 py-0.5 text-white font-bold rounded inline-block uppercase tracking-widest ${isCompleted ? 'bg-slate-700' : rarityTagColors[quest.rarity]}`}>
              {quest.rarity}
            </div>
            {quest.category && (
                <div className={`text-[10px] px-2 py-0.5 text-white font-bold rounded inline-block uppercase tracking-widest ${isCompleted ? 'bg-slate-700' : (quest.category === 'Mastery' ? 'bg-amber-600' : quest.category === 'Architect' ? 'bg-yellow-600 text-black' : 'bg-slate-700')}`}>
                  {quest.category}
                </div>
            )}
        </div>
        <h3 className={`text-lg font-bold ${isCompleted ? 'text-slate-400' : 'text-white'}`}>{quest.title}</h3>
      </div>
      <p className={`text-slate-400 text-xs mb-6 font-sans whitespace-pre-line ${quest.category === 'Architect' ? 'animate-pulse' : ''}`}>
        {quest.description}
      </p>
      <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
        <span className="text-cyan-400/50 text-[10px] font-mono tracking-tighter">ID: {quest.id}</span>
        <span className={`font-mono text-xs ${isCompleted ? 'text-slate-600' : (quest.rarity === 'Epic' ? 'text-purple-400' : quest.rarity === 'Rare' ? 'text-blue-400' : 'text-slate-500')}`}>
            +{quest.xp} XP
        </span>
      </div>
    </motion.div>
  );
}
