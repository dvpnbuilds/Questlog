export type QuestStatus = 'active' | 'completed';

export type Rarity = 'Common' | 'Rare' | 'Epic';

export interface Quest {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  XP: number;
  category?: string;
  status: QuestStatus;
  images?: string[];
}

export interface Note {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images?: string[];
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
