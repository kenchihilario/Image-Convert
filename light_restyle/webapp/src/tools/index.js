import { TOOL_MOVE, TOOL_BRUSH, TOOL_ERASER, TOOL_CROP, TOOL_MARQUEE_RECT, TOOL_LASSO, TOOL_EYEDROPPER, TOOL_GRADIENT, TOOL_SHAPE_RECT, TOOL_SHAPE_ELLIPSE, TOOL_SHAPE_LINE, TOOL_TEXT } from '../constants.js';
import { setupBrush, teardownBrush, updateBrush } from './brush.js';
import { activateCrop, deactivateCrop } from './crop.js';
import { activateSelection, deactivateSelection } from './selection.js';
import { activateEyedropper, deactivateEyedropper } from './eyedropper.js';
import { activateShape, deactivateShape } from './shapes.js';
import { activateText, deactivateText } from './text.js';
import { activateGradient, deactivateGradient } from './gradient.js';
import { updateBrushCursorVisibility } from './brush-cursor.js';
import { getCanvas } from '../state.js';

export function setupTools() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setTool(btn.dataset.tool);
        });
    });
    
    document.getElementById('brush-color').addEventListener('input', updateBrush);
    document.getElementById('brush-size').addEventListener('input', updateBrush);
    document.getElementById('brush-opacity').addEventListener('input', updateBrush);
    document.getElementById('brush-hardness').addEventListener('input', updateBrush);
}

function setTool(toolName) {
    const canvas = getCanvas();
    if (!canvas) return;
    
    teardownBrush(canvas);
    deactivateCrop();
    deactivateSelection();
    deactivateEyedropper();
    deactivateShape();
    deactivateText();
    deactivateGradient();
    
    if (toolName === TOOL_MOVE) {
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.forEachObject(obj => obj.selectable = true);
    } else if (toolName === TOOL_BRUSH) {
        setupBrush(canvas, false);
    } else if (toolName === TOOL_ERASER) {
        setupBrush(canvas, true);
    } else if (toolName === TOOL_CROP) {
        activateCrop();
    } else if (toolName === TOOL_MARQUEE_RECT) {
        activateSelection('rect');
    } else if (toolName === TOOL_LASSO) {
        activateSelection('lasso');
    } else if (toolName === TOOL_EYEDROPPER) {
        activateEyedropper();
    } else if (toolName === TOOL_GRADIENT) {
        activateGradient();
    } else if (toolName === TOOL_SHAPE_RECT) {
        activateShape('rect');
    } else if (toolName === TOOL_SHAPE_ELLIPSE) {
        activateShape('ellipse');
    } else if (toolName === TOOL_SHAPE_LINE) {
        activateShape('line');
    } else if (toolName === TOOL_TEXT) {
        activateText();
    }
}
