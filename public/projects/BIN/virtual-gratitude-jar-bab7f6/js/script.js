document.addEventListener('DOMContentLoaded', () => {
    const addEntryForm = document.getElementById('add-entry-form');
    const searchInput = document.getElementById('search-input');
    const entriesContainer = document.getElementById('entries-container');
    const randomEntryBtn = document.getElementById('random-entry-btn');
    const exportBtn = document.getElementById('export-btn');
    const noEntriesMessage = document.getElementById('no-entries-message');

    // --- Event Listeners ---

    // Add Entry Form Submission
    addEntryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('entry-title').value.trim();
        const description = document.getElementById('entry-description').value.trim();
        const tagsInput = document.getElementById('entry-tags').value.trim();

        if (!description) {
            alert('Please enter a description for your gratitude note.');
            return;
        }

        const newEntry = {
            id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: title,
            description: description,
            tags: tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
            timestamp: new Date().toISOString()
        };

        GratitudeStorage.addEntry(newEntry);
        GratitudeUI.clearForm(addEntryForm);
        loadAndDisplayEntries();
    });

    // Search Input
    searchInput.addEventListener('input', () => {
        loadAndDisplayEntries();
    });

    // Random Entry Button
    randomEntryBtn.addEventListener('click', () => {
        const allEntries = GratitudeStorage.getAllEntries();
        if (allEntries.length === 0) {
            alert('Your gratitude jar is empty. Add some notes first!');
            return;
        }
        const randomIndex = Math.floor(Math.random() * allEntries.length);
        const randomEntry = allEntries[randomIndex];
        GratitudeUI.showModal(randomEntry);
    });

    // Export Button
    exportBtn.addEventListener('click', () => {
        const allEntries = GratitudeStorage.getAllEntries();
        if (allEntries.length === 0) {
            alert('Nothing to export. Your gratitude jar is empty.');
            return;
        }
        exportEntriesToText(allEntries);
    });

    // Click on Entry Card (Event Delegation)
    entriesContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.gratitude-entry');
        if (card && card.dataset.id) {
            const entryId = card.dataset.id;
            const entry = GratitudeStorage.getEntryById(entryId);
            if (entry) {
                GratitudeUI.showModal(entry);
            }
        }
    });

    // --- Functions ---

    function loadAndDisplayEntries() {
        const searchTerm = searchInput.value.toLowerCase();
        let entries = GratitudeStorage.getAllEntries();

        if (searchTerm) {
            entries = entries.filter(entry =>
                entry.title.toLowerCase().includes(searchTerm) ||
                entry.description.toLowerCase().includes(searchTerm) ||
                entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Sort entries by date, newest first
        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        GratitudeUI.displayEntries(entries);
        GratitudeUI.updateNoEntriesMessage(entries.length, !!searchTerm); // Pass search status
    }

    function exportEntriesToText(entries) {
        let textContent = "My Gratitude Jar Entries\n=========================\n\n";

        entries.forEach(entry => {
            textContent += `Date: ${new Date(entry.timestamp).toLocaleDateString()} ${new Date(entry.timestamp).toLocaleTimeString()}\n`;
            if (entry.title) {
                textContent += `Title: ${entry.title}\n`;
            }
            textContent += `Note: ${entry.description}\n`;
            if (entry.tags.length > 0) {
                textContent += `Tags: ${entry.tags.join(', ')}\n`;
            }
            textContent += `-------------------------\n\n`;
        });

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'gratitude_jar_export.txt';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // Public method to be called by UI when an entry is deleted from the modal
    window.handleDeleteEntry = (entryId) => {
        if (confirm('Are you sure you want to delete this gratitude note?')) {
            GratitudeStorage.deleteEntry(entryId);
            GratitudeUI.hideModal();
            loadAndDisplayEntries();
        }
    };


    // --- Initial Load ---
    function initApp() {
        loadAndDisplayEntries();
    }

    initApp();

});