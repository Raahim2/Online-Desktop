// js/export.js

/**
 * Sets up the event listener for the export button.
 * @param {HTMLButtonElement} exportButton - The export button element.
 * @param {HTMLElement} gridContainer - The grid container element.
 * @param {HTMLSelectElement} gridSizeSelect - The grid size select element.
 */
function setupExport(exportButton, gridContainer, gridSizeSelect) {
    if (!exportButton || !gridContainer || !gridSizeSelect) {
        console.error("Export setup failed: Missing required elements.");
        return;
    }

    exportButton.addEventListener('click', () => {
        exportGridAsPNG(gridContainer, gridSizeSelect);
    });
}

/**
 * Exports the current state of the grid as a PNG image.
 * @param {HTMLElement} gridContainer - The grid container element.
 * @param {HTMLSelectElement} gridSizeSelect - The grid size select element.
 */
function exportGridAsPNG(gridContainer, gridSizeSelect) {
    const gridSize = parseInt(gridSizeSelect.value, 10);
    const cells = gridContainer.querySelectorAll('.grid-cell');

    if (cells.length !== gridSize * gridSize) {
        console.error("Grid size mismatch during export.");
        alert("Error exporting: Grid size mismatch. Please try resizing the grid and exporting again.");
        return;
    }

    // Create an offscreen canvas with the actual pixel dimensions
    const canvas = document.createElement('canvas');
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext('2d');

    // Set a default background if desired (e.g., white)
    // If you want transparency for empty cells, skip this.
    // ctx.fillStyle = '#FFFFFF'; // White background
    // ctx.fillRect(0, 0, gridSize, gridSize);

    // Iterate through cells and draw on the canvas
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const color = cell.style.backgroundColor;

        if (color) { // Only draw if the cell has a color
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);

            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1); // Draw a 1x1 pixel rectangle
        }
        // Cells without a background color will remain transparent (or the default background color if set above)
    }

    // Trigger download
    try {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `pixel-palette-art-${gridSize}x${gridSize}.png`;
        link.href = dataURL;
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link); // Clean up
    } catch (error) {
        console.error("Error exporting canvas:", error);
        alert("Sorry, there was an error exporting the image.");
    }
}