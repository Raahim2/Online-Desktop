const UI = (() => {

    const displayIngredients = (ulElement, ingredients, removeCallback) => {
        ulElement.innerHTML = ''; // Clear existing list
        if (ingredients.length === 0) {
            ulElement.innerHTML = '<li class="text-gray-500 italic">No ingredients added yet.</li>';
            return;
        }
        ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center group';
            li.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1); // Capitalize

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;'; // Use HTML entity for 'x'
            removeBtn.className = 'ml-2 text-red-400 hover:text-red-600 font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity';
            removeBtn.title = `Remove ${ingredient}`;
            removeBtn.onclick = () => removeCallback(ingredient);

            li.appendChild(removeBtn);
            ulElement.appendChild(li);
        });
    };

    const clearRecipes = (containerElement) => {
        containerElement.innerHTML = '';
    };

    const displayRecipes = (containerElement, recipes, detailCallback) => {
        clearRecipes(containerElement); // Ensure it's clear before adding
        if (!recipes || recipes.length === 0) {
            // This case is handled by displayMessage in script.js
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out';

            const img = document.createElement('img');
            img.src = recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'; // Placeholder if no image
            img.alt = recipe.title;
            img.className = 'w-full h-48 object-cover';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'p-4';

            const title = document.createElement('h3');
            title.textContent = recipe.title;
            title.className = 'text-lg font-semibold mb-2 text-gray-800';

            // Optional: Display ingredient counts
            const ingredientInfo = document.createElement('p');
            ingredientInfo.className = 'text-sm text-gray-600 mb-3';
            ingredientInfo.textContent = `Uses ${recipe.usedIngredientCount} of your ingredients. ${recipe.missedIngredientCount} more needed.`;


            const viewButton = document.createElement('button');
            viewButton.textContent = 'View Recipe';
            viewButton.className = 'w-full bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition duration-300 text-sm';
            viewButton.onclick = () => detailCallback(recipe.id);

            contentDiv.appendChild(title);
            contentDiv.appendChild(ingredientInfo);
            contentDiv.appendChild(viewButton);
            card.appendChild(img);
            card.appendChild(contentDiv);
            containerElement.appendChild(card);
        });
    };

    const showLoading = (element) => {
        element.classList.remove('hidden');
    };

    const hideLoading = (element) => {
        element.classList.add('hidden');
    };

     const displayMessage = (element, message, show) => {
        element.textContent = message;
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    };

    const showError = (element, message) => {
        displayMessage(element, message, true);
    };

    const hideError = (element) => {
         displayMessage(element, '', false);
    };

    const toggleModal = (modalElement, show) => {
        if (show) {
            modalElement.classList.remove('hidden');
            modalElement.classList.add('flex'); // Use flex for centering
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            modalElement.classList.add('hidden');
            modalElement.classList.remove('flex');
            document.body.style.overflow = ''; // Restore background scrolling
        }
    };

    const displayRecipeDetails = (modalElement, recipeDetails) => {
        const titleEl = modalElement.querySelector('#modal-recipe-title');
        const imageEl = modalElement.querySelector('#modal-recipe-image');
        const ingredientsUl = modalElement.querySelector('#modal-recipe-ingredients');
        const instructionsDiv = modalElement.querySelector('#modal-recipe-instructions');
        const sourceLink = modalElement.querySelector('#modal-recipe-source');
        const saveBtn = modalElement.querySelector('#save-recipe-btn');
        const remixBtn = modalElement.querySelector('#remix-ingredients-btn');

        titleEl.textContent = recipeDetails.title || 'Recipe Details';

        if (recipeDetails.image) {
            imageEl.src = recipeDetails.image;
            imageEl.alt = recipeDetails.title;
            imageEl.classList.remove('hidden');
        } else {
            imageEl.classList.add('hidden');
        }

        ingredientsUl.innerHTML = ''; // Clear previous ingredients
        if (recipeDetails.ingredients && recipeDetails.ingredients.length > 0) {
            recipeDetails.ingredients.forEach(ing => {
                const li = document.createElement('li');
                li.textContent = ing.original; // Display the original string
                ingredientsUl.appendChild(li);
            });
        } else {
            ingredientsUl.innerHTML = '<li>Ingredient information not available.</li>';
        }
        // Reset editability state visually
        makeIngredientsEditable(ingredientsUl, remixBtn, false);


        // Sanitize instructions if they might contain HTML (like from summary)
        // For basic text instructions, direct assignment is fine.
        // If using summary which can have HTML:
        // const tempDiv = document.createElement('div');
        // tempDiv.innerHTML = recipeDetails.instructions || recipeDetails.summary || 'No instructions provided.';
        // instructionsDiv.innerHTML = ''; // Clear previous
        // instructionsDiv.appendChild(tempDiv); // Append sanitized content
        // For plain text instructions (safer):
        instructionsDiv.innerHTML = ''; // Clear previous
        const instructionsText = recipeDetails.instructions || 'No instructions provided.';
        instructionsText.split('\n').forEach(line => {
            if (line.trim()) {
                const p = document.createElement('p');
                p.textContent = line;
                instructionsDiv.appendChild(p);
            }
        });


        if (recipeDetails.sourceUrl) {
            sourceLink.href = recipeDetails.sourceUrl;
            sourceLink.classList.remove('hidden');
        } else {
            sourceLink.classList.add('hidden');
        }

        // Store recipe ID on the save button for easy access
        saveBtn.dataset.recipeId = recipeDetails.id;
    };

     const makeIngredientsEditable = (containerElement, buttonElement, editable) => {
        containerElement.contentEditable = editable;
        if (editable) {
            containerElement.classList.add('border', 'border-emerald-300', 'p-2', 'rounded', 'bg-emerald-50');
            containerElement.focus();
            buttonElement.innerHTML = '<i class="fas fa-check mr-1"></i> Finish Remixing';
            buttonElement.classList.add('text-green-700');
        } else {
            containerElement.classList.remove('border', 'border-emerald-300', 'p-2', 'rounded', 'bg-emerald-50');
            buttonElement.innerHTML = '<i class="fas fa-edit mr-1"></i> Remix Ingredients';
            buttonElement.classList.remove('text-green-700');
        }
    };

     const displaySavedRecipes = (containerElement, noResultsElement, savedRecipes, detailCallback, removeCallback) => {
        containerElement.innerHTML = ''; // Clear previous list
        if (!savedRecipes || savedRecipes.length === 0) {
            displayMessage(noResultsElement, 'You haven\'t saved any recipes yet.', true);
            return;
        }

        displayMessage(noResultsElement, '', false); // Hide the 'no saved recipes' message

        savedRecipes.forEach(recipe => {
            const recipeDiv = document.createElement('div');
            recipeDiv.className = 'p-4 border rounded-lg bg-white flex justify-between items-center shadow-sm';

            const titleSpan = document.createElement('span');
            titleSpan.textContent = recipe.title;
            titleSpan.className = 'font-medium text-gray-700';
             if (recipe.isRemixed) {
                const remixBadge = document.createElement('span');
                remixBadge.textContent = 'Remixed';
                remixBadge.className = 'ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full';
                titleSpan.appendChild(remixBadge);
            }


            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'space-x-2 flex-shrink-0';

            const viewBtn = document.createElement('button');
            viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
            viewBtn.className = 'text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300';
            viewBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent triggering other clicks if nested
                // We need to fetch details again or ensure the saved object has enough info
                // For simplicity, let's assume detailCallback handles fetching if needed
                 detailCallback(recipe.id);
            };

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Remove';
            removeBtn.className = 'text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300';
            removeBtn.onclick = (e) => {
                 e.stopPropagation();
                 removeCallback(recipe.id);
            };

            buttonsDiv.appendChild(viewBtn);
            buttonsDiv.appendChild(removeBtn);
            recipeDiv.appendChild(titleSpan);
            recipeDiv.appendChild(buttonsDiv);
            containerElement.appendChild(recipeDiv);
        });
    };

    const toggleSavedRecipesView = (sectionElement, show) => {
         if (show) {
            sectionElement.classList.remove('hidden');
        } else {
            sectionElement.classList.add('hidden');
        }
    };

    const updateShareLinks = (recipeDetails) => {
        const shareEmail = document.getElementById('share-email');
        const shareTwitter = document.getElementById('share-twitter');
        const shareFacebook = document.getElementById('share-facebook');

        const recipeUrl = recipeDetails.sourceUrl || window.location.href; // Fallback to current page if no source URL
        const shareText = `Check out this recipe: ${recipeDetails.title}`;

        // Email
        shareEmail.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`I found this recipe: ${recipeDetails.title}\n\n${recipeUrl}`)}`;

        // Twitter
        shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(recipeUrl)}`;

        // Facebook (Note: Facebook share URL is less reliable for pre-filling text)
        shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`;
    };

     const toggleShareOptions = (shareOptionsElement) => {
        shareOptionsElement.classList.toggle('hidden');
    };

     const hideShareOptions = (shareOptionsElement) => {
        shareOptionsElement.classList.add('hidden');
    };


    // Public interface
    return {
        displayIngredients,
        clearRecipes,
        displayRecipes,
        showLoading,
        hideLoading,
        displayMessage,
        showError,
        hideError,
        toggleModal,
        displayRecipeDetails,
        makeIngredientsEditable,
        displaySavedRecipes,
        toggleSavedRecipesView,
        updateShareLinks,
        toggleShareOptions,
        hideShareOptions
    };

})();