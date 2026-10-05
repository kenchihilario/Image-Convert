import { getCanvas } from '../state.js';

let activeSelectionPath = null;
let isSelecting = false;
let currentMode = null;
let startX = 0;
let startY = 0;
let drawingPath = null;
let points = [];

export function activateSelection(mode) {
    const canvas = getCanvas();
    if (!canvas) return;

    currentMode = mode;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.forEachObject(obj => obj.selectable = false);

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);
}

export function deactivateSelection() {
    const canvas = getCanvas();
    if (!canvas) return;

    currentMode = null;
    canvas.off('mouse:down', onMouseDown);
    canvas.off('mouse:move', onMouseMove);
    canvas.off('mouse:up', onMouseUp);
}

export function getActiveSelectionClipPath() {
    return activeSelectionPath;
}

export function clearSelection() {
    const canvas = getCanvas();
    if (activeSelectionPath && canvas) {
        canvas.remove(activeSelectionPath);
        activeSelectionPath = null;
        canvas.clipPath = null;
        canvas.requestRenderAll();
    }
}

function onMouseDown(opt) {
    if (!currentMode) return;
    const canvas = getCanvas();
    isSelecting = true;
    const pointer = canvas.getPointer(opt.e);
    startX = pointer.x;
    startY = pointer.y;

    if (activeSelectionPath) {
        canvas.remove(activeSelectionPath);
        activeSelectionPath = null;
    }

    if (currentMode === 'rect') {
        activeSelectionPath = new fabric.Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            fill: 'rgba(255,255,255,0.1)',
            stroke: '#000',
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            absolutePositioned: true
        });
        canvas.add(activeSelectionPath);
    } else if (currentMode === 'lasso') {
        points = [{ x: startX, y: startY }];
        drawingPath = new fabric.Polyline(points, {
            fill: 'rgba(255,255,255,0.1)',
            stroke: '#000',
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            absolutePositioned: true
        });
        canvas.add(drawingPath);
        activeSelectionPath = drawingPath;
    }
}

function onMouseMove(opt) {
    if (!isSelecting || !currentMode) return;
    const canvas = getCanvas();
    const pointer = canvas.getPointer(opt.e);

    if (currentMode === 'rect') {
        if (startX > pointer.x) {
            activeSelectionPath.set({ left: pointer.x });
        }
        if (startY > pointer.y) {
            activeSelectionPath.set({ top: pointer.y });
        }
        activeSelectionPath.set({
            width: Math.abs(startX - pointer.x),
            height: Math.abs(startY - pointer.y)
        });
    } else if (currentMode === 'lasso') {
        points.push({ x: pointer.x, y: pointer.y });
        drawingPath.points = points;
        drawingPath._calcDimensions();
        drawingPath.setCoords();
    }
    canvas.requestRenderAll();
}

function onMouseUp() {
    isSelecting = false;
    const canvas = getCanvas();
    if (activeSelectionPath) {
        canvas.clipPath = activeSelectionPath;
        canvas.requestRenderAll();
    }
}
