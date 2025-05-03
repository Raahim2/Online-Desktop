const Storage = (() => {
    const STORAGE_KEY = 'timelineEntries';

    // Helper function to get entries from localStorage
    const getEntries = () => {
        const entriesJson = localStorage.getItem(STORAGE_KEY);
        try {
            return entriesJson ? JSON.parse(entriesJson) : [];
        } catch (e) {
            console.error("Error parsing timeline entries from localStorage:", e);
            return []; // Return empty array on error
        }
    };

    // Helper function to save entries to localStorage
    const saveEntries = (entries) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.error("Error saving timeline entries to localStorage:", e);
            // Consider adding user feedback here if storage fails (e.g., quota exceeded)
        }
    };

    const getAllEntries = () => {
        return getEntries();
    };

    const saveEntry = (newEntry) => {
        if (!newEntry || !newEntry.id || !newEntry.date || !newEntry.title) {
            console.error("Attempted to save invalid entry:", newEntry);
            return; // Basic validation
        }
        const entries = getEntries();
        // Prevent duplicates just in case
        if (!entries.some(entry => entry.id === newEntry.id)) {
            entries.push(newEntry);
            saveEntries(entries);
        } else {
            console.warn(`Entry with ID ${newEntry.id} already exists. Use updateEntry instead.`);
            // Optionally, update if exists, but saveEntry implies adding new
            // updateEntry(newEntry.id, newEntry);
        }
    };

    const updateEntry = (id, updatedEntryData) => {
        let entries = getEntries();
        const entryIndex = entries.findIndex(entry => entry.id === id);

        if (entryIndex !== -1) {
            // Merge existing data with updated data, preserving the original ID
            entries[entryIndex] = { ...entries[entryIndex], ...updatedEntryData, id: id };
            saveEntries(entries);
        } else {
            console.error(`Entry with ID ${id} not found for update.`);
        }
    };

    const deleteEntry = (id) => {
        let entries = getEntries();
        const filteredEntries = entries.filter(entry => entry.id !== id);
        // Check if an entry was actually removed
        if (entries.length !== filteredEntries.length) {
            saveEntries(filteredEntries);
        } else {
             console.warn(`Attempted to delete non-existent entry with ID ${id}.`);
        }
    };

    const getEntryById = (id) => {
        const entries = getEntries();
        return entries.find(entry => entry.id === id);
    };

    const getFilteredEntries = (filters = {}) => {
        let entries = getEntries();
        const { startDate, endDate, searchTerm } = filters;

        if (startDate) {
            entries = entries.filter(entry => entry.date >= startDate);
        }
        if (endDate) {
            entries = entries.filter(entry => entry.date <= endDate);
        }
        if (searchTerm && searchTerm.trim() !== '') {
            const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
            entries = entries.filter(entry =>
                entry.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                (entry.description && entry.description.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        // Always return sorted by date by default for consistency
        return entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    };


    return {
        getAllEntries,
        saveEntry,
        updateEntry,
        deleteEntry,
        getEntryById,
        getFilteredEntries
    };

})();