import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { shuffleArray, parseListText, debounce } from '../../js/utils.js';

describe('shuffleArray', () => {
    it('returns the same array reference', () => {
        const arr = [1, 2, 3];
        const result = shuffleArray(arr);
        assert.equal(result, arr);
    });

    it('preserves all elements', () => {
        const arr = [1, 2, 3, 4, 5];
        shuffleArray(arr);
        assert.deepEqual(arr.sort(), [1, 2, 3, 4, 5]);
    });

    it('handles empty array', () => {
        const arr = [];
        shuffleArray(arr);
        assert.deepEqual(arr, []);
    });

    it('handles single element', () => {
        const arr = [42];
        shuffleArray(arr);
        assert.deepEqual(arr, [42]);
    });

    it('handles two elements', () => {
        const arr = [1, 2];
        shuffleArray(arr);
        assert.deepEqual(arr.sort(), [1, 2]);
    });

    it('does not produce the same order every time (probabilistic)', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const results = new Set();
        for (let i = 0; i < 50; i++) {
            const copy = [...arr];
            shuffleArray(copy);
            results.add(copy.join(','));
        }
        assert.ok(results.size > 1, 'Shuffle should produce different orderings');
    });
});

describe('parseListText', () => {
    it('splits comma-separated text', () => {
        assert.deepEqual(parseListText('Alice,Bob,Charlie'), ['Alice', 'Bob', 'Charlie']);
    });

    it('splits newline-separated text', () => {
        assert.deepEqual(parseListText('Alice\nBob\nCharlie'), ['Alice', 'Bob', 'Charlie']);
    });

    it('splits mixed separators', () => {
        assert.deepEqual(parseListText('Alice,\nBob,\nCharlie'), ['Alice', 'Bob', 'Charlie']);
    });

    it('trims whitespace', () => {
        assert.deepEqual(parseListText('  Alice ,  Bob  '), ['Alice', 'Bob']);
    });

    it('filters empty strings', () => {
        assert.deepEqual(parseListText('Alice,,,Bob,,Charlie'), ['Alice', 'Bob', 'Charlie']);
    });

    it('returns empty array for empty input', () => {
        assert.deepEqual(parseListText(''), []);
    });

    it('returns empty array for whitespace-only input', () => {
        assert.deepEqual(parseListText('   '), []);
    });

    it('handles single item', () => {
        assert.deepEqual(parseListText('Alice'), ['Alice']);
    });
});

describe('debounce', () => {
    it('delays function execution', (_, done) => {
        let called = false;
        const fn = () => { called = true; };
        const debounced = debounce(fn, 50);
        debounced();
        assert.equal(called, false);
        setTimeout(() => {
            assert.equal(called, true);
            done();
        }, 100);
    });

    it('cancels previous call on rapid invocation', (_, done) => {
        let callCount = 0;
        const fn = () => { callCount++; };
        const debounced = debounce(fn, 50);
        debounced();
        debounced();
        debounced();
        setTimeout(() => {
            assert.equal(callCount, 1);
            done();
        }, 100);
    });

    it('passes arguments to the debounced function', (_, done) => {
        let receivedArgs;
        const fn = (...args) => { receivedArgs = args; };
        const debounced = debounce(fn, 50);
        debounced('a', 'b');
        setTimeout(() => {
            assert.deepEqual(receivedArgs, ['a', 'b']);
            done();
        }, 100);
    });
});
