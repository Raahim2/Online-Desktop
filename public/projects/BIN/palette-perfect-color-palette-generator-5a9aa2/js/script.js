// Placeholder for js/color.js
const ColorUtils = {
    generatePalette: (count, mode, lockedColors = []) => {
        // lockedColors is an array of { index: i, hex: '#RRGGBB' }
        // This is a mock implementation. Real logic would be in color.js
        const palette = [];
        const lockedHexes = {};
        lockedColors.forEach(lc => {
            if (lc && typeof lc.index === 'number' && lc.hex) {
                lockedHexes[lc.index] = lc.hex;
            }
        });

        let baseHue = Math.random() * 360;

        for (let i = 0; i < count; i++) {
            if (lockedHexes[i]) {
                palette.push(lockedHexes[i]);
                continue;
            }
            let hex;
            if (mode === 'random' || count === 1) {
                hex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            } else {
                // Simplified harmony logic for placeholder
                let h, s, l;
                s = 0.7 + Math.random() * 0.2; // Saturation between 0.7 and 0.9
                l = 0.5 + Math.random() * 0.2; // Lightness between 0.5 and 0.7

                switch (mode) {
                    case 'analogous':
                        h = (baseHue + (i - Math.floor(count / 2)) * 30 + 360) % 360;
                        break;
                    case 'monochromatic':
                        h = baseHue;
                        l = 0.2 + (i / (count -1 )) * 0.6; // Vary lightness
                        break;
                    case 'triadic':
                        h = (baseHue + i * 120 + 360) % 360;
                        break;
                    case 'complementary':
                         h = (baseHue + i * 180 + 360) % 360;
                         if (count > 2) l = 0.3 + (i % 2 === 0 ? 0 : 0.3) + Math.random() * 0.1; // Vary lightness for more colors
                         break;
                    case 'split-complementary':
                        if (i === 0) h = baseHue;
                        else if (i === 1) h = (baseHue + 150 + 360) % 360;
                        else h = (baseHue + 210 + 360) % 360;
                        if (count > 3 && i > 2) h = (baseHue + (i-2)*30 + 360) % 360; // Fill remaining with analogous for >3
                        break;
                    case 'tetradic': // Square
                        h = (baseHue + i * 90 + 360) % 360;
                        break;
                    default: // random as fallback
                        hex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                        palette.push(hex);
                        continue;
                }
                hex = ColorUtils.hslToHex(h, s, l);
            }
            palette.push(hex);
        }
        return palette;
    },
    isValidHex: (hex) => /^#[0-9A-F]{6}$/i.test(hex),
    hslToHex: (h, s, l) => { // Basic HSL to Hex, not production-grade for all edge cases
        l /= 1;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    },
    getLuminance: (hex) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >>  8) & 0xff;
        const b = (rgb >>  0) & 0xff;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
};

// Placeholder for js/storage.js
const StorageUtils = {
    getSavedPalettes: () => {
        const palettes = localStorage.getItem('savedPalettes');
        return palettes ? JSON.parse(palettes) : [];
    },
    savePalette: (paletteToSave) => {
        const palettes = StorageUtils.getSavedPalettes();
        // Check if palette (by colors) already exists to avoid duplicates by value
        const isDuplicate = palettes.some(p =>
            p.colors.length === paletteToSave.colors.length &&
            p.colors.every((c, i) => c === paletteToSave.colors[i])
        );
        if (isDuplicate) {
            showToast("Palette already saved.", "info");
            return false;
        }
        palettes.unshift({ id: Date.now().toString(), name: `Palette ${palettes.length + 1}`, colors: paletteToSave }); // Add to beginning
        localStorage.setItem('savedPalettes', JSON.stringify(palettes));
        return true;
    },
    deletePalette: (paletteId) => {
        let palettes = StorageUtils.getSavedPalettes();
        palettes = palettes.filter(p => p.id !== paletteId);
        localStorage.setItem('savedPalettes', JSON.stringify(palettes));
    },
    clearAllPalettes: () => {
        localStorage.removeItem('savedPalettes');
    },
    updatePaletteName: (paletteId, newName) => {
        let palettes = StorageUtils.getSavedPalettes();
        const paletteIndex = palettes.findIndex(p => p.id === paletteId);
        if (paletteIndex > -1) {
            palettes[paletteIndex].name = newName;
            localStorage.setItem('savedPalettes', JSON.stringify(palettes));
            return true;
        }
        return false;
    }
};

// Placeholder for js/export.js
const ExportUtils = {
    exportAsCSS: (palette) => {
        const cssVars = palette.map((color, index) => `--color-${index + 1}: ${color.hex};`).join('\n');
        ExportUtils.downloadFile('palette.css', `:root {\n${cssVars}\n}`, 'text/css');
    },
    exportAsJSON: (palette) => {
        const json = JSON.stringify(palette.map(c => c.hex), null, 2);
        ExportUtils.downloadFile('palette.json', json, 'application/json');
    },
    exportAsSVG: (palette) => {
        const rectWidth = 100;
        const rectHeight = 400;
        const svgRects = palette.map((color, index) =>
            `<rect x="${index * rectWidth}" y="0" width="${rectWidth}" height="${rectHeight}" fill="${color.hex}" />`
        ).join('\n  ');
        const svgContent = `<svg width="${palette.length * rectWidth}" height="${rectHeight}" xmlns="http://www.w3.org/2000/svg">\n  ${svgRects}\n</svg>`;
        ExportUtils.downloadFile('palette.svg', svgContent, 'image/svg+xml');
    },
    downloadFile: (filename, content, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const colorCountInput = document.getElementById('color-count');
    const harmonyModeSelect = document.getElementById('harmony-mode');
    const generatePaletteBtn = document.getElementById('generate-palette');
    const paletteDisplayArea = document.getElementById('palette-display-area');
    const savePaletteBtn = document.getElementById('save-palette-btn');
    const exportPaletteBtn = document.getElementById('export-palette-btn');
    const exportFormatSelect = document.getElementById('export-format');
    const showSavedPalettesBtn = document.getElementById('show-saved-palettes-btn');
    const savedPalettesModal = document.getElementById('saved-palettes-modal');
    const closeSavedPalettesModalBtn = document.getElementById('close-saved-palettes-modal');
    const savedPalettesListContainer = document.getElementById('saved-palettes-list');
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const clearAllPalettesBtn = document.getElementById('clear-all-palettes-btn');

    let currentPalette = []; // Array of objects: { hex: '#RRGGBB', locked: false, id: 'color-0' }

    function showToast(message, type = 'success', duration = 3000) {
        toastMessage.textContent = message;
        toastNotification.classList.remove('hidden', 'bg-red-500', 'bg-blue-500', 'bg-green-500'); // Clear previous states
        if (type === 'error') {
            toastNotification.classList.add('bg-red-500');
        } else if (type === 'info') {
            toastNotification.classList.add('bg-blue-500');
        } else { // success
            toastNotification.classList.add('bg-green-600');
        }
        toastNotification.classList.remove('opacity-0');
        toastNotification.classList.add('opacity-100');
        setTimeout(() => {
            toastNotification.classList.remove('opacity-100');
            toastNotification.classList.add('opacity-0');
            setTimeout(() => toastNotification.classList.add('hidden'), 300); // Wait for fade out
        }, duration);
    }

    function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
        navigator.clipboard.writeText(text)
            .then(() => showToast(successMessage))
            .catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy!', 'error');
            });
    }

    function renderPaletteUI() {
        paletteDisplayArea.innerHTML = '';
        paletteDisplayArea.className = `mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(currentPalette.length, 3)} lg:grid-cols-${Math.min(currentPalette.length, 5)} gap-4`;


        currentPalette.forEach((color, index) => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-swatch-display relative group flex flex-col items-center justify-between p-3 bg-white rounded-lg shadow-md border border-gray-200';
            colorDiv.dataset.colorIndex = index;

            const colorDisplay = document.createElement('div');
            colorDisplay.style.backgroundColor = color.hex;
            colorDisplay.className = 'w-full h-32 sm:h-40 rounded-md mb-3 border border-gray-300 cursor-pointer transition-all duration-200 ease-in-out group-hover:shadow-xl';
            colorDisplay.title = `Click to copy ${color.hex}`;
            colorDisplay.addEventListener('click', () => copyToClipboard(color.hex, `${color.hex} copied!`));

            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'w-full space-y-2';

            const hexInputContainer = document.createElement('div');
            hexInputContainer.className = 'flex items-center space-x-2';

            const hexInput = document.createElement('input');
            hexInput.type = 'text';
            hexInput.value = color.hex.toUpperCase();
            hexInput.className = 'flex-grow p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500';
            hexInput.setAttribute('aria-label', `Hex code for color ${index + 1}`);
            hexInput.addEventListener('change', (e) => handleHexInputChange(index, e.target.value));
            hexInput.addEventListener('input', (e) => { // Live update for typing
                 const val = e.target.value;
                 if (ColorUtils.isValidHex(val)) {
                    colorDisplay.style.backgroundColor = val;
                    // Potentially update native color picker too
                    const nativePicker = colorDiv.querySelector('input[type="color"]');
                    if (nativePicker) nativePicker.value = val;
                 }
            });


            const nativeColorPicker = document.createElement('input');
            nativeColorPicker.type = 'color';
            nativeColorPicker.value = color.hex;
            nativeColorPicker.className = 'w-10 h-10 p-0 border-none rounded-md cursor-pointer'; // Adjusted for better appearance
            nativeColorPicker.setAttribute('aria-label', `Color picker for color ${index + 1}`);
            nativeColorPicker.addEventListener('input', (e) => handleColorInputChange(index, e.target.value));


            hexInputContainer.appendChild(hexInput);
            hexInputContainer.appendChild(nativeColorPicker);

            const lockButton = document.createElement('button');
            lockButton.className = `lock-btn w-full p-2 border rounded-md shadow-sm text-sm font-medium flex items-center justify-center transition-colors duration-150 ${color.locked ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'}`;
            lockButton.innerHTML = color.locked ? '<i class="fas fa-lock mr-2"></i> Locked' : '<i class="fas fa-lock-open mr-2"></i> Lock';
            lockButton.setAttribute('aria-label', color.locked ? `Unlock color ${index + 1}` : `Lock color ${index + 1}`);
            lockButton.addEventListener('click', () => toggleColorLock(index));

            controlsContainer.appendChild(hexInputContainer);
            controlsContainer.appendChild(lockButton);

            colorDiv.appendChild(colorDisplay);
            colorDiv.appendChild(controlsContainer);
            paletteDisplayArea.appendChild(colorDiv);
        });
         // Adjust grid columns based on number of colors for better responsiveness
        const numColors = currentPalette.length;
        if (numColors === 1) paletteDisplayArea.className = 'mt-8 grid grid-cols-1 gap-4';
        else if (numColors === 2) paletteDisplayArea.className = 'mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4';
        else if (numColors === 3) paletteDisplayArea.className = 'mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';
        else if (numColors === 4) paletteDisplayArea.className = 'mt-8 grid grid-cols