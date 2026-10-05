import { getActiveLayer, getCanvas } from '../state.js';
import { executeCommand } from '../history.js';

export function setupFilterGallery() {
    const filters = {
        'btn-filter-sepia': { type: 'Sepia', factory: () => new fabric.Image.filters.Sepia() },
        'btn-filter-grayscale': { type: 'Grayscale', factory: () => new fabric.Image.filters.Grayscale() },
        'btn-filter-invert': { type: 'Invert', factory: () => new fabric.Image.filters.Invert() },
        'btn-filter-blackwhite': { type: 'BlackWhite', factory: () => new fabric.Image.filters.BlackWhite() }
    };

    Object.keys(filters).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            const activeLayer = getActiveLayer();
            if (!activeLayer || activeLayer.type !== 'image') return;

            const filterType = filters[id].type;
            const hasFilter = activeLayer.filters.some(f => f.type === filterType);

            executeCommand({
                do: () => toggleFilter(activeLayer, filterType, filters[id].factory, !hasFilter),
                undo: () => toggleFilter(activeLayer, filterType, filters[id].factory, hasFilter)
            });
        });
    });
}

function toggleFilter(layer, type, factory, enable) {
    if (enable) {
        if (!layer.filters.some(f => f.type === type)) {
            layer.filters.push(factory());
        }
    } else {
        layer.filters = layer.filters.filter(f => f.type !== type);
    }
    
    layer.applyFilters();
    const canvas = getCanvas();
    if (canvas) canvas.requestRenderAll();
}
