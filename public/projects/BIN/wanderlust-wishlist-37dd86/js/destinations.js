const DESTINATIONS_STORAGE_KEY = 'wanderlustWishlistDestinations';

// --- Data Retrieval ---

function getDestinations() {
    const destinationsJson = localStorage.getItem(DESTINATIONS_STORAGE_KEY);
    try {
        return destinationsJson ? JSON.parse(destinationsJson) : [];
    } catch (e) {
        console.error("Error parsing destinations from localStorage:", e);
        return []; // Return empty array on error
    }
}

function getDestinationById(id) {
    const destinations = getDestinations();
    return destinations.find(dest => dest.id === id);
}

// --- Data Persistence ---

function saveDestinations(destinations) {
    try {
        localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(destinations));
    } catch (e) {
        console.error("Error saving destinations to localStorage:", e);
        // Optionally, notify the user that data couldn't be saved
        alert("Could not save destination data. Local storage might be full or disabled.");
    }
}

// --- Data Manipulation ---

function addDestination(destination) {
    const destinations = getDestinations();
    // Basic check for duplicates (optional, based on name)
    // if (destinations.some(d => d.name.toLowerCase() === destination.name.toLowerCase())) {
    //     alert(`${destination.name} already exists in your wishlist.`);
    //     return false; // Indicate failure
    // }
    destinations.push(destination);
    saveDestinations(destinations);
    return true; // Indicate success
}

function deleteDestination(id) {
    let destinations = getDestinations();
    destinations = destinations.filter(dest => dest.id !== id);
    saveDestinations(destinations);
}

function updateDestination(updatedDestination) {
    let destinations = getDestinations();
    const index = destinations.findIndex(dest => dest.id === updatedDestination.id);
    if (index !== -1) {
        destinations[index] = updatedDestination;
        saveDestinations(destinations);
        return true; // Indicate success
    }
    return false; // Indicate failure (not found)
}

function toggleVisitedStatus(id) {
    const destinations = getDestinations();
    const index = destinations.findIndex(dest => dest.id === id);
    if (index !== -1) {
        destinations[index].visited = !destinations[index].visited;
        saveDestinations(destinations);
        return true; // Indicate success
    }
    return false; // Indicate failure (not found)
}


// --- Filtering Logic ---

function getFilteredDestinations(searchTerm = '', category = 'all') {
    const destinations = getDestinations();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return destinations.filter(dest => {
        // Filter by search term (check name and description)
        const nameMatch = dest.name.toLowerCase().includes(lowerCaseSearchTerm);
        const descriptionMatch = dest.description.toLowerCase().includes(lowerCaseSearchTerm);
        const searchMatch = nameMatch || descriptionMatch;

        // Filter by category
        let categoryMatch = true; // Default to true if 'all' categories
        if (category !== 'all') {
            if (category === 'visited') {
                categoryMatch = dest.visited === true;
            } else if (category === 'not-visited') {
                 categoryMatch = dest.visited === false;
            } else {
                categoryMatch = dest.category.toLowerCase() === category.toLowerCase();
            }
        }

        return searchMatch && categoryMatch;
    });
}