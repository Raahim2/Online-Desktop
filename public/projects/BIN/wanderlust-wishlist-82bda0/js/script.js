document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addDestinationForm = document.getElementById('add-destination-form');
    const wishlistContainer = document.getElementById('wishlist-container');
    const editModal = document.getElementById('edit-modal');
    const editDestinationForm = document.getElementById('edit-destination-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const imageInput = document.getElementById('destination-image');
    const imagePreview = document.getElementById('image-preview');
    const editImageInput = document.getElementById('edit-destination-image-input');
    const editImagePreview = document.getElementById('edit-image-preview');

    // --- Initialization ---
    loadInitialDestinations();
    initializeDragAndDrop(wishlistContainer, updateDestinationOrder); // From dragdrop.js

    // --- Event Listeners ---

    // Add Destination Form Submission
    addDestinationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddDestination();
    });

    // Image Preview for Add Form
    imageInput.addEventListener('change', (e) => {
        previewImage(e.target, imagePreview); // From ui.js
    });

     // Image Preview for Edit Form
    editImageInput.addEventListener('change', (e) => {
        previewImage(e.target, editImagePreview); // From ui.js
    });

    // Wishlist Container Event Delegation (Edit/Delete)
    wishlistContainer.addEventListener('click', (e) => {
        const target = e.target;
        const card = target.closest('.destination-card');
        if (!card) return;

        const id = card.dataset.id;

        if (target.classList.contains('delete-btn')) {
            handleDeleteDestination(id, card);
        } else if (target.classList.contains('edit-btn')) {
            handleEditDestination(id);
        }
    });

    // Edit Modal Form Submission
    editDestinationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUpdateDestination();
    });

    // Close/Cancel Edit Modal
    closeModalBtn.addEventListener('click', () => hideEditModal()); // From ui.js
    cancelEditBtn.addEventListener('click', () => hideEditModal()); // From ui.js
    editModal.addEventListener('click', (e) => {
        // Close if clicking outside the modal content
        if (e.target === editModal) {
            hideEditModal(); // From ui.js
        }
    });


    // --- Handler Functions ---

    function handleAddDestination() {
        const title = document.getElementById('destination-title').value.trim();
        const description = document.getElementById('destination-description').value.trim();
        const notes = document.getElementById('destination-notes').value.trim();
        const budget = document.getElementById('destination-budget').value;
        const tags = document.getElementById('destination-tags').value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);
        const imageFile = imageInput.files[0];

        if (!title) {
            alert('Destination title is required.');
            return;
        }

        const newDestination = {
            id: `dest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title,
            description,
            notes,
            budget: budget ? parseFloat(budget) : null,
            tags,
            imageDataUrl: null, // Placeholder
            order: getDestinations().length // Append to the end initially
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                newDestination.imageDataUrl = reader.result;
                saveAndRenderNewDestination(newDestination);
            };
            reader.readAsDataURL(imageFile);
        } else {
             newDestination.imageDataUrl = 'assets/placeholder.svg'; // Use placeholder if no image
             saveAndRenderNewDestination(newDestination);
        }
    }

     function saveAndRenderNewDestination(destination) {
        addDestination(destination); // From storage.js
        addDestinationCard(destination, wishlistContainer); // From ui.js
        clearForm(addDestinationForm, imagePreview); // From ui.js
        updateEmptyMessageVisibility(); // From ui.js
        // Re-initialize drag and drop listeners for the new card
        initializeDragAndDrop(wishlistContainer, updateDestinationOrder);
    }


    function handleDeleteDestination(id, cardElement) {
        if (confirm('Are you sure you want to delete this destination?')) {
            deleteDestination(id); // From storage.js
            removeDestinationCard(cardElement); // From ui.js
            updateEmptyMessageVisibility(); // From ui.js
            // Update order of remaining items
            updateDestinationOrder();
        }
    }

    function handleEditDestination(id) {
        const destination = getDestinations().find(dest => dest.id === id); // From storage.js
        if (destination) {
            populateEditModal(destination); // From ui.js
            showEditModal(); // From ui.js
        } else {
            console.error("Destination not found for editing:", id);
        }
    }

    function handleUpdateDestination() {
        const id = document.getElementById('edit-destination-id').value;
        const title = document.getElementById('edit-destination-title').value.trim();
        const description = document.getElementById('edit-destination-description').value.trim();
        const notes = document.getElementById('edit-destination-notes').value.trim();
        const budget = document.getElementById('edit-destination-budget').value;
        const tags = document.getElementById('edit-destination-tags').value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);
        const imageFile = editImageInput.files[0];

        if (!title) {
            alert('Destination title is required.');
            return;
        }

        const existingDestination = getDestinations().find(dest => dest.id === id); // From storage.js
        if (!existingDestination) {
            console.error("Cannot update non-existent destination:", id);
            hideEditModal(); // From ui.js
            return;
        }

        const updatedData = {
            title,
            description,
            notes,
            budget: budget ? parseFloat(budget) : null,
            tags,
            // Keep existing image data URL unless a new file is selected
            imageDataUrl: existingDestination.imageDataUrl,
            order: existingDestination.order // Preserve order
        };


        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updatedData.imageDataUrl = reader.result;
                finalizeUpdate(id, updatedData);
            };
            reader.readAsDataURL(imageFile);
        } else {
             // If no new image, check if preview has src (meaning existing image or placeholder)
            if (editImagePreview.src && editImagePreview.src !== window.location.href) { // Check if src is set and not just the base URL
                 updatedData.imageDataUrl = editImagePreview.src; // Keep current preview src
            } else {
                 updatedData.imageDataUrl = 'assets/placeholder.svg'; // Fallback to placeholder if somehow cleared
            }
            finalizeUpdate(id, updatedData);
        }
    }

    function finalizeUpdate(id, updatedData) {
        updateDestination(id, updatedData); // From storage.js
        updateDestinationCard(id, updatedData); // From ui.js
        hideEditModal(); // From ui.js
        clearForm(editDestinationForm, editImagePreview); // From ui.js
    }

    // --- Initialization Helper ---
    function loadInitialDestinations() {
        const destinations = getDestinations(); // From storage.js
        renderWishlist(destinations, wishlistContainer); // From ui.js
        updateEmptyMessageVisibility(); // From ui.js
    }

    // --- Drag and Drop Callback ---
    function updateDestinationOrder() {
        const cards = wishlistContainer.querySelectorAll('.destination-card');
        const destinations = getDestinations(); // Get current state
        const newOrderMap = new Map(); // Map ID to new index

        cards.forEach((card, index) => {
            const id = card.dataset.id;
            newOrderMap.set(id, index);
        });

        // Create a new sorted array based on the DOM order
        const reorderedDestinations = destinations
            .map(dest => ({ ...dest, order: newOrderMap.get(dest.id) })) // Update order property
            .sort((a, b) => a.order - b.order); // Sort by the new order

        saveDestinations(reorderedDestinations); // From storage.js
        // No need to re-render UI here, as drag/drop already changed the DOM order
    }

});