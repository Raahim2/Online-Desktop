function applyTheme(themeUrl) {
    const backgroundElement = document.getElementById('app-background');
    if (backgroundElement && themeUrl) {
        // Preload the image to ensure smoother transition
        const img = new Image();
        img.onload = () => {
            backgroundElement.style.backgroundImage = `url('${themeUrl}')`;
            localStorage.setItem('selectedTheme', themeUrl); // Save preference
        };
        img.onerror = () => {
            console.error(`Failed to load theme image: ${themeUrl}`);
            // Optionally fallback to a default theme or color
            backgroundElement.style.backgroundImage = ''; // Remove potentially broken background
            backgroundElement.classList.add('bg-gray-100'); // Example fallback
        };
        img.src = themeUrl;
    } else if (backgroundElement) {
         // Handle cases where themeUrl might be empty or invalid (e.g., future "None" option)
         backgroundElement.style.backgroundImage = '';
         backgroundElement.classList.add('bg-gray-100'); // Example fallback
         localStorage.removeItem('selectedTheme');
    }
}

function setupThemeControls() {
    const themeSelect = document.getElementById('theme-select');

    if (!themeSelect) {
        console.error("Theme select element not found.");
        return;
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        // Check if the saved theme is still a valid option
        const isValidOption = Array.from(themeSelect.options).some(option => option.value === savedTheme);
        if (isValidOption) {
            themeSelect.value = savedTheme;
            applyTheme(savedTheme);
        } else {
             // Saved theme is no longer valid, apply default
             localStorage.removeItem('selectedTheme');
             applyTheme(themeSelect.value);
        }
    } else {
        // Apply the default theme selected in HTML
        applyTheme(themeSelect.value);
    }


    themeSelect.addEventListener('change', (event) => {
        applyTheme(event.target.value);
    });
}

// Make setupThemeControls globally accessible
window.setupThemeControls = setupThemeControls;