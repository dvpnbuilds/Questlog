export type QuestStatus = 'active' | 'completed';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type QuestCategory = 'Daily' | 'Mastery' | 'Architect' | 'Side Quest';

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: QuestCategory | string;
  rarity: Rarity | string;
  status: QuestStatus;
  createdAt: number;
  completedAt?: number;
  images?: string[];
}

export interface Note {
  id: string;
  title: string;
  ritual: string;
  incantation: string;
  tags: string[];
  images?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface Bounty {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'failed';
  createdAt: number;
}

export interface TimelineEvent {
  id: string;
  time: string;
  description: string;
  isCompleted: boolean;
  isRecurring: boolean;
  completedAt?: number;
}

export interface Encounter {
  id: string;
  text: string;
}