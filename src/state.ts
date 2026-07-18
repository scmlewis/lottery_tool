import { AppState, DisplaySettings } from './types';

const initialDisplaySettings: DisplaySettings = {
  soundEnabled: true,
  confettiEnabled: true,
  autoAdvanceSeconds: 0,
};

export const state: AppState = {
  displayMode: false,
  displaySettings: { ...initialDisplaySettings },
  isSpinning: false,
  wheelRotation: 0,
  animationFrameId: null,
  rollAnimFrameId: null,
  drawnNumbers: new Set<number>(),
  batchHistory: [],
  autoAdvanceRemaining: null,
  currentListName: null,
  currentItems: [],
};

export function safeParseJSON<T>(json: string | null, fallback: T): T {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}
