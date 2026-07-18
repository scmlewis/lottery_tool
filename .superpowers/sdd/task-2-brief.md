# Task 2: Core Types and State Management

**Files:**
- Create: `src/types.ts`, `src/state.ts`, `src/storage.ts`
- Modify: None

**Interfaces:**
- Consumes: None
- Produces: TypeScript types and state management utilities

- [ ] **Step 1: Create src/types.ts**

```typescript
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
```

- [ ] **Step 2: Create src/state.ts**

```typescript
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
```

- [ ] **Step 3: Create src/storage.ts**

```typescript
import { safeParseJSON } from './state';

const STORAGE_KEYS = {
  LISTS: 'lucky_draw_lists',
  CURRENT_LIST: 'lucky_draw_current_list',
  DRAWN_NUMBERS: 'drawnNumbers',
  SETTINGS: 'lucky_draw_settings',
  DISPLAY_SETTINGS: 'lucky_draw_display_settings',
} as const;

export function getStoredLists(): Record<string, string[]> {
  return safeParseJSON(localStorage.getItem(STORAGE_KEYS.LISTS), {});
}

export function saveLists(lists: Record<string, string[]>): void {
  localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
}

export function setCurrentItems(listName: string | null, items: string[]): void {
  const lists = getStoredLists();
  if (listName && lists[listName]) {
    lists[listName] = items;
    saveLists(lists);
  }
}

export function loadSettings(): Record<string, unknown> {
  return safeParseJSON(localStorage.getItem(STORAGE_KEYS.SETTINGS), {});
}

export function saveSetting(key: string, value: unknown): void {
  const settings = loadSettings();
  settings[key] = value;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadDisplaySettings(): Record<string, unknown> {
  return safeParseJSON(localStorage.getItem(STORAGE_KEYS.DISPLAY_SETTINGS), {
    soundEnabled: true,
    confettiEnabled: true,
    autoAdvanceSeconds: 0,
  });
}

export function saveDisplaySettings(settings: Record<string, unknown>): void {
  localStorage.setItem(STORAGE_KEYS.DISPLAY_SETTINGS, JSON.stringify(settings));
}

export function saveDrawnNumbers(numbers: Set<number>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DRAWN_NUMBERS, JSON.stringify([...numbers]));
  } catch {
    // ignore quota errors
  }
}

export function loadDrawnNumbers(): Set<number> {
  const saved = safeParseJSON(localStorage.getItem(STORAGE_KEYS.DRAWN_NUMBERS), []);
  return new Set(saved);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/state.ts src/storage.ts
git commit -m "feat: add TypeScript types and state management"
```