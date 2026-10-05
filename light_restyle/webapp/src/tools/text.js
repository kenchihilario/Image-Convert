import { getCanvas, addLayer, removeLayer } from '../state.js';
import { executeCommand } from '../history.js';

export function activateText() {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'text';

    canvas.on('mouse:down', onMouseDown);
}

export function deactivateText() {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.defaultCursor = 'default';
    canvas.off('mouse:down', onMouseDown);
}

function onMouseDown(opt) {
    const canvas = getCanvas();
    const pointer = canvas.getPointer(opt.e);

    const brushColor = document.getElementById('brush-color').value || '#ff0000';
    const brushSize = parseInt(document.getElementById('brush-size').value, 10) || 24;

    const textObj = new fabric.IText('New Text', {
        left: pointer.x,
        top: pointer.y,
        fill: brushColor,
        fontSize: brushSize * 2,
        fontFamily: 'Inter, sans-serif'
    });
    
    textObj.name = 'Text';

    executeCommand({
        do: () => {
            addLayer(textObj);
            canvas.setActiveObject(textObj);
            textObj.enterEditing();
            textObj.selectAll();
            canvas.requestRenderAll();
        },
        undo: () => {
            removeLayer(textObj);
            canvas.requestRenderAll();
        }
    });
    
    deactivateText();
    
    // Restore default selection mode so they can edit
    canvas.selection = true;
    canvas.forEachObject(obj => obj.selectable = true);
    
    // Update UI toolbar visually
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(b => b.classList.remove('active'));
    const moveBtn = document.querySelector('[data-tool="move"]');
    if (moveBtn) moveBtn.classList.add('active');
}
