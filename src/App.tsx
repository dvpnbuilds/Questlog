/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Plus, BookOpen, User, Search } from 'lucide-react';
import { QuestCard } from './components/QuestCard';
import { SpellbookNoteCard } from './components/SpellbookNoteCard';
import { NewQuestModal } from './components/NewQuestModal';
import { ActiveQuestModal } from './components/ActiveQuestModal';
import { NoticeBoardView } from './components/NoticeBoardView';
import { SkillTreeView } from './components/SkillTreeView';
import { ProfileView } from './components/ProfileView';
import { supabase } from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import type { Session } from '@supabase/supabase-js';
import type { Quest, Rarity, Note, Bounty, TimelineEvent, Encounter } from './types';

const ALL_REQUIRED_QUESTS: Omit<Quest, 'id' | 'createdAt'>[] = [
    { title: 'The First Beacon', description: 'Build a Node.js server that says System Online on localhost:3000.', category: 'Mastery', rarity: 'Common', xp: 50, status: 'active' },
    { title: 'The Webhook Receiver', description: 'Create a POST endpoint that can receive a real payload from a GHL Webhook.', category: 'Mastery', rarity: 'Rare', xp: 100, status: 'active' },
    { title: 'The Env Sentinel', description: 'Successfully hide API keys in a .env file and access them in code.', category: 'Mastery', rarity: 'Rare', xp: 75, status: 'active' },
    { title: 'Foundation I: Initialize Supabase', description: 'Initialize Supabase project & link it to the React frontend.', category: 'Architect', rarity: 'Common', xp: 100, status: 'active' },
    { title: 'Foundation II: Schema Design', description: 'Design PostgreSQL schema for Users, StudyNotes, and QuizHistory.', category: 'Architect', rarity: 'Rare', xp: 150, status: 'active' },
    { title: 'Foundation III: Implement Auth', description: 'Implement Email/Password and Google OAuth so users can save progress.', category: 'Architect', rarity: 'Rare', xp: 200, status: 'active' },
    { title: 'Foundation IV: Real Data Migration', description: 'Replace all localStorage or mock data with real Supabase calls.', category: 'Architect', rarity: 'Epic', xp: 250, status: 'active' },
    { title: 'Bridge I: The GHL Webhook', description: 'Set up a Webhook or Edge Function to ping GHL when a new user signs up.', category: 'Architect', rarity: 'Rare', xp: 200, status: 'active' },
    { title: 'Bridge II: Lead Magnet Flow', description: 'If a user finishes a quiz in the Med App, GHL automatically emails a summary PDF.', category: 'Architect', rarity: 'Epic', xp: 250, status: 'active' },
    { title: 'Bridge III: Quoting Tool Connect', description: 'Connect the Quoting tool to Supabase to store history before sending to GHL.', category: 'Architect', rarity: 'Epic', xp: 300, status: 'active' },
    { title: 'Showcase I: Architecture Diagram', description: 'Design the Architecture Diagram component using Figma or Framer Motion.', category: 'Architect', rarity: 'Common', xp: 100, status: 'active' },
    { title: 'Showcase II: Dark-Mode Hero', description: 'Build the Hero section with a high-end, dark-mode aesthetic.', category: 'Architect', rarity: 'Rare', xp: 150, status: 'active' },
    { title: 'Showcase III: Loom Demos', description: 'Record Loom Demos for 1. RAG flow, 2. GHL Automation, 3. Quoting Tool.', category: 'Architect', rarity: 'Rare', xp: 200, status: 'active' },
    { title: 'Showcase IV: Deployment', description: 'Deploy the entire portfolio to dvpnbuilds.com.', category: 'Architect', rarity: 'Epic', xp: 500, status: 'active' },
    { title: 'System Blueprint Creation', description: 'Design system maps.', category: 'Standard', rarity: 'Rare', xp: 150, status: 'active' },
    { title: 'RAG Implementation (Med App)', description: 'Retrieval Augmented Generation.', category: 'Standard', rarity: 'Epic', xp: 600, status: 'active' },
    { title: 'Performance Optimization', description: 'Make it fast.', category: 'Standard', rarity: 'Common', xp: 100, status: 'active' },
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const [playerLevel, setPlayerLevel] = useState<number>(() => {
    const saved = localStorage.getItem('playerLevel');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [playerXP, setPlayerXP] = useState<number>(() => {
    const saved = localStorage.getItem('playerXP');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    const saved = localStorage.getItem('dailyStreak');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [unlockedNodeIds, setUnlockedNodeIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('unlockedNodeIds');
    return saved ? new Set(JSON.parse(saved)) : new Set(['frontend_novice']);
  });
  const [activeView, setActiveView] = useState<'noticeboard' | 'active' | 'completed' | 'spellbook' | 'skilltree' | 'profile'>('noticeboard');
  const [isNewQuestModalOpen, setIsNewQuestModalOpen] = useState(false);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [isGrinding, setIsGrinding] = useState(false);
  const [activeEncounter, setActiveEncounter] = useState<Encounter | null>(null);

  const randomEncounters: Encounter[] = [
    { id: '1', text: '💧 A Water Elemental demands a tribute! Drink a glass of water.' },
    { id: '2', text: '🧘‍♂️ A wandering monk casts Stiff Neck. Fix your posture and stretch!' },
    { id: '3', text: '💾 A shadowy rogue whispers: When was your last save/commit?' },
    { id: '4', text: '🦆 A mystical Rubber Duck appears. Explain your current task out loud to it.' },
    { id: '5', text: '👹 The Scope Creep Goblin hisses: Add one more feature! Resist the urge and stay focused.' },
    { id: '6', text: '👁️ A fairy casts Screen Glare! Look 20 feet away for 20 seconds.' },
  ];

  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSpell, setIsCreatingSpell] = useState(false);
  const [spellError, setSpellError] = useState<string | null>(null);

  useEffect(() => {
    const syncWithSupabase = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('quests')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                setQuests(data);
            } else {
                const { data: seededData, error: seedError } = await supabase
                    .from('quests')
                    .insert(ALL_REQUIRED_QUESTS)
                    .select();

                if (seedError) throw seedError;
                if (seededData) setQuests(seededData);
            }
        } catch (err) {
            console.error('Supabase Sync Error:', err);
        } finally {
            setIsLoading(false);
        }
    };
    syncWithSupabase();
  }, []);

  const [recallNotes, setRecallNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchSpells = async () => {
      const { data, error } = await supabase
        .from('spells')
        .select('id, title, tags, ritual, incantation')
        .order('id', { ascending: true });
      if (error) { console.error('Failed to fetch spells:', error); return; }
      if (data) setRecallNotes(data);
    };
    fetchSpells();
  }, []);

  const [dailyBounties, setDailyBounties] = useState<Bounty[]>(() => {
    const saved = localStorage.getItem('dailyBounties');
    try {
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('timelineEvents');
    try {
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('playerLevel', playerLevel.toString());
    localStorage.setItem('playerXP', playerXP.toString());
    localStorage.setItem('unlockedNodeIds', JSON.stringify(Array.from(unlockedNodeIds)));
    localStorage.setItem('dailyStreak', dailyStreak.toString());
    localStorage.setItem('dailyBounties', JSON.stringify(dailyBounties));
    localStorage.setItem('timelineEvents', JSON.stringify(timelineEvents));
  }, [playerLevel, playerXP, unlockedNodeIds, dailyStreak, dailyBounties, timelineEvents]);

  const XP_REWARDS: Record<Rarity, number> = { Common: 50, Rare: 100, Epic: 250, Legendary: 500 };

  const addXP = (amount: number) => {
    let totalXP = playerXP + amount;
    let newLevel = playerLevel;
    while (totalXP >= 500) {
        newLevel++;
        totalXP -= 500;
    }
    setPlayerXP(totalXP);
    setPlayerLevel(newLevel);
  };

  const completeQuest = async (id: string, rarity: Rarity) => {
    const completedAt = Date.now();
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'completed', completedAt } : q));
    setActiveQuest(null);
    addXP(XP_REWARDS[rarity] || 0);
    const { error } = await supabase
      .from('quests')
      .update({ status: 'completed', completed_at: completedAt })
      .eq('id', id);
    if (error) console.error('Failed to complete quest:', error);
  };

  const addQuest = async (title: string, rarity: Rarity) => {
    const newQuest = {
      title,
      description: 'A newly created quest.',
      category: 'Side Quest',
      rarity,
      xp: XP_REWARDS[rarity],
      status: 'active',
    };
    const { data, error } = await supabase.from('quests').insert(newQuest).select().single();
    if (error) { console.error('Failed to add quest:', error); return; }
    if (data) setQuests(prev => [...prev, data]);
  };

  const updateQuest = async (updatedQuest: Quest) => {
    setQuests(prev => prev.map(q => q.id === updatedQuest.id ? updatedQuest : q));
    const { error } = await supabase
      .from('quests')
      .update({ description: updatedQuest.description, images: updatedQuest.images })
      .eq('id', updatedQuest.id);
    if (error) console.error('Failed to update quest:', error);
  };

  const deleteQuest = async (id: string) => {
    setQuests(prev => prev.filter(q => q.id !== id));
    setActiveQuest(null);
    const { error } = await supabase.from('quests').delete().eq('id', id);
    if (error) console.error('Failed to delete quest:', error);
  };

  const updateNote = async (updatedNote: Note) => {
    setRecallNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    const { error } = await supabase.from('spells').upsert({
      id: updatedNote.id,
      title: updatedNote.title,
      tags: updatedNote.tags,
      ritual: updatedNote.ritual,
      incantation: updatedNote.incantation,
    });
    if (error) console.error('Failed to save spell:', error);
  };

  const addNote = async () => {
    setIsCreatingSpell(true);
    setSpellError(null);
    try {
      const { data, error } = await supabase
        .from('spells')
        .insert({ title: 'New Spell', ritual: '', incantation: '', tags: ['new'] })
        .select('id, title, tags, ritual, incantation')
        .single();
      if (error) throw error;
      if (data) {
        setRecallNotes(prev => [...prev, data]);
        setExpandedNoteId(data.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Unknown error';
      console.error('Failed to create spell:', err);
      setSpellError(msg);
    } finally {
      setIsCreatingSpell(false);
    }
  };

  const deleteEvent = (id: string) => {
      setTimelineEvents(prev => prev.filter(e => e.id !== id));
  };

  const toggleTimelineEvent = (id: string) => {
      setTimelineEvents(prev => prev.map(e => {
          if (e.id === id) {
              if (!e.isCompleted) {
                  addXP(5);
                  return { ...e, isCompleted: true, completedAt: Date.now() };
              }
              return { ...e, isCompleted: false, completedAt: undefined };
          }
          return e;
      }));
  };

  const addEvent = (time: string, description: string, isRecurring: boolean) => {
    setTimelineEvents(prev => [...prev, { id: Date.now().toString(), time, description, isCompleted: false, isRecurring }].sort((a,b) => a.time.localeCompare(b.time)));
  };

  const toggleBounty = (id: string) => {
    setDailyBounties(prev => {
        const next = prev.map(b => {
            if (b.id === id && b.status === 'active') {
                addXP(10);
                return { ...b, status: 'completed' as const };
            }
            return b;
        });
        if (next.length > 0 && next.every(b => b.status === 'completed')) {
            setDailyStreak(s => s + 1);
        }
        return next;
    });
  };

  const addBounty = (title: string) => {
    setDailyBounties([...dailyBounties, { id: Date.now().toString(), title, status: 'active', createdAt: Date.now() }]);
  };

  const abandonBounty = (id: string) => {
      setDailyBounties(prev => prev.filter(b => b.id !== id));
  };

  const reviveBounty = (id: string) => {
      setDailyBounties(prev => prev.map(b => b.id === id ? { ...b, status: 'active' as const, createdAt: Date.now() } : b));
  };

  useEffect(() => {
      const interval = setInterval(() => {
          const now = Date.now();
          setDailyBounties(prev => prev.map(b => {
              if (b.status === 'active' && now > b.createdAt + 24 * 60 * 60 * 1000) {
                  return { ...b, status: 'failed' as const };
              }
              return b;
          }));

          setTimelineEvents(prev => prev.map(e => {
            if (e.isRecurring && e.isCompleted && new Date(now).getHours() === 0 && new Date(now).getMinutes() === 0) {
                return { ...e, isCompleted: false, completedAt: undefined };
            }
            return e;
          }));
      }, 60000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isGrinding) {
          interval = setInterval(() => {
              const random = randomEncounters[Math.floor(Math.random() * randomEncounters.length)];
              setActiveEncounter(random);
          }, 20 * 60 * 1000);
      }
      return () => clearInterval(interval);
  }, [isGrinding]);

  const resetData = () => {
      if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
          localStorage.clear();
          setPlayerLevel(1);
          setPlayerXP(0);
          setQuests([]);
          setActiveView('noticeboard');
          setActiveQuest(null);
          setDailyBounties([]);
          setTimelineEvents([]);
      }
  };

  if (!session) return <LoginScreen />;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans border border-slate-800 md:flex-row flex-col">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-cyan-500/30 bg-slate-900/40 backdrop-blur-xl flex-col shadow-[4px_0_24px_rgba(6,182,212,0.1)]">
        <div className="p-6 border-b border-slate-800">
            <h1 className="font-display text-2xl font-bold tracking-tighter text-white">QUEST<span className="text-cyan-400">LOG</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveView('noticeboard')}
            className={`w-full flex items-center gap-3 rounded-lg p-3 font-medium transition-all ${activeView === 'noticeboard' ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <LayoutDashboard size={20} /> Notice Board
          </button>
          <button
            onClick={() => setActiveView('active')}
            className={`w-full flex items-center gap-3 rounded-lg p-3 font-medium transition-all ${activeView === 'active' ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <LayoutDashboard size={20} /> Active Quests
          </button>
          <button
            onClick={() => setActiveView('spellbook')}
            className={`w-full flex items-center gap-3 rounded-lg p-3 font-medium transition-all ${activeView === 'spellbook' ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <BookOpen size={20} /> The Spellbook
          </button>
          <button
            onClick={() => setActiveView('skilltree')}
            className={`w-full flex items-center gap-3 rounded-lg p-3 font-medium transition-all ${activeView === 'skilltree' ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <BookOpen size={20} /> Skill Tree
          </button>
           <button
             onClick={() => setActiveView('profile')}
             className={`w-full flex items-center gap-3 rounded-lg p-3 font-medium transition-all ${activeView === 'profile' ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
             <User size={20} /> Profile
           </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
             <button onClick={resetData} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Reset Data</button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden flex justify-between items-center bg-slate-950 border-t border-slate-800 p-2">
        <button onClick={() => setActiveView('noticeboard')} className={`flex flex-col items-center gap-1 p-2 ${activeView === 'noticeboard' ? 'text-cyan-400' : 'text-slate-500'}`}><LayoutDashboard size={20}/> <span className="text-[10px]">Board</span></button>
        <button onClick={() => setActiveView('active')} className={`flex flex-col items-center gap-1 p-2 ${activeView === 'active' ? 'text-cyan-400' : 'text-slate-500'}`}><LayoutDashboard size={20}/> <span className="text-[10px]">Quests</span></button>
        <button onClick={() => setActiveView('spellbook')} className={`flex flex-col items-center gap-1 p-2 ${activeView === 'spellbook' ? 'text-cyan-400' : 'text-slate-500'}`}><BookOpen size={20}/> <span className="text-[10px]">Spell</span></button>
        <button onClick={() => setActiveView('skilltree')} className={`flex flex-col items-center gap-1 p-2 ${activeView === 'skilltree' ? 'text-cyan-400' : 'text-slate-500'}`}><BookOpen size={20}/> <span className="text-[10px]">Skills</span></button>
        <button onClick={() => setActiveView('profile')} className={`flex flex-col items-center gap-1 p-2 ${activeView === 'profile' ? 'text-cyan-400' : 'text-slate-500'}`}><User size={20}/> <span className="text-[10px]">Profile</span></button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
        {activeView === 'noticeboard' ? (
            <NoticeBoardView
                dailyBounties={dailyBounties}
                addBounty={addBounty}
                toggleBounty={toggleBounty}
                abandonBounty={abandonBounty}
                reviveBounty={reviveBounty}
                timelineEvents={timelineEvents}
                addEvent={addEvent}
                deleteEvent={deleteEvent}
                toggleTimelineEvent={toggleTimelineEvent}
                isGrinding={isGrinding}
                setIsGrinding={setIsGrinding}
                setActiveView={setActiveView}
                setIsNewQuestModalOpen={setIsNewQuestModalOpen}
                addNote={addNote}
            />
        ) : activeView === 'spellbook' ? (
            <motion.main
                key="spellbook"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
            >
                <div className="flex justify-between items-center mb-8 gap-4">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-4 top-3.5 text-cyan-400/50" />
                        <input
                            type="text"
                            placeholder="Search spellbook..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 pl-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <button
                            onClick={addNote}
                            disabled={isCreatingSpell}
                            className="px-6 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center gap-2 text-white font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Plus size={18} /> {isCreatingSpell ? 'Scribing...' : 'Scribe New Spell'}
                        </button>
                        {spellError && (
                            <span className="text-red-400 text-xs max-w-xs text-right">{spellError}</span>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                    {recallNotes
                        .filter(n => {
                            const q = searchQuery.toLowerCase();
                            return n.title.toLowerCase().includes(q) ||
                                   n.ritual.toLowerCase().includes(q) ||
                                   n.incantation.toLowerCase().includes(q) ||
                                   n.tags.some(t => t.toLowerCase().includes(q));
                        })
                        .map(n => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <SpellbookNoteCard
                                    note={n}
                                    onUpdate={updateNote}
                                    isExpanded={expandedNoteId === n.id}
                                    onToggle={() => setExpandedNoteId(expandedNoteId === n.id ? null : n.id)}
                                />
                            </motion.div>
                        ))
                    }
                    </AnimatePresence>
                </div>
            </motion.main>
        ) : activeView === 'skilltree' ? (
            <SkillTreeView
              playerLevel={playerLevel}
              completedQuestsCount={quests.filter(q => q.status === 'completed').length}
              unlockedNodeIds={unlockedNodeIds}
              onUnlockNode={(id) => setUnlockedNodeIds(prev => new Set(prev).add(id))}
            />
        ) : activeView === 'profile' ? (
            <ProfileView
              playerName="Boukensha"
              playerLevel={playerLevel}
              playerXP={playerXP}
              quests={quests}
              dailyBounties={dailyBounties}
              recallNotes={recallNotes}
              unlockedNodeIds={unlockedNodeIds}
            />
        ) : (
            <motion.main
                key="quests"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                {/* Top HUD */}
                <header className="bg-slate-900/20 backdrop-blur-md border-b border-slate-800/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className='flex items-center gap-8'>
                        <div className="flex flex-col">
                        <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-black mb-1">Level Status</span>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full border border-slate-700">
                                <span className={dailyStreak > 0 ? "text-orange-500" : "text-slate-600"}>🔥</span>
                                <span className={`font-bold ${dailyStreak > 0 ? "text-white" : "text-slate-600"}`}>{dailyStreak}</span>
                            </div>
                            <span className="text-2xl font-bold text-white">LVL {playerLevel}</span>
                            <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(playerXP / 500) * 100}%` }}
                                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                />
                            </div>
                            <span className='text-xs text-cyan-400 font-mono'>{playerXP} / 500 XP</span>
                        </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveView('active')} className={`px-4 py-2 ${activeView === 'active' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500'}`}>Active</button>
                        <button onClick={() => setActiveView('completed')} className={`px-4 py-2 ${activeView === 'completed' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500'}`}>Vanquished</button>
                    </div>
                    <button
                        onClick={() => setIsNewQuestModalOpen(true)}
                        className="px-6 py-2.5 bg-[#020617] border border-cyan-500/50 rounded flex items-center gap-3 text-cyan-400 font-bold uppercase tracking-tighter hover:bg-cyan-500/10 transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                        <Plus size={18} /> New Quest
                    </button>
                </header>

                {/* Quest Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                    {isLoading && (
                        <div className="col-span-3 flex justify-center items-center py-20 text-cyan-400/50 font-mono text-sm tracking-widest">
                            SYNCING WITH THE GUILD...
                        </div>
                    )}
                    <AnimatePresence>
                    {!isLoading && quests.filter(q => q.status === (activeView === 'active' ? 'active' : 'completed')).map((q) => (
                        <motion.div
                        key={q.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                        >
                        <QuestCard quest={q} onClick={activeView === 'active' ? () => setActiveQuest(q) : () => {}} />
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </motion.main>
        )}
        </AnimatePresence>
      </div>

      <NewQuestModal isOpen={isNewQuestModalOpen} onClose={() => setIsNewQuestModalOpen(false)} onQuestCreated={addQuest} />
      <ActiveQuestModal quest={activeQuest} isOpen={!!activeQuest} onClose={() => setActiveQuest(null)} onComplete={completeQuest} onUpdateQuest={updateQuest} onDelete={deleteQuest} />
      <AnimatePresence>
          {activeEncounter && (
              <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.9 }}
                  className="fixed bottom-8 right-8 bg-slate-900/90 border-2 border-purple-500 rounded-lg p-6 max-w-sm shadow-2xl z-50 text-white"
              >
                  <p className="text-lg font-bold mb-4">{activeEncounter.text}</p>
                  <div className="flex gap-4">
                      <button onClick={() => { addXP(15); setActiveEncounter(null); }} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold">Claim (+15 XP)</button>
                      <button onClick={() => setActiveEncounter(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded font-bold">Flee</button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
