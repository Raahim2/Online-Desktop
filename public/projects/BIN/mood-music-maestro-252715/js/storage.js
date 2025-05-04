const MOOD_HISTORY_KEY = 'moodMusicMaestroHistory';
const MAX_HISTORY_ITEMS = 5; // Maximum number of recent moods to store

// Function to get mood history from local storage
function getMoodHistory() {
    const historyJson = localStorage.getItem(MOOD_HISTORY_KEY);
    try {
        const history = historyJson ? JSON.parse(historyJson) : [];
        // Ensure it's always an array
        return Array.isArray(history) ? history : [];
    } catch (e) {
        console.error("Error parsing mood history from localStorage:", e);
        return []; // Return empty array on error
    }
}

// Function to save a mood to the history in local storage
function saveMoodToHistory(mood) {
    if (!mood) return; // Don't save empty moods

    let history = getMoodHistory();

    // Remove the mood if it already exists to move it to the front
    history = history.filter(item => item !== mood);

    // Add the new mood to the beginning
    history.unshift(mood);

    // Limit the history size
    if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    // Save back to local storage
    try {
        localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("Error saving mood history to localStorage:", e);
    }
}

// Function to display mood history buttons in the UI
function displayMoodHistory() {
    const history = getMoodHistory();
    const historyListElement = document.getElementById('history-list');

    if (!historyListElement) {
        console.warn("History list element (#history-list) not found in the DOM.");
        return;
    }

    // Clear current history display
    historyListElement.innerHTML = '';

    if (history.length === 0) {
        const noHistoryMessage = document.createElement('span');
        noHistoryMessage.classList.add('text-indigo-300', 'italic');
        noHistoryMessage.textContent = 'No recent moods selected.';
        historyListElement.appendChild(noHistoryMessage);
    } else {
        history.forEach(mood => {
            const button = document.createElement('button');
            button.textContent = mood.charAt(0).toUpperCase() + mood.slice(1); // Capitalize mood
            button.setAttribute('data-mood', mood);
            // Add Tailwind classes for styling - make them look like small pills/tags
            button.classList.add(
                'history-btn', // Add class for event delegation
                'bg-white',
                'bg-opacity-20',
                'hover:bg-opacity-30',
                'text-indigo-100',
                'font-medium',
                'py-1',
                'px-3',
                'rounded-full',
                'text-sm',
                'transition',
                'duration-200',
                'ease-in-out'
            );
            historyListElement.appendChild(button);
        });
    }
}

// Optional: Add a function to clear history if needed later
// function clearMoodHistory() {
//     localStorage.removeItem(MOOD_HISTORY_KEY);
//     displayMoodHistory(); // Update the UI after clearing
// }