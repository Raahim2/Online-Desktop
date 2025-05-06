const Storage = (() => {
    const IDEAS_KEY = 'ideaIncubatorIdeas';

    const loadIdeas = () => {
        try {
            const ideasJSON = localStorage.getItem(IDEAS_KEY);
            if (ideasJSON === null) {
                return []; // No ideas stored yet
            }
            const parsedIdeas = JSON.parse(ideasJSON);
            // Basic validation: ensure it's an array
            if (!Array.isArray(parsedIdeas)) {
                console.warn("Stored ideas data is not an array. Resetting to empty.");
                return [];
            }
            // Further validation could be added here to check structure of each idea object
            return parsedIdeas;
        } catch (error) {
            console.error("Error loading ideas from localStorage:", error);
            // If parsing fails, return an empty array to prevent application crash
            return [];
        }
    };

    const saveIdeas = (ideas) => {
        if (!Array.isArray(ideas)) {
            console.error("Attempted to save non-array data as ideas:", ideas);
            return;
        }
        try {
            const ideasJSON = JSON.stringify(ideas);
            localStorage.setItem(IDEAS_KEY, ideasJSON);
        } catch (error) {
            console.error("Error saving ideas to localStorage:", error);
            // Potentially notify user or implement a fallback
        }
    };

    return {
        loadIdeas,
        saveIdeas
    };
})();