import { state } from './state.js';
import { showWinnerOverlay, startSpinTick, stopSpinTick, playReveal } from './display.js';

export function pickNumber() {
    const min = parseInt(state.els.minNumber.value) || 0;
    const max = parseInt(state.els.maxNumber.value) || 100;
    const excludeDrawn = state.els.excludeDrawn.checked;
    const timesToDraw = parseInt(state.els.drawSlider.value) || 1;

    if (min >= max) return;
    if (timesToDraw <= 0) return;

    const btn = document.getElementById('pick-number-btn');
    if (btn) btn.disabled = true;

    state.els.numberDisplay.querySelectorAll('.number-item').forEach(s => s.remove());

    if (state.rollAnimFrameId) {
        cancelAnimationFrame(state.rollAnimFrameId);
        state.rollAnimFrameId = null;
    }

    state.els.numberDisplay.classList.add('rolling');
    state.els.numberDisplay.classList.add('has-numbers');

    startSpinTick();

    const range = max - min + 1;

    if (excludeDrawn && state.drawnNumbers.size >= range) {
        saveDrawnNumbers();
        state.drawnNumbers.clear();
        showToast('All numbers drawn — exclusion cleared', 'info');
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
            stopSpinTick();
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
        span.className = 'number-item rolling';
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

    function reEnableButton() {
        state.els.numberDisplay.classList.remove('animate');
        const currentBtn = document.getElementById('pick-number-btn');
        if (currentBtn) currentBtn.disabled = false;
    }

    function rollTick() {
        const elapsed = Date.now() - rollStartTime;

        if (elapsed >= rollDuration) {
            stopSpinTick();
            playReveal();
            drawnThisRound.forEach((num, i) => {
                if (spans[i]) {
                    spans[i].textContent = num;
                    spans[i].classList.remove('rolling');
                    spans[i].classList.add('revealed');
                    spans[i].style.animationDelay = `${i * 60}ms`;
                }
            });
            state.els.numberDisplay.classList.remove('rolling');
            state.els.numberDisplay.classList.add('animate');

            state.batchHistory.unshift(drawnThisRound);
            if (state.batchHistory.length > 50) state.batchHistory.length = 50;
            updateNumberHistory();
            updateDrawProgress();
            saveDrawnNumbers();

            if (state.displayMode) {
                const numStr = drawnThisRound.join(', ');
                showWinnerOverlay(numStr, 'Number Draw');
            }

            let animDone = 0;
            const numberDisplay = state.els.numberDisplay;
            function onAnimEnd() {
                animDone++;
                if (animDone >= drawnThisRound.length) {
                    numberDisplay.removeEventListener('animationend', onAnimEnd);
                    reEnableButton();
                }
            }
            numberDisplay.addEventListener('animationend', onAnimEnd);

            // Safety fallback: re-enable button even if animationend never fires
            setTimeout(reEnableButton, 2000 + drawnThisRound.length * 60);

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
        item.className = 'history-chip';
        const idx = document.createElement('span');
        idx.className = 'history-idx';
        idx.textContent = `#${index + 1}`;
        const nums = document.createElement('span');
        nums.className = 'history-nums';
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
    if (!confirm('Clear all number draw history?')) return;
    state.batchHistory = [];
    state.drawnNumbers.clear();
    saveDrawnNumbers();
    restorePlaceholder();
    updateNumberHistory();
    updateDrawProgress();
}


export function restorePlaceholder() {
    state.els.numberDisplay.classList.remove('has-numbers', 'rolling', 'animate');
    state.els.numberDisplay.textContent = '';
    const existing = document.getElementById('number-display-content');
    if (existing) existing.remove();

    const content = document.createElement('div');
    content.id = 'number-display-content';
    content.className = 'text-center';
    const placeholder = document.createElement('div');
    placeholder.className = 'number-placeholder';
    const emoji = document.createElement('div');
    emoji.className = 'number-placeholder-emoji';
    emoji.textContent = '\uD83C\uDFB0';
    const text = document.createElement('div');
    text.className = 'number-placeholder-text';
    text.innerHTML = 'Set range and quantity,<br>then tap to draw';
    placeholder.appendChild(emoji);
    placeholder.appendChild(text);
    content.appendChild(placeholder);
    state.els.numberDisplay.appendChild(content);
}

