class Color {
    constructor(colorPickerElement, currentPaletteContainer, savedPalettesContainer, storageInstance) {
        if (!colorPickerElement || !currentPaletteContainer || !savedPalettesContainer || !storageInstance) {
            throw new Error("Color class requires valid DOM elements and a Storage instance.");
        }
        this.colorPicker = colorPickerElement;
        this.currentPaletteContainer = currentPaletteContainer;
        this.savedPalettesContainer = savedPalettesContainer;
        this.storage = storageInstance;
        this.currentPaletteColors = [];
        this.maxCurrentPaletteSize = 8; // Max colors to show in the "current" palette bar
    }

    addInitialColor(color) {
        if (color && !this.currentPaletteColors.includes(color)) {
            this.currentPaletteColors.unshift(color); // Add to the beginning
            this._updateCurrentPaletteUI();
        }
    }

    addColorToCurrent(color) {
        if (!color) return;

        // Remove if already exists to move it to the front
        const existingIndex = this.currentPaletteColors.indexOf(color);
        if (existingIndex > -1) {
            this.currentPaletteColors.splice(existingIndex, 1);
        }

        // Add to the beginning
        this.currentPaletteColors.unshift(color);

        // Limit size
        if (this.currentPaletteColors.length > this.maxCurrentPaletteSize) {
            this.currentPaletteColors.pop(); // Remove the oldest color
        }

        this._updateCurrentPaletteUI();
    }

    _createColorSwatch(color) {
        const swatch = document.createElement('button');
        swatch.classList.add('palette-color-button');
        swatch.style.backgroundColor = color;
        swatch.dataset.color = color;
        swatch.setAttribute('title', `Select ${color}`); // Tooltip for accessibility
        swatch.setAttribute('aria-label', `Select color ${color}`);
        return swatch;
    }

    _updateCurrentPaletteUI() {
        this.currentPaletteContainer.innerHTML = ''; // Clear existing swatches
        this.currentPaletteColors.forEach(color => {
            const swatch = this._createColorSwatch(color);
            this.currentPaletteContainer.appendChild(swatch);
        });
    }

    saveCurrentPalette() {
        if (this.currentPaletteColors.length === 0) {
            alert("Current palette is empty. Select some colors first.");
            return;
        }
        const paletteToSave = [...this.currentPaletteColors]; // Create a copy
        const paletteId = `palette_${Date.now()}`; // Simple unique ID
        this.storage.savePalette(paletteId, paletteToSave);
        this.loadPalettes(); // Refresh the saved palettes list
        // Optional: Clear current palette after saving
        // this.currentPaletteColors = [];
        // this._updateCurrentPaletteUI();
        console.log(`Palette saved with ID: ${paletteId}`);
    }

    loadPalettes() {
        const palettes = this.storage.getAllPalettes();
        this._renderSavedPalettes(palettes);
    }

    _renderSavedPalettes(palettes) {
        this.savedPalettesContainer.innerHTML = ''; // Clear existing list
        if (Object.keys(palettes).length === 0) {
            this.savedPalettesContainer.innerHTML = '<p class="text-xs text-gray-500">No palettes saved yet.</p>';
            return;
        }

        Object.entries(palettes).forEach(([id, colors]) => {
            const paletteItem = document.createElement('div');
            paletteItem.classList.add('palette-item', 'border', 'border-gray-200', 'p-2', 'rounded', 'flex', 'items-center', 'space-x-2');
            paletteItem.dataset.paletteId = id;

            const swatchesContainer = document.createElement('div');
            swatchesContainer.classList.add('flex', 'flex-wrap', 'gap-1');
            colors.forEach(color => {
                const swatch = this._createColorSwatch(color);
                swatchesContainer.appendChild(swatch);
            });

            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('ml-auto', 'flex', 'space-x-1'); // Push buttons to the right

            const loadButton = document.createElement('button');
            loadButton.textContent = 'Load';
            loadButton.dataset.action = 'load-palette';
            loadButton.classList.add('text-xs', 'bg-blue-100', 'hover:bg-blue-200', 'text-blue-700', 'px-2', 'py-1', 'rounded');
            loadButton.setAttribute('aria-label', `Load palette ${id}`);


            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Del';
            deleteButton.dataset.action = 'delete-palette';
            deleteButton.classList.add('text-xs', 'bg-red-100', 'hover:bg-red-200', 'text-red-700', 'px-2', 'py-1', 'rounded');
             deleteButton.setAttribute('aria-label', `Delete palette ${id}`);

            buttonsContainer.appendChild(loadButton);
            buttonsContainer.appendChild(deleteButton);

            paletteItem.appendChild(swatchesContainer);
            paletteItem.appendChild(buttonsContainer);
            this.savedPalettesContainer.appendChild(paletteItem);
        });
    }

    loadPaletteIntoCurrent(paletteId) {
        const palette = this.storage.getPalette(paletteId);
        if (palette) {
            // Replace current palette colors, ensuring no duplicates and respecting max size
            this.currentPaletteColors = [...new Set(palette)].slice(0, this.maxCurrentPaletteSize);
            this._updateCurrentPaletteUI();
            console.log(`Loaded palette ${paletteId} into current view.`);
        } else {
            console.error(`Palette with ID ${paletteId} not found.`);
        }
    }

    deletePalette(paletteId) {
        this.storage.deletePalette(paletteId);
        this.loadPalettes(); // Refresh the list
        console.log(`Palette ${paletteId} deleted.`);
    }

    getCurrentPaletteColors() {
        return [...this.currentPaletteColors]; // Return a copy
    }
}