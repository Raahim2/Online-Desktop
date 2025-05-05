let currentAmbientSound = null;
let currentNotificationSound = null;

// DOM Elements
const ambientSoundSelect = document.getElementById('ambient-sound-select');
const customSoundUpload = document.getElementById('custom-sound-upload');
const ambientAudioPlayer = document.getElementById('ambient-audio-player');
const notificationSoundSelect = document.getElementById('notification-sound-select');
const notificationSoundPlayer = document.getElementById('notification-sound-player');

function playAmbientSound(src) {
    if (!ambientAudioPlayer) return;

    if (src && src !== "") {
        if (ambientAudioPlayer.src !== src) {
             ambientAudioPlayer.src = src;
        }
        ambientAudioPlayer.play().catch(error => console.error("Error playing ambient sound:", error));
        currentAmbientSound = src;
        localStorage.setItem('selectedAmbientSound', src);
    } else {
        ambientAudioPlayer.pause();
        ambientAudioPlayer.currentTime = 0;
        ambientAudioPlayer.src = ""; // Clear source
        currentAmbientSound = null;
        localStorage.removeItem('selectedAmbientSound');
    }
}

function playNotificationSound() {
    if (!notificationSoundPlayer || !notificationSoundPlayer.src) {
        console.log("Notification sound player or source not set.");
        return;
    }
    notificationSoundPlayer.currentTime = 0; // Rewind to start
    notificationSoundPlayer.play().catch(error => console.error("Error playing notification sound:", error));
}


function setupSoundControls() {
    if (!ambientSoundSelect || !customSoundUpload || !ambientAudioPlayer || !notificationSoundSelect || !notificationSoundPlayer) {
        console.error("One or more sound control elements are missing.");
        return;
    }

    // --- Ambient Sound Setup ---
    const savedAmbientSound = localStorage.getItem('selectedAmbientSound');
    if (savedAmbientSound) {
         // Check if it's a built-in option or potentially a previously uploaded one (we won't restore uploaded ones easily across sessions this way)
        const isValidOption = Array.from(ambientSoundSelect.options).some(option => option.value === savedAmbientSound);
        if (isValidOption) {
            ambientSoundSelect.value = savedAmbientSound;
            // Don't auto-play on load, let user start it via timer or manually if desired
            // playAmbientSound(savedAmbientSound);
            ambientAudioPlayer.src = savedAmbientSound; // Set src for potential play later
            currentAmbientSound = savedAmbientSound;
        } else {
            localStorage.removeItem('selectedAmbientSound'); // Clean up invalid entry
        }
    } else {
        ambientSoundSelect.value = ""; // Default to "None"
    }


    ambientSoundSelect.addEventListener('change', (event) => {
        playAmbientSound(event.target.value);
        customSoundUpload.value = ''; // Clear file input if dropdown is used
    });

    customSoundUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                playAmbientSound(e.target.result);
                // Clear the dropdown selection as we are using a custom file
                ambientSoundSelect.value = "";
                // Note: Custom uploaded sound URL (data URL) won't persist across page loads unless stored differently
                localStorage.removeItem('selectedAmbientSound'); // Remove dropdown preference
            }
            reader.readAsDataURL(file);
        } else if (file) {
            alert("Please select a valid audio file.");
            customSoundUpload.value = ''; // Clear invalid file
        }
    });

     // Optional: Link ambient sound play/pause to timer start/pause
     const startPauseButton = document.getElementById('start-pause-button');
     if (startPauseButton) {
         startPauseButton.addEventListener('click', () => {
             // Check if timer is *about* to start (currently paused/stopped)
             // We need the state *before* the click handler in timer.js runs, which is tricky.
             // A simpler approach: Play ambient sound if selected and timer is running, pause otherwise.
             // This requires access to the timer's state (isRunning). Let's assume timer.js manages this.
             // We'll modify timer.js to call functions here.

             // Placeholder: timer.js should call toggleAmbientSound(shouldPlay)
         });
     }


    // --- Notification Sound Setup ---
    const savedNotificationSound = localStorage.getItem('selectedNotificationSound');
     if (savedNotificationSound) {
        const isValidOption = Array.from(notificationSoundSelect.options).some(option => option.value === savedNotificationSound);
        if (isValidOption) {
            notificationSoundSelect.value = savedNotificationSound;
            notificationSoundPlayer.src = savedNotificationSound;
            currentNotificationSound = savedNotificationSound;
        } else {
             localStorage.removeItem('selectedNotificationSound');
        }
    }

    // Set initial source if not loaded from storage
    if (!notificationSoundPlayer.src && notificationSoundSelect.value) {
         notificationSoundPlayer.src = notificationSoundSelect.value;
         currentNotificationSound = notificationSoundSelect.value;
    }


    notificationSoundSelect.addEventListener('change', (event) => {
        const newSrc = event.target.value;
        if (newSrc) {
            notificationSoundPlayer.src = newSrc;
            currentNotificationSound = newSrc;
            localStorage.setItem('selectedNotificationSound', newSrc);
            // Play a preview? Optional.
            // playNotificationSound();
        } else {
             notificationSoundPlayer.src = "";
             currentNotificationSound = null;
             localStorage.removeItem('selectedNotificationSound');
        }
    });
}

// Function to be called by timer.js
function toggleAmbientSound(shouldPlay) {
    if (!ambientAudioPlayer || !currentAmbientSound) return;

    if (shouldPlay) {
        ambientAudioPlayer.play().catch(error => console.error("Error playing ambient sound:", error));
    } else {
        ambientAudioPlayer.pause();
    }
}


// Make functions globally accessible
window.setupSoundControls = setupSoundControls;
window.playNotificationSound = playNotificationSound;
window.toggleAmbientSound = toggleAmbientSound; // For timer.js to call