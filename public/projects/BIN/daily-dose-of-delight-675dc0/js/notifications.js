const NotificationService = (() => {
    let notificationTimeoutId = null;
    const PERMISSION_GRANTED = 'granted';
    const PERMISSION_DENIED = 'denied';
    const PERMISSION_DEFAULT = 'default';

    function isSupported() {
        return 'Notification' in window;
    }

    function getPermissionStatusElement() {
        // Assumes this element exists in the DOM
        return document.getElementById('notification-permission-status');
    }

    function updatePermissionStatus() {
        const statusElement = getPermissionStatusElement();
        if (!statusElement || !isSupported()) return;

        const permission = Notification.permission;
        if (permission === PERMISSION_GRANTED) {
            statusElement.textContent = 'Notifications enabled.';
            statusElement.className = 'text-xs text-green-600 mt-1';
        } else if (permission === PERMISSION_DENIED) {
            statusElement.textContent = 'Notifications blocked by browser.';
            statusElement.className = 'text-xs text-red-500 mt-1';
        } else {
            statusElement.textContent = 'Click "Enable" to allow notifications.';
             statusElement.className = 'text-xs text-gray-500 mt-1';
        }
    }

    async function requestPermission() {
        if (!isSupported()) {
            console.warn("Notifications not supported by this browser.");
            return PERMISSION_DENIED; // Treat as denied if not supported
        }

        const permission = await Notification.requestPermission();
        updatePermissionStatus(); // Update UI after permission change
        if (permission === PERMISSION_GRANTED) {
            console.log("Notification permission granted.");
        } else if (permission === PERMISSION_DENIED) {
            console.log("Notification permission denied.");
        } else {
            console.log("Notification permission default (dismissed).");
        }
        return permission;
    }

    function scheduleNotification(timeString) { // timeString format "HH:MM"
        if (!isSupported() || Notification.permission !== PERMISSION_GRANTED) {
            console.log("Cannot schedule notification: Not supported or permission not granted.");
            return;
        }

        cancelNotifications(); // Clear any existing timeout

        const now = new Date();
        const [hours, minutes] = timeString.split(':').map(Number);

        let notificationTime = new Date();
        notificationTime.setHours(hours, minutes, 0, 0);

        // If the time has already passed today, schedule for tomorrow
        if (notificationTime <= now) {
            notificationTime.setDate(notificationTime.getDate() + 1);
        }

        const delay = notificationTime.getTime() - now.getTime();

        if (delay < 0) {
             console.error("Calculated negative delay for notification. Scheduling for tomorrow.");
             notificationTime.setDate(notificationTime.getDate() + 1); // Ensure it's tomorrow
             const correctedDelay = notificationTime.getTime() - now.getTime();
             if(correctedDelay > 0) {
                notificationTimeoutId = setTimeout(showNotification, correctedDelay);
                console.log(`Notification scheduled for ${notificationTime.toLocaleString()}`);
             } else {
                 console.error("Could not schedule notification even for tomorrow.");
             }
        } else {
            notificationTimeoutId = setTimeout(showNotification, delay);
            console.log(`Notification scheduled for ${notificationTime.toLocaleString()}`);
        }


        // Note: setTimeout is not reliable if the browser/tab is closed.
        // A Service Worker is required for robust background notifications.
    }

    function showNotification() {
        if (!isSupported() || Notification.permission !== PERMISSION_GRANTED) {
            return; // Double check permission before showing
        }

        const title = "Daily Dose of Delight";
        const options = {
            body: "Your daily moment of positivity is ready!",
            icon: '/icon.png', // Optional: Add an icon file to your project root
            // tag: 'daily-delight-notification' // Optional: Use a tag to replace existing notifications
        };

        // Check for Service Worker registration to potentially use that instead
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
             navigator.serviceWorker.controller.postMessage({ type: 'showNotification', title, options });
             console.log("Notification request sent via Service Worker.");
        } else {
            // Fallback to basic notification if no active SW controller
            try {
                 const notification = new Notification(title, options);
                 notification.onclick = () => {
                     window.focus(); // Bring tab to focus on click
                     // Optionally navigate to the app URL if needed
                 };
                 console.log("Basic notification shown.");
            } catch (err) {
                 console.error("Error showing basic notification:", err);
            }

        }


        // Re-schedule for the next day automatically ONLY if settings still enabled
        const settings = Storage.loadSettings(); // Need access to settings
        if (settings.notifications.enabled) {
            scheduleNotification(settings.notifications.time);
        }
    }

    function cancelNotifications() {
        if (notificationTimeoutId) {
            clearTimeout(notificationTimeoutId);
            notificationTimeoutId = null;
            console.log("Notification schedule cancelled.");
        }
         // If using Service Worker, might need to send a message to cancel there too
         if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
             navigator.serviceWorker.controller.postMessage({ type: 'cancelNotifications' });
         }
    }

     async function requestPermissionAndUpdateSchedule(timeString) {
        if (!isSupported()) return;

        const permission = await requestPermission();
        if (permission === PERMISSION_GRANTED && timeString) {
            scheduleNotification(timeString);
        } else {
            cancelNotifications(); // Ensure cancelled if permission not granted
        }
    }


    // Public API
    return {
        isSupported,
        requestPermission,
        scheduleNotification,
        cancelNotifications,
        updatePermissionStatus,
        requestPermissionAndUpdateSchedule
    };

})();