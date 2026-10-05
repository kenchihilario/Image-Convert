import { initCanvas, addLayer, getLayers, on } from './state.js';
import { EVENT_ACTIVE_LAYER, EVENT_LAYER_ADDED, EVENT_LAYER_REMOVED, EVENT_LAYER_CHANGED, EVENT_HISTORY_CHANGED } from './constants.js';
import { initShortcuts } from './shortcuts.js';
import { setupTools } from './tools/index.js';
import { setupNavigation } from './tools/navigation.js';
import { bindGroupShortcuts } from './tools/groups.js';
import { initBrushCursor } from './tools/brush-cursor.js';
import { setupAdjustments } from './filters/adjustments.js';
import { setupFilterGallery } from './filters/gallery.js';
import { setupAiRestyle } from './filters/ai_restyle.js';
import { renderLayersList, setupLayerActions } from './ui/panels.js';
import { setupTransformPanel } from './ui/transform.js';
import { saveProjectAsLasp, loadProjectFromLasp } from './storage/project.js';
import { exportCanvas } from './storage/export.js';
import { setupAutosave } from './storage/autosave.js';
import { undo, redo, canUndo, canRedo } from './history.js';

export function initApp() {
    initCanvas('main-canvas', 800, 600);
    addDefaultBackground();
    setupEvents();
    initShortcuts();
    bindGroupShortcuts();
    setupNavigation();
    setupTools();
    initBrushCursor();
    setupAdjustments();
    setupFilterGallery();
    setupAiRestyle();
    setupLayerActions();
    setupTransformPanel();
    setupAutosave();
    

    document.getElementById('menu-open').addEventListener('click', (e) => { e.preventDefault(); loadProjectFromLasp(); });
    document.getElementById('menu-save').addEventListener('click', (e) => { e.preventDefault(); saveProjectAsLasp(); });
    document.getElementById('menu-export').addEventListener('click', (e) => { e.preventDefault(); exportCanvas(); });
    
    document.getElementById('btn-undo').addEventListener('click', () => { undo(); });
    document.getElementById('btn-redo').addEventListener('click', () => { redo(); });
    
    on(EVENT_HISTORY_CHANGED, () => {
        document.getElementById('btn-undo').disabled = !canUndo();
        document.getElementById('btn-redo').disabled = !canRedo();
    });
    
    on(EVENT_LAYER_ADDED, renderLayersList);
    on(EVENT_LAYER_REMOVED, renderLayersList);
    on(EVENT_ACTIVE_LAYER, renderLayersList);
    on(EVENT_LAYER_CHANGED, renderLayersList);
    renderLayersList();
}

function addDefaultBackground() {
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    

    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 800;
    bgCanvas.height = 600;
    const ctx = bgCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);
    
    fabric.Image.fromURL(bgCanvas.toDataURL(), (img) => {
        img.set({
            left: 0, top: 0,
            selectable: true, name: `Background 1`
        });
        addLayer(img, false);
    });
}

function setupEvents() {
    const fileInput = document.getElementById('file-input');
    document.getElementById('menu-open').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    document.getElementById('menu-save').addEventListener('click', saveImage);
    document.getElementById('btn-add-layer').addEventListener('click', addDefaultBackground);
}

function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (f) => loadFabricImage(f.target.result);
        reader.readAsDataURL(e.target.files[0]);
    }
}

function loadFabricImage(dataUrl) {
    fabric.Image.fromURL(dataUrl, (img) => {
        if (img.width > 800 || img.height > 600) img.scaleToWidth(800);
        img.set({
            left: (800 - img.getScaledWidth()) / 2,
            top: (600 - img.getScaledHeight()) / 2,
            name: `Layer ${getLayers().length + 1}`
        });
        addLayer(img, true);
        document.getElementById('status-bar').textContent = "Image loaded.";
    });
}

function saveImage() {
    const link = document.createElement('a');
    link.download = 'photostudio_export.png';
    const canvasEl = document.getElementById('main-canvas').parentElement.querySelector('canvas.upper-canvas');
    if (canvasEl) link.href = canvasEl.toDataURL();
    link.click();
}

window.addEventListener('load', initApp);
