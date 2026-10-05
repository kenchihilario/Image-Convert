import { getCanvas, getLayers, addLayer, removeLayer } from '../state.js';
import { renderLayersList } from '../ui/panels.js';

const CUSTOM_PROPS = ['id', 'name', 'hasMask', 'adjustmentValues', 'selectable', 'evented'];

export function serializeProject() {
    const canvas = getCanvas();
    if (!canvas) return null;
    
    // We also need to store the order of our layers array, because Fabric's canvas.getObjects() 
    // z-index order is the reverse of our UI representation. But loading from JSON will restore 
    // the objects in the exact canvas z-index order, so we can just reverse it to rebuild our layers array.
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
        
        // Rebuild state.js layers array
        // In our state.js, layers[0] is the top-most layer visually (highest z-index)
        // Fabric's canvas.getObjects() returns objects ordered from bottom to top.
        const objects = canvas.getObjects();
        
        // Clear existing layers cleanly
        const currentLayers = getLayers();
        currentLayers.forEach(l => removeLayer(l, false));
        
        // Add them back to state
        objects.forEach(obj => {
            // Because addLayer with bringToFront=true adds to the beginning (unshift) 
            // and brings to front, iterating from bottom to top works perfectly.
            addLayer(obj, true);
        });
        
        // Re-bind image filters since JSON serialization stringifies them but we need to re-apply 
        // them if they rely on specific webgl contexts? Actually fabric's loadFromJSON handles 
        // filter instantiation nicely if the fabric classes are registered.
        // We will just call applyFilters on all images to be safe.
        objects.forEach(obj => {
            if (obj.type === 'image' && obj.filters && obj.filters.length > 0) {
                obj.applyFilters();
            }
        });
        
        canvas.requestRenderAll();
        renderLayersList();
    });
}
