import { getCanvas, addLayer, removeLayer } from '../state.js';
import { executeCommand } from '../history.js';

let isDrawing = false;
let currentShape = null;
let shapeType = null;
let startX = 0;
let startY = 0;

export function activateShape(type) {
    const canvas = getCanvas();
    if (!canvas) return;

    shapeType = type;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
    canvas.forEachObject(obj => obj.selectable = false);

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);
}

export function deactivateShape() {
    const canvas = getCanvas();
    if (!canvas) return;

    shapeType = null;
    canvas.defaultCursor = 'default';
    canvas.off('mouse:down', onMouseDown);
    canvas.off('mouse:move', onMouseMove);
    canvas.off('mouse:up', onMouseUp);
}

function onMouseDown(opt) {
    if (!shapeType) return;
    const canvas = getCanvas();
    isDrawing = true;
    const pointer = canvas.getPointer(opt.e);
    startX = pointer.x;
    startY = pointer.y;

    const brushColor = document.getElementById('brush-color').value || '#ff0000';
    const brushOpacity = parseFloat(document.getElementById('brush-opacity').value) || 1;
    const strokeWidth = parseInt(document.getElementById('brush-size').value, 10) || 2;
    
    // Convert color and opacity to rgba
    const r = parseInt(brushColor.slice(1, 3), 16);
    const g = parseInt(brushColor.slice(3, 5), 16);
    const b = parseInt(brushColor.slice(5, 7), 16);
    const fillColor = `rgba(${r}, ${g}, ${b}, ${brushOpacity})`;

    if (shapeType === 'rect') {
        currentShape = new fabric.Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            fill: fillColor,
            stroke: brushColor,
            strokeWidth: strokeWidth,
            selectable: true
        });
    } else if (shapeType === 'ellipse') {
        currentShape = new fabric.Ellipse({
            left: startX,
            top: startY,
            originX: 'left',
            originY: 'top',
            rx: 0,
            ry: 0,
            fill: fillColor,
            stroke: brushColor,
            strokeWidth: strokeWidth,
            selectable: true
        });
    } else if (shapeType === 'line') {
        currentShape = new fabric.Line([startX, startY, startX, startY], {
            stroke: brushColor,
            strokeWidth: strokeWidth,
            selectable: true
        });
    }

    if (currentShape) {
        currentShape.name = `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`;
        canvas.add(currentShape);
    }
}

function onMouseMove(opt) {
    if (!isDrawing || !currentShape) return;
    const canvas = getCanvas();
    const pointer = canvas.getPointer(opt.e);

    if (shapeType === 'rect') {
        if (startX > pointer.x) currentShape.set({ left: Math.abs(pointer.x) });
        if (startY > pointer.y) currentShape.set({ top: Math.abs(pointer.y) });
        currentShape.set({
            width: Math.abs(startX - pointer.x),
            height: Math.abs(startY - pointer.y)
        });
    } else if (shapeType === 'ellipse') {
        let rx = Math.abs(startX - pointer.x) / 2;
        let ry = Math.abs(startY - pointer.y) / 2;
        if (startX > pointer.x) currentShape.set({ left: pointer.x });
        if (startY > pointer.y) currentShape.set({ top: pointer.y });
        currentShape.set({ rx, ry });
    } else if (shapeType === 'line') {
        currentShape.set({ x2: pointer.x, y2: pointer.y });
    }

    canvas.requestRenderAll();
}

function onMouseUp() {
    if (!isDrawing) return;
    isDrawing = false;
    
    if (currentShape) {
        currentShape.setCoords();
        const canvas = getCanvas();
        const shape = currentShape;
        
        // Remove it temporarily from canvas so we can dispatch the command
        canvas.remove(shape);
        
        executeCommand({
            do: () => {
                addLayer(shape);
                canvas.requestRenderAll();
            },
            undo: () => {
                removeLayer(shape);
                canvas.requestRenderAll();
            }
        });
        
        currentShape = null;
    }
}
