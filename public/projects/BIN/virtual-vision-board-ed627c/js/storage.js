const STORAGE_KEY = 'virtualVisionBoardData';

function saveBoard(boardState) {
    try {
        const dataString = JSON.stringify(boardState);
        localStorage.setItem(STORAGE_KEY, dataString);
    } catch (error) {
        console.error("Error saving board state to local storage:", error);
        if (error.name === 'QuotaExceededError') {
            alert("Could not save board. Local storage quota exceeded. Please remove some items or try saving fewer/smaller images.");
        } else {
            alert("An error occurred while saving the board.");
        }
    }
}

function loadBoard() {
    try {
        const dataString = localStorage.getItem(STORAGE_KEY);
        if (dataString) {
            const boardState = JSON.parse(dataString);
            // Basic validation to ensure it looks like our data structure
            if (boardState && typeof boardState === 'object' && Array.isArray(boardState.elements) && boardState.background) {
                 // Handle potential Data URL length issues from previous saves if needed
                 // (e.g., check lengths, though usually handled by QuotaExceededError)
                return boardState;
            } else {
                console.error("Invalid data format found in local storage.");
                localStorage.removeItem(STORAGE_KEY); // Clear invalid data
                return null;
            }
        }
        return null; // No saved data found
    } catch (error) {
        console.error("Error loading board state from local storage:", error);
        alert("An error occurred while loading the board. Saved data might be corrupted.");
        // Optionally clear corrupted data: localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}