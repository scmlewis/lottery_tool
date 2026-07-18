export type AppMode = 'dashboard' | 'wheel' | 'number' | 'group';

export interface Contestant {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface GroupAssignment {
  id: string;
  name: string;
  members: string[];
  color: string;
}

export interface WinnerHistoryEntry {
  id: string;
  name: string;
  timestamp: number;
}

export interface NumberBatchEntry {
  id: string;
  batchNumber: number;
  timestamp: number;
  numbers: number[];
  min: number;
  max: number;
}

export interface ActivityEntry {
  id: string;
  title: string;
  subtitle: string;
  type: 'wheel' | 'number' | 'group';
  code: string;
  timestamp: number;
}

export interface DisplaySettings {
  soundEnabled: boolean;
  confettiEnabled: boolean;
  autoAdvanceSeconds: number;
}

export interface AppState {
  displayMode: boolean;
  displaySettings: DisplaySettings;
  isSpinning: boolean;
  wheelRotation: number;
  animationFrameId: number | null;
  rollAnimFrameId: number | null;
  drawnNumbers: Set<number>;
  batchHistory: number[][];
  autoAdvanceRemaining: number | null;
  currentListName: string | null;
  currentItems: string[];
}
