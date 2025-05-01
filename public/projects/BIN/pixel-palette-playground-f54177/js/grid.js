// js/grid.js

let gridContainerElement = null;
let currentGridSize = 0; // To keep track for resizing cells

/**
 * Creates the pixel grid in the DOM.
 * @param {number} size - The dimension of the grid (e.g., 16 for 16x16).
 * @param {number} cellSize - The initial size of each cell in pixels.
 */
function createGrid(size, cellSize) {
    if (!gridContainerElement) {
        gridContainerElement = document.getElementById('grid-container');
        if (!gridContainerElement) {
            console.error("Grid container element '#grid-container' not found!");
            return;
        }
    }

    currentGridSize = size; // Store the current grid size

    // Clear previous grid content
    gridContainerElement.innerHTML = '';

    // Set grid container styles based on size and cell size
    gridContainerElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`; // Use fr units for flexibility
    gridContainerElement.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    // Set overall container dimensions based on cell size
    gridContainerElement.style.width = `${size * cellSize}px`;
    gridContainerElement.style.height = `${size * cellSize}px`;
    gridContainerElement.style.borderWidth = '1px'; // Ensure border is visible

    // Create grid cells using a document fragment for performance
    const fragment = document.createDocumentFragment();
    const totalCells = size * size;
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        // Set initial cell size - this will be controlled by the container's dimensions and grid layout
        // Explicit width/height on cells can conflict with fr units, let the grid handle it.
        // cell.style.width = `${cellSize}px`; // Let CSS grid manage this
        // cell.style.height = `${cellSize}px`; // Let CSS grid manage this
        fragment.appendChild(cell);
    }
    gridContainerElement.appendChild(fragment);

    // Apply the initial cell size via container dimensions
    updateCellSize(cellSize); // Call this to ensure container dimensions are set
}

/**
 * Updates the visual size of the grid by adjusting the container dimensions.
 * Individual cell sizes are managed by the CSS grid layout (fr units).
 * @param {number} cellSize - The new target size for each cell in pixels.
 */
function updateCellSize(cellSize) {
    if (!gridContainerElement || currentGridSize === 0) {
        // Grid might not be initialized yet
        return;
    }

    // Update grid container's overall dimensions
    // The `grid-template-columns/rows` using `1fr` will automatically adjust cell sizes
    gridContainerElement.style.width = `${currentGridSize * cellSize}px`;
    gridContainerElement.style.height = `${currentGridSize * cellSize}px`;

    // Optional: If explicit cell borders or other size-dependent styles were needed on cells, update them here.
    // const cells = gridContainerElement.querySelectorAll('.grid-cell');
    // cells.forEach(cell => {
    //     // Update any cell-specific styles if necessary, but width/height should be handled by grid
    // });
}