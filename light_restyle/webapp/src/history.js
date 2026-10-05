import { emit } from './state.js';
import { EVENT_HISTORY_CHANGED } from './constants.js';

let undoStack = [];
let redoStack = [];

export function executeCommand(command) {
    command.do();
    undoStack.push(command);
    redoStack = [];
    emit(EVENT_HISTORY_CHANGED);
}

export function undo() {
    if (undoStack.length === 0) return;
    const command = undoStack.pop();
    command.undo();
    redoStack.push(command);
    emit(EVENT_HISTORY_CHANGED);
}

export function redo() {
    if (redoStack.length === 0) return;
    const command = redoStack.pop();
    command.do();
    undoStack.push(command);
    emit(EVENT_HISTORY_CHANGED);
}

export function clearHistory() {
    undoStack = [];
    redoStack = [];
}

export function canUndo() {
    return undoStack.length > 0;
}

export function canRedo() {
    return redoStack.length > 0;
}