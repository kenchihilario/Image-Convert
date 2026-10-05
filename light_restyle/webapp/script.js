// Web App Script for GPU Accelerated Style Transfer

const DOM = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    uploadBtn: document.getElementById('upload-btn'),
    workspace: document.getElementById('workspace'),
    previewCanvas: document.getElementById('preview-canvas'),
    intensitySlider: document.getElementById('intensity'),
    statusText: document.getElementById('status'),
    downloadBtn: document.getElementById('download-btn'),
    styleCanvas: document.getElementById('style-canvas')
};

let styleModel = null;
let originalImageData = null;
let styledImageData = null;
let currentImageName = "restyle.jpg";

async function initializeModel() {
    try {
        DOM.statusText.textContent = "Loading WebGL AI Engine...";
        styleModel = new mi.ArbitraryStyleTransferNetwork();
        await styleModel.initialize();
        DOM.statusText.textContent = "AI Engine Ready. Please select an image.";
        setupProceduralStyle();
        setupEventListeners();
    } catch (e) {
        console.error(e);
        DOM.statusText.textContent = "Failed to load AI Engine. Check console.";
    }
}

function setupProceduralStyle() {
    const ctx = DOM.styleCanvas.getContext('2d');
    const width = DOM.styleCanvas.width;
    const height = DOM.styleCanvas.height;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f9fafb');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Procedural noise/texture simulation
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 255;
        const g = Math.random() * 255;
        const b = Math.random() * 255;
        ctx.fillStyle = `rgba(${r},${g},${b},0.03)`;
        ctx.fillRect(x, y, 3, 3);
    }
}

function setupEventListeners() {
    DOM.uploadBtn.addEventListener('click', () => DOM.fileInput.click());
    
    DOM.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    DOM.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.dropZone.classList.add('dragover');
    });

    DOM.dropZone.addEventListener('dragleave', () => {
        DOM.dropZone.classList.remove('dragover');
    });

    DOM.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    DOM.intensitySlider.addEventListener('input', updateBlend);
    DOM.downloadBtn.addEventListener('click', downloadImage);
}

async function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    currentImageName = file.name.split('.')[0] + '_airy.jpg';
    
    DOM.dropZone.classList.add('hidden');
    DOM.workspace.classList.remove('hidden');
    DOM.statusText.textContent = "Loading image into GPU...";
    DOM.intensitySlider.disabled = true;
    DOM.downloadBtn.disabled = true;

    const img = new Image();
    img.onload = async () => {
        // Scale down to prevent WebGL Out-Of-Memory errors
        const maxDim = 800;
        let scale = 1.0;
        if (img.width > maxDim || img.height > maxDim) {
            scale = maxDim / Math.max(img.width, img.height);
        }
        
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        // Render scaled image to canvas
        DOM.previewCanvas.width = w;
        DOM.previewCanvas.height = h;
        const ctx = DOM.previewCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        originalImageData = ctx.getImageData(0, 0, w, h);
        
        // Yield to browser to show the raw image live
        await new Promise(r => requestAnimationFrame(r));
        
        await processImage(DOM.previewCanvas);
    };
    img.src = URL.createObjectURL(file);
}

async function processImage(inputCanvas) {
    try {
        DOM.statusText.textContent = "Applying Style Transfer (GPU Processing)...";
        await new Promise(r => setTimeout(r, 50)); // give UI time to update text
        
        // Ensure tensors are disposed to prevent WebGL memory leaks
        const rawStylized = await styleModel.stylize(inputCanvas, DOM.styleCanvas);
        
        // Show raw stylization immediately
        const ctx = DOM.previewCanvas.getContext('2d');
        ctx.putImageData(rawStylized, 0, 0);
        
        DOM.statusText.textContent = "Applying Light & Airy Color Grade...";
        await new Promise(r => setTimeout(r, 50)); // yield to UI
        
        // Read image data
        const styledPixels = rawStylized.data;

        // Apply Color Grading (Lightness, Shadows, Highlights)
        const width = inputCanvas.width;
        const height = inputCanvas.height;
        styledImageData = new ImageData(
            new Uint8ClampedArray(width * height * 4), 
            width, 
            height
        );

        for (let i = 0; i < styledPixels.length; i += 4) {
            let r = styledPixels[i] / 255.0;
            let g = styledPixels[i+1] / 255.0;
            let b = styledPixels[i+2] / 255.0;

            // Simple lift/grading approx
            r = Math.min(1.0, r * 1.15 + 0.05);
            g = Math.min(1.0, g * 1.15 + 0.05);
            b = Math.min(1.0, b * 1.15 + 0.05);

            styledImageData.data[i] = r * 255;
            styledImageData.data[i+1] = g * 255;
            styledImageData.data[i+2] = b * 255;
            styledImageData.data[i+3] = styledPixels[i+3]; // Alpha
        }

        DOM.statusText.textContent = "Ready. Adjust intensity to blend.";
        DOM.intensitySlider.disabled = false;
        DOM.downloadBtn.disabled = false;
        DOM.intensitySlider.value = 1.0;
        
        updateBlend();
    } catch (e) {
        console.error(e);
        DOM.statusText.textContent = "Error processing image.";
    }
}

function updateBlend() {
    if (!originalImageData || !styledImageData) return;
    
    const intensity = parseFloat(DOM.intensitySlider.value);
    const ctx = DOM.previewCanvas.getContext('2d');
    
    const blended = new ImageData(
        new Uint8ClampedArray(originalImageData.data.length),
        originalImageData.width,
        originalImageData.height
    );

    for (let i = 0; i < blended.data.length; i += 4) {
        blended.data[i] = originalImageData.data[i] * (1 - intensity) + styledImageData.data[i] * intensity;
        blended.data[i+1] = originalImageData.data[i+1] * (1 - intensity) + styledImageData.data[i+1] * intensity;
        blended.data[i+2] = originalImageData.data[i+2] * (1 - intensity) + styledImageData.data[i+2] * intensity;
        blended.data[i+3] = 255;
    }

    ctx.putImageData(blended, 0, 0);
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = currentImageName;
    link.href = DOM.previewCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
}

// Start
initializeModel();
