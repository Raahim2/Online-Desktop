// js/palette.js

const defaultPalettes = {
    basic: [
        '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
        '#808080', '#c0c0c0', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'
    ],
    // Add more palettes here if needed, e.g., grayscale, gameboy, nes
    // grayscale: ['#000000', '#222222', '#444444', '#666666', '#888888', '#aaaaaa', '#cccccc', '#eeeeee', '#ffffff'],
};

let currentPaletteContainer = null;
let currentColorPicker = null;
let selectedColor = '#000000'; // Default drawing color

/**
 * Initializes the color palette section.
 * @param {HTMLElement} paletteContainer - The DOM element to hold palette swatches.
 * @param {HTMLInputElement} colorPicker - The main color input element.
 * @param {string} initialPaletteName - The name of the palette to load initially (e.g., 'basic').
 */
function initializePalette(paletteContainer, colorPicker, initialPaletteName = 'basic') {
    currentPaletteContainer = paletteContainer;
    currentColorPicker = colorPicker;

    if (!currentPaletteContainer) {
        console.error("Palette container element not provided or found.");
        return;
    }
    if (!currentColorPicker) {
        console.error("Color picker element not provided or found.");
        return;
    }

    loadPalette(initialPaletteName);
    setCurrentColor(currentColorPicker.value); // Initialize with the picker's default

    // Event listener for palette clicks is handled in script.js via delegation
    // Event listener for color picker input is handled in script.js
}

/**
 * Loads a specific palette into the palette container.
 * @param {string} paletteName - The name of the palette to load (must exist in defaultPalettes).
 */
function loadPalette(paletteName) {
    if (!currentPaletteContainer) return;
    if (!defaultPalettes[paletteName]) {
        console.warn(`Palette "${paletteName}" not found. Loading "basic" instead.`);
        paletteName = 'basic'; // Fallback to basic
    }

    const palette = defaultPalettes[paletteName];
    currentPaletteContainer.innerHTML = ''; // Clear existing swatches

    const fragment = document.createDocumentFragment();
    palette.forEach((color, index) => {
        const swatch = document.createElement('div');
        swatch.classList.add('palette-color', 'w-6', 'h-6', 'border', 'border-gray-400', 'cursor-pointer', 'rounded-sm');
        swatch.style.backgroundColor = color;
        swatch.dataset.color = color; // Store color for easy access

        // Select the first color by default visually
        if (index === 0) {
            swatch.classList.add('selected');
            setCurrentColor(color); // Set the first color as active initially
            if(currentColorPicker) currentColorPicker.value = color;
        }

        fragment.appendChild(swatch);
    });
    currentPaletteContainer.appendChild(fragment);
}

/**
 * Sets the currently selected drawing color.
 * @param {string} color - The color string (e.g., '#ffffff' or 'rgb(255,0,0)').
 */
function setCurrentColor(color) {
    selectedColor = color;
    // Optionally update the color picker input value if it didn't trigger the change
    if (currentColorPicker && currentColorPicker.value !== color) {
       // Check if it's already a hex color
        if (/^#[0-9A-F]{6}$/i.test(color)) {
             currentColorPicker.value = color;
        } else {
             // Attempt conversion if needed (e.g., from rgb) - basic conversion
             const hex = rgbToHexPalette(color);
             if (hex) currentColorPicker.value = hex;
        }
    }

    // Deselect any visually selected palette swatch if the new color doesn't match one
    if (currentPaletteContainer) {
        let matchFound = false;
        currentPaletteContainer.querySelectorAll('.palette-color').forEach(swatch => {
            // Compare normalized colors (e.g., convert swatch bg to hex)
            const swatchHex = rgbToHexPalette(swatch.style.backgroundColor);
            const currentHex = rgbToHexPalette(color); // Ensure comparison is hex vs hex
            if (swatchHex && currentHex && swatchHex.toLowerCase() === currentHex.toLowerCase()) {
                swatch.classList.add('selected');
                matchFound = true;
            } else {
                swatch.classList.remove('selected');
            }
        });
         // If the color picker was used directly, no palette swatch should be selected
        // This logic is mostly handled in script.js now
    }
}

/**
 * Gets the currently selected drawing color.
 * @returns {string} The current color string.
 */
function getCurrentColor() {
    return selectedColor;
}

// Helper function to convert rgb to hex specifically for palette comparison
function rgbToHexPalette(rgb) {
    if (!rgb) return null;
    if (rgb.startsWith('#')) return rgb; // Already hex
    if (!rgb.startsWith('rgb')) return null; // Not a standard rgb string

    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    rgb = rgb.substr(4).split(")")[0].split(sep);

    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
}