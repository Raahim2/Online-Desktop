// js/drawing.js

let isDrawing = false;
let activeTool = 'draw'; // 'draw', 'fill', 'erase'
let currentGridContainer = null;
let currentUndoButton = null;
let currentRedoButton = null;

// History Management
const MAX_HISTORY_SIZE = 50; // Limit memory usage
let historyStack = []; // Stores snapshots of changes for undo/redo
let historyIndex = -1; // Pointer to the current state in the history stack

/**
 * Initializes drawing event listeners on the grid container.
 * @param {HTMLElement} gridContainer - The grid container element.
 * @param {HTMLInputElement} colorPickerRef - Reference to the color picker (used indirectly via getCurrentColor).
 * @param {HTMLButtonElement} undoBtn - The undo button element.
 * @param {HTMLButtonElement} redoBtn - The redo button element.
 */
function initializeDrawing(gridContainer, colorPickerRef, undoBtn, redoBtn) {
    if (!gridContainer) {
        console.error("Drawing initialization failed: Grid container not found.");
        return;
    }
    currentGridContainer = gridContainer;
    currentUndoButton = undoBtn;
    currentRedoButton = redoBtn;

    // Remove previous listeners if re-initializing
    gridContainer.removeEventListener('mousedown', handleMouseDown);
    gridContainer.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp); // Listen on document to catch mouseup outside grid
    gridContainer.removeEventListener('mouseleave', handleMouseLeave);
    gridContainer.removeEventListener('click', handleGridClick); // For single-click actions like fill
    gridContainer.removeEventListener('touchstart', handleTouchStart, { passive: false });
    gridContainer.removeEventListener('touchmove', handleTouchMove, { passive: false });
    gridContainer.removeEventListener('touchend', handleTouchEnd);
    gridContainer.removeEventListener('touchcancel', handleTouchEnd);


    // Add new listeners
    gridContainer.addEventListener('mousedown', handleMouseDown);
    gridContainer.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp); // Listen on document
    gridContainer.addEventListener('mouseleave', handleMouseLeave);
    // gridContainer.addEventListener('click', handleGridClick); // Use mousedown for immediate feedback
    gridContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    gridContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    gridContainer.addEventListener('touchend', handleTouchEnd);
    gridContainer.addEventListener('touchcancel', handleTouchEnd);

    // Initial history state
    resetHistory(); // Start with a clean history for the new grid
}

/**
 * Sets the active drawing tool.
 * @param {string} toolName - The name of the tool ('draw', 'fill', 'erase').
 */
function setActiveTool(toolName) {
    activeTool = toolName;
    if (currentGridContainer) {
        // Update cursor style based on tool
        switch (toolName) {
            case 'fill':
                currentGridContainer.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'%23000000\'><path d=\'M18 3h-3.26a3 3 0 0 0-5.48 0H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zm-7 15.5l-4-4h3V11h2v3.5h3l-4 4zM15 5h-1V4a1 1 0 0 0-2 0v1h-1a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2z\'/></svg>") 12 12, crosshair'; // Bucket cursor
                break;
            case 'erase':
                currentGridContainer.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z\'/><line x1=\'18\' y1=\'9\' x2=\'12\' y2=\'15\'/><line x1=\'12\' y1=\'9\' x2=\'18\' y2=\'15\'/></svg>") 12 12, crosshair'; // Eraser cursor
                break;
            case 'draw':
            default:
                currentGridContainer.style.cursor = 'crosshair';
                break;
        }
    }
}

// --- Event Handlers ---

function handleMouseDown(e) {
    if (e.button !== 0) return; // Only handle left clicks
    isDrawing = true;
    const targetCell = getCellFromEvent(e);
    if (targetCell) {
        applyTool(targetCell, true); // Apply tool and mark as start of action for history
    }
}

function handleMouseMove(e) {
    if (!isDrawing) return;
    const targetCell = getCellFromEvent(e);
    if (targetCell) {
        // For draw/erase, apply continuously
        if (activeTool === 'draw' || activeTool === 'erase') {
            applyTool(targetCell, false); // Apply tool but don't start a new history entry
        }
    }
}

function handleMouseUp(e) {
    if (e.button !== 0) return;
    if (isDrawing) {
        isDrawing = false;
        // Finalize history entry if needed (though typically done on first action)
    }
}

function handleMouseLeave() {
    // Stop drawing if the mouse leaves the grid container
    if (isDrawing) {
        isDrawing = false;
    }
}

function handleGridClick(e) {
    // Primarily for tools like 'fill' that act on a single click
    // Using mousedown instead for better responsiveness
    // if (activeTool === 'fill') {
    //     const targetCell = getCellFromEvent(e);
    //     if (targetCell) {
    //         applyTool(targetCell, true);
    //     }
    // }
}

// --- Touch Event Handlers ---

function handleTouchStart(e) {
    e.preventDefault(); // Prevent scrolling/zooming while drawing
    if (e.touches.length === 1) {
        isDrawing = true;
        const targetCell = getCellFromEvent(e.touches[0]);
        if (targetCell) {
            applyTool(targetCell, true); // Start action
        }
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing || e.touches.length !== 1) return;
    const targetCell = getCellFromEvent(e.touches[0]);
    if (targetCell) {
        if (activeTool === 'draw' || activeTool === 'erase') {
            applyTool(targetCell, false); // Continue action
        }
    }
}

function handleTouchEnd(e) {
    if (isDrawing) {
        isDrawing = false;
        // Finalize history entry if needed
    }
}


// --- Tool Application Logic ---

let currentActionChanges = []; // Store changes for the current continuous action (drag)

/**
 * Applies the currently selected tool to the target cell.
 * @param {HTMLElement} cell - The grid cell element.
 * @param {boolean} isNewAction - True if this is the start of a new action (click/touch start), false if continuing (drag/touch move).
 */
function applyTool(cell, isNewAction) {
    const color = (typeof getCurrentColor === 'function') ? getCurrentColor() : '#000000';
    const eraseColor = ''; // Reset background color for erase

    if (isNewAction) {
        currentActionChanges = []; // Start recording changes for this action
    }

    switch (activeTool) {
        case 'draw':
            drawPixel(cell, color, isNewAction);
            break;
        case 'erase':
            erasePixel(cell, eraseColor, isNewAction);
            break;
        case 'fill':
            // Fill only happens on the initial click/touch (isNewAction should be true)
            if (isNewAction) {
                fillArea(cell, color);
            }
            break;
    }

    // Save state after the *first* modification of a new action sequence
    if (isNewAction && currentActionChanges.length > 0) {
         // If it was a fill, the changes are already recorded in fillArea
        if (activeTool !== 'fill') {
            saveState(currentActionChanges);
        }
    }
}

function drawPixel(cell, color, isNewAction) {
    const oldColor = cell.style.backgroundColor || '';
    if (oldColor !== color) {
        cell.style.backgroundColor = color;
        // Record change only if it's different
        recordChange(cell, oldColor, color);
    }
}

function erasePixel(cell, eraseColor, isNewAction) {
    const oldColor = cell.style.backgroundColor || '';
    if (oldColor !== eraseColor) {
        cell.style.backgroundColor = eraseColor;
         // Record change only if it actually erased something
        recordChange(cell, oldColor, eraseColor);
    }
}

/**
 * Fills a contiguous area starting from the clicked cell.
 * @param {HTMLElement} startCell - The cell where the fill operation starts.
 * @param {string} fillColor - The color to fill with.
 */
function fillArea(startCell, fillColor) {
    const cells = Array.from(currentGridContainer.children);
    const gridSize = Math.sqrt(cells.length);
    const startIndex = cells.indexOf(startCell);
    const startColor = startCell.style.backgroundColor || '';

    if (startColor === fillColor) {
        return; // No need to fill if the color is the same
    }

    const changes = []; // Store changes for this fill action
    const queue = [startIndex];
    const visited = new Set([startIndex]);

    function getCellColor(index) {
        return cells[index] ? (cells[index].style.backgroundColor || '') : null;
    }

    while (queue.length > 0) {
        const currentIndex = queue.shift();
        const currentCell = cells[currentIndex];

        if (currentCell && (currentCell.style.backgroundColor || '') === startColor) {
            const oldColor = currentCell.style.backgroundColor || '';
            currentCell.style.backgroundColor = fillColor;
            changes.push({ element: currentCell, oldColor: oldColor, newColor: fillColor });

            const neighbors = getNeighbors(currentIndex, gridSize);

            neighbors.forEach(neighborIndex => {
                if (neighborIndex >= 0 && neighborIndex < cells.length && !visited.has(neighborIndex)) {
                    const neighborColor = getCellColor(neighborIndex);
                    if (neighborColor === startColor) {
                        visited.add(neighborIndex);
                        queue.push(neighborIndex);
                    }
                }
            });
        }
    }

    if (changes.length > 0) {
        saveState(changes); // Save the entire fill operation as one history step
    }
}

/** Helper function to get valid neighbor indices */
function getNeighbors(index, size) {
    const neighbors = [];
    const row = Math.floor(index / size);
    const col = index % size;

    // Top
    if (row > 0) neighbors.push(index - size);
    // Bottom
    if (row < size - 1) neighbors.push(index + size);
    // Left
    if (col > 0) neighbors.push(index - 1);
    // Right
    if (col < size - 1) neighbors.push(index + 1);

    return neighbors;
}


/** Helper to get the grid cell element from a mouse or touch event */
function getCellFromEvent(event) {
    const gridRect = currentGridContainer.getBoundingClientRect();
    // Use clientX/clientY which are relative to the viewport
    const x = event.clientX - gridRect.left;
    const y = event.clientY - gridRect.top;

    // Calculate cell dimensions based on container size and grid size
    const cells = currentGridContainer.children;
    if (cells.length === 0) return null;
    const gridSize = Math.sqrt(cells.length);
    const cellWidth = gridRect.width / gridSize;
    const cellHeight = gridRect.height / gridSize;


    // Calculate cell indices
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    // Calculate the flat index
    const index = row * gridSize + col;

    // Basic bounds check
    if (index >= 0 && index < cells.length) {
        return cells[index];
    }

    return null; // Click was outside the bounds of the cells
}

// --- History (Undo/Redo) ---

/** Records a single cell change during a drawing action. */
function recordChange(cell, oldColor, newColor) {
    // Avoid recording no-ops
    if (oldColor === newColor) return;

    // Check if this cell was already modified in the *current* continuous action
    const existingChangeIndex = currentActionChanges.findIndex(change => change.element === cell);

    if (existingChangeIndex !== -1) {
        // Update the final state ('newColor') but keep the original 'oldColor'
        currentActionChanges[existingChangeIndex].newColor = newColor;
    } else {
        // Add a new change record for this cell
        currentActionChanges.push({ element: cell, oldColor: oldColor, newColor: newColor });
    }
}


/** Saves the recorded changes (currentActionChanges) as a single step in the history. */
function saveState(changes) {
    if (changes.length === 0) return; // Don't save empty states

    // Clear any redo history beyond the current point
    historyStack = historyStack.slice(0, historyIndex + 1);

    // Add the new state (the list of changes)
    historyStack.push(changes);

    // Limit history size
    if (historyStack.length > MAX_HISTORY_SIZE) {
        historyStack.shift(); // Remove the oldest entry
    } else {
        historyIndex++; // Only increment index if not capped (or capped but adding)
    }
     if (historyIndex > historyStack.length -1) historyIndex = historyStack.length -1; // Ensure index stays valid after shift


    updateHistoryButtons();
}

/** Resets the history stack. */
function resetHistory() {
    historyStack = [];
    historyIndex = -1;
    updateHistoryButtons();
}

/** Undoes the last action. */
function undo() {
    if (historyIndex < 0) return; // Nothing to undo

    const changesToUndo = historyStack[historyIndex];
    // Apply the 'oldColor' for each change in reverse order (though order might not matter for simple color changes)
    for (let i = changesToUndo.length - 1; i >= 0; i--) {
        const change = changesToUndo[i];
        change.element.style.backgroundColor = change.oldColor;
    }

    historyIndex--;
    updateHistoryButtons();
}

/** Redoes the previously undone action. */
function redo() {
    if (historyIndex >= historyStack.length - 1) return; // Nothing to redo

    historyIndex++;
    const changesToRedo = historyStack[historyIndex];
    // Apply the 'newColor' for each change
    changesToRedo.forEach(change => {
        change.element.style.backgroundColor = change.newColor;
    });

    updateHistoryButtons();
}

/** Updates the enabled/disabled state of undo/redo buttons. */
function updateHistoryButtons() {
    if (currentUndoButton) {
        currentUndoButton.disabled = historyIndex < 0;
    }
    if (currentRedoButton) {
        currentRedoButton.disabled = historyIndex >= historyStack.length - 1;
    }
}

// --- Clear Canvas ---

/**
 * Clears the entire grid, resetting all cell colors.
 * @param {HTMLElement} gridContainer - The grid container element.
 */
function clearCanvas(gridContainer) {
    if (!gridContainer) return;
    const cells = gridContainer.querySelectorAll('.grid-cell');
    const changes = [];
    cells.forEach(cell => {
        const oldColor = cell.style.backgroundColor || '';
        if (oldColor !== '') { // Only record if there was a color
             changes.push({ element: cell, oldColor: oldColor, newColor: '' });
             cell.style.backgroundColor = '';
        }
    });

    // Save the clear action as a single history step
    if (changes.length > 0) {
        saveState(changes);
    }
     // Note: We don't call resetHistory() here, because clearing itself should be undoable.
     // resetHistory() is called when the grid *size* changes, making previous history irrelevant.
}