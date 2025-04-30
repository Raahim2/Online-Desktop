document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentIngredients = [];
    let currentRecipeDetails = null; // Holds details of the recipe currently in the modal

    // --- DOM Elements ---
    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const ingredientListUl = document.getElementById('ingredient-list');
    const findRecipesBtn = document.getElementById('find-recipes-btn');
    const recipeResultsDiv = document.getElementById('recipe-results');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessageDiv = document.getElementById('error-message');
    const noResultsMessage = document.getElementById('no-results-message');

    const filterVegetarian = document.getElementById('filter-vegetarian');
    const filterVegan = document.getElementById('filter-vegan');
    const filterGlutenFree = document.getElementById('filter-gluten-free');
    const filterCuisine = document.getElementById('filter-cuisine');

    const modal = document.getElementById('recipe-detail-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveRecipeBtn = document.getElementById('save-recipe-btn');
    const shareRecipeBtn = document.getElementById('share-recipe-btn');
    const remixIngredientsBtn = document.getElementById('remix-ingredients-btn');

    const showSavedRecipesBtn = document.getElementById('show-saved-recipes-btn');
    const savedRecipesSection = document.getElementById('saved-recipes-section');
    const closeSavedRecipesBtn = document.getElementById('close-saved-recipes-btn');
    const savedRecipesListDiv = document.getElementById('saved-recipes-list');
    const noSavedRecipesMessage = document.getElementById('no-saved-recipes-message');

    const shareOptionsDiv = document.getElementById('share-options');


    // --- Functions ---

    const updateIngredientDisplay = () => {
        UI.displayIngredients(ingredientListUl, currentIngredients, removeIngredient);
    };

    const addIngredient = () => {
        const ingredientName = ingredientInput.value.trim().toLowerCase();
        if (ingredientName && !currentIngredients.includes(ingredientName)) {
            currentIngredients.push(ingredientName);
            updateIngredientDisplay();
            ingredientInput.value = '';
            ingredientInput.focus();
             // Hide no results message if it was shown
            UI.displayMessage(noResultsMessage, '', false);
        } else if (currentIngredients.includes(ingredientName)) {
            // Optionally provide feedback that ingredient is already added
            console.warn("Ingredient already added:", ingredientName);
        }
    };

    const removeIngredient = (ingredientToRemove) => {
        currentIngredients = currentIngredients.filter(ing => ing !== ingredientToRemove);
        updateIngredientDisplay();
    };

    const searchRecipes = async () => {
        if (currentIngredients.length === 0) {
            UI.showError(errorMessageDiv, 'Please add at least one ingredient.');
            return;
        }

        UI.clearRecipes(recipeResultsDiv);
        UI.hideError(errorMessageDiv);
        UI.showLoading(loadingIndicator);
        UI.displayMessage(noResultsMessage, '', false); // Hide no results message

        const filters = {
            vegetarian: filterVegetarian.checked,
            vegan: filterVegan.checked,
            glutenFree: filterGlutenFree.checked,
            cuisine: filterCuisine.value.trim()
        };

        try {
            // Assuming API.fetchRecipes takes ingredients array and filters object
            const recipes = await API.fetchRecipes(currentIngredients, filters);
            UI.hideLoading(loadingIndicator);
            if (recipes && recipes.length > 0) {
                UI.displayRecipes(recipeResultsDiv, recipes, showRecipeDetails);
            } else {
                 UI.displayMessage(noResultsMessage, 'No recipes found matching your ingredients and filters.', true);
            }
        } catch (error) {
            console.error("Error fetching recipes:", error);
            UI.hideLoading(loadingIndicator);
            UI.showError(errorMessageDiv, `Failed to fetch recipes. ${error.message || 'Please try again later.'}`);
            UI.displayMessage(noResultsMessage, '', false); // Ensure no results isn't shown on error
        }
    };

    const showRecipeDetails = async (recipeId) => {
        UI.showLoading(loadingIndicator); // Reuse loading indicator briefly
        UI.hideError(errorMessageDiv);
        try {
            // Use a potentially different function if detailed fetch is needed
            // Or assume fetchRecipes already got enough details initially
            // For now, let's assume we need to fetch details
            const details = await API.fetchRecipeDetails(recipeId); // Needs implementation in api.js
            UI.hideLoading(loadingIndicator);
            if (details) {
                currentRecipeDetails = details; // Store details globally for save/share
                UI.displayRecipeDetails(modal, details);
                UI.toggleModal(modal, true);
                UI.hideShareOptions(shareOptionsDiv); // Hide share options initially
            } else {
                UI.showError(errorMessageDiv, 'Could not load recipe details.');
            }
        } catch (error) {
            console.error("Error fetching recipe details:", error);
            UI.hideLoading(loadingIndicator);
            UI.showError(errorMessageDiv, `Failed to load recipe details. ${error.message || ''}`);
        }
    };

    const handleSaveRecipe = () => {
        if (currentRecipeDetails) {
            // Potentially get remixed ingredients if implemented
            const ingredientsContainer = document.getElementById('modal-recipe-ingredients');
            const isEditable = ingredientsContainer.contentEditable === 'true';
            let ingredientsToSave = currentRecipeDetails.ingredients; // Default to original

            if (isEditable) {
                 // If editable, try to parse the edited list
                 // This is a basic example; might need refinement
                 ingredientsToSave = Array.from(ingredientsContainer.querySelectorAll('li'))
                                        .map(li => ({ original: li.textContent.trim() })); // Adapt structure as needed
                 // Reset editability after saving potentially remixed version
                 UI.makeIngredientsEditable(ingredientsContainer, remixIngredientsBtn, false);
            }

            const recipeToSave = {
                ...currentRecipeDetails,
                ingredients: ingredientsToSave, // Save potentially modified ingredients
                isRemixed: isEditable // Add a flag indicating if it was remixed
            };

            Storage.saveRecipe(recipeToSave);
            alert(`${recipeToSave.title} saved!`); // Simple feedback
            // Optionally update saved recipes view if open
            if (!savedRecipesSection.classList.contains('hidden')) {
                loadAndDisplaySavedRecipes();
            }
        }
    };

     const handleShareRecipe = () => {
        if (currentRecipeDetails) {
            UI.updateShareLinks(currentRecipeDetails);
            UI.toggleShareOptions(shareOptionsDiv);
        }
    };

    const handleRemixIngredients = () => {
         const ingredientsContainer = document.getElementById('modal-recipe-ingredients');
         const isCurrentlyEditable = ingredientsContainer.contentEditable === 'true';
         UI.makeIngredientsEditable(ingredientsContainer, remixIngredientsBtn, !isCurrentlyEditable);
    };


    const loadAndDisplaySavedRecipes = () => {
        const savedRecipes = Storage.getSavedRecipes();
        UI.displaySavedRecipes(savedRecipesListDiv, noSavedRecipesMessage, savedRecipes, showRecipeDetails, handleRemoveSavedRecipe);
    };

    const handleShowSavedRecipes = () => {
        loadAndDisplaySavedRecipes();
        UI.toggleSavedRecipesView(savedRecipesSection, true);
        // Optionally hide other sections like input/results if needed for focus
        document.getElementById('ingredient-section').classList.add('hidden');
        document.getElementById('recipe-suggestions-section').classList.add('hidden');

    };

     const handleCloseSavedRecipes = () => {
        UI.toggleSavedRecipesView(savedRecipesSection, false);
         // Show input/results sections again
        document.getElementById('ingredient-section').classList.remove('hidden');
        document.getElementById('recipe-suggestions-section').classList.remove('hidden');
    };

     const handleRemoveSavedRecipe = (recipeId) => {
        if (confirm("Are you sure you want to remove this saved recipe?")) {
            Storage.removeSavedRecipe(recipeId);
            loadAndDisplaySavedRecipes(); // Refresh the list
        }
    };


    // --- Event Listeners ---
    const initializeEventListeners = () => {
        addIngredientBtn.addEventListener('click', addIngredient);
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addIngredient();
            }
        });

        findRecipesBtn.addEventListener('click', searchRecipes);

        closeModalBtn.addEventListener('click', () => {
            UI.toggleModal(modal, false);
            // Reset ingredient editability when closing modal
            const ingredientsContainer = document.getElementById('modal-recipe-ingredients');
            UI.makeIngredientsEditable(ingredientsContainer, remixIngredientsBtn, false);
            UI.hideShareOptions(shareOptionsDiv);
            currentRecipeDetails = null; // Clear current recipe
        });

        saveRecipeBtn.addEventListener('click', handleSaveRecipe);
        shareRecipeBtn.addEventListener('click', handleShareRecipe);
        remixIngredientsBtn.addEventListener('click', handleRemixIngredients);

        showSavedRecipesBtn.addEventListener('click', handleShowSavedRecipes);
        closeSavedRecipesBtn.addEventListener('click', handleCloseSavedRecipes);

        // Close modal if clicking outside the content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                UI.toggleModal(modal, false);
                 // Reset ingredient editability when closing modal
                const ingredientsContainer = document.getElementById('modal-recipe-ingredients');
                UI.makeIngredientsEditable(ingredientsContainer, remixIngredientsBtn, false);
                UI.hideShareOptions(shareOptionsDiv);
                currentRecipeDetails = null; // Clear current recipe
            }
        });
    };

    // --- Initialization ---
    const init = () => {
        initializeEventListeners();
        updateIngredientDisplay(); // Initial display (likely empty)
        UI.displayMessage(noResultsMessage, 'Enter ingredients and click "Find Recipes" to see suggestions.', true); // Show initial message
        // Potentially load saved ingredients from storage if feature is desired
    };

    init();
});