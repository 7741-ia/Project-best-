export type StoryEngineModel = 'gemini-3.1-flash-lite' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview';

export type ImageSize = '1K' | '2K' | '4K';

export type ImageModel = 'gemini-3-pro-image-preview' | 'gemini-3-pro-image' | 'gemini-3.1-flash-image' | 'gemini-3.1-flash-lite-image';

export type ChatRole = 'oracle' | 'companion' | 'tactician';

export interface Character {
  name: string;
  classRole: string;
  background: string;
  visualDescription: string;
  health: number;
  maxHealth: number;
  sanity: number;
  gold: number;
  level: number;
  statusEffects: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'weapon' | 'armor' | 'potion' | 'tool' | 'relic' | 'lore' | string;
  quantity: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | string;
}

export interface SideQuest {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed';
}

export interface QuestState {
  title: string;
  currentObjective: string;
  summary: string;
  milestonesCompleted: string[];
  sideQuests: SideQuest[];
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  relationship: 'Ally' | 'Neutral' | 'Rival' | 'Enemy' | 'Unknown' | string;
  status: string;
}

export interface Choice {
  id: string;
  text: string;
  type: 'combat' | 'dialogue' | 'exploration' | 'stealth' | 'magic' | 'risky' | string;
  hint: string;
}

export interface StoryTurn {
  turnNumber: number;
  timestamp: string;
  userChoice: string;
  storyText: string;
  location: string;
  dangerLevel: 'Safe' | 'Tense' | 'Perilous' | 'Deadly' | string;
  sceneImageUrl?: string;
  sceneImagePrompt?: string;
  imageSizeUsed?: ImageSize;
  summary: string;
  statusLog?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleType?: ChatRole;
}

export interface WorldPreset {
  id: string;
  title: string;
  genre: string;
  artStyle: string;
  description: string;
  defaultCharacter: {
    name: string;
    classRole: string;
    visualDescription: string;
  };
}
