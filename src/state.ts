import { AppState, DisplaySettings, Settings } from './types';

const initialDisplaySettings: DisplaySettings = {
  soundEnabled: true,
  confettiEnabled: true,
  autoAdvanceSeconds: 0,
};

const initialSettings: Settings = {
  removeWinnerAfterDraw: false,
  soundEnabled: true,
  confettiEnabled: true,
  autoAdvanceSeconds: 0,
};

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      return { ...initialSettings, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return initialSettings;
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  } catch {
    // ignore quota errors
  }
}

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

export { loadSettings, saveSettings };
