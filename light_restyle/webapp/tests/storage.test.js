import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as project from '../src/storage/project.js';
import * as autosave from '../src/storage/autosave.js';
import * as state from '../src/state.js';

describe('Storage & Persistence (Phase F)', () => {
    let mockCanvas;
    let mockLayer;

    beforeEach(() => {
        mockLayer = {
            id: '123',
            name: 'Test Layer',
            hasMask: true,
            adjustmentValues: { brightness: 0.5 }
        };
        
        mockCanvas = {
            toJSON: vi.fn((props) => {
                return {
                    objects: [{
                        type: 'image',
                        id: mockLayer.id,
                        name: mockLayer.name,
                        hasMask: mockLayer.hasMask,
                        adjustmentValues: mockLayer.adjustmentValues
                    }]
                };
            }),
            loadFromJSON: vi.fn((json, cb) => cb()),
            getObjects: vi.fn(() => [mockLayer]),
            requestRenderAll: vi.fn()
        };

        vi.spyOn(state, 'getCanvas').mockReturnValue(mockCanvas);
        vi.spyOn(state, 'getLayers').mockReturnValue([mockLayer]);
        vi.spyOn(state, 'removeLayer').mockImplementation(vi.fn());
        vi.spyOn(state, 'addLayer').mockImplementation(vi.fn());

        vi.spyOn(document, 'createElement').mockReturnValue({
            click: vi.fn(),
            type: '',
            accept: '',
            onchange: null,
            addEventListener: vi.fn(),
            querySelector: vi.fn(() => ({ addEventListener: vi.fn() }))
        });
        vi.spyOn(document, 'getElementById').mockReturnValue({
            innerHTML: '',
            appendChild: vi.fn()
        });
        vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn());
        vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn());

        globalThis.URL = {
            createObjectURL: vi.fn(() => 'blob:url'),
            revokeObjectURL: vi.fn()
        };

        globalThis.Blob = class Blob { constructor() {} };

        let store = {};
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(key => store[key]);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { store[key] = value.toString(); });
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(key => { delete store[key]; });
        vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => { store = {}; });
        
        globalThis.confirm = vi.fn(() => true);
    });

    it('should serialize custom properties', () => {
        const jsonString = project.serializeProject();
        const parsed = JSON.parse(jsonString);
        
        expect(mockCanvas.toJSON).toHaveBeenCalledWith(expect.arrayContaining(['id', 'name', 'hasMask', 'adjustmentValues']));
        expect(parsed.objects[0].name).toBe('Test Layer');
        expect(parsed.objects[0].hasMask).toBe(true);
        expect(parsed.objects[0].adjustmentValues.brightness).toBe(0.5);
    });

    it('should restore project and rebuild state layers array', () => {
        project.restoreProject({ objects: [] });
        expect(mockCanvas.loadFromJSON).toHaveBeenCalled();
        expect(state.removeLayer).toHaveBeenCalledWith(mockLayer, false);
        expect(state.addLayer).toHaveBeenCalledWith(mockLayer, true);
    });
});
