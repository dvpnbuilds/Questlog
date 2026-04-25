/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Note } from '../types';

export function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-5 rounded-xl bg-slate-900/60 border border-slate-700 shadow-xl cursor-pointer hover:border-cyan-500/50"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2">{note.title}</h3>
        <div className="flex flex-wrap gap-2">
            {note.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">#{tag}</span>
            ))}
        </div>
      </div>
      <p className="text-slate-400 text-xs font-sans line-clamp-3">
        {note.description}
      </p>
    </motion.div>
  );
}
