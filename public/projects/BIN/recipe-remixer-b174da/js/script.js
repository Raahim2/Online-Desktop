document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const ingredientList = document.getElementById('ingredient-list');
    const findRecipesBtn = document.getElementById('find-recipes-btn');
    const recipeResults = document.getElementById('recipe-results');
    const recipesPlaceholder = document.getElementById('recipes-placeholder');
    const recipeCardTemplate = document.getElementById('recipe-card-template');
    const dietaryFilters = document.querySelectorAll('input[name="dietary"]');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');

    const modal = document.getElementById('recipe-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalRecipeTitle = document.getElementById('modal-recipe-title');
    const modalRecipeImage = document.getElementById('modal-recipe-image');
    const modalServingSize = document.getElementById('modal-serving-size');
    const modalRecipeIngredients = document.getElementById('modal-recipe-ingredients');
    const modalRecipeInstructions = document.getElementById('modal-recipe-instructions');
    const modalRecipeNotes = document.getElementById('modal-recipe-notes');
    const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
    const modalShareBtn = document.getElementById('modal-share-btn');
    const shareableLinkInput = document.getElementById('shareable-link');
    const shareConfirmation = document.getElementById('share-confirmation');

    const favoritesSectionList = document.getElementById('favorite-recipes-list');

    // --- State ---
    let currentIngredients = [];
    let currentRecipes = []; // Holds the currently displayed recipes
    let currentFilters = {
        dietary: [],
        cuisine: ''
    };
    let currentOpenRecipe = null;

    // --- Functions ---

    // Update ingredient list UI
    function renderIngredientList() {
        ingredientList.innerHTML = '';
        if (currentIngredients.length === 0) {
            // Optionally show a placeholder message
            // ingredientList.innerHTML = '<li class="text-gray-500 italic">No ingredients added yet.</li>';
        } else {
            currentIngredients.forEach((ingredient, index) => {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center group';
                li.textContent = ingredient;
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '&times;';
                removeBtn.className = 'ml-2 text-red-500 hover:text-red-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity';
                removeBtn.onclick = () => removeIngredient(index);
                li.appendChild(removeBtn);
                ingredientList.appendChild(li);
            });
        }
    }

    // Add ingredient to state and UI
    function addIngredient() {
        const ingredient = ingredientInput.value.trim().toLowerCase();
        if (ingredient && !currentIngredients.includes(ingredient)) {
            currentIngredients.push(ingredient);
            renderIngredientList();
            ingredientInput.value = '';
        }
        ingredientInput.focus();
    }

    // Remove ingredient from state and UI
    function removeIngredient(index) {
        currentIngredients.splice(index, 1);
        renderIngredientList();
    }

    // Update filters state
    function updateFilters() {
        currentFilters.dietary = Array.from(dietaryFilters)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        currentFilters.cuisine = cuisineFilter.value;
        // Re-display recipes with new filters
        displayRecipes();
    }

    // Filter recipes based on ingredients and filters
    function filterRecipes() {
        const availableRecipes = typeof dummyRecipes !== 'undefined' ? dummyRecipes : [];

        return availableRecipes.filter(recipe => {
            // Ingredient check: Must contain at least one of the user's ingredients
            const hasMatchingIngredient = currentIngredients.length === 0 || currentIngredients.some(userIng =>
                recipe.ingredients.some(recipeIng => recipeIng.name.toLowerCase().includes(userIng))
            );

            if (!hasMatchingIngredient && currentIngredients.length > 0) return false;

            // Dietary check
            const meetsDietary = currentFilters.dietary.length === 0 || currentFilters.dietary.every(diet =>
                recipe.tags && recipe.tags.includes(diet)
            );
            if (!meetsDietary) return false;

            // Cuisine check
            const meetsCuisine = !currentFilters.cuisine || (recipe.cuisine && recipe.cuisine.toLowerCase() === currentFilters.cuisine.toLowerCase());
            if (!meetsCuisine) return false;

            return true; // Passed all checks
        });
    }

    // Display recipes in the results area
    function displayRecipes() {
        recipeResults.innerHTML = ''; // Clear previous results
        const filtered = filterRecipes();
        currentRecipes = filtered; // Store the currently displayed recipes

        if (filtered.length === 0) {
            recipesPlaceholder.textContent = 'No recipes found matching your ingredients and filters.';
            recipesPlaceholder.classList.remove('hidden');
        } else {
            recipesPlaceholder.classList.add('hidden');
            filtered.forEach(recipe => {
                const card = recipeCardTemplate.content.cloneNode(true).querySelector('.recipe-card');
                card.dataset.recipeId = recipe.id;
                card.querySelector('.recipe-image').src = recipe.image || 'https://via.placeholder.com/300x200/cccccc/969696?text=No+Image';
                card.querySelector('.recipe-image').alt = recipe.title;
                card.querySelector('.recipe-title').textContent = recipe.title;
                card.querySelector('.recipe-description').textContent = recipe.description || 'A delicious recipe.';

                // Show matched ingredients (simple version)
                const matched = currentIngredients.filter(userIng =>
                    recipe.ingredients.some(recipeIng => recipeIng.name.toLowerCase().includes(userIng))
                );
                if (matched.length > 0) {
                    card.querySelector('.recipe-ingredients-match').textContent = `Matches: ${matched.slice(0, 3).join(', ')}${matched.length > 3 ? '...' : ''}`;
                } else {
                     card.querySelector('.recipe-ingredients-match').textContent = `Uses common ingredients.`;
                }


                card.addEventListener('click', () => openModal(recipe.id));
                recipeResults.appendChild(card);
            });
        }
    }

    // Open and populate the recipe detail modal
    function openModal(recipeId) {
        const recipe = currentRecipes.find(r => r.id === recipeId) || getFavoriteById(recipeId); // Check current or favorites
        if (!recipe) return;

        currentOpenRecipe = recipe; // Store the recipe being viewed

        modalRecipeTitle.textContent = recipe.title;
        modalRecipeImage.src = recipe.image || 'https://via.placeholder.com/600x400/cccccc/969696?text=No+Image';
        modalRecipeImage.alt = recipe.title;

        // Populate ingredients
        modalRecipeIngredients.innerHTML = '';
        recipe.ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = `${ing.quantity} ${ing.unit || ''} ${ing.name}`;
            modalRecipeIngredients.appendChild(li);
        });

        // Populate instructions
        modalRecipeInstructions.innerHTML = '';
        if (Array.isArray(recipe.instructions)) {
             recipe.instructions.forEach(step => {
                const p = document.createElement('p');
                p.textContent = step;
                modalRecipeInstructions.appendChild(p);
            });
        } else {
             const p = document.createElement('p');
             p.textContent = recipe.instructions; // Handle single string instruction
             modalRecipeInstructions.appendChild(p);
        }


        // Restore saved notes if available
        const savedFavorite = getFavoriteById(recipe.id);
        modalRecipeNotes.value = savedFavorite?.notes || recipe.notes || '';
        modalServingSize.value = savedFavorite?.servingSize || recipe.servingSize || 4;


        updateFavoriteButtonState(recipe.id);
        shareConfirmation.classList.add('hidden'); // Hide share confirmation
        modal.classList.remove('hidden');
    }

    // Close the recipe detail modal
    function closeModal() {
        modal.classList.add('hidden');
        currentOpenRecipe = null; // Clear the currently open recipe
        // Optionally reset fields, though they get overwritten on open
        modalRecipeNotes.value = '';
        modalServingSize.value = 4;
    }

    // Update favorite button appearance and text
    function updateFavoriteButtonState(recipeId) {
        const isFav = isFavorite(recipeId);
        const favText = modalFavoriteBtn.querySelector('.favorite-text');
        const unfavText = modalFavoriteBtn.querySelector('.unfavorite-text');
        if (isFav) {
            favText.classList.add('hidden');
            unfavText.classList.remove('hidden');
            modalFavoriteBtn.classList.replace('bg-yellow-500', 'bg-red-500');
            modalFavoriteBtn.classList.replace('hover:bg-yellow-600', 'hover:bg-red-600');
        } else {
            favText.classList.remove('hidden');
            unfavText.classList.add('hidden');
            modalFavoriteBtn.classList.replace('bg-red-500', 'bg-yellow-500');
            modalFavoriteBtn.classList.replace('hover:bg-red-600', 'hover:bg-yellow-600');
        }
    }

    // Handle favorite button click
    function toggleFavorite() {
        if (!currentOpenRecipe) return;

        const recipeId = currentOpenRecipe.id;
        if (isFavorite(recipeId)) {
            removeFavorite(recipeId);
        } else {
            // Save current state including notes and serving size
            const recipeToSave = {
                ...currentOpenRecipe,
                notes: modalRecipeNotes.value.trim(),
                servingSize: parseInt(modalServingSize.value, 10) || currentOpenRecipe.servingSize || 4
            };
            saveFavorite(recipeToSave);
        }
        updateFavoriteButtonState(recipeId);
        renderFavoritesList(); // Update the sidebar list
    }

    // Render the list of favorite recipes in the sidebar
    function renderFavoritesList() {
        const favorites = getFavorites();
        favoritesSectionList.innerHTML = ''; // Clear existing list

        if (favorites.length === 0) {
            favoritesSectionList.innerHTML = '<p class="text-gray-500 italic">No favorite recipes saved yet.</p>';
        } else {
            favorites.forEach(favRecipe => {
                const favItem = document.createElement('div');
                favItem.className = 'text-sm text-emerald-700 hover:text-emerald-900 cursor-pointer hover:underline';
                favItem.textContent = favRecipe.title;
                favItem.dataset.recipeId = favRecipe.id;
                favItem.onclick = () => openModal(favRecipe.id); // Open modal on click
                favoritesSectionList.appendChild(favItem);
            });
        }
    }

    // Handle share button click
    function shareRecipe() {
         if (!currentOpenRecipe) return;
         // Simple share: copy recipe title and a placeholder link/message
         const shareText = `Check out this recipe: ${currentOpenRecipe.title}\n(Shared from Recipe Remixer)`; // Basic text to copy
         // In a real app, this would be a URL to the recipe page:
         // const shareUrl = `${window.location.origin}/recipe/${currentOpenRecipe.id}`;

         // Use Clipboard API
         navigator.clipboard.writeText(shareText).then(() => {
             shareConfirmation.classList.remove('hidden');
             setTimeout(() => shareConfirmation.classList.add('hidden'), 2000); // Hide after 2 seconds
         }).catch(err => {
             console.error('Failed to copy text: ', err);
             // Fallback for older browsers or if permission denied (less common now)
             try {
                 shareableLinkInput.value = shareText;
                 shareableLinkInput.select();
                 document.execCommand('copy');
                 shareConfirmation.classList.remove('hidden');
                 setTimeout(() => shareConfirmation.classList.add('hidden'), 2000);
             } catch (execErr) {
                 console.error('Fallback copy failed: ', execErr);
                 alert('Could not copy recipe link. Please copy it manually.');
             }
         });
    }


    // --- Event Listeners ---
    addIngredientBtn.addEventListener('click', addIngredient);
    ingredientInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addIngredient();
        }
    });

    findRecipesBtn.addEventListener('click', displayRecipes);
    applyFiltersBtn.addEventListener('click', updateFilters); // Apply filters button triggers update

    // Add listeners to filter inputs to trigger update immediately (optional)
    // dietaryFilters.forEach(filter => filter.addEventListener('change', updateFilters));
    // cuisineFilter.addEventListener('change', updateFilters);

    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { // Close modal if clicking outside the content
        if (e.target === modal) {
            closeModal();
        }
    });

    modalFavoriteBtn.addEventListener('click', toggleFavorite);
    modalShareBtn.addEventListener('click', shareRecipe);

    // --- Initial Load ---
    renderIngredientList();
    renderFavoritesList();
    displayRecipes(); // Show initial recipes (likely none until ingredients added)

});