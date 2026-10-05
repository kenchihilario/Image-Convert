import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as shapes from '../src/tools/shapes.js';
import * as eyedropper from '../src/tools/eyedropper.js';
import * as state from '../src/state.js';
import * as history from '../src/history.js';

describe('Paint & Draw Tools (Phase D)', () => {
    let mockCanvas;
    let mockEvents;

    beforeEach(() => {
        mockEvents = {};
        
        mockCanvas = {
            on: vi.fn((event, cb) => { mockEvents[event] = cb; }),
            off: vi.fn((event) => { delete mockEvents[event]; }),
            getPointer: vi.fn(() => ({ x: 100, y: 100 })),
            add: vi.fn(),
            remove: vi.fn(),
            requestRenderAll: vi.fn(),
            getContext: vi.fn(() => ({
                getImageData: vi.fn(() => ({ data: [255, 0, 0, 255] }))
            })),
            getRetinaScaling: vi.fn(() => 1),
            forEachObject: vi.fn()
        };

        vi.spyOn(state, 'getCanvas').mockReturnValue(mockCanvas);
        vi.spyOn(state, 'addLayer').mockImplementation(vi.fn());
        vi.spyOn(history, 'executeCommand').mockImplementation((cmd) => cmd.do());

        globalThis.fabric = {
            Rect: class {
                constructor(opts) {
                    this.type = 'rect';
                    this.opts = opts;
                    this.set = vi.fn();
                    this.setCoords = vi.fn();
                }
            }
        };
        
        document.body.innerHTML = `
            <input type="color" id="brush-color" value="#000000">
            <input type="number" id="brush-size" value="10">
            <span id="brush-size-value">10px</span>
            <input type="number" id="brush-opacity" value="1">
            <input type="number" id="brush-hardness" value="1">
        `;
    });

    it('should activate shape tool and bind events', () => {
        shapes.activateShape('rect');
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:down', expect.any(Function));
        expect(mockCanvas.isDrawingMode).toBe(false);
    });

    it('should draw a rectangle shape on mouse events', () => {
        shapes.activateShape('rect');
        
        // Mouse Down
        mockEvents['mouse:down']({ e: {} });
        expect(mockCanvas.add).toHaveBeenCalled(); // Preview added
        
        // Mouse Move
        mockCanvas.getPointer.mockReturnValue({ x: 200, y: 200 });
        mockEvents['mouse:move']({ e: {} });
        expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
        
        // Mouse Up
        mockEvents['mouse:up']({ e: {} });
        expect(state.addLayer).toHaveBeenCalled(); // Final layer added to state
    });

    it('should sample color with eyedropper', () => {
        eyedropper.activateEyedropper();
        mockEvents['mouse:down']({ e: {} });
        
        // Should update the brush color input to the sampled color (red = #ff0000)
        expect(document.getElementById('brush-color').value).toBe('#ff0000');
    });
});
