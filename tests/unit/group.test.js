import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── Pure grouping algorithm tests ───
// Extracted from group.js to test without DOM dependencies

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function groupBySize(members, size) {
    const groups = [];
    for (let i = 0; i < members.length; i += size) {
        groups.push(members.slice(i, i + size));
    }
    return groups;
}

function groupByCount(members, count) {
    const groups = Array.from({ length: count }, () => []);
    let idx = 0;
    members.forEach(m => {
        groups[idx].push(m);
        idx = (idx + 1) % count;
    });
    return groups;
}

function computePreview(mode, total, num) {
    if (total === 0) return 'Add members to see preview';
    if (mode === 'size') {
        const groups = Math.ceil(total / num);
        return `${groups} groups (${num} per group)`;
    } else {
        const per = Math.floor(total / num);
        const extra = total % num;
        return `${num} groups (~${per}${extra > 0 ? ` (+1 for ${extra})` : ''} each)`;
    }
}

describe('groupBySize', () => {
    it('creates groups of exact size', () => {
        const result = groupBySize(['A', 'B', 'C', 'D', 'E', 'F'], 3);
        assert.equal(result.length, 2);
        assert.deepEqual(result[0], ['A', 'B', 'C']);
        assert.deepEqual(result[1], ['D', 'E', 'F']);
    });

    it('handles uneven split with smaller last group', () => {
        const result = groupBySize(['A', 'B', 'C', 'D', 'E'], 3);
        assert.equal(result.length, 2);
        assert.deepEqual(result[0], ['A', 'B', 'C']);
        assert.deepEqual(result[1], ['D', 'E']);
    });

    it('creates single-member groups', () => {
        const result = groupBySize(['A', 'B', 'C'], 1);
        assert.equal(result.length, 3);
        assert.deepEqual(result[0], ['A']);
        assert.deepEqual(result[1], ['B']);
        assert.deepEqual(result[2], ['C']);
    });

    it('creates one group when size >= members', () => {
        const result = groupBySize(['A', 'B'], 10);
        assert.equal(result.length, 1);
        assert.deepEqual(result[0], ['A', 'B']);
    });

    it('returns empty array for empty members', () => {
        const result = groupBySize([], 3);
        assert.deepEqual(result, []);
    });
});

describe('groupByCount', () => {
    it('distributes members round-robin', () => {
        const result = groupByCount(['A', 'B', 'C', 'D'], 2);
        assert.equal(result.length, 2);
        assert.deepEqual(result[0], ['A', 'C']);
        assert.deepEqual(result[1], ['B', 'D']);
    });

    it('handles more groups than members', () => {
        const result = groupByCount(['A', 'B'], 5);
        assert.equal(result.length, 5);
        assert.deepEqual(result[0], ['A']);
        assert.deepEqual(result[1], ['B']);
        assert.deepEqual(result[2], []);
        assert.deepEqual(result[3], []);
        assert.deepEqual(result[4], []);
    });

    it('distributes evenly when divisible', () => {
        const result = groupByCount(['A', 'B', 'C', 'D', 'E', 'F'], 3);
        assert.equal(result.length, 3);
        result.forEach(g => assert.equal(g.length, 2));
    });

    it('handles single group', () => {
        const result = groupByCount(['A', 'B', 'C'], 1);
        assert.equal(result.length, 1);
        assert.deepEqual(result[0], ['A', 'B', 'C']);
    });

    it('returns empty groups for empty members', () => {
        const result = groupByCount([], 3);
        assert.equal(result.length, 3);
        result.forEach(g => assert.deepEqual(g, []));
    });
});

describe('computePreview', () => {
    it('shows placeholder when no members', () => {
        assert.equal(computePreview('size', 0, 3), 'Add members to see preview');
    });

    it('calculates size-mode preview', () => {
        assert.equal(computePreview('size', 10, 3), '4 groups (3 per group)');
    });

    it('calculates size-mode exact division', () => {
        assert.equal(computePreview('size', 9, 3), '3 groups (3 per group)');
    });

    it('calculates count-mode preview evenly', () => {
        assert.equal(computePreview('count', 10, 2), '2 groups (~5 each)');
    });

    it('calculates count-mode preview with remainder', () => {
        assert.equal(computePreview('count', 10, 3), '3 groups (~3 (+1 for 1) each)');
    });

    it('handles count-mode single member per group', () => {
        assert.equal(computePreview('count', 5, 5), '5 groups (~1 each)');
    });
});

describe('shuffleArray', () => {
    it('preserves all elements', () => {
        const arr = [1, 2, 3, 4, 5];
        shuffleArray(arr);
        assert.deepEqual(arr.sort((a, b) => a - b), [1, 2, 3, 4, 5]);
    });

    it('returns the same reference', () => {
        const arr = [1, 2, 3];
        assert.equal(shuffleArray(arr), arr);
    });

    it('handles empty array', () => {
        assert.deepEqual(shuffleArray([]), []);
    });
});
