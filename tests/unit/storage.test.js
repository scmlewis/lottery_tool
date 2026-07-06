import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage
const storage = {};
const localStorageMock = {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
};
globalThis.localStorage = localStorageMock;

const { getStoredLists, saveLists, setCurrentItems, loadSettings, saveSetting } = await import('../../js/storage.js');

beforeEach(() => {
    localStorageMock.clear();
});

describe('getStoredLists', () => {
    it('returns empty object when no data stored', () => {
        assert.deepEqual(getStoredLists(), {});
    });

    it('parses stored JSON', () => {
        localStorageMock.setItem('wheelLists', JSON.stringify({ Team: ['Alice', 'Bob'] }));
        const lists = getStoredLists();
        assert.deepEqual(lists, { Team: ['Alice', 'Bob'] });
    });

    it('returns cached result on repeated calls', () => {
        localStorageMock.setItem('wheelLists', JSON.stringify({ A: [1] }));
        const first = getStoredLists();
        const second = getStoredLists();
        assert.equal(first, second);
    });
});

describe('saveLists', () => {
    it('persists lists to localStorage', () => {
        saveLists({ Dev: ['X', 'Y'] });
        const raw = localStorageMock.getItem('wheelLists');
        assert.deepEqual(JSON.parse(raw), { Dev: ['X', 'Y'] });
    });

    it('updates cache', () => {
        saveLists({ A: [1] });
        const result = getStoredLists();
        assert.deepEqual(result, { A: [1] });
    });
});

describe('setCurrentItems', () => {
    it('saves items under list name', () => {
        setCurrentItems('Team', ['Alice', 'Bob']);
        const lists = getStoredLists();
        assert.deepEqual(lists.Team, ['Alice', 'Bob']);
    });

    it('does nothing when listName is falsy', () => {
        setCurrentItems(null, ['Alice']);
        assert.deepEqual(getStoredLists(), {});
    });

    it('does nothing when listName is empty string', () => {
        setCurrentItems('', ['Alice']);
        assert.deepEqual(getStoredLists(), {});
    });
});

describe('loadSettings', () => {
    it('returns empty object when nothing stored', () => {
        assert.deepEqual(loadSettings(), {});
    });

    it('parses stored settings', () => {
        localStorageMock.setItem('lotterySettings', JSON.stringify({ soundEnabled: false }));
        assert.deepEqual(loadSettings(), { soundEnabled: false });
    });
});

describe('saveSetting', () => {
    it('saves a single setting', () => {
        saveSetting('confettiEnabled', true);
        const settings = loadSettings();
        assert.equal(settings.confettiEnabled, true);
    });

    it('merges with existing settings', () => {
        saveSetting('a', 1);
        saveSetting('b', 2);
        const settings = loadSettings();
        assert.equal(settings.a, 1);
        assert.equal(settings.b, 2);
    });

    it('overwrites existing setting', () => {
        saveSetting('key', 'old');
        saveSetting('key', 'new');
        assert.equal(loadSettings().key, 'new');
    });
});
