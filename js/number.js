import { state } from './state.js';

export function pickNumber() {
    const min = parseInt(state.els.minNumber.value) || 0;
    const max = parseInt(state.els.maxNumber.value) || 100;
    const excludeDrawn = state.els.excludeDrawn.checked;
    const timesToDraw = parseInt(state.els.drawSlider.value) || 1;
    const btn = document.querySelector('#number-mode .spin-button');

    if (min >= max) return;
    if (timesToDraw <= 0) return;

    if (btn) btn.disabled = true;

    state.els.numberDisplay.querySelectorAll('.number-item').forEach(s => s.remove());

    if (state.rollAnimFrameId) {
        cancelAnimationFrame(state.rollAnimFrameId);
        state.rollAnimFrameId = null;
    }

    state.els.numberDisplay.classList.add('rolling');
    state.els.numberDisplay.classList.add('has-numbers');

    const range = max - min + 1;

    if (excludeDrawn && state.drawnNumbers.size >= range) {
        state.drawnNumbers.clear();
    }

    let availablePool = null;
    if (excludeDrawn) {
        availablePool = [];
        for (let j = min; j <= max; j++) {
            if (!state.drawnNumbers.has(j)) availablePool.push(j);
        }
        if (availablePool.length === 0) {
            state.els.numberDisplay.classList.remove('rolling');
            state.els.numberDisplay.classList.remove('has-numbers');
            if (btn) btn.disabled = false;
            return;
        }
    }

    const drawnThisRound = [];
    for (let i = 0; i < timesToDraw; i++) {
        if (availablePool) {
            if (availablePool.length === 0) break;
            const idx = Math.floor(Math.random() * availablePool.length);
            const num = availablePool.splice(idx, 1)[0];
            state.drawnNumbers.add(num);
            drawnThisRound.push(num);
        } else {
            drawnThisRound.push(Math.floor(Math.random() * range) + min);
        }
    }

    const spans = [];
    for (let i = 0; i < drawnThisRound.length; i++) {
        const span = document.createElement('span');
        span.className = 'number-item';
        state.els.numberDisplay.appendChild(span);
        spans.push(span);
    }

    state.els.numberDisplay.classList.remove('count-5', 'count-10', 'count-15', 'count-20');
    if (drawnThisRound.length >= 20) state.els.numberDisplay.classList.add('count-20');
    else if (drawnThisRound.length >= 15) state.els.numberDisplay.classList.add('count-15');
    else if (drawnThisRound.length >= 10) state.els.numberDisplay.classList.add('count-10');
    else if (drawnThisRound.length >= 5) state.els.numberDisplay.classList.add('count-5');

    const rollDuration = 1000;
    let rollStartTime = Date.now();

    function rollTick() {
        const elapsed = Date.now() - rollStartTime;

        if (elapsed >= rollDuration) {
            drawnThisRound.forEach((num, i) => {
                if (spans[i]) spans[i].textContent = num;
            });
            state.els.numberDisplay.classList.remove('rolling');
            state.els.numberDisplay.classList.add('animate');

            state.batchHistory.unshift(drawnThisRound);
            if (state.batchHistory.length > 50) state.batchHistory.length = 50;
            updateNumberHistory();
            updateDrawProgress();

            setTimeout(() => {
                state.els.numberDisplay.classList.remove('animate');
                if (btn) btn.disabled = false;
            }, 800);

            return;
        }

        for (let i = 0; i < drawnThisRound.length; i++) {
            if (spans[i]) {
                spans[i].textContent = Math.floor(Math.random() * range) + min;
            }
        }

        state.rollAnimFrameId = requestAnimationFrame(rollTick);
    }

    state.rollAnimFrameId = requestAnimationFrame(rollTick);
}

export function updateNumberHistory() {
    state.els.numberHistory.textContent = '';
    const fragment = document.createDocumentFragment();
    const limit = state.batchHistory.length > 20 ? 20 : state.batchHistory.length;
    for (let index = 0; index < limit; index++) {
        const batch = state.batchHistory[index];
        const item = document.createElement('div');
        item.className = 'history-item';
        const idx = document.createElement('span');
        idx.style.color = '#64748b';
        idx.style.fontSize = '0.8em';
        idx.textContent = `#${index + 1} `;
        const nums = document.createElement('span');
        nums.style.color = '#6ee7b7';
        nums.style.fontWeight = '600';
        nums.textContent = batch.join(', ');
        item.appendChild(idx);
        item.appendChild(nums);
        fragment.appendChild(item);
    }
    state.els.numberHistory.appendChild(fragment);
}

export function updateDrawProgress() {
    const min = parseInt(state.els.minNumber.value) || 0;
    const max = parseInt(state.els.maxNumber.value) || 100;
    const range = max - min + 1;

    const sliderMax = Math.min(range, 20);
    state.els.drawSlider.max = sliderMax;
    state.els.drawMaxLabel.textContent = sliderMax;

    if (parseInt(state.els.drawSlider.value) > sliderMax) {
        state.els.drawSlider.value = sliderMax;
    }

    state.els.drawCount.textContent = state.els.drawSlider.value;

    const percentage = (parseInt(state.els.drawSlider.value) / sliderMax) * 100;
    state.els.drawSlider.style.setProperty('--value', percentage + '%');
}

export function updateDrawCount(value) {
    const count = parseInt(value) || 0;
    state.els.drawCount.textContent = count;

    const min = parseInt(state.els.minNumber.value) || 0;
    const max = parseInt(state.els.maxNumber.value) || 100;
    const range = max - min + 1;
    const sliderMax = Math.min(range, 20);
    const percentage = (count / sliderMax) * 100;
    state.els.drawSlider.style.setProperty('--value', percentage + '%');
}

export function clearNumberHistory() {
    state.batchHistory = [];
    state.drawnNumbers.clear();
    restorePlaceholder();
    updateNumberHistory();
    updateDrawProgress();
}

export function restorePlaceholder() {
    state.els.numberDisplay.classList.remove('has-numbers');
    state.els.numberDisplay.classList.remove('rolling');
    state.els.numberDisplay.classList.remove('animate');
    state.els.numberDisplay.textContent = '';
    const content = document.createElement('div');
    content.id = 'number-display-content';
    content.className = 'text-center';
    const emoji = document.createElement('div');
    emoji.className = 'placeholder-emoji';
    emoji.textContent = '\uD83C\uDFB0';
    const text = document.createElement('div');
    text.className = 'placeholder-text';
    const line1 = document.createElement('div');
    line1.textContent = 'Set range & quantity';
    const line2 = document.createElement('div');
    line2.className = 'mt-xs';
    line2.textContent = 'Click start to draw';
    text.appendChild(line1);
    text.appendChild(line2);
    content.appendChild(emoji);
    content.appendChild(text);
    state.els.numberDisplay.appendChild(content);
}
