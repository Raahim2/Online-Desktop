const GratitudeStorage = (() => {
    const STORAGE_KEY = 'gratitudeJarEntries';

    // Helper function to get entries from localStorage
    const getEntries = () => {
        const entriesJson = localStorage.getItem(STORAGE_KEY);
        try {
            return entriesJson ? JSON.parse(entriesJson) : [];
        } catch (e) {
            console.error("Error parsing gratitude entries from localStorage:", e);
            // If parsing fails, return empty array to prevent app crash
            // Optionally, clear the corrupted data: localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    };

    // Helper function to save entries to localStorage
    const saveEntries = (entries) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.error("Error saving gratitude entries to localStorage:", e);
            // Handle potential storage quota exceeded errors if necessary
            alert("Could not save the entry. Browser storage might be full.");
        }
    };

    // Public methods
    return {
        getAllEntries: () => {
            return getEntries();
        },

        addEntry: (newEntry) => {
            if (!newEntry || typeof newEntry !== 'object' || !newEntry.id || !newEntry.description) {
                 console.error("Attempted to add invalid entry:", newEntry);
                 return;
            }
            const entries = getEntries();
            // Ensure no duplicate IDs, though highly unlikely with the current ID generation
            if (entries.some(entry => entry.id === newEntry.id)) {
                console.warn(`Entry with ID ${newEntry.id} already exists. Skipping add.`);
                return; // Or handle update/replacement if needed
            }
            entries.push(newEntry);
            saveEntries(entries);
        },

        deleteEntry: (entryId) => {
             if (!entryId) {
                 console.error("Attempted to delete entry with invalid ID.");
                 return;
             }
            let entries = getEntries();
            const initialLength = entries.length;
            entries = entries.filter(entry => entry.id !== entryId);
            if (entries.length < initialLength) {
                saveEntries(entries);
            } else {
                 console.warn(`Entry with ID ${entryId} not found for deletion.`);
            }
        },

        getEntryById: (entryId) => {
            if (!entryId) return null;
            const entries = getEntries();
            return entries.find(entry => entry.id === entryId) || null;
        },

        // Optional: Update entry functionality could be added here
        // updateEntry: (updatedEntry) => {
        //     if (!updatedEntry || !updatedEntry.id) return;
        //     let entries = getEntries();
        //     const index = entries.findIndex(entry => entry.id === updatedEntry.id);
        //     if (index !== -1) {
        //         entries[index] = { ...entries[index], ...updatedEntry }; // Merge updates
        //         saveEntries(entries);
        //     } else {
        //          console.warn(`Entry with ID ${updatedEntry.id} not found for update.`);
        //     }
        // }
    };
})();