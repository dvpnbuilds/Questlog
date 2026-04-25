import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import type { Quest, Note, Bounty } from '../types';
import { CORE_PATH, PATH_VIBE_CODER, PATH_AI_SPECIALIST } from './SkillTreeView';

export const ProfileView = ({ 
    playerName, 
    playerLevel, 
    playerXP, 
    quests, 
    dailyBounties, 
    recallNotes,
    unlockedNodeIds
}: { 
    playerName: string, 
    playerLevel: number, 
    playerXP: number,
    quests: Quest[],
    dailyBounties: Bounty[],
    recallNotes: Note[],
    unlockedNodeIds: Set<string>
}) => {
    const completedQuests = quests.filter(q => q.status === 'completed');
    const completedBounties = dailyBounties.filter(b => b.status === 'completed');
    const skillPoints = playerLevel - 1;

    const rank = playerLevel >= 7 ? 'S' : playerLevel === 6 ? 'A' : playerLevel === 5 ? 'B' : playerLevel === 4 ? 'C' : playerLevel === 3 ? 'D' : playerLevel === 2 ? 'E' : 'F';
    
    const allSkills = [...CORE_PATH, ...PATH_VIBE_CODER, ...PATH_AI_SPECIALIST];
    const obtainedSkills = allSkills.filter(s => unlockedNodeIds.has(s.id));

    return (
        <motion.main 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="p-8 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-700 mb-8 flex items-center gap-6">
                <div className="p-4 bg-cyan-900/30 rounded-full border border-cyan-500/50">
                    <Shield size={48} className="text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{playerName}</h2>
                    <p className="text-cyan-400 text-lg font-bold tracking-wider">{rank}-Rank Boukensha</p>
                </div>
            </div>

            {/* XP Bar */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 mb-8">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Current XP</span>
                    <span>{playerXP} / 500 to Next Level</span>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(playerXP / 500) * 100}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Quests Vanquished', value: completedQuests.length },
                    { label: 'Bounties Claimed', value: completedBounties.length },
                    { label: 'Skill Points', value: skillPoints },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 text-center">
                        <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Obtained Skills */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Obtained Skills</h3>
                <div className="flex flex-wrap gap-4">
                    {obtainedSkills.map(skill => {
                        const color = CORE_PATH.find(s => s.id === skill.id) ? 'amber' : PATH_VIBE_CODER.find(s => s.id === skill.id) ? 'cyan' : 'purple';
                        return (
                            <motion.div 
                                key={skill.id}
                                whileHover={{ scale: 1.05 }}
                                className={`px-4 py-2 rounded-full border-2 border-${color}-500/50 bg-${color}-900/20 text-${color}-400 font-bold shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
                            >
                                {skill.title}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Recent History */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Recent History</h3>
                <div className="space-y-3">
                    {quests.slice(-3).reverse().map(q => (
                        <div key={q.id} className="flex justify-between p-3 bg-slate-800 rounded-lg">
                            <span className="text-white text-sm">{q.title}</span>
                            <span className="text-cyan-400 text-sm font-mono">+{q.XP} XP</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.main>
    );
};
