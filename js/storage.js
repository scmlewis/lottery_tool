let cachedLists = null;
let cachedListsJson = '';

export function getStoredLists() {
    const raw = localStorage.getItem('wheelLists');
    if (raw === cachedListsJson) return cachedLists;
    cachedListsJson = raw;
    cachedLists = raw ? JSON.parse(raw) : {};
    return cachedLists;
}

export function saveLists(lists) {
    cachedLists = lists;
    cachedListsJson = JSON.stringify(lists);
    localStorage.setItem('wheelLists', cachedListsJson);
}

export function setCurrentItems(listName, items) {
    if (!listName) return;
    const lists = getStoredLists();
    lists[listName] = items;
    saveLists(lists);
}

export function loadSettings() {
    return JSON.parse(localStorage.getItem('lotterySettings') || '{}');
}

export function saveSetting(key, value) {
    const settings = loadSettings();
    settings[key] = value;
    localStorage.setItem('lotterySettings', JSON.stringify(settings));
}
