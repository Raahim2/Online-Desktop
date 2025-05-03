// js/storage.js

const STORAGE_PREFIX = 'constellationCreator_';

/**
 * Saves constellation data to localStorage.
 * @param {string} name - The name of the constellation (used as part of the key).
 * @param {object} data - The constellation data object { name, stars, lines }.
 */
function saveConstellation(name, data) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        console.error("Invalid name provided for saving constellation.");
        return;
    }
    if (!data || typeof data !== 'object') {
         console.error("Invalid data provided for saving constellation.");
        return;
    }
    try {
        const key = STORAGE_PREFIX + name.trim();
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving constellation to localStorage:", error);
        // Handle potential storage quota exceeded errors
        if (error.name === 'QuotaExceededError') {
            alert("Could not save constellation. Browser storage might be full.");
        }
    }
}

/**
 * Loads constellation data from localStorage.
 * @param {string} name - The name of the constellation to load.
 * @returns {object|null} The loaded constellation data object, or null if not found or error.
 */
function loadConstellation(name) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        console.error("Invalid name provided for loading constellation.");
        return null;
    }
    try {
        const key = STORAGE_PREFIX + name.trim();
        const dataString = localStorage.getItem(key);
        if (dataString) {
            return JSON.parse(dataString);
        }
        return null; // Not found
    } catch (error) {
        console.error("Error loading constellation from localStorage:", error);
        return null;
    }
}

/**
 * Deletes a constellation from localStorage.
 * @param {string} name - The name of the constellation to delete.
 */
function deleteConstellation(name) {
     if (!name || typeof name !== 'string' || name.trim().length === 0) {
        console.error("Invalid name provided for deleting constellation.");
        return;
    }
    try {
        const key = STORAGE_PREFIX + name.trim();
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Error deleting constellation from localStorage:", error);
    }
}

/**
 * Retrieves a list of all saved constellation names.
 * @returns {string[]} An array of saved constellation names.
 */
function listSavedConstellations() {
    const names = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                // Extract name after the prefix
                names.push(key.substring(STORAGE_PREFIX.length));
            }
        }
    } catch (error) {
         console.error("Error listing saved constellations from localStorage:", error);
    }
    return names.sort(); // Return sorted names
}

/**
 * Populates a <select> element with the names of saved constellations.
 * @param {HTMLSelectElement} selectElement - The <select> element to populate.
 */
function populateLoadSelect(selectElement) {
    if (!selectElement || selectElement.tagName !== 'SELECT') {
        console.error("Invalid element provided to populateLoadSelect. Expected a SELECT element.");
        return;
    }

    const savedNames = listSavedConstellations();
    const currentSelectedValue = selectElement.value; // Preserve selection if possible

    // Clear existing options (keeping the first placeholder option if it exists)
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
     // Reset placeholder if needed
    if (selectElement.options.length > 0 && selectElement.options[0].value === "") {
        selectElement.options[0].textContent = "Select saved..."; // Ensure placeholder text
    } else if (selectElement.options.length === 0) {
        // Add a default placeholder if none exists
        const placeholderOption = document.createElement('option');
        placeholderOption.value = "";
        placeholderOption.textContent = "Select saved...";
        placeholderOption.disabled = true; // Optional: make it non-selectable
        placeholderOption.selected = true; // Optional: make it default
        selectElement.appendChild(placeholderOption);
    }


    // Add new options
    savedNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        selectElement.appendChild(option);
    });

    // Try to re-select the previously selected value if it still exists
    if (savedNames.includes(currentSelectedValue)) {
        selectElement.value = currentSelectedValue;
    } else {
         selectElement.selectedIndex = 0; // Default to placeholder
    }

     // Disable load/delete buttons if no constellations are saved
    const loadButton = document.getElementById('loadButton');
    const deleteButton = document.getElementById('deleteButton');
    const hasSavedConstellations = savedNames.length > 0;

    if (loadButton) {
        loadButton.disabled = !hasSavedConstellations;
        loadButton.classList.toggle('opacity-50', !hasSavedConstellations);
        loadButton.classList.toggle('cursor-not-allowed', !hasSavedConstellations);
    }
     if (deleteButton) {
        deleteButton.disabled = !hasSavedConstellations;
        deleteButton.classList.toggle('opacity-50', !hasSavedConstellations);
        deleteButton.classList.toggle('cursor-not-allowed', !hasSavedConstellations);
    }
     // Also disable the select dropdown itself if empty
     selectElement.disabled = !hasSavedConstellations;


}