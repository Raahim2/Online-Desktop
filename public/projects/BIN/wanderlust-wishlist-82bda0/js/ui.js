function createTagElement(tagText) {
    const tag = document.createElement('span');
    // Basic styling, can be enhanced with more colors/logic if needed
    tag.className = 'inline-block bg-cyan-100 text-cyan-800 text-xs font-medium mr-2 mb-1 px-2.5 py-0.5 rounded';
    tag.textContent = tagText;
    return tag;
}

function createDestinationCard(destination) {
    const card = document.createElement('div');
    card.className = 'destination-card bg-white rounded-lg shadow-md overflow-hidden cursor-move transition-shadow duration-200 hover:shadow-lg';
    card.setAttribute('draggable', true);
    card.dataset.id = destination.id; // Store ID for later reference
    card.dataset.order = destination.order; // Store order

    const imageSrc = destination.imageDataUrl || 'assets/placeholder.svg';

    card.innerHTML = `
        <img src="${imageSrc}" alt="${destination.title || 'Destination Image'}" class="w-full h-48 object-cover destination-image">
        <div class="p-4">
            <h3 class="text-xl font-semibold mb-2 destination-title">${destination.title}</h3>
            <p class="text-gray-600 text-sm mb-2 destination-description">${destination.description || ''}</p>
            ${destination.budget ? `<p class="text-sm text-gray-800 font-medium mb-2">Budget: $<span class="destination-budget">${destination.budget}</span></p>` : ''}
            <div class="mb-3 destination-tags">
                ${destination.tags && destination.tags.length > 0 ? destination.tags.map(tag => `<span class="inline-block bg-cyan-100 text-cyan-800 text-xs font-medium mr-2 mb-1 px-2.5 py-0.5 rounded">${tag}</span>`).join('') : '<span class="text-xs text-gray-400 italic">No tags</span>'}
            </div>
            ${destination.notes ? `
            <details class="text-sm text-gray-500 mb-3">
                <summary class="cursor-pointer hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1">Notes</summary>
                <p class="mt-1 p-2 bg-gray-50 rounded border border-gray-200 destination-notes">${destination.notes}</p>
            </details>
            ` : ''}
            <div class="mt-4 flex justify-end space-x-2">
                <button class="edit-btn text-xs text-blue-500 hover:text-blue-700 font-medium py-1 px-2 rounded hover:bg-blue-50 transition-colors duration-150" data-id="${destination.id}">Edit</button>
                <button class="delete-btn text-xs text-red-500 hover:text-red-700 font-medium py-1 px-2 rounded hover:bg-red-50 transition-colors duration-150" data-id="${destination.id}">Delete</button>
            </div>
        </div>
    `;
    return card;
}

function renderWishlist(destinations, container) {
    container.innerHTML = ''; // Clear existing content
    const sortedDestinations = destinations.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    sortedDestinations.forEach(destination => {
        const card = createDestinationCard(destination);
        container.appendChild(card);
    });
    updateEmptyMessageVisibility();
}

function addDestinationCard(destination, container) {
    const card = createDestinationCard(destination);
    container.appendChild(card); // Add to the end by default
    updateEmptyMessageVisibility();
}

function removeDestinationCard(cardElement) {
    if (cardElement && cardElement.parentNode) {
        cardElement.parentNode.removeChild(cardElement);
        updateEmptyMessageVisibility();
    }
}

function updateDestinationCard(id, updatedData) {
    const card = document.querySelector(`.destination-card[data-id="${id}"]`);
    if (card) {
        const titleEl = card.querySelector('.destination-title');
        const descEl = card.querySelector('.destination-description');
        const budgetEl = card.querySelector('.destination-budget');
        const budgetContainer = budgetEl ? budgetEl.closest('p') : null;
        const tagsContainer = card.querySelector('.destination-tags');
        const notesDetailsEl = card.querySelector('details');
        const notesPEl = card.querySelector('.destination-notes');
        const imageEl = card.querySelector('.destination-image');

        if (titleEl) titleEl.textContent = updatedData.title;
        if (descEl) descEl.textContent = updatedData.description || '';
        if (imageEl) {
            imageEl.src = updatedData.imageDataUrl || 'assets/placeholder.svg';
            imageEl.alt = updatedData.title || 'Destination Image';
        }

        // Update or add/remove budget display
        if (updatedData.budget) {
            if (budgetEl) {
                budgetEl.textContent = updatedData.budget;
                if (budgetContainer) budgetContainer.style.display = ''; // Ensure visible
            } else {
                // Need to create and insert the budget paragraph if it didn't exist
                const newBudgetP = document.createElement('p');
                newBudgetP.className = 'text-sm text-gray-800 font-medium mb-2';
                newBudgetP.innerHTML = `Budget: $<span class="destination-budget">${updatedData.budget}</span>`;
                // Insert it before the tags container, or adjust as needed based on layout
                 if (tagsContainer) {
                    tagsContainer.parentNode.insertBefore(newBudgetP, tagsContainer);
                 } else if (notesDetailsEl) {
                     notesDetailsEl.parentNode.insertBefore(newBudgetP, notesDetailsEl);
                 } else {
                     // Append if nothing else is there (adjust logic if needed)
                     card.querySelector('.p-4').appendChild(newBudgetP);
                 }
            }
        } else if (budgetContainer) {
            budgetContainer.style.display = 'none'; // Hide if budget removed
        }


        // Update tags
        if (tagsContainer) {
            tagsContainer.innerHTML = ''; // Clear existing tags
            if (updatedData.tags && updatedData.tags.length > 0) {
                updatedData.tags.forEach(tagText => {
                    tagsContainer.appendChild(createTagElement(tagText));
                });
            } else {
                tagsContainer.innerHTML = '<span class="text-xs text-gray-400 italic">No tags</span>';
            }
        }

        // Update or add/remove notes display
        if (updatedData.notes) {
            if (notesDetailsEl && notesPEl) {
                notesPEl.textContent = updatedData.notes;
                notesDetailsEl.style.display = ''; // Ensure visible
            } else if (notesDetailsEl) { // Details exists, but maybe p is missing? Recreate
                 notesDetailsEl.innerHTML = `
                    <summary class="cursor-pointer hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1">Notes</summary>
                    <p class="mt-1 p-2 bg-gray-50 rounded border border-gray-200 destination-notes">${updatedData.notes}</p>
                 `;
                 notesDetailsEl.style.display = '';
            } else {
                // Need to create and insert the details element if it didn't exist
                const newDetails = document.createElement('details');
                newDetails.className = 'text-sm text-gray-500 mb-3';
                newDetails.innerHTML = `
                    <summary class="cursor-pointer hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1">Notes</summary>
                    <p class="mt-1 p-2 bg-gray-50 rounded border border-gray-200 destination-notes">${updatedData.notes}</p>
                `;
                 // Insert before action buttons
                 const actionsDiv = card.querySelector('.flex.justify-end');
                 if (actionsDiv) {
                     actionsDiv.parentNode.insertBefore(newDetails, actionsDiv);
                 } else {
                     card.querySelector('.p-4').appendChild(newDetails); // Fallback append
                 }
            }
        } else if (notesDetailsEl) {
            notesDetailsEl.style.display = 'none'; // Hide if notes removed
        }

    } else {
        console.warn("Could not find card to update with ID:", id);
    }
}


function clearForm(formElement, imagePreviewElement = null) {
    if (formElement) {
        formElement.reset();
    }
    if (imagePreviewElement) {
        imagePreviewElement.src = '#'; // Reset src
        imagePreviewElement.classList.add('hidden'); // Hide preview
    }
     // Reset file input visually (though the internal file list is reset by form.reset())
    const fileInput = formElement ? formElement.querySelector('input[type="file"]') : null;
    if (fileInput) {
        // Creating a new input element and replacing the old one is a robust way
        // but might break event listeners if not careful.
        // Simpler approach: just clear value (works in most modern browsers)
        try {
            fileInput.value = null;
        } catch (e) {
            console.log("Couldn't clear file input value directly.");
        }
    }
}

function previewImage(inputElement, previewElement) {
    const file = inputElement.files[0];
    if (file && previewElement) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewElement.src = e.target.result;
            previewElement.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    } else if (previewElement) {
        previewElement.src = '#'; // Reset src
        previewElement.classList.add('hidden'); // Hide if no file selected
    }
}

function showEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Optional: focus first input
        const firstInput = modal.querySelector('input:not([type=hidden]), textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

function hideEditModal() {
    const modal = document.getElementById('edit-modal');
    const form = document.getElementById('edit-destination-form');
    const preview = document.getElementById('edit-image-preview');
    if (modal) {
        modal.classList.add('hidden');
    }
     // Clear the form when hiding
    clearForm(form, preview);
}

function populateEditModal(destination) {
    document.getElementById('edit-destination-id').value = destination.id;
    document.getElementById('edit-destination-title').value = destination.title;
    document.getElementById('edit-destination-description').value = destination.description || '';
    document.getElementById('edit-destination-notes').value = destination.notes || '';
    document.getElementById('edit-destination-budget').value = destination.budget || '';
    document.getElementById('edit-destination-tags').value = destination.tags ? destination.tags.join(', ') : '';

    const imagePreview = document.getElementById('edit-image-preview');
    if (destination.imageDataUrl && destination.imageDataUrl !== 'assets/placeholder.svg') {
        imagePreview.src = destination.imageDataUrl;
        imagePreview.classList.remove('hidden');
    } else {
        imagePreview.src = '#'; // Reset src
        imagePreview.classList.add('hidden');
    }
     // Clear any previously selected file in the input
    const fileInput = document.getElementById('edit-destination-image-input');
    if (fileInput) {
         try { fileInput.value = null; } catch(e) {}
    }
}

function updateEmptyMessageVisibility() {
    const container = document.getElementById('wishlist-container');
    const message = document.getElementById('empty-wishlist-message');
    if (container && message) {
        const cardCount = container.querySelectorAll('.destination-card').length;
        if (cardCount === 0) {
            message.classList.remove('hidden');
        } else {
            message.classList.add('hidden');
        }
    }
}