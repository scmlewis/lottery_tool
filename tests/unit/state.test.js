import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Must mock localStorage before importing state.js
const storage = {};
globalThis.localStorage = {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
};

const { safeParseJSON } = await import('../../js/state.js');

describe('safeParseJSON', () => {
    it('returns parsed JSON for valid input', () => {
        assert.deepEqual(safeParseJSON('{"a":1}', {}), { a: 1 });
        assert.deepEqual(safeParseJSON('[1,2,3]', []), [1, 2, 3]);
    });

    it('returns default value for null input', () => {
        assert.deepEqual(safeParseJSON(null, { fallback: true }), { fallback: true });
    });

    it('returns default value for undefined input', () => {
        assert.deepEqual(safeParseJSON(undefined, 'default'), 'default');
    });

    it('returns default value for empty string', () => {
        assert.deepEqual(safeParseJSON('', []), []);
    });

    it('returns default value for corrupt JSON', () => {
        assert.deepEqual(safeParseJSON('{invalid json}', 42), 42);
    });

    it('handles boolean values', () => {
        assert.equal(safeParseJSON('true', false), true);
        assert.equal(safeParseJSON('false', true), false);
    });

    it('handles numeric strings', () => {
        assert.equal(safeParseJSON('42', 0), 42);
        assert.equal(safeParseJSON('3.14', 0), 3.14);
    });

    it('handles numeric input (JSON.parse accepts numbers)', () => {
        assert.equal(safeParseJSON(123, 'fallback'), 123);
    });
});
