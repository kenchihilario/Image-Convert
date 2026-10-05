import { getCanvas, getLayers } from '../state.js';
import { executeCommand } from '../history.js';

let cropRect = null;
let isCropping = false;
let isDrawingCrop = false;
let startX = 0;
let startY = 0;

export function activateCrop() {
    const canvas = getCanvas();
    if (!canvas) return;

    isCropping = true;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.forEachObject(obj => obj.selectable = false);

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);
}

export function deactivateCrop() {
    const canvas = getCanvas();
    if (!canvas) return;

    isCropping = false;
    if (cropRect) {
        canvas.remove(cropRect);
        cropRect = null;
    }
    
    canvas.off('mouse:down', onMouseDown);
    canvas.off('mouse:move', onMouseMove);
    canvas.off('mouse:up', onMouseUp);
}

function onMouseDown(opt) {
    if (!isCropping) return;
    const canvas = getCanvas();
    if (opt.target && opt.target === cropRect) return;

    if (cropRect) {
        canvas.remove(cropRect);
    }

    isDrawingCrop = true;
    const pointer = canvas.getPointer(opt.e);
    startX = pointer.x;
    startY = pointer.y;

    cropRect = new fabric.Rect({
        left: startX,
        top: startY,
        width: 0,
        height: 0,
        fill: 'rgba(0,0,0,0.2)',
        stroke: '#ffffff',
        strokeDashArray: [5, 5],
        selectable: true,
        hasBorders: true,
        hasControls: true
    });

    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
}

function onMouseMove(opt) {
    if (!isDrawingCrop || !cropRect) return;
    const pointer = getCanvas().getPointer(opt.e);

    if (startX > pointer.x) {
        cropRect.set({ left: pointer.x });
    }
    if (startY > pointer.y) {
        cropRect.set({ top: pointer.y });
    }

    cropRect.set({
        width: Math.abs(startX - pointer.x),
        height: Math.abs(startY - pointer.y)
    });
    
    getCanvas().requestRenderAll();
}

function onMouseUp() {
    isDrawingCrop = false;
    if (cropRect) cropRect.setCoords();
}

export function commitCrop() {
    if (!cropRect) return;
    const canvas = getCanvas();
    const rect = cropRect.getBoundingRect();
    
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    const layers = getLayers();
    const oldStates = layers.map(l => ({ left: l.left, top: l.top }));
    
    const newWidth = rect.width;
    const newHeight = rect.height;
    const offsetX = rect.left;
    const offsetY = rect.top;

    executeCommand({
        do: () => {
            canvas.setWidth(newWidth);
            canvas.setHeight(newHeight);
            layers.forEach(layer => {
                layer.set({ left: layer.left - offsetX, top: layer.top - offsetY });
                layer.setCoords();
            });
            if (cropRect) {
                canvas.remove(cropRect);
                cropRect = null;
            }
            canvas.requestRenderAll();
        },
        undo: () => {
            canvas.setWidth(oldWidth);
            canvas.setHeight(oldHeight);
            layers.forEach((layer, i) => {
                layer.set({ left: oldStates[i].left, top: oldStates[i].top });
                layer.setCoords();
            });
            canvas.requestRenderAll();
        }
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && isCropping && cropRect) {
        commitCrop();
    }
});
