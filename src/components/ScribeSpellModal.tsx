import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, List, Loader2 } from 'lucide-react';

interface SpellDraft {
  title: string;
  ritual: string;
  incantation: string;
  tags: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (spell: SpellDraft) => Promise<boolean>;
}

export function ScribeSpellModal({ isOpen, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [ritual, setRitual] = useState('');
  const [incantation, setIncantation] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ritualRef = useRef<HTMLTextAreaElement>(null);
  const incantationRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(''); setRitual(''); setIncantation('');
      setTags([]); setTagInput(''); setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const insertBullet = (
    ref: React.RefObject<HTMLTextAreaElement | null>,
    value: string,
    setValue: (v: string) => void
  ) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = value.substring(0, start);
    const after = value.substring(ta.selectionEnd);
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    const insertion = (needsNewline ? '\n' : '') + '- ';
    setValue(before + insertion + after);
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        ref.current.setSelectionRange(start + insertion.length, start + insertion.length);
      }
    }, 0);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('A spell needs a title.'); return; }
    setIsSaving(true);
    setError(null);
    const ok = await onSave({ title: title.trim(), ritual, incantation, tags });
    setIsSaving(false);
    if (ok) onClose();
    else setError('Failed to scribe the spell. Check your connection and try again.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-[0_0_80px_rgba(6,182,212,0.12),0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white tracking-tight">Scribe New Spell</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Spell Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') ritualRef.current?.focus(); }}
                  placeholder="Name your spell..."
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Tags
                </label>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a tag and hit Enter..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 placeholder:text-slate-600 text-sm focus:outline-none mb-2 transition-colors"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono flex items-center gap-1 cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        {tag} <span className="text-slate-500">×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ritual */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                    The Ritual
                  </label>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertBullet(ritualRef, ritual, setRitual)}
                    title="Insert bullet"
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-purple-400 text-xs border border-slate-700 transition-colors"
                  >
                    <List size={11} />
                  </button>
                </div>
                <textarea
                  ref={ritualRef}
                  value={ritual}
                  onChange={(e) => setRitual(e.target.value)}
                  placeholder="Procedures, steps, theory — markdown supported..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 font-mono text-sm focus:outline-none focus:border-purple-500/70 focus:shadow-[0_0_0_1px_rgba(168,85,247,0.15)] resize-none transition-all"
                />
              </div>

              {/* Incantation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    The Incantation
                  </label>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertBullet(incantationRef, incantation, setIncantation)}
                    title="Insert bullet"
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 text-xs border border-slate-700 transition-colors"
                  >
                    <List size={11} />
                  </button>
                </div>
                <textarea
                  ref={incantationRef}
                  value={incantation}
                  onChange={(e) => setIncantation(e.target.value)}
                  placeholder="Raw prompts, code snippets, terminal commands..."
                  rows={4}
                  className="w-full bg-slate-950 border border-cyan-900/40 rounded-lg px-4 py-3 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_0_1px_rgba(6,182,212,0.15)] resize-none transition-all"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              >
                {isSaving
                  ? <><Loader2 size={13} className="animate-spin" /> Scribing...</>
                  : 'Scribe Spell'
                }
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
