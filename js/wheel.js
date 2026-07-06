import { state } from './state.js';
import { setCurrentItems } from './storage.js';
import { renderItemTags } from './utils.js';
import { showWinnerOverlay, startSpinTick, stopSpinTick } from './display.js';

const CANVAS_SIZE = 320;
const DISPLAY_CANVAS_SIZE = 640;
const COLORS = [
    '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24',
    '#2dd4bf', '#818cf8', '#fb923c', '#4ade80', '#f87171'
];

let canvas, ctx;
let currentCanvasSize = CANVAS_SIZE;

export function initCanvas() {
    canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    resizeCanvas();
}

function resizeCanvas() {
    if (!canvas) return;
    const isDisplay = state.displayMode;
    const size = isDisplay ? DISPLAY_CANVAS_SIZE : CANVAS_SIZE;
    currentCanvasSize = size;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    drawWheel(state.wheelRotation);
}

export function onDisplayModeChange() {
    resizeCanvas();
}

export function drawWheel(rotation = 0) {
    if (!ctx) return;
    const size = currentCanvasSize;
    const radius = size / 2 - 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const fontSize = size > 400 ? 18 : 13;
    const labelOffset = size > 400 ? 55 : 35;

    ctx.clearRect(0, 0, size, size);

    if (state.currentItems.length === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fill();
        ctx.fillStyle = '#6b7a99';
        ctx.font = `bold ${size > 400 ? 24 : 18}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Add items to spin', centerX, centerY);
        return;
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);

    const sliceAngle = (2 * Math.PI) / state.currentItems.length;

    state.currentItems.forEach((item, index) => {
        const startAngle = index * sliceAngle;
        const endAngle = startAngle + sliceAngle;
        const midAngle = startAngle + sliceAngle / 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = COLORS[index % COLORS.length];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(midAngle);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 4;
        ctx.fillText(item, radius - labelOffset, 0);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, size > 400 ? 38 : 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0e17';
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center dot glow
    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size > 400 ? 38 : 28);
    grad.addColorStop(0, 'rgba(110,231,183,0.15)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
}

export function spinWheel() {
    if (state.currentItems.length === 0) return;
    if (state.isSpinning) return;

    state.isSpinning = true;
    const spinBtn = state.els.spinButton;
    if (spinBtn) spinBtn.disabled = true;

    state.els.winnerDisplay.classList.remove('active');

    const wheelGlow = document.getElementById('wheel-glow');
    if (wheelGlow) wheelGlow.classList.add('active');

    const winnerIndex = Math.floor(Math.random() * state.currentItems.length);
    const winner = state.currentItems[winnerIndex];

    const spinDuration = 4500;
    const fullSpins = 8;
    const sliceAngle = (2 * Math.PI) / state.currentItems.length;
    const targetAngle = fullSpins * 2 * Math.PI - (winnerIndex * sliceAngle) - (sliceAngle / 2);

    const startTime = Date.now();
    const startRotation = state.wheelRotation;

    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
    }

    startSpinTick();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        state.wheelRotation = startRotation + (targetAngle * easeProgress);

        drawWheel(state.wheelRotation);

        if (progress < 1) {
            state.animationFrameId = requestAnimationFrame(animate);
        } else {
            state.isSpinning = false;
            stopSpinTick();
            if (spinBtn) spinBtn.disabled = false;

            const wheelGlow = document.getElementById('wheel-glow');
            if (wheelGlow) wheelGlow.classList.remove('active');

            displayWinner(winner);
            addWheelHistory(winner);

            const removeCheckbox = document.getElementById('remove-after-draw');
            const removeAfter = removeCheckbox ? removeCheckbox.checked : true;
            if (removeAfter) {
                state.currentItems.splice(winnerIndex, 1);
                setCurrentItems(state.currentListName, state.currentItems);
                const itemsDisplay = document.getElementById('items-display');
                if (itemsDisplay && state.els.currentItemsTitle) {
                    state.els.currentItemsTitle.textContent = `Current Items (${state.currentItems.length})`;
                    renderItemTags('items-display', state.currentItems);
                }
                const ta = state.els.namesTextarea;
                if (ta) ta.value = state.currentItems.join('\n');
            }

            drawWheel(state.wheelRotation);
        }
    }

    state.animationFrameId = requestAnimationFrame(animate);
}

export function displayWinner(name) {
    state.els.winnerDisplay.querySelector('.winner-name').textContent = name;
    state.els.winnerDisplay.querySelector('.winner-label').textContent = '\uD83C\uDF89 Winner!';
    state.els.winnerDisplay.classList.add('active');

    if (state.displayMode) {
        showWinnerOverlay(name, 'Wheel Draw');
    }
}

export function saveWheelHistory() {
    localStorage.setItem('wheelHistory', JSON.stringify(state.wheelHistory));
}

export function updateWheelHistory() {
    const listEl = state.els.wheelHistoryList;
    if (!listEl) return;
    listEl.textContent = '';

    if (!state.currentListName) {
        const hint = document.createElement('div');
        hint.className = 'empty-state';
        hint.textContent = 'Select a list to view its draw history.';
        listEl.appendChild(hint);
        return;
    }

    const filtered = state.wheelHistory.filter(entry => entry.list === state.currentListName);

    if (filtered.length === 0) {
        const hint = document.createElement('div');
        hint.className = 'empty-state';
        hint.textContent = 'No history for this list yet.';
        listEl.appendChild(hint);
        return;
    }

    const fragment = document.createDocumentFragment();
    const shown = filtered.length > 50 ? filtered.slice(0, 50) : filtered;
    for (let i = 0; i < shown.length; i++) {
        const entry = shown[i];
        const item = document.createElement('div');
        item.className = 'wheel-history-item';
        const left = document.createElement('div');
        left.textContent = entry.name;
        const right = document.createElement('div');
        right.className = 'time';
        right.textContent = new Date(entry.time).toLocaleString();
        item.appendChild(left);
        item.appendChild(right);
        fragment.appendChild(item);
    }
    listEl.appendChild(fragment);
}

export function addWheelHistory(name) {
    const entry = { name: name, time: new Date().toISOString(), list: state.currentListName || '' };
    state.wheelHistory.unshift(entry);
    if (state.wheelHistory.length > 200) state.wheelHistory.length = 200;
    saveWheelHistory();
    updateWheelHistory();
}

export function clearWheelHistory() {
    if (!confirm('Clear all wheel draw history?')) return;
    state.wheelHistory = [];
    saveWheelHistory();
    updateWheelHistory();
}
