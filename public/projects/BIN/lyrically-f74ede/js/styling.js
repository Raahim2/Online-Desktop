/**
 * Applies a specific CSS style property to a DOM element.
 * @param {HTMLElement} element - The DOM element to style.
 * @param {string} property - The CSS property name (camelCase).
 * @param {string} value - The value for the CSS property.
 */
function applyStyle(element, property, value) {
    if (element && typeof element.style !== 'undefined') {
        element.style[property] = value;
    } else {
        console.warn(`Attempted to apply style to invalid element or element without style property:`, element);
    }
}

/**
 * Applies custom styles defined within a preset object.
 * This function can be expanded to handle more complex style manipulations
 * beyond simple property assignments if needed by presets.
 * @param {HTMLElement} textElement - The primary text layer element.
 * @param {HTMLElement} backgroundElement - The background layer element.
 * @param {HTMLElement} containerElement - The main preview container element.
 * @param {object} customStyles - An object containing custom style definitions from a preset.
 */
function applyCustomPresetStyles(textElement, backgroundElement, containerElement, customStyles) {
    // Example: Applying a text shadow defined in a preset
    if (customStyles.textShadow) {
        applyStyle(textElement, 'textShadow', customStyles.textShadow);
    } else {
         applyStyle(textElement, 'textShadow', 'none'); // Reset if not defined
    }

    // Example: Applying a border to the container
    if (customStyles.containerBorder) {
        applyStyle(containerElement, 'border', customStyles.containerBorder);
    } else {
         applyStyle(containerElement, 'border', 'none'); // Reset if not defined
    }

     // Example: Applying filter effects to the background
    if (customStyles.backgroundFilter) {
        applyStyle(backgroundElement, 'filter', customStyles.backgroundFilter);
    } else {
         applyStyle(backgroundElement, 'filter', 'none'); // Reset if not defined
    }

    // Add more custom style applications here as needed based on preset structure
    // e.g., gradients, specific element transformations, etc.
}

// Potential future additions:
// - Functions for complex layout calculations (e.g., staggered text)
// - Functions to handle specific text effects (e.g., outlines, glows)