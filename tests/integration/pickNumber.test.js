import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const storage = {};
globalThis.localStorage = {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
};

function createMockEl(overrides = {}) {
    return {
        value: '',
        textContent: '',
        style: { setProperty: () => {} },
        appendChild: () => {},
        querySelectorAll: () => [],
        ...overrides,
    };
}

function createMockNumberDisplay() {
    const cls = new Set();
    const children = [];
    let text = '';
    return {
        _classList: cls,
        _children: children,
        classList: {
            add: (c) => cls.add(c),
            remove: (c) => cls.delete(c),
            contains: (c) => cls.has(c),
        },
        querySelectorAll: () => [],
        appendChild: (el) => children.push(el),
        get textContent() { return text; },
        set textContent(v) { text = v; },
    };
}

describe('pickNumber lifecycle', () => {
    let btn;
    let scheduledTimers;
    let stateObj;

    before(async () => {
        btn = { disabled: false };

        // Manual timer control
        let virtualTime = 0;
        let nextTimerId = 1;
        scheduledTimers = [];

        const addTimer = (cb, delay, interval) => {
            const id = nextTimerId++;
            const entry = { id, cb, fireAt: virtualTime + delay, interval };
            scheduledTimers.push(entry);
            scheduledTimers.sort((a, b) => a.fireAt - b.fireAt);
            return id;
        };

        const removeTimer = (id) => {
            scheduledTimers = scheduledTimers.filter(t => t.id !== id);
        };

        globalThis.Date.now = () => virtualTime;
        globalThis.setTimeout = (cb, ms) => addTimer(cb, ms, null);
        globalThis.clearTimeout = removeTimer;
        globalThis.setInterval = (cb, ms) => addTimer(cb, ms, ms);
        globalThis.clearInterval = removeTimer;
        globalThis.requestAnimationFrame = (cb) => addTimer(cb, 16, null);
        globalThis.cancelAnimationFrame = removeTimer;
        globalThis.confirm = () => true;
        globalThis.window = globalThis;

        globalThis.advanceTime = (ms) => {
            const target = virtualTime + ms;
            while (scheduledTimers.length > 0 && scheduledTimers[0].fireAt <= target) {
                const t = scheduledTimers.shift();
                virtualTime = t.fireAt;
                t.cb();
                if (t.interval !== null) {
                    const nextEntry = { id: t.id, cb: t.cb, fireAt: virtualTime + t.interval, interval: t.interval };
                    scheduledTimers.push(nextEntry);
                    scheduledTimers.sort((a, b) => a.fireAt - b.fireAt);
                }
            }
            virtualTime = target;
        };

        globalThis.document = {
            getElementById: (id) => {
                if (id === 'pick-number-btn') return btn;
                if (id === 'toast') return null;
                if (id === 'number-display-content') return null;
                return null;
            },
            createElement: () => ({
                className: '',
                textContent: '',
                style: { animationDelay: '' },
                classList: { add: () => {}, remove: () => {} },
                appendChild: () => {},
            }),
            createDocumentFragment: () => {
                const frag = { _children: [], appendChild: (el) => frag._children.push(el) };
                return frag;
            },
            querySelectorAll: () => [],
        };

        // Patch shared state (import once, reuse across tests)
        const stateModule = await import('../../js/state.js');
        stateObj = stateModule.state;
    });

    beforeEach(() => {
        // Reset state for each test
        const numberDisplay = createMockNumberDisplay();
        stateObj.els = {
            minNumber: createMockEl({ value: '1' }),
            maxNumber: createMockEl({ value: '10' }),
            excludeDrawn: { checked: false },
            drawSlider: createMockEl({ value: '1' }),
            numberDisplay,
            numberHistory: createMockEl(),
            drawCount: createMockEl(),
            drawMaxLabel: createMockEl(),
        };
        stateObj.drawnNumbers = new Set();
        stateObj.batchHistory = [];
        stateObj.rollAnimFrameId = null;
        stateObj.displayMode = false;
        storage['drawnNumbers'] = null;
        btn.disabled = false;
        scheduledTimers.length = 0;
        globalThis.localStorage.clear();
    });

    after(() => {
        delete globalThis.document;
        delete globalThis.requestAnimationFrame;
        delete globalThis.cancelAnimationFrame;
        delete globalThis.setTimeout;
        delete globalThis.clearTimeout;
        delete globalThis.setInterval;
        delete globalThis.clearInterval;
        delete globalThis.Date.now;
        delete globalThis.window;
        delete globalThis.advanceTime;
        delete globalThis.confirm;
    });

    it('returns a Promise that resolves after draw completes', { timeout: 3000 }, async () => {
        const { pickNumber } = await import('../../js/number.js');
        const result = pickNumber();
        assert.ok(result instanceof Promise, 'pickNumber should return a Promise');
        advanceTime(2000);
        await result;
    });

    it('does not leave button disabled after draw completes', { timeout: 3000 }, async () => {
        const { pickNumber } = await import('../../js/number.js');
        btn.disabled = false;
        const promise = pickNumber();
        advanceTime(2000);
        await promise;
        assert.equal(btn.disabled, false, 'button should not be disabled after draw');
    });

    it('persists drawn numbers to localStorage after draw', { timeout: 3000 }, async () => {
        const { pickNumber } = await import('../../js/number.js');
        stateObj.els.excludeDrawn.checked = true;
        stateObj.els.maxNumber.value = '5';
        stateObj.els.minNumber.value = '1';

        const promise = pickNumber();
        advanceTime(2000);
        await promise;

        const saved = JSON.parse(storage['drawnNumbers']);
        assert.ok(saved.length > 0, 'drawn numbers should be persisted');
        for (const num of saved) {
            assert.ok(num >= 1 && num <= 5, `number ${num} out of range`);
        }
    });

    it('resolves immediately when min >= max', async () => {
        const { pickNumber } = await import('../../js/number.js');
        stateObj.els.minNumber.value = '10';
        stateObj.els.maxNumber.value = '5';
        const result = pickNumber();
        assert.ok(result instanceof Promise);
        await result; // should resolve without advancing time
    });

    it('handles zero slider value by defaulting to 1 draw', { timeout: 3000 }, async () => {
        const { pickNumber } = await import('../../js/number.js');
        stateObj.els.drawSlider.value = '0';
        const result = pickNumber();
        assert.ok(result instanceof Promise);
        advanceTime(2000);
        await result;
    });

    it('clears exclude set and resolves when all numbers exhausted', { timeout: 3000 }, async () => {
        const { pickNumber } = await import('../../js/number.js');
        stateObj.els.excludeDrawn.checked = true;
        stateObj.els.maxNumber.value = '3';
        stateObj.els.minNumber.value = '1';
        stateObj.drawnNumbers = new Set([1, 2, 3]);

        const promise = pickNumber();
        // After exhaustion, the set is cleared and a normal draw happens
        advanceTime(2000);
        await promise; // should not throw — showToast is now properly imported
    });

    it('tracks excluded numbers across draws with persistence', { timeout: 3000 }, async () => {
        const { pickNumber } = await import('../../js/number.js');
        stateObj.els.excludeDrawn.checked = true;
        stateObj.els.maxNumber.value = '3';
        stateObj.els.minNumber.value = '1';
        stateObj.els.drawSlider.value = '1';

        // Draw 1
        let p = pickNumber();
        advanceTime(2000);
        await p;
        assert.equal(stateObj.drawnNumbers.size, 1);
        let saved = JSON.parse(storage['drawnNumbers']);
        assert.equal(saved.length, 1);

        // Draw 2
        stateObj.els.excludeDrawn.checked = true;
        p = pickNumber();
        advanceTime(2000);
        await p;
        assert.equal(stateObj.drawnNumbers.size, 2);
        saved = JSON.parse(storage['drawnNumbers']);
        assert.equal(saved.length, 2);

        // Draw 3
        p = pickNumber();
        advanceTime(2000);
        await p;
        assert.equal(stateObj.drawnNumbers.size, 3);
        saved = JSON.parse(storage['drawnNumbers']);
        assert.equal(saved.length, 3);

        // Draw 4 — all exhausted, should clear and draw fresh
        p = pickNumber();
        advanceTime(2000);
        await p;
        assert.equal(stateObj.drawnNumbers.size, 1);
        saved = JSON.parse(storage['drawnNumbers']);
        assert.equal(saved.length, 1);
    });

    it('clearNumberHistory clears persisted drawn numbers without ReferenceError', { timeout: 3000 }, async () => {
        const { clearNumberHistory } = await import('../../js/number.js');
        stateObj.els.excludeDrawn.checked = true;
        stateObj.els.maxNumber.value = '5';
        stateObj.els.minNumber.value = '1';
        stateObj.drawnNumbers = new Set([1, 2, 3]);

        // Should not throw ReferenceError for saveDrawnNumbers
        clearNumberHistory();

        assert.equal(stateObj.drawnNumbers.size, 0);
        assert.deepEqual(stateObj.batchHistory, []);
        // After clear, localStorage should reflect empty set
        const saved = JSON.parse(storage['drawnNumbers']);
        assert.deepEqual(saved, []);
    });
});
