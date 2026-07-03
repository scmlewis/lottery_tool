export const state = {
    currentListName: null,
    currentItems: [],
    wheelRotation: 0,
    isSpinning: false,
    animationFrameId: null,
    batchHistory: [],
    drawnNumbers: new Set(),
    rollAnimFrameId: null,
    currentGroupMembers: [],
    wheelHistory: safeParseJSON(localStorage.getItem('wheelHistory'), []),
    els: {},
    displayMode: false,
    displaySettings: {
        soundEnabled: true,
        confettiEnabled: true,
        autoAdvanceSeconds: 0,
    },
    autoAdvanceRemaining: null,
};

// Safe JSON parse that falls back to defaultValue on corrupt data.
export function safeParseJSON(raw, defaultValue) {
    try {
        return raw ? JSON.parse(raw) : defaultValue;
    } catch {
        return defaultValue;
    }
}
