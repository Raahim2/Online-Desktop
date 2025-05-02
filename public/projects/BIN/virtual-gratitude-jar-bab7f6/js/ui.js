const GratitudeUI = (() => {
    const entriesContainer = document.getElementById('entries-container');
    const noEntriesMessage = document.getElementById('no-entries-message');
    const entryModal = document.getElementById('entry-modal');
    const modalTitle = document.getElementById('modal-entry-title');
    const modalDate = document.getElementById('modal-entry-date');
    const modalDescription = document.getElementById('modal-entry-description');
    const modalTagsContainer = document.getElementById('modal-entry-tags');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const deleteEntryBtn = document.getElementById('delete-entry-btn');

    let currentModalEntryId = null; // Store the ID of the entry currently in the modal

    const formatDate = (isoString) => {
        if (!isoString) return 'Unknown date';
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const createEntryCard = (entry) => {
        const card = document.createElement('div');
        card.className = 'gratitude-entry bg-white p-4 rounded-lg shadow border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200 ease-in-out';
        card.dataset.id = entry.id;

        let tagsHtml = '';
        if (entry.tags && entry.tags.length > 0) {
            tagsHtml = `<div class="mt-2 flex flex-wrap gap-1">
                ${entry.tags.map(tag => `<span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">${tag}</span>`).join('')}
            </div>`;
        }

        // Truncate long descriptions for the card view
        const shortDescription = entry.description.length > 100
            ? entry.description.substring(0, 100) + '...'
            : entry.description;

        card.innerHTML = `
            ${entry.title ? `<h3 class="text-lg font-semibold text-gray-800 mb-1">${entry.title}</h3>` : ''}
            <p class="text-gray-600 text-sm mb-2">${shortDescription}</p>
            <p class="text-xs text-gray-400 mb-2">${formatDate(entry.timestamp)}</p>
            ${tagsHtml}
        `;
        return card;
    };

    const displayEntries = (entries) => {
        entriesContainer.innerHTML = ''; // Clear existing entries
        if (entries && entries.length > 0) {
            entries.forEach(entry => {
                const card = createEntryCard(entry);
                entriesContainer.appendChild(card);
            });
        }
    };

    const updateNoEntriesMessage = (entryCount, isSearchActive = false) => {
        if (entryCount === 0) {
            noEntriesMessage.textContent = isSearchActive
                ? 'No notes match your search.'
                : 'Your jar is empty. Add a note to start collecting moments!';
            noEntriesMessage.classList.remove('hidden');
            noEntriesMessage.classList.add('block'); // Ensure it's displayed
        } else {
            noEntriesMessage.classList.add('hidden');
            noEntriesMessage.classList.remove('block');
        }
    };

    const clearForm = (formElement) => {
        if (formElement) {
            formElement.reset();
            // Explicitly clear textarea if reset doesn't work reliably for it
             const textarea = formElement.querySelector('textarea');
             if (textarea) textarea.value = '';
             const titleInput = formElement.querySelector('#entry-title');
             if (titleInput) titleInput.value = '';
             const tagsInput = formElement.querySelector('#entry-tags');
             if (tagsInput) tagsInput.value = '';
        }
    };

    const showModal = (entry) => {
        if (!entry) return;
        currentModalEntryId = entry.id; // Store the ID

        modalTitle.textContent = entry.title || 'Gratitude Note';
        modalDate.textContent = `Recorded on: ${formatDate(entry.timestamp)}`;
        modalDescription.textContent = entry.description;

        modalTagsContainer.innerHTML = ''; // Clear previous tags
        if (entry.tags && entry.tags.length > 0) {
            entry.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'text-sm bg-teal-100 text-teal-800 px-3 py-1 rounded-full';
                tagElement.textContent = tag;
                modalTagsContainer.appendChild(tagElement);
            });
        } else {
             modalTagsContainer.innerHTML = '<span class="text-sm text-gray-500 italic">No tags</span>';
        }

        // Set data-id on delete button for script.js to use
        deleteEntryBtn.dataset.id = entry.id;

        entryModal.classList.remove('hidden');
        // Trigger transition
        requestAnimationFrame(() => {
            entryModal.classList.remove('opacity-0');
            entryModal.querySelector('.transform').classList.remove('scale-95');
            entryModal.querySelector('.transform').classList.add('scale-100');
        });
    };

    const hideModal = () => {
        currentModalEntryId = null; // Clear the stored ID
        entryModal.classList.add('opacity-0');
        entryModal.querySelector('.transform').classList.add('scale-95');
        entryModal.querySelector('.transform').classList.remove('scale-100');
        // Wait for transition to finish before hiding
        setTimeout(() => {
            entryModal.classList.add('hidden');
        }, 300); // Match transition duration in index.html style/Tailwind config
    };

    // --- Modal Event Listeners ---
    closeModalBtn.addEventListener('click', hideModal);
    deleteEntryBtn.addEventListener('click', () => {
        if (currentModalEntryId && typeof window.handleDeleteEntry === 'function') {
            window.handleDeleteEntry(currentModalEntryId); // Call function defined in script.js
        } else {
             console.error("Could not delete entry: ID missing or handler not found.");
        }
    });

    // Close modal if clicking outside the content area
    entryModal.addEventListener('click', (e) => {
        if (e.target === entryModal) { // Check if the click is on the backdrop itself
            hideModal();
        }
    });

    // Close modal on Escape key press
     document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !entryModal.classList.contains('hidden')) {
            hideModal();
        }
    });


    // Public API
    return {
        displayEntries,
        updateNoEntriesMessage,
        clearForm,
        showModal,
        hideModal
    };
})();