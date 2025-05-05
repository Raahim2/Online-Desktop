document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const suggestActivityButton = document.getElementById('suggest-activity-button');
    const breakActivitySuggestion = document.getElementById('break-activity-suggestion');

    // --- Break Activity Suggestions ---
    const breakActivities = [
        "Do 10 jumping jacks.",
        "Stretch your arms and neck.",
        "Walk around the room for 2 minutes.",
        "Drink a glass of water.",
        "Close your eyes and take 5 deep breaths.",
        "Look out the window at something far away.",
        "Do a quick 1-minute meditation.",
        "Tidy up one small area of your desk.",
        "Listen to one uplifting song.",
        "Think of 3 things you are grateful for.",
        "Do 5 push-ups or wall push-ups.",
        "Quickly sketch something.",
        "Read a page from a non-work-related book.",
        "Plan a healthy snack.",
        "Water a plant."
    ];

    // --- Event Listeners ---
    suggestActivityButton.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * breakActivities.length);
        breakActivitySuggestion.textContent = breakActivities[randomIndex];
        breakActivitySuggestion.classList.remove('italic');
    });

    // --- Initialization ---
    // Initialize other modules by calling their setup functions
    // Assumes functions like `setupTimerControls`, `setupThemeControls`, etc. exist in respective files
    if (typeof setupTimerControls === 'function') {
        setupTimerControls();
    } else {
        console.error('timer.js setup function not found.');
    }

    if (typeof setupThemeControls === 'function') {
        setupThemeControls();
    } else {
        console.error('themes.js setup function not found.');
    }

    if (typeof setupSoundControls === 'function') {
        setupSoundControls();
    } else {
        console.error('sounds.js setup function not found.');
    }

     if (typeof setupTaskControls === 'function') {
        setupTaskControls();
    } else {
        console.error('tasks.js setup function not found.');
    }

    if (typeof setupCharts === 'function') {
        setupCharts();
        // Potentially load initial chart data here if needed
    } else {
        console.error('charts.js setup function not found.');
    }

    console.log("Personalized Pomodoro Playground Initialized.");

});