const LOCAL_STORAGE_KEY = 'moodBoardAssemblerState';

/**
 * Saves the current state of the mood board to local storage.
 * @param {object} state - The state object containing board HTML and background color.
 *                         Example: { html: '<div>...</div>', bgColor: '#ffffff' }
 */
function saveBoardState(state) {
    if (!state || typeof state.html === 'undefined' || typeof state.bgColor === 'undefined') {
        console.error("Invalid state object passed to saveBoardState.");
        return;
    }
    try {
        const stateString = JSON.stringify(state);
        localStorage.setItem(LOCAL_STORAGE_KEY, stateString);
        // console.log("Board state saved."); // Optional: for debugging
    } catch (error) {
        console.error("Error saving board state to local storage:", error);
        // Handle potential errors like storage being full or disabled
        if (error.name === 'QuotaExceededError') {
            alert("Local storage is full. Cannot save board state.");
        } else {
            alert("Could not save board state. Local storage might be disabled or unavailable.");
        }
    }
}

/**
 * Loads the saved mood board state from local storage.
 * @returns {object|null} The saved state object { html, bgColor } or null if no state is found or an error occurs.
 */
function loadBoardState() {
    try {
        const stateString = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stateString) {
            const state = JSON.parse(stateString);
            // Basic validation of the loaded state
            if (typeof state === 'object' && state !== null && typeof state.html === 'string' && typeof state.bgColor === 'string') {
                 // console.log("Board state loaded."); // Optional: for debugging
                return state;
            } else {
                console.warn("Invalid board state found in local storage. Starting fresh.");
                localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid data
                return null;
            }
        }
        return null; // No saved state found
    } catch (error) {
        console.error("Error loading board state from local storage:", error);
        // Handle potential errors during parsing or access
        return null;
    }
}

/**
 * Clears the saved mood board state from local storage.
 */
function clearSavedBoardState() {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        // console.log("Saved board state cleared."); // Optional: for debugging
    } catch (error) {
        console.error("Error clearing saved board state:", error);
    }
}