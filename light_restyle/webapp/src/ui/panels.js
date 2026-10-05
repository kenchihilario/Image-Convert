import { getLayers, getActiveLayer, setActiveLayer, removeLayer, getCanvas, on } from '../state.js';
import { executeCommand } from '../history.js';
import { EVENT_ACTIVE_LAYER } from '../constants.js';
import { groupSelectedLayers } from '../tools/groups.js';
import { addLayerMask } from '../tools/masks.js';
export function renderLayersList() {
    const layersList = document.getElementById('layers-list');
    layersList.innerHTML = '';
    
    const layers = getLayers();
    const activeLayer = getActiveLayer();
    
    layers.forEach((layer) => {
        const li = document.createElement('li');
        li.className = `layer-item ${layer === activeLayer ? 'active' : ''}`;
        
        li.innerHTML = `
            <div class="layer-thumb" style="background-color: ${layer.fill || '#ccc'}">
                ${layer.hasMask ? '<div class="mask-indicator" style="position:absolute; bottom:0; right:0; width:8px; height:8px; background:#fff; border:1px solid #000;"></div>' : ''}
            </div>
            <div class="layer-name">
                ${layer.type === 'group' ? '<i class="fa-solid fa-folder"></i> ' : ''}
                ${layer.name || 'Layer'}
            </div>
            <div class="layer-visibility"><i class="fa-solid fa-eye${layer.visible ? '' : '-slash'}"></i></div>
        `;
        
        li.addEventListener('click', () => {
            setActiveLayer(layer);
            const canvas = getCanvas();
            if (canvas) canvas.requestRenderAll();
        });
        
        li.querySelector('.layer-visibility').addEventListener('click', (e) => toggleLayerVisibility(e, layer));
        layersList.appendChild(li);
    });
}

function toggleLayerVisibility(e, layer) {
    e.stopPropagation();
    layer.set('visible', !layer.visible);
    const canvas = getCanvas();
    if (canvas) canvas.requestRenderAll();
    e.currentTarget.innerHTML = `<i class="fa-solid fa-eye${layer.visible ? '' : '-slash'}"></i>`;
}

export function setupLayerActions() {
    document.getElementById('btn-delete-layer').addEventListener('click', () => {
        const activeLayer = getActiveLayer();
        if (activeLayer) removeLayer(activeLayer);
    });
    
    document.getElementById('btn-group-layer').addEventListener('click', groupSelectedLayers);
    document.getElementById('btn-mask-layer').addEventListener('click', addLayerMask);

    const opacityInput = document.getElementById('layer-opacity-num');
    const blendModeSelect = document.getElementById('layer-blend-mode');

    opacityInput.addEventListener('change', () => {
        const activeLayer = getActiveLayer();
        if (!activeLayer) return;
        
        const oldVal = activeLayer.opacity;
        const newVal = parseInt(opacityInput.value, 10) / 100;
        
        executeCommand({
            do: () => applyOpacity(activeLayer, newVal),
            undo: () => applyOpacity(activeLayer, oldVal)
        });
    });

    blendModeSelect.addEventListener('change', () => {
        const activeLayer = getActiveLayer();
        if (!activeLayer) return;
        
        const oldVal = activeLayer.globalCompositeOperation;
        const newVal = blendModeSelect.value;
        
        executeCommand({
            do: () => applyBlendMode(activeLayer, newVal),
            undo: () => applyBlendMode(activeLayer, oldVal)
        });
    });

    on(EVENT_ACTIVE_LAYER, syncLayerControls);
}

function applyOpacity(layer, val) {
    layer.set('opacity', val);
    const canvas = getCanvas();
    if (canvas) canvas.requestRenderAll();
    if (getActiveLayer() === layer) {
        document.getElementById('layer-opacity-num').value = Math.round(val * 100);
    }
}

function applyBlendMode(layer, val) {
    layer.set('globalCompositeOperation', val);
    const canvas = getCanvas();
    if (canvas) canvas.requestRenderAll();
    if (getActiveLayer() === layer) {
        document.getElementById('layer-blend-mode').value = val;
    }
}

export function syncLayerControls(layer) {
    if (!layer) return;
    document.getElementById('layer-opacity-num').value = Math.round((layer.opacity !== undefined ? layer.opacity : 1) * 100);
    document.getElementById('layer-blend-mode').value = layer.globalCompositeOperation || 'source-over';
}
