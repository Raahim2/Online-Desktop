const Storage = (() => {
    const BOOKS_KEY = 'bookTracker_books';
    const HISTORY_KEY = 'bookTracker_history';
    const GOALS_KEY = 'bookTracker_goals';

    const loadData = (key, defaultValue = []) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error loading data from localStorage for key "${key}":`, error);
            return defaultValue; // Return default value on error
        }
    };

    const saveData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving data to localStorage for key "${key}":`, error);
            // Optionally, add user feedback about storage issues
            alert('Could not save data. Local storage might be full or disabled.');
        }
    };

    return {
        loadBooks: () => loadData(BOOKS_KEY, []),
        saveBooks: (books) => saveData(BOOKS_KEY, books),

        loadReadingHistory: () => loadData(HISTORY_KEY, []),
        saveReadingHistory: (history) => saveData(HISTORY_KEY, history),

        loadGoals: () => loadData(GOALS_KEY, { weeklyPages: null }), // Default goal structure
        saveGoals: (goals) => saveData(GOALS_KEY, goals),
    };
})();