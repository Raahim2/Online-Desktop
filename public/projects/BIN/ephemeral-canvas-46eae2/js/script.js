document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('drawingCanvas');
    const colorPicker = document.getElementById('colorPicker');
    const brushSizeSlider = document.getElementById('brushSize');
    const brushSizeValueDisplay = document.getElementById('brushSizeValue');
    const timerSettingInput = document.getElementById('timerSetting');
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const savePaletteBtn = document.getElementById('savePaletteBtn');
    const savedPalettesList = document.getElementById('savedPalettesList');
    const currentPaletteContainer = document.getElementById('currentPalette');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerValueSpan = timerDisplay.querySelector('span');

    if (!canvasElement || !colorPicker || !brushSizeSlider || !brushSizeValueDisplay || !timerSettingInput || !clearCanvasBtn || !fullscreenBtn || !savePaletteBtn || !savedPalettesList || !currentPaletteContainer || !timerDisplay || !timerValueSpan) {
        console.error("One or more essential DOM elements are missing!");
        return;
    }

    // --- Callbacks ---
    const handleTimerUpdate = (timeLeft) => {
        timerDisplay.classList.remove('hidden');
        timerValueSpan.textContent = timeLeft;
    };

    const handleTimerEnd = () => {
        drawingCanvas.clearCanvas();
        timerDisplay.classList.add('hidden');
        console.log("Timer ended, canvas cleared.");
    };

    const handleDrawStart = () => {
        const duration = parseInt(timerSettingInput.value, 10) || 60;
        ephemeralTimer.startOrReset(duration);
        timerDisplay.classList.remove('hidden');
    };

    // --- Initializations ---
    const storage = new Storage('ephemeralCanvasPalettes');
    const colorManager = new Color(colorPicker, currentPaletteContainer, savedPalettesList, storage);
    const ephemeralTimer = new Timer(handleTimerUpdate, handleTimerEnd);
    const drawingCanvas = new Canvas(canvasElement, handleDrawStart);

    // --- Initial Setup ---
    const initialColor = colorPicker.value;
    const initialSize = parseInt(brushSizeSlider.value, 10);

    drawingCanvas.setColor(initialColor);
    drawingCanvas.setBrushSize(initialSize);
    brushSizeValueDisplay.textContent = initialSize;
    colorManager.addInitialColor(initialColor); // Add default color to current palette display
    colorManager.loadPalettes(); // Load saved palettes from storage

    // --- Event Listeners ---

    // Color Picker
    colorPicker.addEventListener('input', (e) => {
        const newColor = e.target.value;
        drawingCanvas.setColor(newColor);
        colorManager.addColorToCurrent(newColor);
    });

    // Brush Size Slider
    brushSizeSlider.addEventListener('input', (e) => {
        const newSize = parseInt(e.target.value, 10);
        drawingCanvas.setBrushSize(newSize);
        brushSizeValueDisplay.textContent = newSize;
    });

    // Timer Setting Input (stop timer if changed while running)
    timerSettingInput.addEventListener('change', () => {
        ephemeralTimer.stop();
        timerDisplay.classList.add('hidden');
        // Timer will restart with new value on next draw start
    });
    timerSettingInput.addEventListener('input', () => {
        // Basic validation to prevent non-numeric or out-of-range values
        let value = parseInt(timerSettingInput.value, 10);
        const min = parseInt(timerSettingInput.min, 10);
        const max = parseInt(timerSettingInput.max, 10);
        if (isNaN(value)) value = min;
        if (value < min) value = min;
        if (value > max) value = max;
        timerSettingInput.value = value; // Correct the input value if needed
    });


    // Clear Canvas Button
    clearCanvasBtn.addEventListener('click', () => {
        drawingCanvas.clearCanvas();
        ephemeralTimer.stop();
        timerDisplay.classList.add('hidden');
    });

    // Fullscreen Button
    fullscreenBtn.addEventListener('click', () => {
        const docElement = document.documentElement;
        if (!document.fullscreenElement) {
            if (docElement.requestFullscreen) {
                docElement.requestFullscreen().catch(err => console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`));
            } else if (docElement.webkitRequestFullscreen) { /* Safari */
                docElement.webkitRequestFullscreen();
            } else if (docElement.msRequestFullscreen) { /* IE11 */
                docElement.msRequestFullscreen();
            }
            fullscreenBtn.textContent = "Exit Fullscreen";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            fullscreenBtn.textContent = "Fullscreen";
        }
    });

    // Adjust button text on fullscreen change (e.g., pressing Esc)
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fullscreenBtn.textContent = "Fullscreen";
        } else {
             fullscreenBtn.textContent = "Exit Fullscreen";
        }
        // Ensure canvas resizes correctly after exiting fullscreen
        setTimeout(() => drawingCanvas.resizeCanvas(), 100);
    });


    // Save Palette Button
    savePaletteBtn.addEventListener('click', () => {
        colorManager.saveCurrentPalette();
    });

    // Palette Interaction (Event Delegation on the list container)
    savedPalettesList.addEventListener('click', (e) => {
        const target = e.target;

        // Click on a color swatch within a saved palette
        if (target.classList.contains('palette-color-button')) {
            const color = target.dataset.color;
            if (color) {
                colorPicker.value = color;
                // Trigger input event manually to update canvas color and current palette display
                colorPicker.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        // Click on the "Load" button for a saved palette
        else if (target.dataset.action === 'load-palette') {
            const paletteId = target.closest('.palette-item')?.dataset.paletteId;
            if (paletteId) {
                colorManager.loadPaletteIntoCurrent(paletteId);
                // Optionally set the first color of the loaded palette as active
                const firstColor = colorManager.getCurrentPaletteColors()[0];
                 if(firstColor) {
                    colorPicker.value = firstColor;
                    colorPicker.dispatchEvent(new Event('input', { bubbles: true }));
                 }
            }
        }
        // Click on the "Delete" button for a saved palette
        else if (target.dataset.action === 'delete-palette') {
            const paletteItem = target.closest('.palette-item');
            const paletteId = paletteItem?.dataset.paletteId;
            if (paletteId && confirm('Are you sure you want to delete this palette?')) {
                 colorManager.deletePalette(paletteId);
            }
        }
    });

     // Current Palette Interaction (clicking a color sets it active)
    currentPaletteContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('palette-color-button') && target.dataset.color) {
             const color = target.dataset.color;
             colorPicker.value = color;
             // Trigger input event manually to update canvas color
             colorPicker.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });


    // Window Resize Handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            drawingCanvas.resizeCanvas();
            // Optional: Redraw content after resize if needed, though clearing might be better for ephemeral
            // drawingCanvas.redrawContent(); // Requires implementation in canvas.js
        }, 150); // Debounce resize events
    });

    // Initial canvas resize
    drawingCanvas.resizeCanvas();

    console.log("Ephemeral Canvas initialized.");
});