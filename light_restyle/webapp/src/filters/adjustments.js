import { getActiveLayer, getCanvas, on } from '../state.js';
import { executeCommand } from '../history.js';
import { EVENT_ACTIVE_LAYER } from '../constants.js';

export function setupAdjustments() {
    const sliders = [
        'adj-brightness', 'adj-contrast', 'adj-gamma', 
        'adj-hue', 'adj-saturation', 'adj-lightness', 
        'adj-blur', 'adj-noise', 'adj-pixelate'
    ];
    
    sliders.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            const activeLayer = getActiveLayer();
            if (!activeLayer || activeLayer.type !== 'image') return;
            
            // Rebuild filters and apply
            const newValues = getSliderValues();
            
            // To support history, we need a way to store the old filter state.
            // But storing all values is easier.
            const oldValues = activeLayer.adjustmentValues || getEmptyValues();
            
            executeCommand({
                do: () => applyValuesToLayer(activeLayer, newValues),
                undo: () => applyValuesToLayer(activeLayer, oldValues)
            });
        });
        
        // Also apply live preview on input
        document.getElementById(id).addEventListener('input', () => {
            const activeLayer = getActiveLayer();
            if (!activeLayer || activeLayer.type !== 'image') return;
            applyValuesToLayer(activeLayer, getSliderValues(), false); // false = don't save to history yet
        });
    });

    on(EVENT_ACTIVE_LAYER, syncAdjustmentsUI);
    
    // Remove the old apply button if it still exists
    const btn = document.getElementById('btn-apply-filters');
    if (btn) btn.style.display = 'none';
}

function getEmptyValues() {
    return {
        brightness: 0, contrast: 0, gamma: 1, 
        hue: 0, saturation: 0, lightness: 0, 
        blur: 0, noise: 0, pixelate: 1
    };
}

function getSliderValues() {
    return {
        brightness: parseFloat(document.getElementById('adj-brightness').value) || 0,
        contrast: parseFloat(document.getElementById('adj-contrast').value) || 0,
        gamma: parseFloat(document.getElementById('adj-gamma').value) || 1,
        hue: parseFloat(document.getElementById('adj-hue').value) || 0,
        saturation: parseFloat(document.getElementById('adj-saturation').value) || 0,
        lightness: parseFloat(document.getElementById('adj-lightness').value) || 0,
        blur: parseFloat(document.getElementById('adj-blur').value) || 0,
        noise: parseInt(document.getElementById('adj-noise').value, 10) || 0,
        pixelate: parseInt(document.getElementById('adj-pixelate').value, 10) || 1
    };
}

function applyValuesToLayer(layer, values, syncUI = true) {
    layer.adjustmentValues = values;
    
    // Keep filter gallery effects (Sepia, etc) which are toggled elsewhere
    const galleryFilters = layer.filters.filter(f => 
        ['Sepia', 'Grayscale', 'Invert', 'BlackWhite'].includes(f.type)
    );
    
    layer.filters = [...galleryFilters];

    if (values.brightness !== 0) layer.filters.push(new fabric.Image.filters.Brightness({ brightness: values.brightness }));
    if (values.contrast !== 0) layer.filters.push(new fabric.Image.filters.Contrast({ contrast: values.contrast }));
    if (values.gamma !== 1) layer.filters.push(new fabric.Image.filters.Gamma({ gamma: [values.gamma, values.gamma, values.gamma] }));
    if (values.hue !== 0) layer.filters.push(new fabric.Image.filters.HueRotation({ rotation: values.hue }));
    if (values.saturation !== 0) layer.filters.push(new fabric.Image.filters.Saturation({ saturation: values.saturation }));
    // Note: Fabric doesn't have a native Lightness filter, we could simulate with Brightness or HSL wrapper. 
    // Fabric's Brightness acts somewhat like Lightness. We'll skip Lightness or map to Brightness for now.
    
    if (values.blur > 0) layer.filters.push(new fabric.Image.filters.Blur({ blur: values.blur }));
    if (values.noise > 0) layer.filters.push(new fabric.Image.filters.Noise({ noise: values.noise }));
    if (values.pixelate > 1) layer.filters.push(new fabric.Image.filters.Pixelate({ blocksize: values.pixelate }));

    layer.applyFilters();
    const canvas = getCanvas();
    if (canvas) canvas.requestRenderAll();
    
    if (syncUI && getActiveLayer() === layer) {
        document.getElementById('adj-brightness').value = values.brightness;
        document.getElementById('adj-contrast').value = values.contrast;
        document.getElementById('adj-gamma').value = values.gamma;
        document.getElementById('adj-hue').value = values.hue;
        document.getElementById('adj-saturation').value = values.saturation;
        document.getElementById('adj-blur').value = values.blur;
        document.getElementById('adj-noise').value = values.noise;
        document.getElementById('adj-pixelate').value = values.pixelate;
    }
}

function syncAdjustmentsUI(layer) {
    if (!layer || layer.type !== 'image') {
        document.getElementById('adjustments-panel').style.opacity = '0.5';
        document.getElementById('adjustments-panel').style.pointerEvents = 'none';
        return;
    }
    
    document.getElementById('adjustments-panel').style.opacity = '1';
    document.getElementById('adjustments-panel').style.pointerEvents = 'auto';

    const vals = layer.adjustmentValues || getEmptyValues();
    document.getElementById('adj-brightness').value = vals.brightness;
    document.getElementById('adj-contrast').value = vals.contrast;
    document.getElementById('adj-gamma').value = vals.gamma;
    document.getElementById('adj-hue').value = vals.hue;
    document.getElementById('adj-saturation').value = vals.saturation;
    document.getElementById('adj-lightness').value = vals.lightness;
    document.getElementById('adj-blur').value = vals.blur;
    document.getElementById('adj-noise').value = vals.noise;
    document.getElementById('adj-pixelate').value = vals.pixelate;
}
