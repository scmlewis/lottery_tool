export function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function parseListText(text) {
    return text.split(/[,\n]+/).map(s => s.trim()).filter(s => s.length > 0);
}

export function debounce(fn, ms) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
}

export function renderItemTags(containerId, items) {
    const display = document.getElementById(containerId);
    if (!display) return;
    display.textContent = '';
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
        const tag = document.createElement('div');
        tag.className = 'item-tag';
        const span = document.createElement('span');
        span.textContent = item;
        const btn = document.createElement('button');
        btn.textContent = '\u00d7';
        btn.dataset.index = index;
        tag.appendChild(span);
        tag.appendChild(btn);
        fragment.appendChild(tag);
    });
    display.appendChild(fragment);
}

export function setupItemDelegation(containerId, removeCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        if (!isNaN(idx)) removeCallback(idx);
    });
}

export function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.className = 'toast'; }, 3000);
}
