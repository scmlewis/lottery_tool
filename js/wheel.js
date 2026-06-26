import { state } from './state.js';
import { setCurrentItems } from './storage.js';

const CANVAS_SIZE = 320;
const COLORS = [
    '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24',
    '#2dd4bf', '#818cf8', '#fb923c', '#4ade80', '#f87171'
];

let canvas, ctx;

export function initCanvas() {
    canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.width = canvas.height = CANVAS_SIZE;
}

export function drawWheel(rotation = 0) {
    if (!ctx) return;
    const radius = CANVAS_SIZE / 2 - 15;
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (state.currentItems.length === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#2d3748';
        ctx.fill();
        ctx.fillStyle = '#718096';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Add items to your list to view', centerX, centerY);
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
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(midAngle);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(item, radius - 35, 0);
        ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#0c0f14';
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

export function spinWheel() {
    if (state.currentItems.length === 0) return;
    if (state.isSpinning) return;

    state.isSpinning = true;
    const spinBtn = state.els.spinButton;
    if (spinBtn) spinBtn.disabled = true;

    state.els.winnerDisplay.classList.remove('active');

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
            if (spinBtn) spinBtn.disabled = false;

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
                    import('./app.js').then(m => m.renderItemTags('items-display', state.currentItems, m.removeItem));
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
    state.wheelHistory = [];
    saveWheelHistory();
    updateWheelHistory();
}
