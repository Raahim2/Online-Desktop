document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const contentTextElement = document.getElementById('content-text');
    const contentTypeElement = document.getElementById('content-type');
    const contentDisplayElement = document.getElementById('content-display');
    const favoriteButton = document.getElementById('favorite-button');
    const completeButton = document.getElementById('complete-button');
    const shareButton = document.getElementById('share-button');
    const settingsButton = document.getElementById('settings-button');
    const closeSettingsButton = document.getElementById('close-settings-button');
    const saveSettingsButton = document.getElementById('save-settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const streakCountElement = document.getElementById('streak-count');
    const offlineIndicator = document.getElementById('offline-indicator');
    const currentYearElement = document.getElementById('current-year');

    // Settings Elements
    const categoryCheckboxes = document.querySelectorAll('input[name="categories"]');
    const enableNotificationsCheckbox = document.getElementById('enable-notifications');
    const notificationTimeInput = document.getElementById('notification-time');
    const notificationPermissionStatus = document.getElementById('notification-permission-status');

    // --- State ---
    let currentContent = null;
    let settings = Storage.loadSettings();
    let userData = Storage.loadUserData();

    // --- Initialization ---
    function initApp() {
        console.log("Initializing Daily Dose of Delight...");
        currentYearElement.textContent = new Date().getFullYear();
        UI.populateSettings(settings);
        updateStreakCounter();
        loadAndDisplayContent();
        setupEventListeners();
        checkOnlineStatus();
        updateNotificationSettingsUI(); // Initial state based on loaded settings
        NotificationService.updatePermissionStatus(); // Check permission on load
        checkAndUpdateStreak();
        console.log("App Initialized.");
    }

    // --- Content Management ---
    async function loadAndDisplayContent() {
        const today = new Date().toDateString();
        let contentToShow = Storage.getCachedContent(today);
        let source = 'cache';

        if (!contentToShow || contentToShow.categories.join(',') !== settings.categories.join(',')) {
            // Fetch new content if not cached for today or if categories changed
            try {
                contentToShow = await ContentService.getDailyContent(settings.categories);
                if (contentToShow) {
                    Storage.cacheContent(today, contentToShow);
                    source = 'fetch';
                } else {
                    // Fallback if fetch fails and cache is empty/invalid
                    contentToShow = Storage.getCachedContent(today) || ContentService.getFallbackContent();
                    source = contentToShow ? 'cache-fallback' : 'static-fallback';
                }
            } catch (error) {
                console.error("Error fetching content:", error);
                contentToShow = Storage.getCachedContent(today) || ContentService.getFallbackContent();
                source = contentToShow ? 'cache-error-fallback' : 'static-error-fallback';
            }
        }

        console.log(`Displaying content from: ${source}`);
        if (contentToShow) {
            currentContent = contentToShow;
            UI.displayContent(currentContent);
            updateInteractionButtons();
        } else {
            UI.displayContent({ text: "Could not load content. Please check your connection or settings.", type: "Error" });
            // Disable interaction buttons if no content
            favoriteButton.disabled = true;
            completeButton.disabled = true;
            shareButton.disabled = true;
        }
    }

    // --- Streak Management ---
    function checkAndUpdateStreak() {
        const today = new Date().toDateString();
        const lastVisit = Storage.getLastVisitDate();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();

        if (lastVisit !== today) {
            // If it's a new day, check if the last visit was yesterday to continue the streak
            if (lastVisit === yesterdayString) {
                // Streak continues, but reset completion status for the new day's content
                userData.completedToday = false;
            } else {
                // Streak broken (or first visit)
                userData.streak = 0;
                userData.completedToday = false;
            }
            Storage.setLastVisitDate(today); // Mark today as visited
            Storage.saveUserData(userData);
            updateStreakCounter();
        }
        // If lastVisit IS today, do nothing - streak is already current.
    }

    function incrementStreak() {
        const today = new Date().toDateString();
        if (!userData.completedToday) {
            userData.streak = (Storage.getLastVisitDate() === today || Storage.getLastVisitDate() === new Date(Date.now() - 86400000).toDateString()) ? userData.streak + 1 : 1;
            userData.completedToday = true; // Mark as completed for streak purposes
            Storage.setLastVisitDate(today); // Ensure visit date is today
            Storage.saveUserData(userData);
            updateStreakCounter();
            console.log("Streak incremented:", userData.streak);
        }
    }


    function updateStreakCounter() {
        UI.updateStreakCounter(userData.streak);
    }

    // --- Interaction Buttons ---
    function handleFavoriteClick() {
        if (!currentContent) return;
        const isFavorited = Storage.toggleFavorite(currentContent);
        UI.toggleFavoriteIcon(favoriteButton, isFavorited);
        console.log(`Content ${isFavorited ? 'favorited' : 'unfavorited'}.`);
    }

    function handleCompleteClick() {
        if (!currentContent) return;
        // Mark as completed for the specific content ID
        const isCompleted = Storage.markCompleted(currentContent);
        UI.toggleCompleteIcon(completeButton, isCompleted);
        // Increment streak only if marking complete for the first time today
        incrementStreak();
        console.log(`Content marked as completed.`);
    }

    async function handleShareClick() {
        if (!currentContent) return;
        const shareData = {
            title: 'Daily Dose of Delight',
            text: `"${currentContent.text}" - Daily Dose of Delight (${currentContent.type})`,
            url: window.location.href // Or a specific URL if available
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                console.log('Content shared successfully via Web Share API.');
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareData.text);
                alert('Content copied to clipboard!'); // Simple feedback
                console.log('Content copied to clipboard.');
            } else {
                alert('Sharing not supported on this browser.');
                console.log('Sharing not supported.');
            }
        } catch (err) {
            console.error('Error sharing:', err);
            // Don't alert error to user unless necessary
        }
    }

    function updateInteractionButtons() {
        if (!currentContent) return;
        const isFavorited = Storage.isFavorited(currentContent);
        const isCompleted = Storage.isCompleted(currentContent);
        UI.toggleFavoriteIcon(favoriteButton, isFavorited);
        UI.toggleCompleteIcon(completeButton, isCompleted);
        // Re-enable buttons if they were disabled
        favoriteButton.disabled = false;
        completeButton.disabled = false;
        shareButton.disabled = false;
    }


    // --- Settings Management ---
    function handleSaveSettings() {
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // Ensure at least one category is selected
        if (selectedCategories.length === 0) {
            alert("Please select at least one content category.");
            // Optionally, re-check the first category or the previously saved ones
             categoryCheckboxes[0].checked = true;
             settings.categories = [categoryCheckboxes[0].value];
             // return; // Prevent saving if you want to force selection
        } else {
             settings.categories = selectedCategories;
        }


        const notificationsEnabled = enableNotificationsCheckbox.checked;
        const notificationTime = notificationTimeInput.value;

        settings.notifications.enabled = notificationsEnabled;
        settings.notifications.time = notificationTime;

        Storage.saveSettings(settings);
        UI.hideSettingsPanel();
        console.log("Settings saved:", settings);

        // Refresh content based on new categories
        loadAndDisplayContent();

        // Update notification schedule
        if (notificationsEnabled) {
            NotificationService.requestPermissionAndUpdateSchedule(notificationTime);
        } else {
            NotificationService.cancelNotifications();
        }
        updateNotificationSettingsUI(); // Reflect changes immediately
    }

    function updateNotificationSettingsUI() {
        const enabled = settings.notifications.enabled;
        enableNotificationsCheckbox.checked = enabled;
        notificationTimeInput.disabled = !enabled;
        notificationTimeInput.value = settings.notifications.time || '09:00'; // Default time if none set
        if (!enabled) {
            notificationPermissionStatus.textContent = ''; // Clear status if disabled
        } else {
             NotificationService.updatePermissionStatus(); // Update status text if enabled
        }
    }


    // --- Online/Offline Status ---
    function checkOnlineStatus() {
        if (!navigator.onLine) {
            handleOffline();
        }
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
    }

    function handleOnline() {
        UI.hideOfflineIndicator();
        console.log("Status: Online");
        // Optionally try to refresh content if coming back online
        loadAndDisplayContent();
    }

    function handleOffline() {
        UI.showOfflineIndicator();
        console.log("Status: Offline");
        // Content loading logic already handles falling back to cache/fallback
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        favoriteButton.addEventListener('click', handleFavoriteClick);
        completeButton.addEventListener('click', handleCompleteClick);
        shareButton.addEventListener('click', handleShareClick);
        settingsButton.addEventListener('click', () => {
            UI.populateSettings(settings); // Ensure settings panel shows current state
            updateNotificationSettingsUI(); // Update notification UI state
            NotificationService.updatePermissionStatus(); // Re-check permission status when opening
            UI.showSettingsPanel();
        });
        closeSettingsButton.addEventListener('click', UI.hideSettingsPanel);
        saveSettingsButton.addEventListener('click', handleSaveSettings);

        // Update notification time input enabled state based on checkbox
        enableNotificationsCheckbox.addEventListener('change', () => {
            const isEnabled = enableNotificationsCheckbox.checked;
            notificationTimeInput.disabled = !isEnabled;
             if (isEnabled) {
                // Request permission immediately if enabling
                NotificationService.requestPermissionAndUpdateSchedule(notificationTimeInput.value);
            } else {
                 NotificationService.cancelNotifications();
                 notificationPermissionStatus.textContent = ''; // Clear status text
            }
        });

         // Update schedule if time changes while enabled
        notificationTimeInput.addEventListener('change', () => {
            if (enableNotificationsCheckbox.checked) {
                 NotificationService.requestPermissionAndUpdateSchedule(notificationTimeInput.value);
            }
        });
    }

    // --- Start the App ---
    initApp();
});