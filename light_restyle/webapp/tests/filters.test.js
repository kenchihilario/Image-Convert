import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as adjustments from '../src/filters/adjustments.js';
import * as gallery from '../src/filters/gallery.js';
import * as state from '../src/state.js';
import * as history from '../src/history.js';

describe('Filters & Adjustments (Phase E)', () => {
    let mockCanvas;
    let mockLayer;
    let uiValues = {};

    beforeEach(() => {
        mockLayer = {
            id: 1,
            type: 'image',
            filters: [],
            applyFilters: vi.fn(),
            adjustmentValues: null
        };
        
        mockCanvas = {
            requestRenderAll: vi.fn()
        };

        vi.spyOn(state, 'getCanvas').mockReturnValue(mockCanvas);
        vi.spyOn(state, 'getActiveLayer').mockReturnValue(mockLayer);
        vi.spyOn(history, 'executeCommand').mockImplementation((cmd) => cmd.do());

        // Mock UI elements
        uiValues = {
            'adj-brightness': '0.5',
            'adj-contrast': '0',
            'adj-gamma': '1',
            'adj-hue': '0.2',
            'adj-saturation': '0',
            'adj-lightness': '0',
            'adj-blur': '0',
            'adj-noise': '0',
            'adj-pixelate': '1'
        };

        vi.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'adjustments-panel') {
                return { style: {} };
            }
            if (id === 'btn-apply-filters') {
                return { style: {} };
            }
            return {
                value: uiValues[id] || '',
                addEventListener: vi.fn()
            };
        });

        globalThis.fabric = {
            Image: {
                filters: {
                    Brightness: class { constructor(o) { this.type = 'Brightness'; this.opts = o; } },
                    Contrast: class { constructor(o) { this.type = 'Contrast'; this.opts = o; } },
                    Gamma: class { constructor(o) { this.type = 'Gamma'; this.opts = o; } },
                    HueRotation: class { constructor(o) { this.type = 'HueRotation'; this.opts = o; } },
                    Saturation: class { constructor(o) { this.type = 'Saturation'; this.opts = o; } },
                    Blur: class { constructor(o) { this.type = 'Blur'; this.opts = o; } },
                    Noise: class { constructor(o) { this.type = 'Noise'; this.opts = o; } },
                    Pixelate: class { constructor(o) { this.type = 'Pixelate'; this.opts = o; } },
                    Sepia: class { constructor(o) { this.type = 'Sepia'; this.opts = o; } },
                    Grayscale: class { constructor(o) { this.type = 'Grayscale'; this.opts = o; } },
                    Invert: class { constructor(o) { this.type = 'Invert'; this.opts = o; } },
                    BlackWhite: class { constructor(o) { this.type = 'BlackWhite'; this.opts = o; } }
                }
            }
        };
    });

    it('should inject filters non-destructively on adjustment', () => {
        adjustments.setupAdjustments();
        const listener = document.getElementById.mock.results.find(r => r.value && r.value.addEventListener && r.value.addEventListener.mock.calls.length > 0).value.addEventListener.mock.calls.find(c => c[0] === 'change')[1];
        
        listener({ target: { id: 'adj-brightness' } });
        
        expect(mockLayer.applyFilters).toHaveBeenCalled();
        expect(mockLayer.filters.some(f => f.type === 'Brightness')).toBe(true);
        expect(mockLayer.filters.some(f => f.type === 'HueRotation')).toBe(true);
        expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
    });

    it('should toggle filter gallery effects', () => {
        gallery.setupFilterGallery();
        const listener = document.getElementById.mock.results.find(r => document.getElementById.mock.calls.some(c => c[0] === 'btn-filter-sepia' && r.value && r.value.addEventListener)).value.addEventListener.mock.calls.find(c => c[0] === 'click')[1];
        
        listener(); // Toggle Sepia On
        
        expect(mockLayer.filters.some(f => f.type === 'Sepia')).toBe(true);
        expect(mockLayer.applyFilters).toHaveBeenCalled();
    });
});
