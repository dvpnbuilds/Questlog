
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Upload, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Note } from '../types';

export function SpellbookNoteCard({ note, onUpdate, isExpanded, onToggle }: { note: Note; onUpdate: (n: Note) => void; isExpanded: boolean; onToggle: () => void }) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [tagInput, setTagInput] = useState('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newImages = [...(note.images || []), base64String];
        onUpdate({ ...note, images: newImages });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
        onUpdate({...note, tags: [...note.tags, tagInput.trim()]});
        setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({...note, tags: note.tags.filter(t => t !== tagToRemove)});
  };

  const updateDescription = (newDesc: string) => {
    onUpdate({ ...note, description: newDesc });
  };

  const updateTitle = (newTitle: string) => {
    onUpdate({ ...note, title: newTitle });
  };

  return (
    <motion.div
      className="rounded-xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden"
    >
      <div 
        onClick={onToggle}
        className="p-5 cursor-pointer flex items-center justify-between"
      >
        <div>
            {mode === 'edit' && isExpanded ? (
                <input 
                    value={note.title}
                    onChange={(e) => updateTitle(e.target.value)}
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
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown className="text-slate-500" />
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5"
          >
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-700 mb-4 w-fit">
                <button onClick={() => setMode('edit')} className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold ${mode === 'edit' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}><Edit3 size={14} /> Edit</button>
                <button onClick={() => setMode('preview')} className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold ${mode === 'preview' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}><Eye size={14} /> Preview</button>
            </div>
            
            {mode === 'edit' ? (
                <>
                <div className="mb-4">
                    <input 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add tag and hit Enter..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-xs mb-2 focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-2">
                        {note.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono flex items-center gap-1 cursor-pointer hover:bg-slate-700" onClick={() => removeTag(tag)}>
                                {tag} <span>×</span>
                            </span>
                        ))}
                    </div>
                </div>
                <textarea
                  value={note.description}
                  onChange={(e) => updateDescription(e.target.value)}
                  className="w-full min-h-[300px] bg-slate-900/50 border border-slate-700 rounded-lg p-6 text-slate-300 font-mono text-sm focus:outline-none focus:border-cyan-500 resize-y"
                />
                </>
            ) : (
                <div className="w-full min-h-[300px] p-6 text-slate-300 font-sans text-base leading-relaxed overflow-y-auto prose prose-invert prose-cyan max-w-none">
                    <ReactMarkdown>{note.description}</ReactMarkdown>
                </div>
            )}
            
            <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                    {note.images?.map((img, i) => (
                        <img key={i} src={img} alt="Gallery" className="w-16 h-16 rounded-lg object-cover border border-slate-700"/>
                    ))}
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/50 cursor-pointer">
                        <Upload size={16} />
                        <span className='text-[8px] uppercase font-bold'>Add</span>
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
