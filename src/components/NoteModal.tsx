/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Note } from '../types';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

interface ModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNote: (updatedNote: Note) => void;
}

export function NoteModal({ note, isOpen, onClose, onUpdateNote }: ModalProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [description, setDescription] = useState(note?.ritual || '');
  const [images, setImages] = useState<string[]>(note?.images || []);

  useEffect(() => {
    setDescription(note?.ritual || '');
    setImages(note?.images || []);
    setMode('edit');
  }, [note]);

  if (!isOpen || !note) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newImages = [...images, base64String];
        setImages(newImages);
        onUpdateNote({ ...note, ritual: description, images: newImages });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDescription = (newDesc: string) => {
    setDescription(newDesc);
    onUpdateNote({ ...note, ritual: newDesc, images });
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
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-3xl shadow-[0_0_50px_rgba(34,211,238,0.1)] relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{note.title}</h2>
              <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-700">
                  <button 
                      onClick={() => setMode('edit')}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold transition-all ${mode === 'edit' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      <Edit3 size={16} /> Edit
                  </button>
                  <button 
                      onClick={() => setMode('preview')}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold transition-all ${mode === 'preview' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      <Eye size={16} /> Preview
                  </button>
              </div>
            </div>

            {mode === 'edit' ? (
                <textarea
                  value={description}
                  onChange={(e) => updateDescription(e.target.value)}
                  className="w-full min-h-[40vh] bg-slate-900/50 border border-slate-700 rounded-lg p-6 text-slate-300 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-y"
                  placeholder="Note details (Markdown supported)..."
                />
            ) : (
                <div className="w-full min-h-[40vh] p-6 text-slate-300 font-sans text-base leading-relaxed overflow-y-auto prose prose-invert prose-cyan max-w-none">
                    <ReactMarkdown skipHtml>{description}</ReactMarkdown>
                </div>
            )}
            
            <div className="mt-6">
                <h3 className="text-cyan-400 font-bold mb-3 uppercase tracking-tighter text-xs">Media Gallery</h3>
                <div className="flex flex-wrap gap-4">
                    {images.map((img, i) => (
                        <div key={i} className="relative">
                            <img src={img} alt="Gallery" className="w-20 h-20 rounded-lg object-cover border border-slate-700"/>
                        </div>
                    ))}
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors cursor-pointer">
                        <Upload size={20} className='mb-1'/>
                        <span className='text-[10px] font-bold uppercase'>Upload</span>
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
