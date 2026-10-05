import { describe, it, expect, beforeEach, vi } from 'vitest';
import { activateCrop, deactivateCrop, commitCrop } from '../src/tools/crop.js';
import * as state from '../src/state.js';
import * as history from '../src/history.js';

describe('Crop Tool', () => {
    let mockCanvas;

    beforeEach(() => {
        mockCanvas = {
            on: vi.fn(),
            off: vi.fn(),
            add: vi.fn(),
            remove: vi.fn(),
            setActiveObject: vi.fn(),
            setWidth: vi.fn(),
            setHeight: vi.fn(),
            requestRenderAll: vi.fn(),
            getPointer: vi.fn(() => ({ x: 10, y: 10 })),
            forEachObject: vi.fn(),
            width: 800,
            height: 600
        };
        vi.spyOn(state, 'getCanvas').mockReturnValue(mockCanvas);
        vi.spyOn(state, 'getLayers').mockReturnValue([]);
        vi.spyOn(history, 'executeCommand').mockImplementation((cmd) => cmd.do());
        
        globalThis.fabric = {
            Rect: class {
                constructor() {
                    this.set = vi.fn();
                    this.setCoords = vi.fn();
                    this.getBoundingRect = vi.fn(() => ({ left: 100, top: 100, width: 400, height: 300 }));
                }
            }
        };
    });

    it('should bind canvas events on activate', () => {
        activateCrop();
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:down', expect.any(Function));
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:move', expect.any(Function));
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:up', expect.any(Function));
    });

    it('should unbind canvas events on deactivate', () => {
        activateCrop();
        deactivateCrop();
        expect(mockCanvas.off).toHaveBeenCalledWith('mouse:down', expect.any(Function));
        expect(mockCanvas.off).toHaveBeenCalledWith('mouse:move', expect.any(Function));
        expect(mockCanvas.off).toHaveBeenCalledWith('mouse:up', expect.any(Function));
    });

    it('should draw a crop rectangle on mouse down', () => {
        activateCrop();
        const mouseDownHandler = mockCanvas.on.mock.calls.find(call => call[0] === 'mouse:down')[1];
        
        mouseDownHandler({ e: {} });
        
        expect(mockCanvas.add).toHaveBeenCalled();
        expect(mockCanvas.setActiveObject).toHaveBeenCalled();
    });

    it('should execute crop command and resize canvas on commit', () => {
        activateCrop();
        const mouseDownHandler = mockCanvas.on.mock.calls.find(call => call[0] === 'mouse:down')[1];
        mouseDownHandler({ e: {} }); // create the rect
        
        commitCrop();
        
        expect(history.executeCommand).toHaveBeenCalled();
        expect(mockCanvas.setWidth).toHaveBeenCalledWith(400);
        expect(mockCanvas.setHeight).toHaveBeenCalledWith(300);
    });
});
