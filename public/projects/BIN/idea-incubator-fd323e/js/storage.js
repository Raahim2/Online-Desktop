const IdeaStorage = (() => {
    const STORAGE_KEY = 'ideaIncubatorIdeas';

    function getAllIdeas() {
        const ideasJson = localStorage.getItem(STORAGE_KEY);
        try {
            return ideasJson ? JSON.parse(ideasJson) : [];
        } catch (e) {
            console.error("Error parsing ideas from localStorage:", e);
            return []; // Return empty array on error
        }
    }

    function saveAllIdeas(ideas) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
        } catch (e) {
            console.error("Error saving ideas to localStorage:", e);
            // Consider notifying the user if storage fails (e.g., quota exceeded)
            alert("Could not save ideas. Local storage might be full or disabled.");
        }
    }

    function getIdeaById(id) {
        const ideas = getAllIdeas();
        return ideas.find(idea => idea.id === id);
    }

    function addIdea(newIdea) {
        const ideas = getAllIdeas();
        // Ensure no duplicate ID (highly unlikely with the current generation method, but good practice)
        if (ideas.some(idea => idea.id === newIdea.id)) {
            console.warn(`Attempted to add idea with duplicate ID: ${newIdea.id}`);
            // Optionally, generate a new ID here if needed
            return; // Or handle error appropriately
        }
        ideas.push(newIdea);
        saveAllIdeas(ideas);
    }

    function updateIdea(updatedIdea) {
        let ideas = getAllIdeas();
        const index = ideas.findIndex(idea => idea.id === updatedIdea.id);
        if (index !== -1) {
            // Preserve existing position unless explicitly provided in updatedIdea
            const existingPosition = { x: ideas[index].x, y: ideas[index].y };
            ideas[index] = { ...existingPosition, ...updatedIdea }; // Merge, updatedIdea properties overwrite
            saveAllIdeas(ideas);
            return true;
        }
        console.warn(`Attempted to update non-existent idea with ID: ${updatedIdea.id}`);
        return false;
    }

     function updateIdeaPosition(id, x, y) {
         let ideas = getAllIdeas();
         const index = ideas.findIndex(idea => idea.id === id);
         if (index !== -1) {
             // Only update position fields, leave others intact
             ideas[index].x = x;
             ideas[index].y = y;
             // Also update fx and fy to persist dragged position if needed by d3 upon reload
             ideas[index].fx = x;
             ideas[index].fy = y;
             saveAllIdeas(ideas);
             return true;
         }
         console.warn(`Attempted to update position for non-existent idea with ID: ${id}`);
         return false;
     }


    function deleteIdea(id) {
        let ideas = getAllIdeas();
        const initialLength = ideas.length;
        ideas = ideas.filter(idea => idea.id !== id);
        if (ideas.length < initialLength) {
            saveAllIdeas(ideas);
            return true; // Indicate successful deletion
        }
        console.warn(`Attempted to delete non-existent idea with ID: ${id}`);
        return false; // Indicate idea not found
    }

    // Expose public methods
    return {
        getAllIdeas,
        getIdeaById,
        addIdea,
        updateIdea,
        deleteIdea,
        updateIdeaPosition
    };
})();