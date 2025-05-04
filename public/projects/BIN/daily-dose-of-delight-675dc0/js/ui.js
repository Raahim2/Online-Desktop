const UI = (() => {

    // --- DOM Element References ---
    // We get references inside functions where needed to ensure DOM is loaded,
    // or assume they are passed as arguments if needed frequently.

    function displayContent(contentItem) {
        const contentTextElement = document.getElementById('content-text');
        const contentTypeElement = document.getElementById('content-type');
        const contentDisplayElement = document.getElementById('content-display');

        if (!contentTextElement || !contentTypeElement || !contentDisplayElement) {
            console.error("Required content display elements not found.");
            return;
        }

        // Reset animation
        contentDisplayElement.classList.remove('fade-in');
        // Force reflow to restart animation - slight delay helps ensure it works
        void contentDisplayElement.offsetWidth;

        if (contentItem && contentItem.text) {
            contentTextElement.textContent = contentItem.text;
            contentTypeElement.textContent = contentItem.type || '';
            // Trigger fade-in animation
            contentDisplayElement.classList.add('fade-in');
        } else {
            contentTextElement.textContent = 'No content available.';
            contentTypeElement.textContent = 'Info';
        }
    }

    function toggleFavoriteIcon(buttonElement, isFavorited) {
        if (!buttonElement) return;
        const icon = buttonElement.querySelector('i');
        if (!icon) return;

        if (isFavorited) {
            icon.classList.remove('far');
            icon.classList.add('fas', 'text-red-500'); // Solid heart, red color
            buttonElement.classList.add('bg-red-100'); // Add background on active state
            buttonElement.setAttribute('aria-pressed', 'true');
        } else {
            icon.classList.remove('fas', 'text-red-500');
            icon.classList.add('far'); // Outline heart, default color
            buttonElement.classList.remove('bg-red-100'); // Remove background
            buttonElement.setAttribute('aria-pressed', 'false');
        }
    }

    function toggleCompleteIcon(buttonElement, isCompleted) {
        if (!buttonElement) return;
        const icon = buttonElement.querySelector('i');
        if (!icon) return;

        if (isCompleted) {
            icon.classList.remove('far');
            icon.classList.add('fas', 'text-green-500'); // Solid check, green color
             buttonElement.classList.add('bg-green-100'); // Add background on active state
             buttonElement.setAttribute('aria-pressed', 'true');
        } else {
            icon.classList.remove('fas', 'text-green-500');
            icon.classList.add('far'); // Outline check, default color
            buttonElement.classList.remove('bg-green-100'); // Remove background
            buttonElement.setAttribute('aria-pressed', 'false');
        }
    }

    function showSettingsPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.remove('hidden');
            // Optional: Add focus management, e.g., focus the first input or close button
            const closeButton = document.getElementById('close-settings-button');
            if(closeButton) closeButton.focus();
        }
    }

    function hideSettingsPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.add('hidden');
             // Optional: Return focus to the settings button
            const settingsButton = document.getElementById('settings-button');
            if(settingsButton) settingsButton.focus();
        }
    }

    function populateSettings(settings) {
        // Categories
        const categoryCheckboxes = document.querySelectorAll('input[name="categories"]');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = settings.categories.includes(checkbox.value);
        });

        // Notifications
        const enableNotificationsCheckbox = document.getElementById('enable-notifications');
        const notificationTimeInput = document.getElementById('notification-time');

        if (enableNotificationsCheckbox) {
            enableNotificationsCheckbox.checked = settings.notifications.enabled;
        }
        if (notificationTimeInput) {
            notificationTimeInput.value = settings.notifications.time || '09:00';
            notificationTimeInput.disabled = !settings.notifications.enabled;
        }
    }

    function updateStreakCounter(streakCount) {
        const streakCountElement = document.getElementById('streak-count');
        if (streakCountElement) {
            streakCountElement.textContent = streakCount || 0;
             // Optional: Add animation on update
             const counterContainer = streakCountElement.closest('span');
             if (counterContainer) {
                 counterContainer.classList.add('animate-pulse'); // Simple pulse
                 setTimeout(() => counterContainer.classList.remove('animate-pulse'), 1000); // Remove after a bit
             }
        }
    }

    function showOfflineIndicator() {
        const offlineIndicator = document.getElementById('offline-indicator');
        if (offlineIndicator) {
            offlineIndicator.classList.remove('hidden');
        }
    }

    function hideOfflineIndicator() {
        const offlineIndicator = document.getElementById('offline-indicator');
        if (offlineIndicator) {
            offlineIndicator.classList.add('hidden');
        }
    }


    // Public API
    return {
        displayContent,
        toggleFavoriteIcon,
        toggleCompleteIcon,
        showSettingsPanel,
        hideSettingsPanel,
        populateSettings,
        updateStreakCounter,
        showOfflineIndicator,
        hideOfflineIndicator
    };

})();