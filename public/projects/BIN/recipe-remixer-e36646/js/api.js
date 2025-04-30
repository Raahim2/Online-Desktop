const API = (() => {
    // IMPORTANT: Replace with your actual Spoonacular API Key
    // Storing API keys directly in client-side code is insecure for production applications.
    // Consider using a backend proxy or environment variables during build.
    const API_KEY = 'YOUR_SPOONACULAR_API_KEY';
    const BASE_URL = 'https://api.spoonacular.com/recipes';

    const handleResponse = async (response) => {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Try to parse error body
            const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
            console.error("API Error:", errorMessage, errorData);
            throw new Error(errorMessage);
        }
        return response.json();
    };

    const fetchRecipes = async (ingredients = [], filters = {}, numberOfResults = 12) => {
        if (!API_KEY || API_KEY === 'YOUR_SPOONACULAR_API_KEY') {
             console.error("API Key not configured in js/api.js");
             throw new Error("API Key not configured. Please add your Spoonacular API key to js/api.js.");
        }
        if (ingredients.length === 0) {
            return [];
        }

        const ingredientsString = ingredients.join(',');
        const params = new URLSearchParams({
            apiKey: API_KEY,
            ingredients: ingredientsString,
            number: numberOfResults,
            ranking: 1, // Maximize used ingredients
            ignorePantry: true,
        });

        // Add dietary filters if present
        const dietFilters = [];
        if (filters.vegetarian) dietFilters.push('vegetarian');
        if (filters.vegan) dietFilters.push('vegan');
        if (filters.glutenFree) dietFilters.push('gluten free');
        if (dietFilters.length > 0) {
            params.append('diet', dietFilters.join(','));
        }

        // Note: Spoonacular's findByIngredients doesn't directly support cuisine filtering well.
        // ComplexSearch endpoint is better for that but requires different parameters.
        // We'll rely on diet filters here. Cuisine filter input is present in UI but not used in this API call.

        const url = `${BASE_URL}/findByIngredients?${params.toString()}`;

        try {
            const response = await fetch(url);
            const data = await handleResponse(response);
            // Map the response to the format expected by the UI
            return data.map(recipe => ({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                // Sometimes imageType is useful if you need to construct the URL differently
                // imageType: recipe.imageType,
                usedIngredientCount: recipe.usedIngredientCount,
                missedIngredientCount: recipe.missedIngredientCount,
                // Optional: include missed/used ingredients if needed for display card
                // missedIngredients: recipe.missedIngredients,
                // usedIngredients: recipe.usedIngredients,
            }));
        } catch (error) {
            console.error('Error fetching recipes:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    };

    const fetchRecipeDetails = async (recipeId) => {
         if (!API_KEY || API_KEY === 'YOUR_SPOONACULAR_API_KEY') {
             console.error("API Key not configured in js/api.js");
             throw new Error("API Key not configured. Please add your Spoonacular API key to js/api.js.");
        }
        if (!recipeId) {
            throw new Error("Recipe ID is required to fetch details.");
        }

        const params = new URLSearchParams({
            apiKey: API_KEY,
            includeNutrition: false // Or true if you want nutrition info
        });

        const url = `${BASE_URL}/${recipeId}/information?${params.toString()}`;

        try {
            const response = await fetch(url);
            const data = await handleResponse(response);

            // Map the response to a more consistent format for the modal
            return {
                id: data.id,
                title: data.title,
                image: data.image,
                ingredients: data.extendedIngredients?.map(ing => ({
                    id: ing.id,
                    original: ing.original, // Full original string like "2 cups flour"
                    name: ing.nameClean || ing.name, // Prefer cleaned name
                    amount: ing.amount,
                    unit: ing.unit
                })) || [],
                instructions: data.instructions || (data.analyzedInstructions && data.analyzedInstructions.length > 0
                    ? data.analyzedInstructions[0].steps.map(step => step.step).join('\n')
                    : 'No instructions provided.'), // Provide fallback instructions text
                sourceUrl: data.sourceUrl,
                readyInMinutes: data.readyInMinutes,
                servings: data.servings,
                summary: data.summary // May contain HTML, handle carefully in UI
            };
        } catch (error) {
            console.error(`Error fetching recipe details for ID ${recipeId}:`, error);
            throw error; // Re-throw the error
        }
    };

    // Public interface
    return {
        fetchRecipes,
        fetchRecipeDetails
    };

})();