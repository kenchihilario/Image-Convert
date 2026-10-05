import { getCanvas } from '../state.js';
import { updateBrush } from './brush.js';

let isEyedropperActive = false;

export function activateEyedropper() {
    const canvas = getCanvas();
    if (!canvas) return;

    isEyedropperActive = true;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';

    canvas.on('mouse:down', sampleColor);
}

export function deactivateEyedropper() {
    const canvas = getCanvas();
    if (!canvas) return;

    isEyedropperActive = false;
    canvas.defaultCursor = 'default';
    canvas.off('mouse:down', sampleColor);
}

function sampleColor(opt) {
    if (!isEyedropperActive) return;
    const canvas = getCanvas();
    const ctx = canvas.getContext();
    

    const pointer = canvas.getPointer(opt.e);
    

    const multiplier = canvas.getRetinaScaling();
    
    const x = Math.round(pointer.x * multiplier);
    const y = Math.round(pointer.y * multiplier);
    
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    
    if (pixel) {
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        document.getElementById('brush-color').value = hex;
        updateBrush();
    }
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}
