import { undo, redo } from './history.js';

const shortcutMap = {};

export function registerShortcut(keyCombo, action) {
    shortcutMap[keyCombo] = action;
}

export function handleKeyDown(event) {
    const isCtrl = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const key = event.key.toUpperCase();
    
    let combo = [];
    if (isCtrl) combo.push('CTRL');
    if (isShift) combo.push('SHIFT');
    combo.push(key);
    
    const comboString = combo.join('+');
    
    if (shortcutMap[comboString]) {
        event.preventDefault();
        shortcutMap[comboString]();
    }
}

export function initShortcuts() {
    window.addEventListener('keydown', handleKeyDown);
    
    registerShortcut('CTRL+Z', undo);
    registerShortcut('CTRL+SHIFT+Z', redo);
    registerShortcut('CTRL+Y', redo);
}
