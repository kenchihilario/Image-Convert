import { getCanvas } from '../state.js';
import { startRasterPaint, continueRasterPaint, endRasterPaint } from './raster-editor.js';
import { updateBrushCursorSize } from './brush-cursor.js';

let isRasterMode = false;
let isEraser = false;
let canvasEventBound = false;

export function setupBrush(canvas, eraserMode) {
    canvas.isDrawingMode = false; // Disable native fabric vector drawing
    isRasterMode = true;
    isEraser = eraserMode;
    
    updateBrush();
    bindRasterEvents(canvas);
}

export function teardownBrush(canvas) {
    isRasterMode = false;
    unbindRasterEvents(canvas);
}

export function updateBrush() {
    const brushSize = parseInt(document.getElementById('brush-size').value, 10);
    document.getElementById('brush-size-value').innerText = `${brushSize}px`;
    updateBrushCursorSize();
}

function bindRasterEvents(canvas) {
    if (canvasEventBound) return;
    
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvasEventBound = true;
}

function unbindRasterEvents(canvas) {
    if (!canvasEventBound) return;
    
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
    canvasEventBound = false;
}

function handleMouseDown(e) {
    if (!isRasterMode) return;
    const canvas = getCanvas();
    startRasterPaint(canvas.getPointer(e.e), isEraser);
}

function handleMouseMove(e) {
    if (!isRasterMode) return;
    const canvas = getCanvas();
    continueRasterPaint(canvas.getPointer(e.e));
}

function handleMouseUp(e) {
    if (!isRasterMode) return;
    endRasterPaint();
}
