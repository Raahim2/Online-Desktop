const FAVORITES_STORAGE_KEY = 'recipeRemixerFavorites';

function getFavorites() {
    const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY);
    try {
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (e) {
        console.error("Error parsing favorites from localStorage:", e);
        return [];
    }
}

function saveFavorite(recipe) {
    if (!recipe || typeof recipe.id === 'undefined') {
        console.error("Cannot save favorite: invalid recipe object provided.", recipe);
        return;
    }
    const favorites = getFavorites();
    // Check if recipe already exists (by id) to avoid duplicates or update it
    const existingIndex = favorites.findIndex(fav => fav.id === recipe.id);
    if (existingIndex > -1) {
        // Update existing favorite (e.g., with new notes or serving size)
        favorites[existingIndex] = recipe;
    } else {
        // Add new favorite
        favorites.push(recipe);
    }
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

function removeFavorite(recipeId) {
     if (typeof recipeId === 'undefined') {
        console.error("Cannot remove favorite: invalid recipe ID provided.", recipeId);
        return;
    }
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav.id !== recipeId);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

function isFavorite(recipeId) {
     if (typeof recipeId === 'undefined') {
        return false;
    }
    const favorites = getFavorites();
    return favorites.some(fav => fav.id === recipeId);
}

function getFavoriteById(recipeId) {
    if (typeof recipeId === 'undefined') {
        return null;
    }
    const favorites = getFavorites();
    return favorites.find(fav => fav.id === recipeId) || null;
}