const StorageManager = (() => {
    const STORAGE_KEY = 'sereneScenes_customSoundscapes';

    const getAllSoundscapes = () => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            try {
                return JSON.parse(storedData);
            } catch (e) {
                console.error("Error parsing soundscapes from localStorage:", e);
                return {};
            }
        }
        return {};
    };

    const saveSoundscape = (name, configuration) => {
        if (!name || typeof name !== 'string' || name.trim() === "") {
            console.error("Invalid soundscape name provided for saving.");
            return false;
        }
        if (!configuration || typeof configuration !== 'object' || Object.keys(configuration).length === 0) {
            console.error("Invalid soundscape configuration provided for saving.");
            return false;
        }

        const soundscapes = getAllSoundscapes();
        soundscapes[name.trim()] = configuration;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(soundscapes));
            return true;
        } catch (e) {
            console.error("Error saving soundscape to localStorage:", e);
            // Potentially handle quota exceeded error
            if (e.name === 'QuotaExceededError') {
                alert("Could not save soundscape. Local storage is full. Please try deleting some saved soundscapes.");
            }
            return false;
        }
    };

    const getSoundscape = (name) => {
        if (!name || typeof name !== 'string') {
            return null;
        }
        const soundscapes = getAllSoundscapes();
        return soundscapes[name] || null;
    };

    const deleteSoundscape = (name) => {
        if (!name || typeof name !== 'string') {
            console.error("Invalid soundscape name provided for deletion.");
            return false;
        }
        const soundscapes = getAllSoundscapes();
        if (soundscapes.hasOwnProperty(name)) {
            delete soundscapes[name];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(soundscapes));
                return true;
            } catch (e) {
                console.error("Error deleting soundscape from localStorage:", e);
                return false;
            }
        }
        return false; // Soundscape not found
    };

    return {
        getAllSoundscapes,
        saveSoundscape,
        getSoundscape,
        deleteSoundscape
    };
})();