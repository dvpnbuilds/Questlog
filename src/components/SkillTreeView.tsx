import { motion } from 'motion/react';
import { Lock, CheckCircle } from 'lucide-react';

interface SkillNode {
    id: string;
    title: string;
    description: string;
    prerequisiteId: string | null;
    requiredQuests: number;
    lvl: number;
}

export const CORE_PATH: SkillNode[] = [
    { id: 'frontend_novice', title: 'Frontend Novice', description: 'The basics of web.', prerequisiteId: null, requiredQuests: 0, lvl: 1 },
    { id: 'react_adept', title: 'React Adept', description: 'Mastering components.', prerequisiteId: 'frontend_novice', requiredQuests: 2, lvl: 2 },
    { id: 'backend_initiate', title: 'Backend Initiate', description: 'Server-side logic.', prerequisiteId: 'react_adept', requiredQuests: 5, lvl: 3 },
    { id: 'database_warden', title: 'Database Warden', description: 'Data structures.', prerequisiteId: 'backend_initiate', requiredQuests: 8, lvl: 4 },
];

export const PATH_VIBE_CODER: SkillNode[] = [
    { id: 'prompt_architect', title: 'Prompt Architect', description: 'Context windows.', prerequisiteId: 'database_warden', requiredQuests: 10, lvl: 5 },
    { id: 'workflow_sorcerer', title: 'Workflow Sorcerer', description: 'Automation mastery.', prerequisiteId: 'prompt_architect', requiredQuests: 12, lvl: 6 },
    { id: 'fullstack_alchemist', title: 'Full-Stack Alchemist', description: 'Ultimate fusion.', prerequisiteId: 'workflow_sorcerer', requiredQuests: 15, lvl: 7 },
];

export const PATH_AI_SPECIALIST: SkillNode[] = [
    { id: 'automation_engineer', title: 'Automation Engineer', description: 'Systems integration.', prerequisiteId: 'database_warden', requiredQuests: 10, lvl: 5 },
    { id: 'rag_specialist', title: 'RAG Specialist', description: 'Retrieval augmented.', prerequisiteId: 'automation_engineer', requiredQuests: 12, lvl: 6 },
    { id: 'agent_architect', title: 'Agent Architect', description: 'Autonomous agents.', prerequisiteId: 'rag_specialist', requiredQuests: 15, lvl: 7 },
];

const SkillNodeCard = ({ 
    node, 
    isUnlocked, 
    canUnlock, 
    onUnlock 
}: { 
    node: SkillNode, 
    isUnlocked: boolean, 
    canUnlock: boolean, 
    onUnlock: () => void 
}) => {
    const borderColor = node.id.includes('vibe') ? 'border-cyan-500' : 
                        node.id.includes('ai') ? 'border-purple-500' : 'border-amber-500';
    
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-5 rounded-xl bg-slate-900 border-2 w-full ${isUnlocked ? borderColor : 'border-slate-700'} relative`}
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{node.title}</h3>
                {isUnlocked ? <CheckCircle className="text-emerald-400" size={20} /> : <Lock className="text-slate-500" size={20} />}
            </div>
            <p className="text-slate-400 text-xs mb-3">{node.description}</p>
            <div className="flex justify-between items-center text-xs">
                <span className={`text-slate-500 ${!isUnlocked && !canUnlock ? 'text-amber-500' : ''}`}>
                    Requires {node.requiredQuests} Quests
                </span>
                {!isUnlocked && (
                    canUnlock ? (
                        <button onClick={onUnlock} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded font-bold">Unlock</button>
                    ) : (
                        <span className="text-slate-600 italic">Locked: Needs More Quests</span>
                    )
                )}
            </div>
        </motion.div>
    );
};

export const SkillTreeView = ({ 
    playerLevel, 
    completedQuestsCount,
    unlockedNodeIds,
    onUnlockNode
}: { 
    playerLevel: number, 
    completedQuestsCount: number,
    unlockedNodeIds: Set<string>,
    onUnlockNode: (nodeId: string) => void
}) => {
    const skillPoints = playerLevel - 1;
    const spentSkillPoints = unlockedNodeIds.size - 1;
    const availableSP = skillPoints - spentSkillPoints;

    return (
        <motion.main key="skilltree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 flex flex-col items-center">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 w-full max-w-2xl mb-12 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Skill Tree</h2>
                <div className="flex gap-4 p-3 bg-slate-800 rounded-lg">
                    <span className="text-slate-400 text-sm">SP Available</span>
                    <span className="font-bold text-amber-400 text-xl">{Math.max(0, availableSP)}</span>
                </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                {CORE_PATH.map((node) => (
                    <SkillNodeCard 
                        key={node.id} 
                        node={node} 
                        isUnlocked={unlockedNodeIds.has(node.id)}
                        canUnlock={!unlockedNodeIds.has(node.id) && (node.prerequisiteId ? unlockedNodeIds.has(node.prerequisiteId) : true) && completedQuestsCount >= node.requiredQuests && availableSP > 0}
                        onUnlock={() => onUnlockNode(node.id)}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-12">
                <div className="flex flex-col gap-4">
                    <h3 className="text-center font-bold text-cyan-400">Path of the Vibe-Coder</h3>
                    {PATH_VIBE_CODER.map((node) => (
                        <SkillNodeCard 
                            key={node.id} 
                            node={node} 
                            isUnlocked={unlockedNodeIds.has(node.id)}
                            canUnlock={!unlockedNodeIds.has(node.id) && (node.prerequisiteId ? unlockedNodeIds.has(node.prerequisiteId) : true) && completedQuestsCount >= node.requiredQuests && availableSP > 0}
                            onUnlock={() => onUnlockNode(node.id)}
                        />
                    ))}
                </div>
                <div className="flex flex-col gap-4">
                    <h3 className="text-center font-bold text-purple-400">Path of the Specialist</h3>
                    {PATH_AI_SPECIALIST.map((node) => (
                        <SkillNodeCard 
                            key={node.id} 
                            node={node} 
                            isUnlocked={unlockedNodeIds.has(node.id)}
                            canUnlock={!unlockedNodeIds.has(node.id) && (node.prerequisiteId ? unlockedNodeIds.has(node.prerequisiteId) : true) && completedQuestsCount >= node.requiredQuests && availableSP > 0}
                            onUnlock={() => onUnlockNode(node.id)}
                        />
                    ))}
                </div>
            </div>
        </motion.main>
    );
};
