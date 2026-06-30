import { state } from './state.js';
import { saveSetting, loadSettings } from './storage.js';
import { onDisplayModeChange } from './wheel.js';

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.15) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) { /* audio not available */ }
}

function playSpinSound() {
    playTone(220, 0.08, 'square', 0.06);
}

function playWinnerChime() {
    playTone(523, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 120);
    setTimeout(() => playTone(784, 0.25, 'sine', 0.15), 240);
    setTimeout(() => playTone(1047, 0.4, 'sine', 0.1), 400);
}

function playRevealSound() {
    playTone(440, 0.1, 'triangle', 0.1);
    setTimeout(() => playTone(880, 0.2, 'triangle', 0.08), 80);
}

let spinTickInterval = null;

export function startSpinTick() {
    if (spinTickInterval) return;
    spinTickInterval = setInterval(() => playSpinSound(), 80);
}

export function stopSpinTick() {
    if (spinTickInterval) {
        clearInterval(spinTickInterval);
        spinTickInterval = null;
    }
}

export function playWinnerFanfare() {
    stopSpinTick();
    if (state.displaySettings.soundEnabled !== false) {
        playWinnerChime();
    }
}

export function playReveal() {
    if (state.displaySettings.soundEnabled !== false) {
        playRevealSound();
    }
}

function createConfettiPiece(container) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const colors = ['#6ee7b7', '#a78bfa', '#f472b6', '#fbbf24', '#60a5fa', '#fb923c', '#34d399'];
    piece.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty('--confetti-left', Math.random() * 100 + '%');
    piece.style.setProperty('--confetti-delay', Math.random() * 0.5 + 's');
    piece.style.setProperty('--confetti-duration', (1.5 + Math.random() * 1.5) + 's');
    piece.style.setProperty('--confetti-rotate', Math.random() * 360 + 'deg');
    piece.style.setProperty('--confetti-x', (Math.random() * 200 - 100) + 'px');
    container.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
}

export function launchConfetti() {
    if (state.displaySettings.confettiEnabled === false) return;
    let container = document.getElementById('confetti-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'confetti-container';
        container.className = 'confetti-container';
        document.body.appendChild(container);
    }
    const count = 60;
    for (let i = 0; i < count; i++) {
        setTimeout(() => createConfettiPiece(container), i * 15);
    }
}

export function clearConfetti() {
    const container = document.getElementById('confetti-container');
    if (container) container.remove();
}

let autoAdvanceTimer = null;

export function startAutoAdvance(seconds, callback) {
    clearAutoAdvance();
    if (!seconds || seconds <= 0) return;
    state.autoAdvanceRemaining = seconds;
    updateAutoAdvanceDisplay();

    autoAdvanceTimer = setInterval(() => {
        state.autoAdvanceRemaining--;
        updateAutoAdvanceDisplay();
        if (state.autoAdvanceRemaining <= 0) {
            clearAutoAdvance();
            callback();
        }
    }, 1000);
}

export function clearAutoAdvance() {
    if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
    state.autoAdvanceRemaining = null;
    updateAutoAdvanceDisplay();
}

function updateAutoAdvanceDisplay() {
    const el = document.getElementById('auto-advance-countdown');
    if (el) {
        if (state.autoAdvanceRemaining != null && state.autoAdvanceRemaining > 0) {
            el.textContent = state.autoAdvanceRemaining;
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    }
}

export function enterDisplayMode() {
    state.displayMode = true;
    document.body.classList.add('display-mode');
    loadDisplaySettings();
    updateDisplaySettingsUI();
    onDisplayModeChange();

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('keydown', onDisplayKeydown);
    document.addEventListener('mousemove', resetCursorTimeout);
    resetCursorTimeout();
}

export function exitDisplayMode() {
    state.displayMode = false;
    document.body.classList.remove('display-mode');
    clearAutoAdvance();
    clearConfetti();
    stopSpinTick();
    showCursor();
    onDisplayModeChange();

    if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    }

    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('keydown', onDisplayKeydown);
    document.removeEventListener('mousemove', resetCursorTimeout);
}

function onFullscreenChange() {
    if (!document.fullscreenElement && state.displayMode) {
        exitDisplayMode();
    }
}

function onDisplayKeydown(e) {
    if (e.key === 'Escape' && state.displayMode) {
        e.preventDefault();
        exitDisplayMode();
    }
}

let cursorTimeout = null;

function resetCursorTimeout() {
    showCursor();
    clearTimeout(cursorTimeout);
    if (state.displayMode) {
        cursorTimeout = setTimeout(() => {
            if (state.displayMode) document.body.classList.add('cursor-hidden');
        }, 3000);
    }
}

function showCursor() {
    document.body.classList.remove('cursor-hidden');
}

export function loadDisplaySettings() {
    const saved = loadSettings();
    state.displaySettings = {
        soundEnabled: saved.soundEnabled !== false,
        confettiEnabled: saved.confettiEnabled !== false,
        autoAdvanceSeconds: saved.autoAdvanceSeconds || 0,
    };
}

export function saveDisplaySettings() {
    saveSetting('soundEnabled', state.displaySettings.soundEnabled);
    saveSetting('confettiEnabled', state.displaySettings.confettiEnabled);
    saveSetting('autoAdvanceSeconds', state.displaySettings.autoAdvanceSeconds);
}

export function updateDisplaySettingsUI() {
    const soundCb = document.getElementById('setting-sound');
    const confettiCb = document.getElementById('setting-confetti');
    const autoInput = document.getElementById('setting-auto-advance');

    if (soundCb) soundCb.checked = state.displaySettings.soundEnabled;
    if (confettiCb) confettiCb.checked = state.displaySettings.confettiEnabled;
    if (autoInput) autoInput.value = state.displaySettings.autoAdvanceSeconds;
}

export function toggleDisplayMode() {
    if (state.displayMode) {
        exitDisplayMode();
    } else {
        enterDisplayMode();
    }
}

export function showWinnerOverlay(name, sub) {
    const overlay = document.getElementById('winner-overlay');
    const nameEl = document.getElementById('winner-overlay-name');
    const subEl = document.getElementById('winner-overlay-sub');
    if (!overlay || !nameEl) return;

    nameEl.textContent = name;
    if (subEl) subEl.textContent = sub || '';
    overlay.classList.add('active');

    playWinnerFanfare();
    launchConfetti();

    const autoSec = state.displaySettings.autoAdvanceSeconds || 0;
    if (autoSec > 0) {
        startAutoAdvance(autoSec, () => {
            overlay.classList.remove('active');
            clearConfetti();
        });
    }
}
