import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import type { Quest, Note, Bounty } from '../types';
import { CORE_PATH, PATH_VIBE_CODER, PATH_AI_SPECIALIST } from './SkillTreeView';

export const ProfileView = ({
    playerName,
    playerEmail,
    playerLevel,
    playerXP,
    quests,
    dailyBounties,
    recallNotes,
    unlockedNodeIds
}: {
    playerName: string,
    playerEmail: string | null,
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
            className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8"
        >
            {/* Header */}
            <div className="bg-slate-900/60 p-5 sm:p-8 rounded-2xl border border-slate-700 mb-6 sm:mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="p-3 sm:p-4 bg-cyan-900/30 rounded-full border border-cyan-500/50">
                    <Shield size={40} className="text-cyan-400 sm:size-12" />
                </div>
                <div className="min-w-0">
                    <h2 className="break-words text-2xl font-bold text-white tracking-tight sm:text-3xl">{playerName}</h2>
                    <p className="text-cyan-400 text-base font-bold tracking-wider sm:text-lg">{rank}-Rank Boukensha</p>
                    {playerEmail && (
                        <p className="break-all text-slate-500 text-sm mt-1">{playerEmail}</p>
                    )}
                </div>
            </div>

            {/* XP Bar */}
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-700 mb-6 sm:mb-8">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                {[
                    { label: 'Quests Vanquished', value: completedQuests.length },
                    { label: 'Bounties Claimed', value: completedBounties.length },
                    { label: 'Spells Scribed', value: recallNotes.length },
                    { label: 'Skill Points', value: skillPoints },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-700 text-center">
                        <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Obtained Skills */}
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-700 mb-6 sm:mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Obtained Skills</h3>
                <div className="flex flex-wrap gap-4">
                    {obtainedSkills.map(skill => {
                        const color = CORE_PATH.find(s => s.id === skill.id) ? 'amber' : PATH_VIBE_CODER.find(s => s.id === skill.id) ? 'cyan' : 'purple';
                        return (
                            <motion.div 
                                key={skill.id}
                                whileHover={{ scale: 1.05 }}
                                className={`max-w-full break-words px-4 py-2 rounded-full border-2 border-${color}-500/50 bg-${color}-900/20 text-${color}-400 font-bold shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
                            >
                                {skill.title}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Recent History */}
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Recent History</h3>
                <div className="space-y-3">
                    {quests.slice(-3).reverse().map(q => (
                        <div key={q.id} className="flex justify-between gap-3 p-3 bg-slate-800 rounded-lg">
                            <span className="min-w-0 break-words text-white text-sm">{q.title}</span>
                            <span className="text-cyan-400 text-sm font-mono">+{q.xp} XP</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.main>
    );
};
