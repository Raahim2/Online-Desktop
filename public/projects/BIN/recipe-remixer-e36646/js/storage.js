const Storage = (() => {
    const SAVED_RECIPES_KEY = 'recipeRemixerSavedRecipes';

    const getSavedRecipes = () => {
        try {
            const storedRecipes = localStorage.getItem(SAVED_RECIPES_KEY);
            return storedRecipes ? JSON.parse(storedRecipes) : [];
        } catch (error) {
            console.error("Error retrieving saved recipes from localStorage:", error);
            // Optionally clear corrupted data: localStorage.removeItem(SAVED_RECIPES_KEY);
            return [];
        }
    };

    const saveRecipe = (recipeToSave) => {
        if (!recipeToSave || !recipeToSave.id) {
            console.error("Invalid recipe object provided for saving:", recipeToSave);
            return;
        }

        try {
            const savedRecipes = getSavedRecipes();
            const existingIndex = savedRecipes.findIndex(recipe => recipe.id === recipeToSave.id);

            if (existingIndex > -1) {
                // Update existing recipe if found (e.g., if it was remixed and saved again)
                savedRecipes[existingIndex] = recipeToSave;
            } else {
                // Add new recipe if not found
                savedRecipes.push(recipeToSave);
            }

            localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
        } catch (error) {
            console.error("Error saving recipe to localStorage:", error);
            // Handle potential storage quota exceeded errors if necessary
            if (error.name === 'QuotaExceededError') {
                alert("Could not save recipe. Local storage is full.");
            }
        }
    };

    const removeSavedRecipe = (recipeId) => {
         if (!recipeId) {
            console.error("Invalid recipe ID provided for removal");
            return;
        }
        try {
            let savedRecipes = getSavedRecipes();
            savedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
            localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
        } catch (error) {
            console.error(`Error removing recipe with ID ${recipeId} from localStorage:`, error);
        }
    };

    // Public interface
    return {
        getSavedRecipes,
        saveRecipe,
        removeSavedRecipe
    };

})();