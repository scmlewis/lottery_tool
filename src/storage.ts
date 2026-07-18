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
