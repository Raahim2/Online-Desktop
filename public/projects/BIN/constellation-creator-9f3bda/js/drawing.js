// js/drawing.js

let lines = [];
let currentLineStartStarIndex = -1;
let currentLineEndX = 0;
let currentLineEndY = 0;

/**
 * Starts the process of drawing a line from a specific star.
 * @param {number} starIndex - The index of the star in the `stars` array where the line starts.
 * @param {number} startX - The initial x-coordinate (usually the star's x).
 * @param {number} startY - The initial y-coordinate (usually the star's y).
 */
function startDrawingLine(starIndex, startX, startY) {
    // Ensure stars array is accessible (implicitly global or passed)
    if (starIndex >= 0 && starIndex < stars.length) {
        currentLineStartStarIndex = starIndex;
        currentLineEndX = startX; // Initialize end coords to start coords
        currentLineEndY = startY;
    } else {
        currentLineStartStarIndex = -1; // Invalid start index
    }
}

/**
 * Updates the temporary end coordinates of the line being drawn.
 * @param {number} currentX - The current mouse x-coordinate.
 * @param {number} currentY - The current mouse y-coordinate.
 */
function updateDrawingLine(currentX, currentY) {
    if (currentLineStartStarIndex !== -1) {
        currentLineEndX = currentX;
        currentLineEndY = currentY;
    }
}

/**
 * Finishes drawing a line. If the end coordinates are over another star,
 * a permanent line is added to the `lines` array.
 * @param {number} endX - The final x-coordinate (mouseup position).
 * @param {number} endY - The final y-coordinate (mouseup position).
 */
function finishDrawingLine(endX, endY) {
    if (currentLineStartStarIndex === -1) return; // No line was being drawn

    // Check if the mouseup occurred over a different star
    const endStarIndex = getStarAt(endX, endY); // Assumes getStarAt is globally available from stars.js

    if (endStarIndex !== -1 && endStarIndex !== currentLineStartStarIndex) {
        // Check if this line already exists (in either direction)
        const alreadyExists = lines.some(line =>
            (line.startStarIndex === currentLineStartStarIndex && line.endStarIndex === endStarIndex) ||
            (line.startStarIndex === endStarIndex && line.endStarIndex === currentLineStartStarIndex)
        );

        if (!alreadyExists) {
             // Add the new line
            lines.push({
                startStarIndex: currentLineStartStarIndex,
                endStarIndex: endStarIndex
            });
        }
    }

    // Reset drawing state regardless of whether a line was added
    resetDrawingLine();
}

/**
 * Resets the state related to drawing the current line.
 */
function resetDrawingLine() {
    currentLineStartStarIndex = -1;
    currentLineEndX = 0;
    currentLineEndY = 0;
}


/**
 * Draws all the permanent lines onto the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 */
function drawLines(ctx) {
    if (!ctx || !stars || stars.length === 0) return; // Need context and stars data

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; // Semi-transparent white lines
    ctx.lineWidth = 1.5;

    lines.forEach(line => {
        // Ensure star indices are valid before attempting to draw
        if (line.startStarIndex >= 0 && line.startStarIndex < stars.length &&
            line.endStarIndex >= 0 && line.endStarIndex < stars.length)
        {
            const startStar = stars[line.startStarIndex];
            const endStar = stars[line.endStarIndex];

            ctx.beginPath();
            ctx.moveTo(startStar.x, startStar.y);
            ctx.lineTo(endStar.x, endStar.y);
            ctx.stroke();
        } else {
            // Handle potential data inconsistency, maybe remove the invalid line
            console.warn("Attempted to draw line with invalid star index:", line);
            // Optionally filter out such lines here or during loading
        }
    });
}

/**
 * Replaces the current lines array with a new one, typically used when loading data.
 * Performs basic validation.
 * @param {Array<object>} newLines - An array of line objects ({startStarIndex, endStarIndex}).
 */
function setLines(newLines) {
     if (Array.isArray(newLines)) {
        // Basic validation
        lines = newLines.filter(l =>
            typeof l.startStarIndex === 'number' && typeof l.endStarIndex === 'number'
        );
    } else {
        console.error("Invalid data provided to setLines. Expected an array.");
        lines = []; // Reset to empty if data is invalid
    }
    resetDrawingLine(); // Ensure no partial line drawing state persists
}