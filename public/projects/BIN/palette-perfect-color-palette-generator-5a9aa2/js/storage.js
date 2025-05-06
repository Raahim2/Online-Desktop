const StorageUtils = {
    STORAGE_KEY: 'savedPalettes_PalettePerfect',

    getSavedPalettes: function() {
        try {
            const palettesJSON = localStorage.getItem(this.STORAGE_KEY);
            if (palettesJSON) {
                const palettes = JSON.parse(palettesJSON);
                // Ensure palettes are in a consistent format, e.g., array of objects
                if (Array.isArray(palettes)) {
                    return palettes;
                }
            }
        } catch (error) {
            console.error("Error retrieving palettes from localStorage:", error);
        }
        return []; // Return empty array if no palettes or error
    },

    savePalette: function(paletteColorsArray, paletteName = null) {
        if (!Array.isArray(paletteColorsArray) || paletteColorsArray.length === 0) {
            console.error("Invalid palette data for saving.");
            return { success: false, message: "Invalid palette data." };
        }

        const palettes = this.getSavedPalettes();

        // Check for exact duplicate by color array content
        const isDuplicate = palettes.some(p =>
            p.colors.length === paletteColorsArray.length &&
            p.colors.every((c, i) => c.toLowerCase() === paletteColorsArray[i].toLowerCase())
        );

        if (isDuplicate) {
            return { success: false, message: "This exact palette is already saved." };
        }

        const newPalette = {
            id: `palette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: paletteName || `Palette ${palettes.length + 1}`,
            colors: paletteColorsArray.map(c => c.toUpperCase()), // Store hex codes consistently
            createdAt: new Date().toISOString()
        };

        palettes.unshift(newPalette); // Add new palette to the beginning

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(palettes));
            return { success: true, message: "Palette saved successfully!", palette: newPalette };
        } catch (error) {
            console.error("Error saving palette to localStorage:", error);
            if (error.name === 'QuotaExceededError') {
                 return { success: false, message: "Storage limit exceeded. Could not save palette." };
            }
            return { success: false, message: "Could not save palette due to an error." };
        }
    },

    deletePalette: function(paletteId) {
        if (!paletteId) {
            console.error("Palette ID is required for deletion.");
            return false;
        }
        let palettes = this.getSavedPalettes();
        const initialLength = palettes.length;
        palettes = palettes.filter(p => p.id !== paletteId);

        if (palettes.length < initialLength) {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(palettes));
                return true;
            } catch (error) {
                console.error("Error deleting palette from localStorage:", error);
                return false;
            }
        }
        return false; // Palette not found
    },

    updatePaletteName: function(paletteId, newName) {
        if (!paletteId || typeof newName !== 'string' || newName.trim() === '') {
            console.error("Invalid arguments for updating palette name.");
            return false;
        }
        let palettes = this.getSavedPalettes();
        const paletteIndex = palettes.findIndex(p => p.id === paletteId);

        if (paletteIndex > -1) {
            palettes[paletteIndex].name = newName.trim();
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(palettes));
                return true;
            } catch (error) {
                console.error("Error updating palette name in localStorage:", error);
                return false;
            }
        }
        return false; // Palette not found
    },

    clearAllPalettes: function() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error("Error clearing all palettes from localStorage:", error);
            return false;
        }
    },

    getPaletteById: function(paletteId) {
        if (!paletteId) return null;
        const palettes = this.getSavedPalettes();
        return palettes.find(p => p.id === paletteId) || null;
    }
};