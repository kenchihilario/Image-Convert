import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLayers, getActiveLayer, addLayer, removeLayer, setActiveLayer, initCanvas, on } from '../src/state.js';
import { EVENT_ACTIVE_LAYER, EVENT_LAYER_ADDED, EVENT_LAYER_REMOVED } from '../src/constants.js';

describe('State Module', () => {
    beforeEach(() => {
        globalThis.fabric = {
            Canvas: class {
                constructor() {
                    this.on = vi.fn();
                    this.add = vi.fn();
                    this.remove = vi.fn();
                    this.setActiveObject = vi.fn();
                }
            }
        };
        initCanvas('mock-id', 800, 600);
        const layers = getLayers();
        layers.forEach(l => removeLayer(l));
    });

    it('should add a layer to the top', () => {
        const mockLayer1 = { id: 1 };
        const mockLayer2 = { id: 2 };
        addLayer(mockLayer1);
        addLayer(mockLayer2);
        const layers = getLayers();
        expect(layers.length).toBe(2);
        expect(layers[0]).toBe(mockLayer2);
        expect(getActiveLayer()).toBe(mockLayer2);
    });

    it('should emit events on adding layer', () => {
        const spy = vi.fn();
        on(EVENT_LAYER_ADDED, spy);
        const mockLayer = {};
        addLayer(mockLayer);
        expect(spy).toHaveBeenCalledWith(mockLayer);
    });

    it('should emit events on removing layer', () => {
        const spy = vi.fn();
        on(EVENT_LAYER_REMOVED, spy);
        const mockLayer = {};
        addLayer(mockLayer);
        removeLayer(mockLayer);
        expect(spy).toHaveBeenCalledWith(mockLayer);
    });

    it('should emit active layer change', () => {
        const spy = vi.fn();
        on(EVENT_ACTIVE_LAYER, spy);
        const mockLayer = {};
        setActiveLayer(mockLayer);
        expect(spy).toHaveBeenCalledWith(mockLayer);
    });
});
