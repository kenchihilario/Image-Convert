import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as groups from '../src/tools/groups.js';
import * as masks from '../src/tools/masks.js';
import * as panels from '../src/ui/panels.js';
import * as state from '../src/state.js';
import * as history from '../src/history.js';

describe('Layer Enhancements (Phase C)', () => {
    let mockCanvas;
    let mockLayer1;
    let mockLayer2;
    let activeObj;

    beforeEach(() => {
        mockLayer1 = { id: 1, type: 'rect', set: vi.fn() };
        mockLayer2 = { id: 2, type: 'rect', set: vi.fn() };
        
        activeObj = {
            type: 'activeSelection',
            getObjects: vi.fn(() => [mockLayer1, mockLayer2]),
            toGroup: vi.fn(() => ({ type: 'group', getObjects: vi.fn(() => [mockLayer1, mockLayer2]), toActiveSelection: vi.fn() }))
        };

        mockCanvas = {
            getActiveObject: vi.fn(() => activeObj),
            setActiveObject: vi.fn(),
            requestRenderAll: vi.fn()
        };

        vi.spyOn(state, 'getCanvas').mockReturnValue(mockCanvas);
        vi.spyOn(state, 'getActiveLayer').mockReturnValue(mockLayer1);
        vi.spyOn(state, 'removeLayer').mockImplementation(vi.fn());
        vi.spyOn(state, 'addLayer').mockImplementation(vi.fn());
        vi.spyOn(history, 'executeCommand').mockImplementation((cmd) => cmd.do());

        globalThis.fabric = {
            Rect: class {
                constructor() {
                    this.set = vi.fn();
                }
            }
        };
        
        document.body.innerHTML = `
            <input type="number" id="layer-opacity-num" value="100">
            <select id="layer-blend-mode">
                <option value="source-over">Normal</option>
                <option value="multiply">Multiply</option>
            </select>
        `;
    });

    it('should sync layer opacity and blend mode to UI', () => {
        mockLayer1.opacity = 0.5;
        mockLayer1.globalCompositeOperation = 'multiply';
        panels.syncLayerControls(mockLayer1);
        
        expect(document.getElementById('layer-opacity-num').value).toBe('50');
        expect(document.getElementById('layer-blend-mode').value).toBe('multiply');
    });

    it('should group selected layers and update state arrays', () => {
        groups.groupSelectedLayers();
        expect(activeObj.toGroup).toHaveBeenCalled();
        expect(state.removeLayer).toHaveBeenCalledWith(mockLayer1, false);
        expect(state.removeLayer).toHaveBeenCalledWith(mockLayer2, false);
        expect(state.addLayer).toHaveBeenCalled();
    });

    it('should add a layer mask using clipPath', () => {
        mockLayer1.clipPath = null;
        masks.addLayerMask();
        expect(mockLayer1.set).toHaveBeenCalledWith('clipPath', expect.anything());
        expect(mockLayer1.set).toHaveBeenCalledWith('hasMask', true);
    });
});
