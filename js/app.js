import { state, safeParseJSON } from './state.js';
import { debounce, parseListText, renderItemTags, setupItemDelegation, showToast } from './utils.js';
import { getStoredLists, saveLists, setCurrentItems, loadSettings, saveSetting } from './storage.js';
import { initCanvas, drawWheel, spinWheel, updateWheelHistory, clearWheelHistory } from './wheel.js';
import { pickNumber, updateDrawProgress, updateDrawCount, clearNumberHistory } from './number.js';
import { addSingleMember, addBatchMembers, clearGroupMembers, removeGroupMember, startGrouping, shuffleGroup, exportGroupsCSV, computeGroupPreview, renderGroupResults } from './group.js';
import { toggleDisplayMode, loadDisplaySettings, saveDisplaySettings } from './display.js';

function cacheDom() {
    const e = state.els;
    e.namesTextarea = document.getElementById('names-textarea');
    e.numberDisplay = document.getElementById('number-display');
    e.drawSlider = document.getElementById('draw-slider');
    e.drawCount = document.getElementById('draw-count');
    e.drawMaxLabel = document.getElementById('draw-max-label');
    e.minNumber = document.getElementById('min-number');
    e.maxNumber = document.getElementById('max-number');
    e.excludeDrawn = document.getElementById('exclude-drawn');
    e.spinButton = document.getElementById('spin-button');
    e.winnerDisplay = document.getElementById('winner-display');
    e.itemsDisplay = document.getElementById('items-display');
    e.currentItemsTitle = document.getElementById('current-items-title');
    e.savedListsPills = document.getElementById('saved-lists-pills');
    e.numberHistory = document.getElementById('number-history');
    e.groupMembers = document.getElementById('group-members');
    e.groupMemberInput = document.getElementById('group-member-input');
    e.groupCount = document.getElementById('group-count');
    e.groupNumber = document.getElementById('group-number');
    e.groupPreview = document.getElementById('group-preview');
    e.groupResults = document.getElementById('group-results');
    e.wheelHistoryList = document.getElementById('wheel-history-list');
    e.wheelMode = document.getElementById('wheel-mode');
}

function refreshWheelView() {
    updateListSelector();
    updateItemsDisplay();
    drawWheel();
}

function createNewList() {
    const name = document.getElementById('list-name').value.trim();
    if (!name) { showToast('Enter a list name', 'error'); return; }
    const lists = getStoredLists();
    if (lists.hasOwnProperty(name)) { showToast('List already exists', 'error'); return; }
    lists[name] = [];
    saveLists(lists);
    state.currentListName = name;
    state.currentItems = [];
    refreshWheelView();
    state.els.namesTextarea.value = '';
    document.getElementById('list-name').value = '';
    showToast('List created', 'success');
}

function updateListSelector() {
    const lists = getStoredLists();
    const container = state.els.savedListsPills;
    if (!container) return;
    container.textContent = '';
    const fragment = document.createDocumentFragment();

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'pill-button';
    clearBtn.textContent = 'No List';
    clearBtn.dataset.listName = '';
    fragment.appendChild(clearBtn);

    for (const name in lists) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pill-button';
        btn.textContent = `${name} (${lists[name].length})`;
        btn.dataset.listName = name;
        if (state.currentListName === name) btn.classList.add('active');
        fragment.appendChild(btn);
    }
    container.appendChild(fragment);
}

function selectListByName(name) {
    state.currentListName = name;
    const lists = getStoredLists();
    state.currentItems = [...(lists[name] || [])];
    state.els.namesTextarea.value = state.currentItems.join('\n');
    refreshWheelView();
    updateWheelHistory();
    updateListSelector();
    loadDrawnNumbers();
}


function saveDrawnNumbers() {
    try {
        localStorage.setItem('drawnNumbers', JSON.stringify([...state.drawnNumbers]));
    } catch {
        // ignore quota errors silently
    }
}

function loadDrawnNumbers() {
    const saved = safeParseJSON(localStorage.getItem('drawnNumbers'), []);
    state.drawnNumbers = new Set(saved);
}

function shuffleList() {
    if (state.currentItems.length === 0) return;
    for (let i = state.currentItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.currentItems[i], state.currentItems[j]] = [state.currentItems[j], state.currentItems[i]];
    }
    setCurrentItems(state.currentListName, state.currentItems);
    state.els.namesTextarea.value = state.currentItems.join('\n');
    updateItemsDisplay();
    drawWheel();
}

function saveCurrentList() {
    if (!state.currentListName) { showToast('Create or select a list first', 'error'); return; }
    const items = parseListText(state.els.namesTextarea.value);
    if (items.length === 0) { showToast('Enter at least one item', 'error'); return; }
    state.currentItems = items;
    setCurrentItems(state.currentListName, items);
    saveDrawnNumbers();
    refreshWheelView();
    showToast('List saved', 'success');
}

function deleteCurrentList() {
    if (!state.currentListName) { showToast('Select a list first', 'error'); return; }
    if (!confirm(`Delete "${state.currentListName}" and all its items?`)) return;
    const lists = getStoredLists();
    delete lists[state.currentListName];
    saveLists(lists);
    localStorage.removeItem('drawnNumbers');
    state.currentListName = null;
    state.currentItems = [];
    state.drawnNumbers.clear();
    state.els.namesTextarea.value = '';
    document.getElementById('list-name').value = '';
    refreshWheelView();
    showToast('List deleted', 'success');
}

function removeItem(index) {
    state.currentItems.splice(index, 1);
    setCurrentItems(state.currentListName, state.currentItems);
    state.els.namesTextarea.value = state.currentItems.join('\n');
    updateItemsDisplay();
    drawWheel();
}

function updateItemsDisplay() {
    const count = state.currentItems.length;
    state.els.currentItemsTitle.textContent = `Current Items (${count})`;
    renderItemTags('items-display', state.currentItems);
}

function setupPillDelegation() {
    state.els.savedListsPills.addEventListener('click', function (e) {
        const btn = e.target.closest('.pill-button');
        if (!btn) return;
        const name = btn.dataset.listName;
        if (name) {
            selectListByName(name);
        } else {
            state.currentListName = null;
            state.currentItems = [];
            state.els.namesTextarea.value = '';
            updateItemsDisplay();
            drawWheel();
            updateListSelector();
            updateWheelHistory();
        }
    });
}

function setupSettingsDrawer() {
    const toggle = document.getElementById('settings-toggle');
    const overlay = document.getElementById('settings-overlay');
    const drawer = document.getElementById('settings-drawer');
    const closeBtn = document.getElementById('settings-close');

    function openDrawer() {
        overlay.classList.add('active');
        drawer.classList.add('active');
    }
    function closeDrawer() {
        overlay.classList.remove('active');
        drawer.classList.remove('active');
    }

    if (toggle) toggle.addEventListener('click', openDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });

    const settings = loadSettings();

    const removeAfterDraw = document.getElementById('remove-after-draw');
    if (removeAfterDraw) {
        if (settings.removeAfterDraw !== undefined) removeAfterDraw.checked = settings.removeAfterDraw;
        removeAfterDraw.addEventListener('change', (e) => saveSetting('removeAfterDraw', e.target.checked));
    }

    const minNum = document.getElementById('min-number');
    const maxNum = document.getElementById('max-number');
    if (minNum) {
        if (settings.minNumber !== undefined) minNum.value = settings.minNumber;
        minNum.addEventListener('change', (e) => { saveSetting('minNumber', e.target.value); updateDrawProgress(); });
    }
    if (maxNum) {
        if (settings.maxNumber !== undefined) maxNum.value = settings.maxNumber;
        maxNum.addEventListener('change', (e) => { saveSetting('maxNumber', e.target.value); updateDrawProgress(); });
    }

    if (state.els.drawSlider) {
        if (settings.drawCount !== undefined) state.els.drawSlider.value = settings.drawCount;
        state.els.drawSlider.addEventListener('input', (e) => { saveSetting('drawCount', e.target.value); updateDrawCount(e.target.value); });
    }

    const excludeDrawn = document.getElementById('exclude-drawn');
    if (excludeDrawn) {
        if (settings.excludeDrawn !== undefined) excludeDrawn.checked = settings.excludeDrawn;
        excludeDrawn.addEventListener('change', (e) => saveSetting('excludeDrawn', e.target.checked));
    }

    const groupRadios = document.querySelectorAll('input[name="group-mode"]');
    groupRadios.forEach(radio => {
        if (settings.groupMode && radio.value === settings.groupMode) radio.checked = true;
        radio.addEventListener('change', (e) => { saveSetting('groupMode', e.target.value); computeGroupPreview(); });
    });

    const groupNum = document.getElementById('group-number');
    if (groupNum) {
        if (settings.groupNumber !== undefined) groupNum.value = settings.groupNumber;
        groupNum.addEventListener('input', (e) => { saveSetting('groupNumber', e.target.value); computeGroupPreview(); });
    }

    const soundCb = document.getElementById('setting-sound');
    const confettiCb = document.getElementById('setting-confetti');
    const autoAdvanceInput = document.getElementById('setting-auto-advance');

    if (soundCb) {
        soundCb.checked = state.displaySettings.soundEnabled;
        soundCb.addEventListener('change', (e) => { state.displaySettings.soundEnabled = e.target.checked; saveDisplaySettings(); });
    }
    if (confettiCb) {
        confettiCb.checked = state.displaySettings.confettiEnabled;
        confettiCb.addEventListener('change', (e) => { state.displaySettings.confettiEnabled = e.target.checked; saveDisplaySettings(); });
    }
    if (autoAdvanceInput) {
        autoAdvanceInput.value = state.displaySettings.autoAdvanceSeconds;
        autoAdvanceInput.addEventListener('input', (e) => { state.displaySettings.autoAdvanceSeconds = parseInt(e.target.value) || 0; saveDisplaySettings(); });
    }
}

function setupEventListeners() {
    document.getElementById('spin-button')?.addEventListener('click', spinWheel);
    document.getElementById('create-list-btn')?.addEventListener('click', createNewList);
    document.getElementById('save-list-btn')?.addEventListener('click', saveCurrentList);
    document.getElementById('shuffle-list-btn')?.addEventListener('click', shuffleList);
    document.getElementById('delete-list-btn')?.addEventListener('click', deleteCurrentList);

    document.getElementById('pick-number-btn')?.addEventListener('click', pickNumber);
    document.getElementById('clear-history-btn')?.addEventListener('click', () => { clearNumberHistory(); });
    document.getElementById('clear-wheel-history-btn')?.addEventListener('click', () => { clearWheelHistory(); });

    document.getElementById('add-member-btn')?.addEventListener('click', addSingleMember);
    document.getElementById('add-batch-btn')?.addEventListener('click', addBatchMembers);
    document.getElementById('shuffle-group-btn')?.addEventListener('click', shuffleGroup);
    document.getElementById('clear-group-btn')?.addEventListener('click', clearGroupMembers);
    document.getElementById('start-grouping-btn')?.addEventListener('click', startGrouping);
    document.getElementById('export-csv-btn')?.addEventListener('click', exportGroupsCSV);

    document.getElementById('display-mode-btn')?.addEventListener('click', toggleDisplayMode);

    document.getElementById('winner-overlay-close')?.addEventListener('click', () => {
        document.getElementById('winner-overlay')?.classList.remove('active');
        clearConfetti();
        clearAutoAdvance();
    });

    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', function () {
            this.classList.toggle('collapsed');
            const body = this.nextElementSibling;
            if (body) body.classList.toggle('collapsed');
        });
    });

    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            const mode = this.dataset.mode;
            document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.mode-content').forEach(content => content.classList.remove('active'));
            document.getElementById(mode + '-mode').classList.add('active');
            if (mode === 'wheel') setTimeout(() => drawWheel(), 100);
        });
    });

    document.getElementById('group-member-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addSingleMember();
    });
}

window.addEventListener('load', function () {
    cacheDom();
    initCanvas();
    loadDisplaySettings();
    loadDrawnNumbers();
    setupEventListeners();
    setupPillDelegation();
    setupSettingsDrawer();
    setupItemDelegation('items-display', removeItem);
    setupItemDelegation('group-items-display', removeGroupMember);
    updateListSelector();
    drawWheel();
    updateDrawProgress();
    computeGroupPreview();
});

window.addEventListener('resize', debounce(function () {
    if (state.els.wheelMode && state.els.wheelMode.classList.contains('active')) {
        drawWheel();
    }
}, 100));
