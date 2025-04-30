const Storage = (() => {
    const STORAGE_KEY = 'microJournalEntries';

    // Retrieve entries from localStorage
    const getEntries = () => {
        const entriesJson = localStorage.getItem(STORAGE_KEY);
        try {
            // Parse JSON or return empty array if null/invalid
            return entriesJson ? JSON.parse(entriesJson) : [];
        } catch (e) {
            console.error("Error parsing entries from localStorage:", e);
            // If parsing fails, return empty array to prevent app crash
            return [];
        }
    };

    // Save a single entry (adds or updates)
    const saveEntry = (entryToSave) => {
        if (!entryToSave || !entryToSave.id) {
            console.error("Invalid entry object provided to saveEntry:", entryToSave);
            return;
        }
        const entries = getEntries();
        const existingEntryIndex = entries.findIndex(entry => entry.id === entryToSave.id);

        if (existingEntryIndex > -1) {
            // Update existing entry
            entries[existingEntryIndex] = entryToSave;
        } else {
            // Add new entry
            entries.push(entryToSave);
        }

        // Sort entries by date, newest first, before saving
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.error("Error saving entries to localStorage:", e);
            // Consider notifying the user if storage fails (e.g., quota exceeded)
            UI.showAlert('Error saving entry. Storage might be full.', 'error', document.body);
        }
    };

    // Delete an entry by its ID
    const deleteEntry = (entryId) => {
        let entries = getEntries();
        entries = entries.filter(entry => entry.id !== entryId);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.error("Error deleting entry from localStorage:", e);
             UI.showAlert('Error deleting entry.', 'error', document.body);
        }
    };

    // Get a single entry by ID
    const getEntryById = (entryId) => {
        const entries = getEntries();
        return entries.find(entry => entry.id === entryId);
    };

    // Public API
    return {
        getEntries,
        saveEntry,
        deleteEntry,
        getEntryById
    };
})();