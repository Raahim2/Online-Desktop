const UI = (() => {

    // Cache DOM elements
    const entryForm = document.getElementById('entry-form');
    const entryDateInput = document.getElementById('entry-date');
    const entryTitleInput = document.getElementById('entry-title');
    const entryDescriptionInput = document.getElementById('entry-description');
    const entryImageInput = document.getElementById('entry-image');
    const imagePreview = document.getElementById('image-preview');
    const entryIdInput = document.getElementById('entry-id');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const noEntriesMessage = document.getElementById('no-entries-message');
    const formSectionTitle = document.querySelector('#entry-form-section h2');
    const submitButton = entryForm.querySelector('button[type="submit"]');

    const clearImagePreview = () => {
        imagePreview.src = '#'; // Reset src
        imagePreview.classList.add('hidden');
        // Also reset the file input value so the same file can be selected again if needed
        entryImageInput.value = '';
    };

    const showImagePreview = (imageDataUrl) => {
        imagePreview.src = imageDataUrl;
        imagePreview.classList.remove('hidden');
    };

    const resetForm = () => {
        entryForm.reset(); // Resets all form fields
        entryIdInput.value = ''; // Clear hidden ID
        clearImagePreview(); // Clear image preview
        cancelEditBtn.classList.add('hidden'); // Hide cancel button
        if (formSectionTitle) {
            formSectionTitle.textContent = 'Add New Entry'; // Reset title
        }
        if (submitButton) {
             submitButton.textContent = 'Save Entry'; // Reset button text
        }
    };

    const populateFormForEdit = (entry) => {
        entryIdInput.value = entry.id;
        entryDateInput.value = entry.date;
        entryTitleInput.value = entry.title;
        entryDescriptionInput.value = entry.description || ''; // Handle potentially undefined description

        // Handle image preview for existing entry
        clearImagePreview(); // Clear any previous preview first
        if (entry.image) {
            showImagePreview(entry.image); // Assumes image is stored as base64 or accessible URL
        }

        cancelEditBtn.classList.remove('hidden'); // Show cancel button
        if (formSectionTitle) {
            formSectionTitle.textContent = 'Edit Entry'; // Change title
        }
         if (submitButton) {
             submitButton.textContent = 'Update Entry'; // Change button text
        }
    };

    const toggleNoEntriesMessage = (show) => {
        if (noEntriesMessage) {
            if (show) {
                noEntriesMessage.classList.remove('hidden');
            } else {
                noEntriesMessage.classList.add('hidden');
            }
        }
    };

    return {
        resetForm,
        populateFormForEdit,
        showImagePreview,
        clearImagePreview,
        toggleNoEntriesMessage
    };

})();