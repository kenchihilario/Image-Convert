import { getCanvas, addLayer, removeLayer } from '../state.js';
import { executeCommand } from '../history.js';

let isDrawing = false;
let startX = 0;
let startY = 0;
let previewLine = null;

export function activateGradient() {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
    canvas.forEachObject(obj => obj.selectable = false);

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);
}

export function deactivateGradient() {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.defaultCursor = 'default';
    canvas.off('mouse:down', onMouseDown);
    canvas.off('mouse:move', onMouseMove);
    canvas.off('mouse:up', onMouseUp);
}

function onMouseDown(opt) {
    const canvas = getCanvas();
    isDrawing = true;
    const pointer = canvas.getPointer(opt.e);
    startX = pointer.x;
    startY = pointer.y;

    previewLine = new fabric.Line([startX, startY, startX, startY], {
        stroke: '#ffffff',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false
    });
    canvas.add(previewLine);
}

function onMouseMove(opt) {
    if (!isDrawing || !previewLine) return;
    const pointer = getCanvas().getPointer(opt.e);
    previewLine.set({ x2: pointer.x, y2: pointer.y });
    getCanvas().requestRenderAll();
}

function onMouseUp(opt) {
    if (!isDrawing) return;
    isDrawing = false;
    
    const canvas = getCanvas();
    if (previewLine) {
        canvas.remove(previewLine);
        previewLine = null;
    }

    const pointer = canvas.getPointer(opt.e);
    const endX = pointer.x;
    const endY = pointer.y;

    if (Math.abs(endX - startX) < 5 && Math.abs(endY - startY) < 5) return;

    const brushColor = document.getElementById('brush-color').value || '#ff0000';
    const brushOpacity = parseFloat(document.getElementById('brush-opacity').value) || 1;
    let r = parseInt(brushColor.slice(1, 3), 16);
    let g = parseInt(brushColor.slice(3, 5), 16);
    let b = parseInt(brushColor.slice(5, 7), 16);
    

    if (brushColor.length === 4) {
        r = parseInt(brushColor[1] + brushColor[1], 16);
        g = parseInt(brushColor[2] + brushColor[2], 16);
        b = parseInt(brushColor[3] + brushColor[3], 16);
    }
    
    const startColor = `rgba(${r}, ${g}, ${b}, ${brushOpacity})`;
    const endColor = `rgba(${r}, ${g}, ${b}, 0)`;

    const bgRect = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height,
        selectable: true
    });
    
    const fullGradient = new fabric.Gradient({
        type: 'linear',
        coords: { x1: startX, y1: startY, x2: endX, y2: endY },
        colorStops: [
            { offset: 0, color: startColor },
            { offset: 1, color: endColor }
        ]
    });
    
    bgRect.set('fill', fullGradient);
    bgRect.name = 'Gradient';

    executeCommand({
        do: () => {
            addLayer(bgRect);
            canvas.requestRenderAll();
        },
        undo: () => {
            removeLayer(bgRect);
            canvas.requestRenderAll();
        }
    });
}
