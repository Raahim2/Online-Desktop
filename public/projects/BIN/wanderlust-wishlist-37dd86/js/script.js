document.addEventListener('DOMContentLoaded', () => {
    const addDestinationForm = document.getElementById('add-destination-form');
    const destinationListContainer = document.getElementById('destination-list');
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const noDestinationsMessage = document.getElementById('no-destinations-message');

    // --- Initial Load ---
    loadAndRenderDestinations();

    // --- Event Listeners ---

    // Add Destination Form Submission
    addDestinationForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleAddDestination();
    });

    // Search Input
    searchInput.addEventListener('input', () => {
        filterAndRenderDestinations();
    });

    // Filter Dropdown
    filterCategory.addEventListener('change', () => {
        filterAndRenderDestinations();
    });

    // Event Delegation for Delete and Mark Visited Buttons
    destinationListContainer.addEventListener('click', (event) => {
        const target = event.target;
        const card = target.closest('.destination-card'); // Add this class in ui.js

        if (!card) return; // Click wasn't inside a card

        const destinationId = card.dataset.id;

        if (target.classList.contains('delete-btn')) {
            handleDeleteDestination(destinationId);
        } else if (target.classList.contains('mark-visited-btn')) {
            handleToggleVisited(destinationId);
        }
        // Add potential listener for card click to show details modal if implemented
    });

    // --- Handler Functions ---

    function handleAddDestination() {
        const nameInput = document.getElementById('destination-name');
        const descriptionInput = document.getElementById('destination-description');
        const imageInput = document.getElementById('destination-image');
        const activitiesInput = document.getElementById('destination-activities');
        const categoryInput = document.getElementById('destination-category');

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const imageUrl = imageInput.value.trim();
        const activities = activitiesInput.value.trim().split(',').map(activity => activity.trim()).filter(Boolean); // Split and clean activities
        const category = categoryInput.value;

        if (!name) {
            alert('Please enter a destination name.'); // Simple validation
            return;
        }

        const newDestination = {
            id: `dest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // More robust unique ID
            name: name,
            description: description,
            imageUrl: imageUrl || 'assets/placeholder.jpg', // Use placeholder if no URL
            activities: activities,
            category: category,
            visited: false,
            addedDate: new Date().toISOString() // Add timestamp
        };

        addDestination(newDestination);
        clearForm(addDestinationForm);
        loadAndRenderDestinations(); // Re-render the full list
    }

    function handleDeleteDestination(id) {
        if (confirm('Are you sure you want to delete this destination?')) {
            deleteDestination(id);
            loadAndRenderDestinations(); // Re-render after deletion
        }
    }

    function handleToggleVisited(id) {
        toggleVisitedStatus(id);
        // Re-render only if the filter is not 'Visited' or 'Not Visited'
        // Or simply re-render always for simplicity, which filterAndRenderDestinations does
        filterAndRenderDestinations();
    }

    function loadAndRenderDestinations() {
        const destinations = getDestinations();
        renderDestinations(destinations, destinationListContainer);
        updateNoDestinationsMessage(destinations.length);
        // Potentially update map here if implemented
    }

    function filterAndRenderDestinations() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = filterCategory.value;
        const destinations = getFilteredDestinations(searchTerm, selectedCategory);
        renderDestinations(destinations, destinationListContainer);
        updateNoDestinationsMessage(destinations.length);
         // Potentially update map here if implemented
    }

    function updateNoDestinationsMessage(count) {
        if (count === 0) {
            noDestinationsMessage.classList.remove('hidden');
        } else {
            noDestinationsMessage.classList.add('hidden');
        }
    }

});