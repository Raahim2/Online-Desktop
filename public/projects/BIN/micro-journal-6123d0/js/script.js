document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const entryForm = document.getElementById('entry-form');
    const entryText = document.getElementById('entry-text');
    const entryMoodHiddenInput = document.getElementById('entry-mood');
    const moodSelectors = document.querySelectorAll('.mood-selector');
    const wordCountDisplay = document.getElementById('word-count');
    const saveButton = document.getElementById('save-button');
    const clearButton = document.getElementById('clear-button');
    const searchInput = document.getElementById('search-input');
    const moodFilter = document.getElementById('mood-filter');
    const entriesList = document.getElementById('entries-list');
    const exportButton = document.getElementById('export-button');
    const entryDateDisplay = document.getElementById('entry-date');
    const currentYearSpan = document.getElementById('current-year');

    let currentEditingId = null; // To track if we are editing an existing entry

    // --- Initialization ---
    loadEntries();
    UI.updateDateDisplay(entryDateDisplay); // Set initial date display
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }


    // --- Event Listeners ---

    // Entry Form Submission (Save/Update)
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = entryText.value.trim();
        const mood = entryMoodHiddenInput.value;
        const date = new Date(); // Use current date/time for new/updated entries

        if (!text) {
            UI.showAlert('Please write something before saving.', 'warning', entryForm);
            return;
        }

        const entry = {
            id: currentEditingId || Date.now().toString(), // Use existing ID if editing, else generate new
            date: date.toISOString(),
            text: text,
            mood: mood
        };

        Storage.saveEntry(entry);
        UI.clearEditor(entryText, entryMoodHiddenInput, wordCountDisplay, moodSelectors, entryDateDisplay);
        loadEntries(); // Reload list to show the new/updated entry
        UI.showAlert(`Entry ${currentEditingId ? 'updated' : 'saved'} successfully!`, 'success', entryForm);
        currentEditingId = null; // Reset editing state
        saveButton.textContent = 'Save Entry';
    });

    // Clear Editor / New Entry Button
    clearButton.addEventListener('click', () => {
        UI.clearEditor(entryText, entryMoodHiddenInput, wordCountDisplay, moodSelectors, entryDateDisplay);
        currentEditingId = null; // Ensure we are not editing
        saveButton.textContent = 'Save Entry';
        entryText.focus();
    });

    // Word Count Update
    entryText.addEventListener('input', () => {
        UI.updateWordCount(entryText, wordCountDisplay);
    });

    // Mood Selection
    moodSelectors.forEach(button => {
        button.addEventListener('click', () => {
            const selectedMood = button.getAttribute('data-mood');
            UI.selectMood(selectedMood, entryMoodHiddenInput, moodSelectors);
        });
    });

    // Search Input
    searchInput.addEventListener('input', () => {
        filterAndDisplayEntries();
    });

    // Mood Filter Change
    moodFilter.addEventListener('change', () => {
        filterAndDisplayEntries();
    });

    // Export Button
    exportButton.addEventListener('click', () => {
        const entries = Storage.getEntries();
        if (entries.length === 0) {
            UI.showAlert('No entries to export.', 'info', document.body);
            return;
        }
        try {
            const textData = UI.formatEntriesForExport(entries);
            UI.triggerDownload(textData, 'micro-journal-export.txt');
        } catch (error) {
            console.error("Export failed:", error);
            UI.showAlert('Failed to export entries.', 'error', document.body);
        }
    });

    // Event Delegation for Edit/Delete on Entries List
    entriesList.addEventListener('click', (e) => {
        // Edit Button Click
        if (e.target.closest('.edit-entry-button')) {
            const button = e.target.closest('.edit-entry-button');
            const entryId = button.getAttribute('data-id');
            const entry = Storage.getEntryById(entryId);
            if (entry) {
                currentEditingId = entry.id;
                entryText.value = entry.text;
                UI.selectMood(entry.mood, entryMoodHiddenInput, moodSelectors);
                UI.updateWordCount(entryText, wordCountDisplay);
                UI.updateDateDisplay(entryDateDisplay, new Date(entry.date)); // Show original date when editing
                saveButton.textContent = 'Update Entry';
                entryText.focus();
                // Scroll to top might be helpful
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        // Delete Button Click
        if (e.target.closest('.delete-entry-button')) {
            const button = e.target.closest('.delete-entry-button');
            const entryId = button.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this entry?')) {
                Storage.deleteEntry(entryId);
                if (currentEditingId === entryId) { // If deleting the entry currently being edited
                    UI.clearEditor(entryText, entryMoodHiddenInput, wordCountDisplay, moodSelectors, entryDateDisplay);
                    currentEditingId = null;
                    saveButton.textContent = 'Save Entry';
                }
                loadEntries(); // Reload list
                UI.showAlert('Entry deleted.', 'info', document.body, 3000);
            }
        }
    });


    // --- Core Functions ---

    // Load entries from storage and display them
    function loadEntries() {
        filterAndDisplayEntries(); // Initial load uses the filter function
    }

    // Filter entries based on search and mood, then display
    function filterAndDisplayEntries() {
        const allEntries = Storage.getEntries();
        const searchTerm = searchInput.value.toLowerCase();
        const selectedMood = moodFilter.value;

        const filteredEntries = allEntries.filter(entry => {
            const textMatch = !searchTerm || entry.text.toLowerCase().includes(searchTerm);
            const moodMatch = !selectedMood || (selectedMood === 'none' ? !entry.mood : entry.mood === selectedMood);
            return textMatch && moodMatch;
        });

        UI.displayEntries(filteredEntries, entriesList);
    }

});