import { getCanvas, getLayers, addLayer, removeLayer, setActiveLayer } from '../state.js';
import { executeCommand } from '../history.js';

export function groupSelectedLayers() {
    const canvas = getCanvas();
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'activeSelection') {
        return;
    }

    const objects = activeObj.getObjects();
    
    executeCommand({
        do: () => {
            const group = activeObj.toGroup();
            group.name = 'Group';
            

            objects.forEach(obj => removeLayer(obj, false));
            addLayer(group);
            
            canvas.requestRenderAll();
        },
        undo: () => {
            const group = canvas.getActiveObject();
            if (group && group.type === 'group') {
                const activeSelection = group.toActiveSelection();
                removeLayer(group, false);
                objects.forEach(obj => addLayer(obj, true));
                canvas.setActiveObject(activeSelection);
                canvas.requestRenderAll();
            }
        }
    });
}

export function ungroupSelectedLayer() {
    const canvas = getCanvas();
    if (!canvas) return;

    const group = canvas.getActiveObject();
    if (!group || group.type !== 'group') {
        return;
    }

    const objects = group.getObjects();

    executeCommand({
        do: () => {
            const activeSelection = group.toActiveSelection();
            removeLayer(group, false);
            objects.forEach(obj => addLayer(obj, true));
            canvas.setActiveObject(activeSelection);
            canvas.requestRenderAll();
        },
        undo: () => {
            const activeSelection = canvas.getActiveObject();
            if (activeSelection && activeSelection.type === 'activeSelection') {
                const newGroup = activeSelection.toGroup();
                newGroup.name = 'Group';
                objects.forEach(obj => removeLayer(obj, false));
                addLayer(newGroup);
                canvas.requestRenderAll();
            }
        }
    });
}

export function bindGroupShortcuts() {
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && !e.shiftKey && e.key === 'g') {
            e.preventDefault();
            groupSelectedLayers();
        } else if (e.ctrlKey && e.shiftKey && e.key === 'G') {
            e.preventDefault();
            ungroupSelectedLayer();
        }
    });
}
