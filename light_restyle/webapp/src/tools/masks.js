import { getCanvas, getActiveLayer } from '../state.js';
import { executeCommand } from '../history.js';

export function addLayerMask() {
    const layer = getActiveLayer();
    const canvas = getCanvas();
    if (!layer || !canvas) return;

    if (layer.clipPath) {

        return;
    }

    executeCommand({
        do: () => {
            const rect = new fabric.Rect({
                left: layer.left,
                top: layer.top,
                width: layer.width * layer.scaleX,
                height: layer.height * layer.scaleY,
                fill: '#ffffff',
                absolutePositioned: true
            });
            layer.set('clipPath', rect);
            layer.set('hasMask', true); // Custom flag
            canvas.requestRenderAll();
        },
        undo: () => {
            layer.set('clipPath', null);
            layer.set('hasMask', false);
            canvas.requestRenderAll();
        }
    });
}
