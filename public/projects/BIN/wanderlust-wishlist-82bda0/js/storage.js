const STORAGE_KEY = 'wanderlustWishlistDestinations';

function getDestinations() {
    const destinationsJson = localStorage.getItem(STORAGE_KEY);
    try {
        const destinations = destinationsJson ? JSON.parse(destinationsJson) : [];
        // Ensure destinations are sorted by their order property
        return destinations.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (e) {
        console.error("Error parsing destinations from localStorage:", e);
        return []; // Return empty array on error
    }
}

function saveDestinations(destinations) {
    if (!Array.isArray(destinations)) {
        console.error("Attempted to save non-array data to localStorage:", destinations);
        return;
    }
    // Ensure order property is consistent before saving
    const destinationsToSave = destinations.map((dest, index) => ({
        ...dest,
        order: dest.order ?? index // Assign index as order if missing
    })).sort((a, b) => a.order - b.order); // Sort again just to be sure

    localStorage.setItem(STORAGE_KEY, JSON.stringify(destinationsToSave));
}

function addDestination(newDestination) {
    const destinations = getDestinations();
    // Ensure the new destination has an order property
    if (newDestination.order === undefined || newDestination.order === null) {
         newDestination.order = destinations.length; // Append to the end
    }
    destinations.push(newDestination);
    saveDestinations(destinations);
}

function updateDestination(id, updatedData) {
    let destinations = getDestinations();
    const destinationIndex = destinations.findIndex(dest => dest.id === id);

    if (destinationIndex !== -1) {
        // Preserve the original order if not explicitly changed in updatedData
        const originalOrder = destinations[destinationIndex].order;
        destinations[destinationIndex] = {
            ...destinations[destinationIndex], // Keep existing properties like id
            ...updatedData, // Overwrite with new data
            order: updatedData.order ?? originalOrder // Use new order if provided, else keep old
        };
        saveDestinations(destinations);
    } else {
        console.error("Destination with ID not found for update:", id);
    }
}

function deleteDestination(id) {
    let destinations = getDestinations();
    const filteredDestinations = destinations.filter(dest => dest.id !== id);
    // Re-assign order based on new array indices after deletion
    const reorderedDestinations = filteredDestinations.map((dest, index) => ({
        ...dest,
        order: index
    }));
    saveDestinations(reorderedDestinations);
}