import { getCanvas } from '../state.js';

let ringEl = null;

export function initBrushCursor() {
    ringEl = document.getElementById('brush-cursor-ring');
    const canvas = getCanvas();
    if (!canvas) return;

    const wrapper = document.getElementById('canvas-wrapper');
    
    wrapper.addEventListener('mousemove', (e) => {
        if (!ringEl || ringEl.style.display === 'none') return;
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ringEl.style.left = `${x}px`;
        ringEl.style.top = `${y}px`;
    });

    wrapper.addEventListener('mouseleave', () => {
        if (ringEl) ringEl.style.display = 'none';
    });
    
    wrapper.addEventListener('mouseenter', () => {
        updateBrushCursorVisibility();
    });
    
    canvas.on('mouse:wheel', () => {
        updateBrushCursorSize();
    });
}

export function updateBrushCursorVisibility() {
    if (!ringEl) return;
    const activeToolBtn = document.querySelector('.tool-btn.active');
    const tool = activeToolBtn ? activeToolBtn.dataset.tool : null;
    
    if (tool === 'brush' || tool === 'eraser') {
        ringEl.style.display = 'block';
        updateBrushCursorSize();
    } else {
        ringEl.style.display = 'none';
    }
}

export function updateBrushCursorSize() {
    if (!ringEl) return;
    const size = parseInt(document.getElementById('brush-size').value, 10);
    const canvas = getCanvas();
    if (canvas) {
        const zoom = canvas.getZoom();
        const displaySize = size * zoom;
        ringEl.style.width = `${displaySize}px`;
        ringEl.style.height = `${displaySize}px`;
    }
}
