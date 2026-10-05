import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupNavigation } from '../src/tools/navigation.js';
import * as state from '../src/state.js';

describe('Navigation Tool', () => {
    let mockCanvas;

    beforeEach(() => {
        mockCanvas = {
            on: vi.fn(),
            off: vi.fn(),
            getZoom: vi.fn(() => 1),
            zoomToPoint: vi.fn(),
            setViewportTransform: vi.fn(),
            viewportTransform: [1, 0, 0, 1, 0, 0],
            requestRenderAll: vi.fn()
        };
        vi.spyOn(state, 'getCanvas').mockReturnValue(mockCanvas);
        

        document.body.innerHTML = '<div id="status-bar"></div>';
    });

    it('should bind canvas events on setup', () => {
        setupNavigation();
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:wheel', expect.any(Function));
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:down', expect.any(Function));
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:move', expect.any(Function));
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:up', expect.any(Function));
    });

    it('should update zoom on wheel event', () => {
        setupNavigation();
        const wheelHandler = mockCanvas.on.mock.calls.find(call => call[0] === 'mouse:wheel')[1];
        
        const mockOpt = {
            e: {
                deltaY: -100,
                offsetX: 50,
                offsetY: 50,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn()
            }
        };
        
        wheelHandler(mockOpt);
        
        expect(mockCanvas.zoomToPoint).toHaveBeenCalled();
        expect(mockOpt.e.preventDefault).toHaveBeenCalled();
        
        const statusBar = document.getElementById('status-bar');
        expect(statusBar.textContent).toContain('Zoom:');
    });
});
