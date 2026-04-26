
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Upload, Eye, Edit3, List, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Note } from '../types';

export function SpellbookNoteCard({ note, onUpdate, isExpanded, onToggle }: {
  note: Note;
  onUpdate: (n: Note) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [previewTab, setPreviewTab] = useState<'ritual' | 'incantation'>('ritual');
  const [tagInput, setTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const ritualRef = useRef<HTMLTextAreaElement>(null);
  const incantationRef = useRef<HTMLTextAreaElement>(null);

  const insertBullet = (ref: React.RefObject<HTMLTextAreaElement | null>, field: 'ritual' | 'incantation') => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;
    const before = value.substring(0, start);
    const after = value.substring(end);
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    const insertion = (needsNewline ? '\n' : '') + '- ';
    const newCursor = start + insertion.length;
    onUpdate({ ...note, [field]: before + insertion + after });
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        ref.current.setSelectionRange(newCursor, newCursor);
      }
    }, 0);
  };

  const copyIncantation = () => {
    navigator.clipboard.writeText(note.incantation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...note, images: [...(note.images || []), reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      onUpdate({ ...note, tags: [...note.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({ ...note, tags: note.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <motion.div className="rounded-xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden">
      {/* Card Header */}
      <div onClick={onToggle} className="p-5 cursor-pointer flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {mode === 'edit' && isExpanded ? (
            <input
              value={note.title}
              onChange={(e) => onUpdate({ ...note, title: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="text-lg font-bold text-white mb-2 bg-slate-800 p-1 rounded border border-slate-700 focus:outline-none focus:border-cyan-500 w-full"
            />
          ) : (
            <h3 className="text-lg font-bold text-white mb-2">{note.title}</h3>
          )}
          <div className="flex flex-wrap gap-2">
            {note.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">#{tag}</span>
            ))}
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="ml-4 shrink-0">
          <ChevronDown className="text-slate-500" />
        </motion.div>
      </div>

      {/* Expanded Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5"
          >
            {/* Edit / Preview mode toggle */}
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-700 mb-4 w-fit">
              <button
                onClick={() => setMode('edit')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors ${mode === 'edit' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={() => setMode('preview')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors ${mode === 'preview' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Eye size={14} /> Preview
              </button>
            </div>

            {mode === 'edit' ? (
              <>
                {/* Tags editor */}
                <div className="mb-5">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag and hit Enter..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-xs mb-2 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        onClick={() => removeTag(tag)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono flex items-center gap-1 cursor-pointer hover:bg-slate-700"
                      >
                        {tag} <span>×</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* The Ritual textarea */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">The Ritual</label>
                    <button
                      onClick={() => insertBullet(ritualRef, 'ritual')}
                      title="Insert bullet point"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-purple-400 text-xs border border-slate-700 transition-colors"
                    >
                      <List size={12} />
                    </button>
                  </div>
                  <textarea
                    ref={ritualRef}
                    value={note.ritual}
                    onChange={(e) => onUpdate({ ...note, ritual: e.target.value })}
                    placeholder="Procedures, steps, theory — markdown supported..."
                    className="w-full min-h-[180px] bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-purple-500/70 focus:shadow-[0_0_0_1px_rgba(168,85,247,0.2)] resize-y transition-shadow"
                  />
                </div>

                {/* The Incantation textarea */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest">The Incantation</label>
                    <button
                      onClick={() => insertBullet(incantationRef, 'incantation')}
                      title="Insert bullet point"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 text-xs border border-slate-700 transition-colors"
                    >
                      <List size={12} />
                    </button>
                  </div>
                  <textarea
                    ref={incantationRef}
                    value={note.incantation}
                    onChange={(e) => onUpdate({ ...note, incantation: e.target.value })}
                    placeholder="Raw prompts, code snippets, terminal commands..."
                    className="w-full min-h-[180px] bg-slate-950 border border-cyan-900/40 rounded-lg p-4 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_0_1px_rgba(6,182,212,0.2)] resize-y transition-shadow"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Preview tab switcher */}
                <div className="flex gap-1 bg-slate-950 rounded-lg p-1 border border-slate-700 mb-4 w-fit">
                  <button
                    onClick={() => setPreviewTab('ritual')}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${previewTab === 'ritual' ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(147,51,234,0.4)]' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Ritual
                  </button>
                  <button
                    onClick={() => setPreviewTab('incantation')}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${previewTab === 'incantation' ? 'bg-cyan-600 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Incantation
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {previewTab === 'ritual' ? (
                    <motion.div
                      key="ritual"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.15 }}
                      className="spell-prose w-full min-h-[300px] p-6 text-slate-300 text-base rounded-lg bg-slate-900/30 border border-slate-700/50"
                    >
                      {note.ritual
                        ? <ReactMarkdown>{note.ritual}</ReactMarkdown>
                        : <p style={{ whiteSpace: 'normal' }} className="text-slate-600 italic text-sm">No ritual scribed.</p>
                      }
                    </motion.div>
                  ) : (
                    <motion.div
                      key="incantation"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="relative"
                    >
                      <button
                        onClick={copyIncantation}
                        className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all z-10 ${copied ? 'bg-green-600 text-white border-green-500' : 'bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white border-slate-600'}`}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <div className="spell-prose spell-incantation w-full min-h-[300px] bg-slate-950 border border-cyan-900/50 rounded-lg p-5 pr-24 text-cyan-300 font-mono text-sm leading-relaxed shadow-[inset_0_0_30px_rgba(6,182,212,0.03)]">
                        {note.incantation
                          ? <ReactMarkdown>{note.incantation}</ReactMarkdown>
                          : <p style={{ whiteSpace: 'normal' }} className="text-slate-600 italic">No incantation scribed.</p>
                        }
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Image gallery */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {note.images?.map((img, i) => (
                  <img key={i} src={img} alt="Gallery" className="w-16 h-16 rounded-lg object-cover border border-slate-700" />
                ))}
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/50 cursor-pointer transition-colors">
                  <Upload size={16} />
                  <span className="text-[8px] uppercase font-bold">Add</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
