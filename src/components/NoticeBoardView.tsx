
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Trash2, RotateCcw, X, Target } from 'lucide-react';
import type { Bounty, TimelineEvent } from '../types';

type ViewName = 'noticeboard' | 'active' | 'completed' | 'spellbook' | 'skilltree' | 'profile';

interface Props {
    dailyBounties: Bounty[];
    addBounty: (title: string) => void;
    toggleBounty: (id: string) => void;
    abandonBounty: (id: string) => void;
    reviveBounty: (id: string) => void;
    timelineEvents: TimelineEvent[];
    addEvent: (time: string, description: string, isRecurring: boolean) => void;
    deleteEvent: (id: string) => void;
    toggleTimelineEvent: (id: string) => void;
    isGrinding: boolean;
    setIsGrinding: (value: boolean) => void;
    setActiveView: (view: ViewName) => void;
    setIsNewQuestModalOpen: (value: boolean) => void;
    addNote: () => void;
}

export function NoticeBoardView({ dailyBounties, addBounty, toggleBounty, abandonBounty, reviveBounty, timelineEvents, addEvent, deleteEvent, toggleTimelineEvent, isGrinding, setIsGrinding, setActiveView, setIsNewQuestModalOpen, addNote }: Props) {
    const [isAddingBounty, setIsAddingBounty] = useState(false);
    const [newBountyTitle, setNewBountyTitle] = useState('');
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [newEventTime, setNewEventTime] = useState('12:00');
    const [newEventDesc, setNewEventDesc] = useState('');
    const [newEventRecurring, setNewEventRecurring] = useState(false);

    const handleAddBounty = (e: React.FormEvent) => {
        e.preventDefault();
        if (newBountyTitle.trim()) {
            addBounty(newBountyTitle.trim());
            setNewBountyTitle('');
            setIsAddingBounty(false);
        }
    };

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEventDesc.trim() && newEventTime) {
            addEvent(newEventTime, newEventDesc.trim(), newEventRecurring);
            setNewEventDesc('');
            setNewEventTime('12:00');
            setNewEventRecurring(false);
            setIsAddingEvent(false);
        }
    };

    const completedBounties = dailyBounties.filter(b => b.status === 'completed');
    const completedEvents = timelineEvents.filter(e => e.isCompleted);
    const completedNames = [
        ...completedBounties.map(b => b.title),
        ...completedEvents.map(e => e.description)
    ];

    const totalCompletedTasks = completedBounties.length + completedEvents.length;
    const totalXPEarnedToday = (completedBounties.length * 10) + (completedEvents.length * 5);

    return (
        <motion.main key="noticeboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">Notice Board</h1>
                    <div className="grid grid-cols-2 gap-3 mt-4 sm:flex sm:gap-4">
                        <button onClick={() => { setActiveView('spellbook'); addNote(); }} className="px-3 py-2 bg-slate-800 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-700 text-sm">New Note</button>
                        <button onClick={() => { setActiveView('active'); setIsNewQuestModalOpen(true); }} className="px-3 py-2 bg-slate-800 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-700 text-sm">New Quest</button>
                    </div>
                </div>
                <button onClick={() => setIsGrinding(!isGrinding)} className={`w-full justify-center px-5 py-2.5 bg-[#020617] border rounded flex items-center gap-3 font-bold uppercase tracking-tighter transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] lg:w-auto ${isGrinding ? 'border-red-500/50 text-red-400 animate-pulse' : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'}`}>
                    {isGrinding ? 'Stop Grinding' : 'Enter Grind Mode'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Today's Timeline</h2>
                        <button onClick={() => setIsAddingEvent(!isAddingEvent)} className="text-cyan-400 hover:text-cyan-300 bg-slate-800 rounded-full p-2"><Plus size={16}/></button>
                    </div>
                    <AnimatePresence>
                        {isAddingEvent && (
                            <motion.form initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} onSubmit={handleAddEvent} className="mb-4 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex flex-col gap-3">
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 w-full">
                                    <input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 focus:ring-1 focus:ring-cyan-500" />
                                    <input type="text" value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="Event description" className="w-full bg-slate-900 border border-slate-700 rounded px-2 focus:ring-1 focus:ring-cyan-500 placeholder:text-xs" />
                                </div>
                                <div className='flex items-center justify-between gap-2 mt-4'>
                                    <label className='flex items-center gap-2 text-sm text-slate-400'><input type='checkbox' checked={newEventRecurring} onChange={e => setNewEventRecurring(e.target.checked)} /> Repeat Daily</label>
                                    <button type="submit" className="bg-slate-800 hover:bg-slate-700 px-4 py-1 rounded text-cyan-400 font-medium">Add</button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {timelineEvents.map(event => (
                                <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className={`p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex items-start gap-3 sm:items-center sm:gap-4 group ${event.isCompleted ? 'opacity-50' : ''}`}>
                                    <button onClick={() => toggleTimelineEvent(event.id)} className={`mt-1 flex items-center justify-center w-5 h-5 shrink-0 rounded-full border sm:mt-0 sm:w-4 sm:h-4 ${event.isCompleted ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-slate-600'}`}><Check size={10}/></button>
                                    <span className={`w-16 shrink-0 font-mono text-cyan-400 text-sm ${event.isCompleted ? 'line-through' : ''}`}>{event.time}</span>
                                    <span className={`min-w-0 flex-1 break-words ${event.isCompleted ? 'line-through' : ''}`}>{event.description}</span>
                                    <button onClick={() => deleteEvent(event.id)} className="text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 size={16}/></button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
                
                <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Daily Bounties</h2>
                        <button onClick={() => setIsAddingBounty(!isAddingBounty)} className="text-cyan-400 hover:text-cyan-300 bg-slate-800 rounded-full p-2"><Plus size={16}/></button>
                    </div>
                    <AnimatePresence>
                        {isAddingBounty && (
                            <motion.form initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} onSubmit={handleAddBounty} className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <input autoFocus type="text" value={newBountyTitle} onChange={e => setNewBountyTitle(e.target.value)} placeholder="Bounty title" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 mb-2 focus:ring-1 focus:ring-cyan-500" />
                                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 rounded text-cyan-400 py-1">Add Bounty</button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Active Bounties</h3>
                            <div className="space-y-2">
                            <AnimatePresence>
                                {dailyBounties.filter(b => b.status === 'active').map(bounty => (
                                    <motion.div key={bounty.id} className="p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex justify-between items-start gap-3 sm:items-center">
                                        <span className="min-w-0 break-words text-white">{bounty.title}</span>
                                        <button onClick={() => toggleBounty(bounty.id)} className="text-cyan-400 hover:text-cyan-300"><Check size={20}/></button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">Unfinished / Failed</h3>
                            <div className="space-y-2">
                            <AnimatePresence>
                                {dailyBounties.filter(b => b.status === 'failed').map(bounty => (
                                    <motion.div key={bounty.id} className="p-3 sm:p-4 bg-slate-950 rounded-lg border border-red-900/50 flex justify-between items-start gap-3 sm:items-center">
                                        <span className="min-w-0 break-words text-red-500/70">{bounty.title}</span>
                                        <div className='flex gap-2'>
                                            <button onClick={() => reviveBounty(bounty.id)} className="text-cyan-400 hover:text-cyan-300"><RotateCcw size={16}/></button>
                                            <button onClick={() => abandonBounty(bounty.id)} className="text-red-400 hover:text-red-300"><X size={16}/></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className='bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between shadow-[0_0_30px_rgba(6,182,212,0.1)]'>
                <div className='flex gap-4 items-center'>
                    <Target size={40} className='shrink-0 text-cyan-400 sm:size-12'/>
                    <div>
                        <h2 className='text-xl font-bold text-white sm:text-2xl'>Today's Grind Summary</h2>
                        <p className='text-slate-400'>Total tasks completed today: <span className='font-bold text-cyan-400'>{totalCompletedTasks}</span></p>
                    </div>
                </div>
                <div className='w-full flex-1 lg:mx-8'>
                    <h3 className='text-xs text-slate-400 uppercase tracking-widest mb-2'>Defeated Tasks</h3>
                    <div className='flex flex-wrap gap-2 max-h-24 overflow-y-auto'>
                        {completedNames.length > 0 ? (
                            completedNames.map((name, i) => (
                                <span key={i} className='text-xs px-3 py-1 rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-500/30'>{name}</span>
                            ))
                        ) : (
                            <span className='text-xs italic text-slate-500'>The board is quiet... for now.</span>
                        )}
                    </div>
                </div>
                <div className='text-left lg:text-right'>
                    <p className='text-sm text-slate-400 uppercase tracking-widest'>XP Earned Today</p>
                    <p className='text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500'>{totalXPEarnedToday}</p>
                </div>
            </section>
        </motion.main>
    );
}
