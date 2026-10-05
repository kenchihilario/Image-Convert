import { getActiveLayer, getLayers, addLayer } from '../state.js';

let styleModel = null;

export function setupAiRestyle() {
    document.getElementById('menu-ai-style').addEventListener('click', runAiRestyle);
}

async function initAiModel() {
    if (!styleModel) {
        document.getElementById('status-bar').textContent = "Loading AI Engine...";
        styleModel = new mi.ArbitraryStyleTransferNetwork();
        await styleModel.initialize();
        setupProceduralStyle();
        document.getElementById('status-bar').textContent = "AI Engine Ready.";
    }
}

function setupProceduralStyle() {
    const ctx = document.getElementById('style-canvas').getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#f9fafb');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
}

async function runAiRestyle(e) {
    e.preventDefault();
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.type !== 'image') return;

    await initAiModel();
    document.getElementById('status-bar').textContent = "Applying AI Style...";

    try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = activeLayer.width * activeLayer.scaleX;
        tempCanvas.height = activeLayer.height * activeLayer.scaleY;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.drawImage(activeLayer.getElement(), 0, 0, tempCanvas.width, tempCanvas.height);

        const styleCanvas = document.getElementById('style-canvas');
        const rawStylized = await styleModel.stylize(tempCanvas, styleCanvas);
        
        applyColorGrade(rawStylized, tempCanvas.width, tempCanvas.height, activeLayer);
    } catch (err) {
        document.getElementById('status-bar').textContent = "AI Filter Failed.";
    }
}

function applyColorGrade(rawStylized, width, height, originalLayer) {
    const styledPixels = rawStylized.data;
    const styledImageData = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);

    for (let i = 0; i < styledPixels.length; i += 4) {
        let r = styledPixels[i] / 255.0;
        let g = styledPixels[i+1] / 255.0;
        let b = styledPixels[i+2] / 255.0;

        r = Math.min(1.0, r * 1.15 + 0.05);
        g = Math.min(1.0, g * 1.15 + 0.05);
        b = Math.min(1.0, b * 1.15 + 0.05);

        styledImageData.data[i] = r * 255;
        styledImageData.data[i+1] = g * 255;
        styledImageData.data[i+2] = b * 255;
        styledImageData.data[i+3] = styledPixels[i+3];
    }

    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;
    resultCanvas.getContext('2d').putImageData(styledImageData, 0, 0);

    fabric.Image.fromURL(resultCanvas.toDataURL(), (img) => {
        img.set({
            left: originalLayer.left, top: originalLayer.top,
            name: `AI Restyled`
        });
        addLayer(img, true);
        document.getElementById('status-bar').textContent = "AI Restyle Complete.";
    });
}
