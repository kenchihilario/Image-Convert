import { getCanvas } from '../state.js';

export function exportCanvas() {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1 // can increase this for higher res exports
    });

    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'export.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
