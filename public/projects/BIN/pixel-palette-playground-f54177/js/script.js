document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const gridSizeSelect = document.getElementById('grid-size');
    const gridContainer = document.getElementById('grid-container');
    const colorPicker = document.getElementById('color-picker');
    const paletteContainer = document.getElementById('palette-container');
    const toolButtons = document.querySelectorAll('.tool-button');
    const clearButton = document.getElementById('clear-button');
    const exportButton = document.getElementById('export-png-button');
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');
    const cellSizeSlider = document.getElementById('cell-size-slider');
    const cellSizeValueSpan = document.getElementById('cell-size-value');

    // --- Initial State ---
    let currentSize = parseInt(gridSizeSelect.value, 10);
    let currentCellSize = parseInt(cellSizeSlider.value, 10);

    // --- Initialization ---
    // Assume functions are globally available or within imported modules/classes
    // e.g., window.Grid.create, window.Palette.initialize, etc.

    // Initialize Grid (from grid.js)
    if (typeof createGrid === 'function') {
        createGrid(currentSize, currentCellSize);
    } else {
        console.error("grid.js: createGrid function not found.");
    }

    // Initialize Palette (from palette.js)
    if (typeof initializePalette === 'function') {
        initializePalette(paletteContainer, colorPicker);
    } else {
        console.error("palette.js: initializePalette function not found.");
    }

    // Initialize Drawing Listeners (from drawing.js)
    if (typeof initializeDrawing === 'function') {
        initializeDrawing(gridContainer, colorPicker, undoButton, redoButton);
    } else {
        console.error("drawing.js: initializeDrawing function not found.");
    }

    // Initialize Export (from export.js) - might not need explicit init
    if (typeof setupExport === 'function') {
        setupExport(exportButton, gridContainer, gridSizeSelect);
    } else {
        console.error("export.js: setupExport function not found.");
    }


    // --- Event Listeners ---

    // Grid Size Change
    gridSizeSelect.addEventListener('change', (e) => {
        currentSize = parseInt(e.target.value, 10);
        if (typeof createGrid === 'function') {
            createGrid(currentSize, currentCellSize);
             // Re-initialize drawing listeners for the new grid
            if (typeof initializeDrawing === 'function') {
                initializeDrawing(gridContainer, colorPicker, undoButton, redoButton);
            }
            // Reset history on grid change
            if(typeof resetHistory === 'function') {
                resetHistory();
            } else {
                 console.warn("drawing.js: resetHistory function not found for grid resize.");
            }
        }
    });

    // Cell Size (Zoom) Change
    cellSizeSlider.addEventListener('input', (e) => {
        currentCellSize = parseInt(e.target.value, 10);
        cellSizeValueSpan.textContent = currentCellSize;
        if (typeof updateCellSize === 'function') {
            updateCellSize(currentCellSize);
        } else {
            console.error("grid.js: updateCellSize function not found.");
        }
    });

    // Tool Selection
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            toolButtons.forEach(btn => btn.classList.remove('active-tool'));
            button.classList.add('active-tool');
            const selectedTool = button.getAttribute('data-tool');
            if (typeof setActiveTool === 'function') {
                setActiveTool(selectedTool);
            } else {
                console.error("drawing.js: setActiveTool function not found.");
            }
        });
    });

    // Color Picker Change
    colorPicker.addEventListener('input', (e) => {
        const newColor = e.target.value;
        if (typeof setCurrentColor === 'function') {
            setCurrentColor(newColor);
        } else {
             console.error("palette.js/drawing.js: setCurrentColor function not found.");
        }
         // Deselect palette colors if custom color is chosen directly
        const selectedPaletteColor = paletteContainer.querySelector('.palette-color.selected');
        if (selectedPaletteColor) {
            selectedPaletteColor.classList.remove('selected');
        }
    });

     // Palette Color Click (delegated)
     paletteContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('palette-color')) {
            const color = e.target.style.backgroundColor;
            // Convert rgb to hex for the color picker
             const hexColor = rgbToHex(color);
             if (hexColor) {
                colorPicker.value = hexColor;
                 if (typeof setCurrentColor === 'function') {
                    setCurrentColor(hexColor);
                 }
                 // Visually select the clicked palette color
                 paletteContainer.querySelectorAll('.palette-color').forEach(el => el.classList.remove('selected'));
                 e.target.classList.add('selected');
             }
        }
    });

    // Clear Canvas Button
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
            if (typeof clearCanvas === 'function') {
                clearCanvas(gridContainer);
                 // Reset history after clearing
                 if(typeof resetHistory === 'function') {
                    resetHistory();
                 } else {
                     console.warn("drawing.js: resetHistory function not found for clear canvas.");
                 }
            } else {
                console.error("drawing.js: clearCanvas function not found.");
            }
        }
    });

    // Export Button (Functionality likely within export.js, triggered via setupExport)
    // The setupExport function should handle the click listener internally.

    // Undo Button
    undoButton.addEventListener('click', () => {
        if (typeof undo === 'function') {
            undo();
        } else {
            console.error("drawing.js: undo function not found.");
        }
    });

    // Redo Button
    redoButton.addEventListener('click', () => {
        if (typeof redo === 'function') {
            redo();
        } else {
            console.error("drawing.js: redo function not found.");
        }
    });

    // --- Utility Functions ---
    function rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return null; // Handle cases where color might not be set yet or is not rgb

        // Choose correct separator
        let sep = rgb.indexOf(",") > -1 ? "," : " ";
        // Turn "rgb(r,g,b)" into [r,g,b]
        rgb = rgb.substr(4).split(")")[0].split(sep);

        let r = (+rgb[0]).toString(16),
            g = (+rgb[1]).toString(16),
            b = (+rgb[2]).toString(16);

        if (r.length == 1) r = "0" + r;
        if (g.length == 1) g = "0" + g;
        if (b.length == 1) b = "0" + b;

        return "#" + r + g + b;
    }

    // --- Initial Active Tool ---
    // Ensure 'draw' tool is active by default if setActiveTool exists
    if (typeof setActiveTool === 'function') {
        setActiveTool('draw'); // Set default tool
    }

});