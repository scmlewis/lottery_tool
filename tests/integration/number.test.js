import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── Pure number draw algorithm tests ───
// Extracted from number.js to test without DOM dependencies

function pickNumbers(min, max, count, excludeDrawn, drawnNumbers) {
    if (min >= max) return { drawn: [], drawnNumbers };
    if (count <= 0) return { drawn: [], drawnNumbers };

    const range = max - min + 1;
    const newDrawnNumbers = new Set(drawnNumbers);

    if (excludeDrawn && newDrawnNumbers.size >= range) {
        newDrawnNumbers.clear();
    }

    let availablePool = null;
    if (excludeDrawn) {
        availablePool = [];
        for (let j = min; j <= max; j++) {
            if (!newDrawnNumbers.has(j)) availablePool.push(j);
        }
        if (availablePool.length === 0) return { drawn: [], drawnNumbers: newDrawnNumbers };
    }

    const drawnThisRound = [];
    for (let i = 0; i < count; i++) {
        if (availablePool) {
            if (availablePool.length === 0) break;
            const idx = Math.floor(Math.random() * availablePool.length);
            const num = availablePool.splice(idx, 1)[0];
            newDrawnNumbers.add(num);
            drawnThisRound.push(num);
        } else {
            drawnThisRound.push(Math.floor(Math.random() * range) + min);
        }
    }

    return { drawn: drawnThisRound, drawnNumbers: newDrawnNumbers };
}

function computeSliderMax(min, max) {
    const range = max - min + 1;
    return Math.min(range, 20);
}

describe('pickNumbers', () => {
    it('returns empty when min >= max', () => {
        const result = pickNumbers(10, 5, 1, false, new Set());
        assert.deepEqual(result.drawn, []);
    });

    it('returns empty when count <= 0', () => {
        const result = pickNumbers(1, 10, 0, false, new Set());
        assert.deepEqual(result.drawn, []);
    });

    it('draws correct number of items', () => {
        const result = pickNumbers(1, 100, 5, false, new Set());
        assert.equal(result.drawn.length, 5);
    });

    it('draws within specified range', () => {
        for (let trial = 0; trial < 20; trial++) {
            const result = pickNumbers(5, 10, 10, false, new Set());
            for (const num of result.drawn) {
                assert.ok(num >= 5 && num <= 10, `Number ${num} out of range [5,10]`);
            }
        }
    });

    it('respects exclude drawn mode - unique numbers', () => {
        const result = pickNumbers(1, 5, 5, true, new Set());
        assert.equal(result.drawn.length, 5);
        assert.deepEqual(result.drawn.sort((a, b) => a - b), [1, 2, 3, 4, 5]);
    });

    it('respects exclude drawn mode - skips previously drawn', () => {
        const previouslyDrawn = new Set([1, 2, 3]);
        const result = pickNumbers(1, 5, 2, true, previouslyDrawn);
        assert.equal(result.drawn.length, 2);
        for (const num of result.drawn) {
            assert.ok(!previouslyDrawn.has(num), `Number ${num} was already drawn`);
        }
    });

    it('clears exclusion set when all numbers exhausted', () => {
        const allDrawn = new Set([1, 2, 3, 4, 5]);
        const result = pickNumbers(1, 5, 1, true, allDrawn);
        // After clearing, it should draw from full range
        assert.equal(result.drawn.length, 1);
        assert.ok(result.drawnNumbers.size <= 1);
    });

    it('stops drawing when pool exhausted', () => {
        const result = pickNumbers(1, 3, 10, true, new Set());
        assert.equal(result.drawn.length, 3);
    });

    it('allows repeats when excludeDrawn is false', () => {
        const results = [];
        for (let i = 0; i < 50; i++) {
            const result = pickNumbers(1, 2, 2, false, new Set());
            results.push(result.drawn.join(','));
        }
        // With repeats allowed, we should see some duplicate draws
        const unique = new Set(results);
        assert.ok(unique.size < 50, 'Should have some repeated draws');
    });
});

describe('computeSliderMax', () => {
    it('returns range when range < 20', () => {
        assert.equal(computeSliderMax(1, 5), 5);
    });

    it('returns 20 when range >= 20', () => {
        assert.equal(computeSliderMax(1, 100), 20);
    });

    it('returns 1 for single number range', () => {
        assert.equal(computeSliderMax(5, 5), 1);
    });

    it('returns 20 for range of exactly 20', () => {
        assert.equal(computeSliderMax(1, 20), 20);
    });
});

describe('drawnNumbers tracking', () => {
    it('accumulates drawn numbers across rounds', () => {
        let drawn = new Set();
        const r1 = pickNumbers(1, 10, 3, true, drawn);
        drawn = r1.drawnNumbers;
        assert.equal(drawn.size, 3);

        const r2 = pickNumbers(1, 10, 3, true, drawn);
        drawn = r2.drawnNumbers;
        assert.equal(drawn.size, 6);

        // No overlap
        const overlap = r1.drawn.filter(n => r2.drawn.includes(n));
        assert.equal(overlap.length, 0);
    });

    it('batch history stays within limits', () => {
        const history = [];
        let drawn = new Set();
        for (let i = 0; i < 60; i++) {
            const result = pickNumbers(1, 100, 1, true, drawn);
            drawn = result.drawnNumbers;
            history.unshift(result.drawn);
            if (history.length > 50) history.length = 50;
        }
        assert.equal(history.length, 50);
    });
});
