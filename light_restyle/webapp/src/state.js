import { EVENT_LAYER_ADDED, EVENT_LAYER_REMOVED, EVENT_LAYER_CHANGED, EVENT_ACTIVE_LAYER } from './constants.js';

let canvas = null;
let layers = [];
let activeLayer = null;
const listeners = {};

export function initCanvas(canvasId, width, height) {
    canvas = new fabric.Canvas(canvasId, {
        width,
        height,
        backgroundColor: 'transparent',
        preserveObjectStacking: true
    });
    
    canvas.on('selection:created', () => setActiveLayer(canvas.getActiveObject()));
    canvas.on('selection:updated', () => setActiveLayer(canvas.getActiveObject()));
    canvas.on('selection:cleared', () => setActiveLayer(null));
    canvas.on('object:modified', () => emit(EVENT_LAYER_CHANGED));
    
    return canvas;
}

export function getCanvas() {
    return canvas;
}

export function getLayers() {
    return [...layers];
}

export function getActiveLayer() {
    return activeLayer;
}

export function setActiveLayer(layer) {
    activeLayer = layer;
    if (layer && canvas) {
        canvas.setActiveObject(layer);
    }
    emit(EVENT_ACTIVE_LAYER, layer);
}

export function addLayer(layer, bringToFront = true) {
    if (!canvas) return;
    canvas.add(layer);
    if (bringToFront) {
        layers.unshift(layer);
    } else {
        layers.push(layer);
        layer.sendToBack();
    }
    setActiveLayer(layer);
    emit(EVENT_LAYER_ADDED, layer);
}

export function removeLayer(layer) {
    if (!canvas || !layer) return;
    canvas.remove(layer);
    layers = layers.filter(l => l !== layer);
    if (activeLayer === layer) {
        setActiveLayer(layers[layers.length - 1] || null);
    }
    emit(EVENT_LAYER_REMOVED, layer);
}

export function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
}

export function emit(event, data) {
    if (listeners[event]) {
        listeners[event].forEach(cb => cb(data));
    }
}
