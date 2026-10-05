import { describe, it, expect, vi } from 'vitest';
import { registerShortcut, handleKeyDown } from '../src/shortcuts.js';

describe('Shortcuts Module', () => {
    it('should trigger registered shortcut', () => {
        const action = vi.fn();
        registerShortcut('CTRL+Z', action);
        
        const event = {
            ctrlKey: true,
            shiftKey: false,
            metaKey: false,
            key: 'z',
            preventDefault: vi.fn()
        };
        
        handleKeyDown(event);
        
        expect(action).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should support shift modifiers', () => {
        const action = vi.fn();
        registerShortcut('CTRL+SHIFT+Z', action);
        
        const event = {
            ctrlKey: true,
            shiftKey: true,
            metaKey: false,
            key: 'Z',
            preventDefault: vi.fn()
        };
        
        handleKeyDown(event);
        
        expect(action).toHaveBeenCalled();
    });
});
