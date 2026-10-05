import { getCanvas, getLayers, addLayer, removeLayer } from '../state.js';
import { renderLayersList } from '../ui/panels.js';

const CUSTOM_PROPS = ['id', 'name', 'hasMask', 'adjustmentValues', 'selectable', 'evented'];

export function serializeProject() {
    const canvas = getCanvas();
    if (!canvas) return null;
    

    const json = canvas.toJSON(CUSTOM_PROPS);
    return JSON.stringify(json);
}

export function saveProjectAsLasp() {
    const jsonString = serializeProject();
    if (!jsonString) return;

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.lasp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function loadProjectFromLasp() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lasp';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target.result);
                restoreProject(json);
            } catch (err) {
                console.error("Failed to parse project file", err);
                alert("Invalid project file.");
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

export function restoreProject(jsonObj) {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.loadFromJSON(jsonObj, () => {
        canvas.requestRenderAll();
        

        const objects = canvas.getObjects();
        

        const currentLayers = getLayers();
        currentLayers.forEach(l => removeLayer(l, false));
        

        objects.forEach(obj => {

            addLayer(obj, true);
        });
        

        objects.forEach(obj => {
            if (obj.type === 'image' && obj.filters && obj.filters.length > 0) {
                obj.applyFilters();
            }
        });
        
        canvas.requestRenderAll();
        renderLayersList();
    });
}
