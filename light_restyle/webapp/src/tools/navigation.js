import { getCanvas } from '../state.js';

let isDragging = false;
let lastPosX = 0;
let lastPosY = 0;
let spacePressed = false;

export function setupNavigation() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const canvas = getCanvas();
    if (!canvas) return;
    
    canvas.on('mouse:wheel', handleWheel);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
}

function handleKeyDown(e) {
    if (e.code === 'Space') {
        spacePressed = true;
        const canvas = getCanvas();
        if (canvas) canvas.defaultCursor = 'grab';
    }
}

function handleKeyUp(e) {
    if (e.code === 'Space') {
        spacePressed = false;
        const canvas = getCanvas();
        if (canvas) canvas.defaultCursor = 'default';
    }
}

function handleWheel(opt) {
    const canvas = getCanvas();
    if (!canvas) return;
    
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** opt.e.deltaY;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
    
    updateZoomStatus(zoom);
}

function handleMouseDown(opt) {
    if (spacePressed) {
        const canvas = getCanvas();
        if (!canvas) return;
        
        isDragging = true;
        canvas.selection = false;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
    }
}

function handleMouseMove(opt) {
    if (isDragging) {
        const canvas = getCanvas();
        if (!canvas) return;
        
        const e = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        canvas.requestRenderAll();
        
        lastPosX = e.clientX;
        lastPosY = e.clientY;
    }
}

function handleMouseUp() {
    const canvas = getCanvas();
    if (!canvas) return;
    
    canvas.setViewportTransform(canvas.viewportTransform);
    isDragging = false;
    canvas.selection = true;
}

function updateZoomStatus(zoom) {
    const status = document.getElementById('status-bar');
    if (status) {
        const pct = Math.round(zoom * 100);
        status.textContent = `Zoom: ${pct}%`;
    }
}
