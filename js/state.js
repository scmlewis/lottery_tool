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
    wheelHistory: JSON.parse(localStorage.getItem('wheelHistory') || '[]'),
    els: {}
};
