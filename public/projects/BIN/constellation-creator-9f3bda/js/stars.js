// js/stars.js

let stars = [];
const STAR_RADIUS = 4; // Visual radius of the star
const STAR_CLICK_RADIUS = 8; // Larger radius for easier clicking/interaction

/**
 * Adds a star object to the stars array.
 * @param {number} x - The x-coordinate of the star.
 * @param {number} y - The y-coordinate of the star.
 */
function addStar(x, y) {
    stars.push({ x, y, radius: STAR_RADIUS });
}

/**
 * Draws all stars onto the provided canvas context.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 */
function drawStars(ctx) {
    if (!ctx) return;
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

/**
 * Finds the index of a star within the STAR_CLICK_RADIUS of the given coordinates.
 * Iterates backwards to prioritize stars drawn on top if they overlap.
 * @param {number} x - The x-coordinate to check.
 * @param {number} y - The y-coordinate to check.
 * @returns {number} The index of the star if found, otherwise -1.
 */
function getStarAt(x, y) {
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        const dx = x - star.x;
        const dy = y - star.y;
        if (dx * dx + dy * dy <= STAR_CLICK_RADIUS * STAR_CLICK_RADIUS) {
            return i;
        }
    }
    return -1;
}

/**
 * Clears the existing stars and generates a new set of random stars within the canvas bounds.
 * @param {number} count - The number of random stars to generate.
 * @param {number} canvasWidth - The width of the canvas.
 * @param {number} canvasHeight - The height of the canvas.
 */
function generateRandomStars(count, canvasWidth, canvasHeight) {
    stars = []; // Clear existing stars
    const padding = 30; // Keep stars away from edges
    if (canvasWidth <= padding * 2 || canvasHeight <= padding * 2) return; // Avoid issues on tiny canvas

    for (let i = 0; i < count; i++) {
        const x = Math.random() * (canvasWidth - padding * 2) + padding;
        const y = Math.random() * (canvasHeight - padding * 2) + padding;
        // Basic check to avoid placing stars too close to each other (optional)
        let tooClose = false;
        for(const existingStar of stars) {
            const distSq = (x - existingStar.x)**2 + (y - existingStar.y)**2;
            if (distSq < (STAR_CLICK_RADIUS * 2)**2) { // Avoid overlap within click radius
                tooClose = true;
                break;
            }
        }
        if (!tooClose) {
             addStar(x, y);
        } else {
            i--; // Try again for this star count
        }

    }
}

/**
 * Replaces the current stars array with a new one, typically used when loading data.
 * Performs basic validation.
 * @param {Array<object>} newStars - An array of star objects ({x, y, radius?}).
 */
function setStars(newStars) {
    if (Array.isArray(newStars)) {
        // Basic validation and setting default radius if missing
        stars = newStars.filter(s => typeof s.x === 'number' && typeof s.y === 'number')
                        .map(s => ({
                            x: s.x,
                            y: s.y,
                            radius: s.radius || STAR_RADIUS
                        }));
    } else {
        console.error("Invalid data provided to setStars. Expected an array.");
        stars = []; // Reset to empty if data is invalid
    }
}