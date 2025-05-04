const Storage = (() => {
    const SETTINGS_KEY = 'dailyDelightSettings';
    const USER_DATA_KEY = 'dailyDelightUserData';
    const CONTENT_CACHE_KEY = 'dailyDelightContentCache';

    // --- Helper Functions ---
    function _getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return null;
        }
    }

    function _setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
            // Handle potential storage quota exceeded errors if necessary
        }
    }

    // --- Settings ---
    const defaultSettings = {
        categories: ['affirmations', 'quotes', 'meditations'],
        notifications: {
            enabled: false,
            time: '09:00' // Default time
        }
    };

    function loadSettings() {
        const savedSettings = _getItem(SETTINGS_KEY);
        // Merge saved settings with defaults to ensure all keys exist
        return { ...defaultSettings, ...savedSettings, notifications: { ...defaultSettings.notifications, ...(savedSettings?.notifications || {}) } };
    }

    function saveSettings(settings) {
        _setItem(SETTINGS_KEY, settings);
    }

    // --- User Data ---
    const defaultUserData = {
        favorites: [], // Array of content IDs
        completed: [], // Array of content IDs
        streak: 0,
        lastVisitDate: null, // Store as Date().toDateString()
        completedToday: false // Has the user interacted (e.g., completed) today to count towards streak
    };

    function loadUserData() {
        const savedUserData = _getItem(USER_DATA_KEY);
        // Merge saved data with defaults
        return { ...defaultUserData, ...savedUserData };
    }

    function saveUserData(userData) {
        _setItem(USER_DATA_KEY, userData);
    }

    function toggleFavorite(contentItem) {
        if (!contentItem || !contentItem.id) return false;
        const userData = loadUserData();
        const index = userData.favorites.indexOf(contentItem.id);
        let isFavorited;
        if (index > -1) {
            userData.favorites.splice(index, 1); // Remove if exists
            isFavorited = false;
        } else {
            userData.favorites.push(contentItem.id); // Add if not exists
            isFavorited = true;
        }
        saveUserData(userData);
        return isFavorited;
    }

    function isFavorited(contentItem) {
        if (!contentItem || !contentItem.id) return false;
        const userData = loadUserData();
        return userData.favorites.includes(contentItem.id);
    }

     function markCompleted(contentItem) {
        if (!contentItem || !contentItem.id) return false;
        const userData = loadUserData();
        let isCompleted = false;
        if (!userData.completed.includes(contentItem.id)) {
            userData.completed.push(contentItem.id);
            // Optionally limit the size of the completed array if needed
            // e.g., userData.completed = userData.completed.slice(-100);
            isCompleted = true; // Mark as newly completed
        } else {
            isCompleted = true; // Already completed, return true
        }
        // Don't modify completedToday here, let streak logic handle it
        saveUserData(userData);
        return isCompleted; // Return true if it's now marked as completed (either newly or previously)
    }

    function isCompleted(contentItem) {
        if (!contentItem || !contentItem.id) return false;
        const userData = loadUserData();
        return userData.completed.includes(contentItem.id);
    }

    function getLastVisitDate() {
        const userData = loadUserData();
        return userData.lastVisitDate;
    }

    function setLastVisitDate(dateString) {
        const userData = loadUserData();
        userData.lastVisitDate = dateString;
        // Reset completedToday flag when the visit date changes
        userData.completedToday = false;
        saveUserData(userData);
    }

    // --- Content Cache ---
    function cacheContent(dateString, contentItem) {
         if (!contentItem) return;
         const cacheData = {
             date: dateString,
             content: contentItem
         };
         _setItem(CONTENT_CACHE_KEY, cacheData);
         console.log(`Content cached for date: ${dateString}`);
    }

    function getCachedContent(dateString) {
        const cacheData = _getItem(CONTENT_CACHE_KEY);
        if (cacheData && cacheData.date === dateString && cacheData.content) {
            console.log(`Cache hit for date: ${dateString}`);
            return cacheData.content;
        }
        console.log(`Cache miss or expired for date: ${dateString}`);
        return null;
    }

    // Public API
    return {
        loadSettings,
        saveSettings,
        loadUserData,
        saveUserData,
        toggleFavorite,
        isFavorited,
        markCompleted,
        isCompleted,
        getLastVisitDate,
        setLastVisitDate,
        cacheContent,
        getCachedContent
    };

})();