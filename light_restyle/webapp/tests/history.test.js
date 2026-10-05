import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeCommand, undo, redo, clearHistory, canUndo, canRedo } from '../src/history.js';

describe('History Module', () => {
    beforeEach(() => {
        clearHistory();
    });

    it('should execute command and add to undo stack', () => {
        const cmd = { do: vi.fn(), undo: vi.fn() };
        executeCommand(cmd);
        expect(cmd.do).toHaveBeenCalled();
        expect(canUndo()).toBe(true);
        expect(canRedo()).toBe(false);
    });

    it('should undo command and move to redo stack', () => {
        const cmd = { do: vi.fn(), undo: vi.fn() };
        executeCommand(cmd);
        undo();
        expect(cmd.undo).toHaveBeenCalled();
        expect(canUndo()).toBe(false);
        expect(canRedo()).toBe(true);
    });

    it('should redo command', () => {
        const cmd = { do: vi.fn(), undo: vi.fn() };
        executeCommand(cmd);
        undo();
        redo();
        expect(cmd.do).toHaveBeenCalledTimes(2);
        expect(canUndo()).toBe(true);
        expect(canRedo()).toBe(false);
    });

    it('should clear redo stack when new command executed', () => {
        const cmd1 = { do: vi.fn(), undo: vi.fn() };
        const cmd2 = { do: vi.fn(), undo: vi.fn() };
        executeCommand(cmd1);
        undo();
        executeCommand(cmd2);
        expect(canRedo()).toBe(false);
    });
});
