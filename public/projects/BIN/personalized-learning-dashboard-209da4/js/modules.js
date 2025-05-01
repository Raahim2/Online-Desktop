const Modules = (() => {

    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    };

    const createSubject = (name, description = '', icon = 'fas fa-book') => {
        return {
            id: generateId(),
            name: name,
            description: description,
            icon: icon,
            progress: 0,
            resources: [],
            goals: [],
            notes: [],
            createdAt: new Date().toISOString() // Optional: track creation time
        };
    };

    const createResource = (name, url) => {
        if (!name || !url) {
            console.error("Resource name and URL are required.");
            return null;
        }
        // Basic URL validation (optional but recommended)
        try {
            new URL(url); // Check if URL is valid
        } catch (_) {
            console.warn("Invalid URL provided for resource:", url);
            // Decide if invalid URL should prevent creation or just warn
            // return null; // Uncomment to prevent creation with invalid URL
        }
        return {
            id: generateId(),
            name: name,
            url: url,
            createdAt: new Date().toISOString()
        };
    };

    const createGoal = (description, dueDate = null) => {
         if (!description) {
            console.error("Goal description is required.");
            return null;
        }
        return {
            id: generateId(),
            description: description,
            dueDate: dueDate, // Store as string YYYY-MM-DD or null
            completed: false,
            createdAt: new Date().toISOString()
        };
    };

    const createNote = (content) => {
         if (!content) {
            console.error("Note content is required.");
            return null;
        }
        return {
            id: generateId(),
            content: content,
            createdAt: new Date().toISOString()
        };
    };

    return {
        createSubject,
        createResource,
        createGoal,
        createNote
    };

})();