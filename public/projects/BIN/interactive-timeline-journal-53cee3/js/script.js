document.addEventListener('DOMContentLoaded', () => {
    const entryForm = document.getElementById('entry-form');
    const entryDateInput = document.getElementById('entry-date');
    const entryTitleInput = document.getElementById('entry-title');
    const entryDescriptionInput = document.getElementById('entry-description');
    const entryImageInput = document.getElementById('entry-image');
    const imagePreview = document.getElementById('image-preview');
    const entryIdInput = document.getElementById('entry-id');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    const filterStartDateInput = document.getElementById('filter-start-date');
    const filterEndDateInput = document.getElementById('filter-end-date');
    const searchTermInput = document.getElementById('search-term');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const exportDataBtn = document.getElementById('export-data-btn');

    const timelineEntriesContainer = document.getElementById('timeline-entries');

    // --- Initialization ---
    loadAndDisplayEntries();

    // --- Event Listeners ---

    // Handle Form Submission (Add/Update)
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = entryIdInput.value;
        const entryData = {
            date: entryDateInput.value,
            title: entryTitleInput.value,
            description: entryDescriptionInput.value,
            // Handle image data separately if needed, store path or base64
            image: imagePreview.src.startsWith('data:image') ? imagePreview.src : null // Store base64 if preview exists
        };

        if (id) {
            // Update existing entry
            Storage.updateEntry(id, entryData);
            UI.resetForm(); // Also clears the hidden ID and hides cancel button
        } else {
            // Add new entry
            entryData.id = Date.now().toString(); // Simple unique ID
            Storage.saveEntry(entryData);
            UI.resetForm();
        }
        loadAndDisplayEntries(); // Refresh timeline
    });

    // Image Preview Handler
    entryImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                UI.showImagePreview(event.target.result);
            }
            reader.readAsDataURL(file);
        } else {
            UI.clearImagePreview();
        }
    });

    // Cancel Edit Mode
    cancelEditBtn.addEventListener('click', () => {
        UI.resetForm();
    });

    // Filter/Search Handler
    applyFiltersBtn.addEventListener('click', () => {
        loadAndDisplayEntries(); // Re-render with current filter values
    });

    // Reset Filters/Search Handler
    resetFiltersBtn.addEventListener('click', () => {
        filterStartDateInput.value = '';
        filterEndDateInput.value = '';
        searchTermInput.value = '';
        loadAndDisplayEntries(); // Re-render without filters
    });

    // Export Data Handler
    exportDataBtn.addEventListener('click', () => {
        const allEntries = Storage.getAllEntries();
        const dataStr = JSON.stringify(allEntries, null, 2); // Pretty print JSON
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = 'timeline_journal_export.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        linkElement.remove(); // Clean up
    });

    // Event Delegation for Edit/Delete Buttons on Timeline
    timelineEntriesContainer.addEventListener('click', (e) => {
        const target = e.target;
        const entryId = target.getAttribute('data-id');

        if (target.classList.contains('edit-btn') && entryId) {
            const entry = Storage.getEntryById(entryId);
            if (entry) {
                UI.populateFormForEdit(entry);
                // Scroll to form for better UX on mobile
                entryForm.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (target.classList.contains('delete-btn') && entryId) {
            if (confirm('Are you sure you want to delete this entry?')) {
                Storage.deleteEntry(entryId);
                loadAndDisplayEntries(); // Refresh timeline
            }
        }
    });


    // --- Core Functions ---

    function loadAndDisplayEntries() {
        const filters = {
            startDate: filterStartDateInput.value,
            endDate: filterEndDateInput.value,
            searchTerm: searchTermInput.value.toLowerCase()
        };
        const entries = Storage.getFilteredEntries(filters);
        Timeline.renderTimeline(entries);
        UI.toggleNoEntriesMessage(entries.length === 0);
    }

});