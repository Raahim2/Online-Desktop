class Storage {
    constructor(storageKey) {
        if (!storageKey || typeof storageKey !== 'string') {
            throw new Error("Storage requires a valid string key.");
        }
        this.storageKey = storageKey;
        this.localStorageAvailable = this._checkLocalStorage();
    }

    _checkLocalStorage() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn("LocalStorage is not available. Palettes will not be saved.", e);
            return false;
        }
    }

    getAllPalettes() {
        if (!this.localStorageAvailable) {
            return {};
        }
        try {
            const palettesJSON = localStorage.getItem(this.storageKey);
            return palettesJSON ? JSON.parse(palettesJSON) : {};
        } catch (e) {
            console.error("Error reading palettes from localStorage:", e);
            // Attempt to clear potentially corrupted data
            // localStorage.removeItem(this.storageKey);
            return {}; // Return empty object on error
        }
    }

    getPalette(id) {
        const palettes = this.getAllPalettes();
        return palettes[id] || null;
    }

    savePalette(id, colorsArray) {
        if (!this.localStorageAvailable) {
            console.warn("Cannot save palette: LocalStorage not available.");
            return false;
        }
        if (!id || !Array.isArray(colorsArray)) {
             console.error("Invalid arguments for savePalette. Requires id (string) and colorsArray (array).");
             return false;
        }

        try {
            const palettes = this.getAllPalettes();
            palettes[id] = colorsArray;
            localStorage.setItem(this.storageKey, JSON.stringify(palettes));
            return true;
        } catch (e) {
            console.error("Error saving palette to localStorage:", e);
            if (e.name === 'QuotaExceededError') {
                alert("Storage limit exceeded. Could not save palette. Try deleting old palettes.");
            }
            return false;
        }
    }

    deletePalette(id) {
        if (!this.localStorageAvailable) {
             console.warn("Cannot delete palette: LocalStorage not available.");
            return false;
        }
         if (!id) {
             console.error("Invalid arguments for deletePalette. Requires id (string).");
             return false;
        }

        try {
            const palettes = this.getAllPalettes();
            if (palettes[id]) {
                delete palettes[id];
                localStorage.setItem(this.storageKey, JSON.stringify(palettes));
                return true;
            }
            return false; // Palette didn't exist
        } catch (e) {
            console.error("Error deleting palette from localStorage:", e);
            return false;
        }
    }
}