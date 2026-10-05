import { getCanvas, getActiveLayer } from '../state.js';
import { executeCommand } from '../history.js';

let isPainting = false;
let isEraserMode = false;
let offscreenCanvas = null;
let offscreenCtx = null;
let lastPointer = null;
let currentLayer = null;
let originalDataUrl = null;

function hexToRgba(hex, alpha) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function startRasterPaint(pointer, isEraser) {
    currentLayer = getActiveLayer();
    if (!currentLayer || currentLayer.type !== 'image') return;

    isPainting = true;
    isEraserMode = isEraser;
    

    const el = currentLayer.getElement();
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = el.width || currentLayer.width;
    tempCanvas.height = el.height || currentLayer.height;
    tempCanvas.getContext('2d', { willReadFrequently: true }).drawImage(el, 0, 0, tempCanvas.width, tempCanvas.height);
    originalDataUrl = tempCanvas.toDataURL();
    

    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = tempCanvas.width;
    offscreenCanvas.height = tempCanvas.height;
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    

    offscreenCtx.drawImage(el, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
    
    lastPointer = pointer;
    paintToOffscreen(pointer);
}

export function continueRasterPaint(pointer) {
    if (!isPainting || !currentLayer) return;
    paintToOffscreen(pointer);
    lastPointer = pointer;
}

export function endRasterPaint() {
    if (!isPainting || !currentLayer) return;
    isPainting = false;
    
    const layerToUpdate = currentLayer;
    const newDataUrl = offscreenCanvas.toDataURL(); // Raw pixels without fabric filters
    
    executeCommand({
        do: () => {
            fabric.Image.fromURL(newDataUrl, (img) => {
                layerToUpdate.setElement(img.getElement());
                layerToUpdate.applyFilters();
                getCanvas().requestRenderAll();
            });
        },
        undo: () => {
            fabric.Image.fromURL(originalDataUrl, (img) => {
                layerToUpdate.setElement(img.getElement());
                layerToUpdate.applyFilters();
                getCanvas().requestRenderAll();
            });
        }
    });
    
    offscreenCanvas = null;
    offscreenCtx = null;
    currentLayer = null;
}

function paintToOffscreen(pointer) {
    if (!offscreenCtx || !currentLayer) return;
    
    const brushSize = parseInt(document.getElementById('brush-size').value, 10);
    const brushOpacity = parseFloat(document.getElementById('brush-opacity').value);
    const brushHardness = parseFloat(document.getElementById('brush-hardness').value);
    const hexColor = document.getElementById('brush-color').value;
    

    const invertedMatrix = fabric.util.invertTransform(currentLayer.calcTransformMatrix());
    const localLast = fabric.util.transformPoint(lastPointer, invertedMatrix);
    const localCurrent = fabric.util.transformPoint(pointer, invertedMatrix);
    

    let offsetX = 0;
    let offsetY = 0;
    if (currentLayer.originX === 'center') offsetX = currentLayer.width / 2;
    if (currentLayer.originY === 'center') offsetY = currentLayer.height / 2;
    
    const lx1 = localLast.x + offsetX;
    const ly1 = localLast.y + offsetY;
    const lx2 = localCurrent.x + offsetX;
    const ly2 = localCurrent.y + offsetY;

    if (brushHardness < 1) {
        offscreenCtx.shadowBlur = (1 - brushHardness) * brushSize * 0.5;
        offscreenCtx.shadowColor = isEraserMode ? `rgba(255,255,255,${brushOpacity})` : hexToRgba(hexColor, brushOpacity);
    } else {
        offscreenCtx.shadowBlur = 0;
    }

    offscreenCtx.beginPath();
    offscreenCtx.moveTo(lx1, ly1);
    offscreenCtx.lineTo(lx2, ly2);
    
    offscreenCtx.lineWidth = brushSize / currentLayer.scaleX; // Adjust stroke width to local scale
    offscreenCtx.lineCap = 'round';
    offscreenCtx.lineJoin = 'round';
    
    if (isEraserMode) {
        offscreenCtx.globalCompositeOperation = 'destination-out';
        offscreenCtx.strokeStyle = `rgba(255,255,255,${brushOpacity})`;
    } else {
        offscreenCtx.globalCompositeOperation = 'source-over';
        offscreenCtx.strokeStyle = hexToRgba(hexColor, brushOpacity);
    }
    

    const activeSelectionPath = window.__ACTIVE_SELECTION_PATH__; // Mocking global for now if needed. 

    
    offscreenCtx.stroke();
    

    const newCanvas = document.createElement('canvas');
    newCanvas.width = offscreenCanvas.width;
    newCanvas.height = offscreenCanvas.height;
    newCanvas.getContext('2d').drawImage(offscreenCanvas, 0, 0);
    
    currentLayer.setElement(newCanvas);
    currentLayer.applyFilters();
    getCanvas().requestRenderAll();
}
