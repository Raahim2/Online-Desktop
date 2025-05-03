document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pixel-canvas');
    const colorPaletteContainer = document.getElementById('color-palette');
    const colorPicker = document.getElementById('color-picker');
    const gridWidthInput = document.getElementById('grid-width');
    const gridHeightInput = document.getElementById('grid-height');
    const resizeGridBtn = document.getElementById('resize-grid-btn');
    const textInput = document.getElementById('text-input');
    const textToPixelBtn = document.getElementById('text-to-pixel-btn');
    const presetSelector = document.getElementById('preset-selector');
    const drawPresetBtn = document.getElementById('draw-preset-btn');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');
    const downloadBtn = document.getElementById('download-btn');
    const colorTooltip = document.getElementById('color-tooltip');

    // --- State ---
    let selectedColor = '#FFFFFF'; // Default to white
    let isDrawing = false;
    let gridWidth = parseInt(gridWidthInput.value, 10);
    let gridHeight = parseInt(gridHeightInput.value, 10);
    let pixelSize = 20; // Adjust as needed for visual size

    // --- Retro Color Palette ---
    const retroPalette = [
        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
        '#00FFFF', '#FF00FF', '#808080', '#C0C0C0', '#800000', '#008000',
        '#000080', '#808000', '#008080', '#800080' // Example palette
    ];

    // --- Initialization ---
    function initialize() {
        populateColorPalette();
        Graphics.initializeCanvas(canvas, gridWidth, gridHeight, pixelSize, selectedColor); // Use Graphics module
        addEventListeners();
        updateInputFields();
    }

    function updateInputFields() {
        gridWidthInput.value = gridWidth;
        gridHeightInput.value = gridHeight;
    }

    function populateColorPalette() {
        retroPalette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.classList.add('w-6', 'h-6', 'border', 'border-gray-500', 'cursor-pointer', 'inline-block', 'mr-1', 'mb-1');
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;
            swatch.addEventListener('click', () => {
                selectedColor = color;
                colorPicker.value = color; // Sync picker
                Graphics.setCurrentColor(selectedColor); // Update color in Graphics module
                // Optional: Add visual selection indicator
                document.querySelectorAll('#color-palette div').forEach(el => el.style.outline = 'none');
                swatch.style.outline = '2px solid #FFF'; // Highlight selected
            });
            colorPaletteContainer.insertBefore(swatch, colorPicker); // Insert before the picker
        });
        // Select the default color visually
        const defaultSwatch = colorPaletteContainer.querySelector(`[data-color="${selectedColor}"]`);
        if (defaultSwatch) {
            defaultSwatch.style.outline = '2px solid #FFF';
        }
    }

    // --- Event Listeners ---
    function addEventListeners() {
        // Color Picker Input
        colorPicker.addEventListener('input', (e) => {
            selectedColor = e.target.value;
            Graphics.setCurrentColor(selectedColor);
            // Deselect palette swatches
             document.querySelectorAll('#color-palette div').forEach(el => el.style.outline = 'none');
        });

        // Canvas Interaction (Drawing)
        const handleDraw = (event) => {
            event.preventDefault(); // Prevent unwanted scrolling on touch
            const rect = canvas.getBoundingClientRect();
            const clientX = event.clientX ?? event.touches[0].clientX;
            const clientY = event.clientY ?? event.touches[0].clientY;
            const x = Math.floor((clientX - rect.left) / pixelSize);
            const y = Math.floor((clientY - rect.top) / pixelSize);
            Graphics.drawPixel(x, y);
        };

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            handleDraw(e);
        });
        canvas.addEventListener('mousemove', (e) => {
            if (isDrawing) {
                handleDraw(e);
            }
            // Tooltip logic
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / pixelSize);
            const y = Math.floor((e.clientY - rect.top) / pixelSize);
            const color = Graphics.getPixelColor(x, y);
            if (color) {
                colorTooltip.textContent = color;
                colorTooltip.style.left = `${e.clientX + 15}px`;
                colorTooltip.style.top = `${e.clientY}px`;
                colorTooltip.classList.remove('hidden');
            } else {
                colorTooltip.classList.add('hidden');
            }
        });
        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseleave', () => {
            isDrawing = false;
            colorTooltip.classList.add('hidden');
        });

        // Touch Events
        canvas.addEventListener('touchstart', (e) => {
             isDrawing = true;
             handleDraw(e);
        });
        canvas.addEventListener('touchmove', (e) => {
             if (isDrawing) {
                 handleDraw(e);
             }
        });
        canvas.addEventListener('touchend', () => isDrawing = false);
        canvas.addEventListener('touchcancel', () => isDrawing = false);


        // Grid Resize
        resizeGridBtn.addEventListener('click', () => {
            const newWidth = parseInt(gridWidthInput.value, 10);
            const newHeight = parseInt(gridHeightInput.value, 10);
            if (newWidth > 0 && newHeight > 0 && newWidth <= 64 && newHeight <= 64) {
                gridWidth = newWidth;
                gridHeight = newHeight;
                // Recalculate pixelSize to fit if needed, or keep fixed and allow scroll
                // For simplicity, keep fixed pixelSize for now
                Graphics.resizeCanvas(gridWidth, gridHeight, pixelSize);
            } else {
                alert("Please enter valid dimensions (1-64).");
                updateInputFields(); // Reset inputs to current valid values
            }
        });

        // Text to Pixels
        textToPixelBtn.addEventListener('click', () => {
            const text = textInput.value.toUpperCase(); // Use uppercase for pixel fonts
            if (text) {
                Input.drawText(text, 0, 0); // Let Input module handle drawing
                textInput.value = ''; // Clear input after drawing
            }
        });

        // Draw Preset
        drawPresetBtn.addEventListener('click', () => {
            const selectedPreset = presetSelector.value;
            if (selectedPreset) {
                Input.drawPreset(selectedPreset, 0, 0); // Let Input module handle drawing
            }
        });

        // Clear Canvas
        clearCanvasBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear the canvas?")) {
                Graphics.clearCanvas();
            }
        });

        // Download PNG
        downloadBtn.addEventListener('click', () => {
            Download.downloadCanvasAsPNG(canvas, 'retro-pixel-art.png'); // Use Download module
        });
    }

    // --- Start the application ---
    initialize();
});