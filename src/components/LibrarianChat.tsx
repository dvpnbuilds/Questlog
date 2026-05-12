import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookMarked, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Note } from '../types';

const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY_MESSAGES = 8;
const MAX_CONTEXT_SPELLS = 50;
const MAX_CONTEXT_FIELD_CHARS = 1500;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function LibrarianChat({ spells }: { spells: Note[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('librarian', {
        body: {
          message: text,
          history: messages.slice(-MAX_HISTORY_MESSAGES).map((msg) => ({
            role: msg.role,
            content: msg.content.slice(0, MAX_MESSAGE_CHARS),
          })),
          spells: spells.slice(0, MAX_CONTEXT_SPELLS).map((spell) => ({
            title: spell.title.slice(0, MAX_CONTEXT_FIELD_CHARS),
            ritual: spell.ritual.slice(0, MAX_CONTEXT_FIELD_CHARS),
            incantation: spell.incantation.slice(0, MAX_CONTEXT_FIELD_CHARS),
            tags: spell.tags.slice(0, 10).map((tag) => tag.slice(0, 80)),
          })),
        },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'The tomes are silent, traveler. The connection to the archives has been lost — please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="librarian-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            title="Ask the Librarian"
            className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-slate-900/90 border border-purple-500/40 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.35)] hover:shadow-[0_0_45px_rgba(147,51,234,0.55)] hover:border-purple-400/60 transition-all group lg:bottom-6 lg:right-6"
          >
            {/* Outer pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-purple-500/15 group-hover:bg-purple-500/25" />
            <BookMarked size={22} className="text-purple-300 relative z-10 group-hover:text-purple-200 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="librarian-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-3 bottom-24 z-50 flex h-[min(620px,calc(100dvh-7.5rem))] flex-col overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_80px_rgba(147,51,234,0.12),0_25px_50px_rgba(0,0,0,0.6)] sm:left-auto sm:right-4 sm:w-[380px] lg:bottom-6 lg:right-6 lg:bg-slate-900/85"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-purple-500/20 bg-purple-950/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/30 flex items-center justify-center">
                    <BookMarked size={15} className="text-purple-300" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-purple-400 border-2 border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none">The Librarian</h3>
                  <p className="text-[10px] text-purple-400/60 mt-0.5">{spells.length} spell{spells.length !== 1 ? 's' : ''} in the tome</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-4">
                  <div className="w-14 h-14 rounded-full bg-purple-950/50 border border-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.15)]">
                    <BookMarked size={22} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Greetings, traveler.</p>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed max-w-[220px]">
                      Ask me anything about your spellbook. I have memorized every tome in the archive.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full max-w-[260px]">
                    {[
                      'How did I set up the GHL redirect?',
                      'What spells do I have for automation?',
                      'Show me my Supabase auth setup.',
                    ].map(hint => (
                      <button
                        key={hint}
                        onClick={() => { setInput(hint); inputRef.current?.focus(); }}
                      className="break-words text-[11px] text-purple-400/70 hover:text-purple-300 border border-purple-500/15 hover:border-purple-500/30 rounded-lg px-3 py-1.5 transition-colors text-left"
                      >
                        "{hint}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[82%] ${
                    msg.role === 'user'
                      ? 'bg-cyan-600/80 text-white rounded-br-sm'
                      : 'bg-purple-950/60 border border-purple-500/20 text-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-purple-950/60 border border-purple-500/20 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-purple-500/20 bg-slate-950/30 shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
                  maxLength={MAX_MESSAGE_CHARS}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask the Librarian..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_12px_rgba(147,51,234,0.4)] shrink-0"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
