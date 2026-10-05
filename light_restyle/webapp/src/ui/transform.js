import { getActiveLayer, getCanvas, on } from '../state.js';
import { EVENT_ACTIVE_LAYER } from '../constants.js';
import { executeCommand } from '../history.js';

let isUpdatingUI = false;
let transformStartState = null;

export function setupTransformPanel() {
    const canvas = getCanvas();
    if (!canvas) return;

    on(EVENT_ACTIVE_LAYER, updateTransformUI);
    canvas.on('object:moving', updateTransformUI);
    canvas.on('object:scaling', updateTransformUI);
    canvas.on('object:rotating', updateTransformUI);
    
    canvas.on('before:transform', handleBeforeTransform);
    canvas.on('object:modified', handleObjectModified);

    document.getElementById('tf-x').addEventListener('change', applyTransformFromUI);
    document.getElementById('tf-y').addEventListener('change', applyTransformFromUI);
    document.getElementById('tf-w').addEventListener('change', applyTransformFromUI);
    document.getElementById('tf-h').addEventListener('change', applyTransformFromUI);
    document.getElementById('tf-rot').addEventListener('change', applyTransformFromUI);
}

function updateTransformUI() {
    if (isUpdatingUI) return;
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    isUpdatingUI = true;
    document.getElementById('tf-x').value = Math.round(activeLayer.left);
    document.getElementById('tf-y').value = Math.round(activeLayer.top);
    document.getElementById('tf-w').value = Math.round(activeLayer.getScaledWidth());
    document.getElementById('tf-h').value = Math.round(activeLayer.getScaledHeight());
    document.getElementById('tf-rot').value = Math.round(activeLayer.angle);
    isUpdatingUI = false;
}

function handleBeforeTransform(opt) {
    const target = opt.transform.target;
    transformStartState = {
        left: target.left,
        top: target.top,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        angle: target.angle
    };
}

function handleObjectModified(opt) {
    updateTransformUI();
    const target = opt.target;
    if (!transformStartState) return;
    
    const oldState = transformStartState;
    const newState = {
        left: target.left,
        top: target.top,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        angle: target.angle
    };

    executeCommand({
        do: () => applyState(target, newState),
        undo: () => applyState(target, oldState)
    });
    transformStartState = null;
}

function applyTransformFromUI() {
    if (isUpdatingUI) return;
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    const x = parseFloat(document.getElementById('tf-x').value);
    const y = parseFloat(document.getElementById('tf-y').value);
    const w = parseFloat(document.getElementById('tf-w').value);
    const h = parseFloat(document.getElementById('tf-h').value);
    const rot = parseFloat(document.getElementById('tf-rot').value);

    const oldState = {
        left: activeLayer.left,
        top: activeLayer.top,
        scaleX: activeLayer.scaleX,
        scaleY: activeLayer.scaleY,
        angle: activeLayer.angle
    };

    const newState = {
        left: x,
        top: y,
        scaleX: w / activeLayer.width,
        scaleY: h / activeLayer.height,
        angle: rot
    };

    executeCommand({
        do: () => applyState(activeLayer, newState),
        undo: () => applyState(activeLayer, oldState)
    });
}

function applyState(layer, state) {
    layer.set(state);
    layer.setCoords();
    const canvas = getCanvas();
    if (canvas) canvas.requestRenderAll();
    
    if (getActiveLayer() === layer) {
        isUpdatingUI = true;
        document.getElementById('tf-x').value = Math.round(layer.left);
        document.getElementById('tf-y').value = Math.round(layer.top);
        document.getElementById('tf-w').value = Math.round(layer.getScaledWidth());
        document.getElementById('tf-h').value = Math.round(layer.getScaledHeight());
        document.getElementById('tf-rot').value = Math.round(layer.angle);
        isUpdatingUI = false;
    }
}
