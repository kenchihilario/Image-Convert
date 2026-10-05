import { serializeProject, restoreProject } from './project.js';
import { on } from '../state.js';
import { EVENT_LAYER_CHANGED, EVENT_LAYER_ADDED, EVENT_LAYER_REMOVED } from '../constants.js';

let autosaveTimeout = null;

export function setupAutosave() {
    on(EVENT_LAYER_CHANGED, triggerAutosave);
    on(EVENT_LAYER_ADDED, triggerAutosave);
    on(EVENT_LAYER_REMOVED, triggerAutosave);
    

    setTimeout(() => {
        const saved = localStorage.getItem('autosave_project');
        if (saved) {
            if (confirm("Found an autosaved project. Would you like to restore it?")) {
                try {
                    restoreProject(JSON.parse(saved));
                } catch (err) {
                    console.error("Autosave restore failed", err);
                }
            } else {
                localStorage.removeItem('autosave_project');
            }
        }
    }, 100);
}

function triggerAutosave() {
    if (autosaveTimeout) clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(() => {
        const jsonString = serializeProject();
        if (jsonString) {
            try {
                localStorage.setItem('autosave_project', jsonString);
                console.log("Autosaved project");
            } catch (e) {
                console.warn("Autosave failed. Quota exceeded?", e);
            }
        }
    }, 1000);
}
