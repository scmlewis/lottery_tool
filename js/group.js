import { state } from './state.js';
import { parseListText, shuffleArray, renderItemTags } from './utils.js';
import { showWinnerOverlay, playReveal } from './display.js';

const CARD_TINTS = [
    'rgba(110,231,183,0.18)', 'rgba(96,165,250,0.18)', 'rgba(167,139,250,0.18)',
    'rgba(244,114,182,0.18)', 'rgba(251,191,36,0.18)', 'rgba(45,212,191,0.18)',
    'rgba(129,140,248,0.18)', 'rgba(251,146,60,0.18)', 'rgba(74,222,128,0.18)',
    'rgba(248,113,113,0.18)'
];
const CARD_TEXT = [
    '#6ee7b7', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#2dd4bf',
    '#818cf8', '#fb923c', '#4ade80', '#f87171'
];

export function addSingleMember() {
    const v = state.els.groupMemberInput.value.trim();
    if (!v) return;
    state.currentGroupMembers.push(v);
    updateGroupDisplay();
    state.els.groupMemberInput.value = '';
    computeGroupPreview();
}

export function addBatchMembers() {
    const txt = state.els.groupMembers.value;
    if (!txt) return;
    const items = parseListText(txt);
    if (items.length === 0) return;
    state.currentGroupMembers = state.currentGroupMembers.concat(items);
    updateGroupDisplay();
    state.els.groupMembers.value = '';
    computeGroupPreview();
}

export function clearGroupMembers() {
    if (!confirm('Remove all group members?')) return;
    state.currentGroupMembers = [];
    updateGroupDisplay();
    state.els.groupMembers.value = '';
    computeGroupPreview();
}

export function updateGroupDisplay() {
    state.els.groupCount.textContent = state.currentGroupMembers.length;
    renderItemTags('group-items-display', state.currentGroupMembers);
}

export function removeGroupMember(index) {
    state.currentGroupMembers.splice(index, 1);
    updateGroupDisplay();
    computeGroupPreview();
}

export function computeGroupPreview() {
    const mode = document.querySelector('input[name="group-mode"]:checked')?.value || 'size';
    const num = Math.max(1, parseInt(state.els.groupNumber.value) || 1);
    const total = state.currentGroupMembers.length;

    if (total === 0) {
        state.els.groupPreview.textContent = 'Add members to see preview';
        return;
    }

    if (mode === 'size') {
        const groups = Math.ceil(total / num);
        state.els.groupPreview.textContent = `${groups} groups (${num} per group)`;
    } else {
        const per = Math.floor(total / num);
        const extra = total % num;
        state.els.groupPreview.textContent = `${num} groups (~${per}${extra > 0 ? ` (+1 for ${extra})` : ''} each)`;
    }
}

export function startGrouping() {
    if (state.currentGroupMembers.length === 0) return;

    const mode = document.querySelector('input[name="group-mode"]:checked')?.value || 'size';
    const num = Math.max(1, parseInt(state.els.groupNumber.value) || 1);
    const members = shuffleArray([...state.currentGroupMembers]);

    let groups = [];
    if (mode === 'size') {
        for (let i = 0; i < members.length; i += num) {
            groups.push(members.slice(i, i + num));
        }
    } else {
        groups = Array.from({ length: num }, () => []);
        let idx = 0;
        members.forEach(m => {
            groups[idx].push(m);
            idx = (idx + 1) % num;
        });
    }

    renderGroupResults(groups);
    playReveal();

    if (state.displayMode) {
        const summary = groups.map((g, i) => `Group ${i + 1}: ${g.length} members`).join(' | ');
        showWinnerOverlay(`${groups.length} Groups Formed`, summary);
    }
}

export function renderGroupResults(groups) {
    state.els.groupResults.textContent = '';
    const fragment = document.createDocumentFragment();

    // Remove empty state if present
    const emptyEl = document.getElementById('empty-state');
    if (emptyEl) emptyEl.remove();

    groups.forEach((g, i) => {
        const card = document.createElement('div');
        card.className = 'group-card';
        card.style.animationDelay = `${i * 80}ms`;

        const tint = CARD_TINTS[i % CARD_TINTS.length];
        const textColor = CARD_TEXT[i % CARD_TEXT.length];

        const header = document.createElement('div');
        header.className = 'group-card-header';
        header.style.background = tint;
        header.style.borderBottom = '1px solid rgba(255,255,255,0.06)';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'group-card-header-title';
        titleDiv.style.color = textColor;
        titleDiv.textContent = `Group ${i + 1}`;

        const countDiv = document.createElement('div');
        countDiv.className = 'group-card-header-count';
        countDiv.textContent = `${g.length} member${g.length !== 1 ? 's' : ''}`;

        header.appendChild(titleDiv);
        header.appendChild(countDiv);

        const content = document.createElement('div');
        content.className = 'group-card-content';

        for (let idx = 0; idx < g.length; idx++) {
            const m = g[idx];
            const row = document.createElement('div');
            row.className = 'group-card-row';

            const avatar = document.createElement('div');
            avatar.className = 'group-card-avatar';
            avatar.style.background = CARD_TEXT[idx % CARD_TEXT.length];
            avatar.textContent = m.charAt(0).toUpperCase();

            const nameDiv = document.createElement('div');
            nameDiv.className = 'group-card-name';
            nameDiv.textContent = m;

            row.appendChild(avatar);
            row.appendChild(nameDiv);
            content.appendChild(row);
        }

        card.appendChild(header);
        card.appendChild(content);
        fragment.appendChild(card);
    });
    state.els.groupResults.appendChild(fragment);
}

export function exportGroupsCSV() {
    if (!state.els.groupResults || state.els.groupResults.children.length === 0) return;

    const rows = [];
    Array.from(state.els.groupResults.children).forEach(card => {
        const title = card.querySelector('.group-card-header-title')?.textContent || '';
        const members = [];
        card.querySelectorAll('.group-card-name').forEach(el => {
            members.push(el.textContent.trim());
        });
        rows.push([title, ...members]);
    });

    const escapeCSVCell = (cell) => {
        cell = (cell || '').replace(/"/g, '""');
        if (/[,"\r\n]/.test(cell)) cell = `"${cell}"`;
        return cell;
    };
    const csv = rows.map(r => r.map(escapeCSVCell).join(',')).join('\n');
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'groups.csv';
    a.click();
    URL.revokeObjectURL(url);
}


export function shuffleGroup() {
    if (state.currentGroupMembers.length === 0) return;
    shuffleArray(state.currentGroupMembers);
    updateGroupDisplay();
}
