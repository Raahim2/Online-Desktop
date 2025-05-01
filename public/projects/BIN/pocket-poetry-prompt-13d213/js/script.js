document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const promptDisplay = document.getElementById('prompt-display');
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const copyBtn = document.getElementById('copy-btn');
    const viewSavedBtn = document.getElementById('view-saved-btn');
    const contributeBtn = document.getElementById('contribute-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const savedCountSpan = document.getElementById('saved-count');
    const toastNotification = document.getElementById('toast-notification');

    // Modals & Forms
    const savedPromptsModal = document.getElementById('saved-prompts-modal');
    const closeSavedModalBtn = document.getElementById('close-saved-modal-btn');
    const savedPromptsList = document.getElementById('saved-prompts-list');

    const contributeModal = document.getElementById('contribute-modal');
    const closeContributeModalBtn = document.getElementById('close-contribute-modal-btn');
    const contributeForm = document.getElementById('contribute-form');
    const newPromptInput = document.getElementById('new-prompt-input');
    const contributionMessage = document.getElementById('contribution-message');

    // --- State ---
    let currentPrompt = '';
    let allPrompts = typeof prompts !== 'undefined' ? [...prompts] : []; // Use prompts from prompts.js

    // --- Functions ---

    // Generate and display a new prompt
    const generateNewPrompt = () => {
        if (allPrompts.length === 0) {
            promptDisplay.textContent = 'No prompts available. Try contributing some!';
            currentPrompt = '';
            saveBtn.disabled = true;
            copyBtn.disabled = true;
            return;
        }
        const randomIndex = Math.floor(Math.random() * allPrompts.length);
        currentPrompt = allPrompts[randomIndex];
        promptDisplay.textContent = currentPrompt;
        promptDisplay.classList.remove('italic', 'text-gray-500', 'dark:text-gray-400'); // Remove placeholder styles
        saveBtn.disabled = false;
        copyBtn.disabled = false;
        // Add a subtle animation
        promptDisplay.parentNode.classList.add('animate-pulse-once');
        setTimeout(() => {
            promptDisplay.parentNode.classList.remove('animate-pulse-once');
        }, 500); // Match duration in CSS if defined
    };

    // Update the display of the saved prompts count
    const updateSavedCount = () => {
        const favorites = Storage.getFavorites();
        savedCountSpan.textContent = favorites.length;
    };

    // Show a toast notification
    const showToast = (message) => {
        toastNotification.textContent = message;
        toastNotification.classList.remove('opacity-0');
        toastNotification.classList.add('opacity-100');
        setTimeout(() => {
            toastNotification.classList.remove('opacity-100');
            toastNotification.classList.add('opacity-0');
        }, 2000);
    };

    // Populate and show the saved prompts modal
    const showSavedPrompts = () => {
        const favorites = Storage.getFavorites();
        savedPromptsList.innerHTML = ''; // Clear previous list

        if (favorites.length === 0) {
            savedPromptsList.innerHTML = '<li class="text-center text-gray-500 dark:text-gray-400">No prompts saved yet.</li>';
        } else {
            favorites.forEach((prompt, index) => {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded transition-colors duration-200';
                li.innerHTML = `
                    <span class="flex-1 mr-3">${prompt}</span>
                    <button data-index="${index}" class="remove-fav-btn text-red-500 hover:text-red-700 dark:hover:text-red-400 px-2 py-1 rounded transition-colors duration-200" aria-label="Remove prompt">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                savedPromptsList.appendChild(li);
            });

            // Add event listeners to remove buttons
            savedPromptsList.querySelectorAll('.remove-fav-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const indexToRemove = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                    Storage.removeFavoriteByIndex(indexToRemove);
                    showSavedPrompts(); // Refresh the list
                    updateSavedCount(); // Update the count display
                });
            });
        }
        savedPromptsModal.classList.remove('hidden');
    };

    // Hide the saved prompts modal
    const hideSavedPrompts = () => {
        savedPromptsModal.classList.add('hidden');
    };

    // Show the contribute modal
    const showContributeModal = () => {
        contributionMessage.classList.add('hidden'); // Hide previous message
        newPromptInput.value = ''; // Clear input
        contributeModal.classList.remove('hidden');
        newPromptInput.focus();
    };

    // Hide the contribute modal
    const hideContributeModal = () => {
        contributeModal.classList.add('hidden');
    };

    // Handle contribution form submission
    const handleContributionSubmit = (e) => {
        e.preventDefault();
        const newPrompt = newPromptInput.value.trim();
        if (newPrompt) {
            // In a real app, this would send the prompt to a server for review/addition.
            // For this demo, we'll just show a success message.
            // Optionally, add it to the current session's prompts:
            // if (!allPrompts.includes(newPrompt)) {
            //     allPrompts.push(newPrompt);
            // }
            contributionMessage.textContent = 'Thank you for your contribution!';
            contributionMessage.classList.remove('hidden');
            newPromptInput.value = '';
            setTimeout(() => {
                 hideContributeModal();
            }, 2000); // Close modal after a delay
        }
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        const htmlElement = document.documentElement;
        const isDark = htmlElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Update icon
        const moonIcon = darkModeToggle.querySelector('.fa-moon');
        const sunIcon = darkModeToggle.querySelector('.fa-sun');
        if (isDark) {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
    };

    // Set initial dark mode icon state
    const setInitialDarkModeIcon = () => {
         const isDark = document.documentElement.classList.contains('dark');
         const moonIcon = darkModeToggle.querySelector('.fa-moon');
         const sunIcon = darkModeToggle.querySelector('.fa-sun');
         if (isDark) {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
    };


    // --- Event Listeners ---
    generateBtn.addEventListener('click', generateNewPrompt);

    saveBtn.addEventListener('click', () => {
        if (currentPrompt) {
            const success = Storage.saveFavorite(currentPrompt);
            if (success) {
                showToast('Prompt saved!');
                updateSavedCount();
            } else {
                showToast('Prompt already saved.');
            }
        }
    });

    copyBtn.addEventListener('click', () => {
        if (currentPrompt && navigator.clipboard) {
            navigator.clipboard.writeText(currentPrompt)
                .then(() => {
                    showToast('Copied to clipboard!');
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    showToast('Failed to copy.');
                });
        } else if (currentPrompt) {
            // Fallback for older browsers (less common now)
            try {
                const textArea = document.createElement("textarea");
                textArea.value = currentPrompt;
                textArea.style.position = "fixed"; // Avoid scrolling to bottom
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('Copied to clipboard!');
            } catch (err) {
                console.error('Fallback copy failed: ', err);
                showToast('Failed to copy.');
            }
        }
    });

    viewSavedBtn.addEventListener('click', showSavedPrompts);
    closeSavedModalBtn.addEventListener('click', hideSavedPrompts);
    // Close modal if clicking outside the content
    savedPromptsModal.addEventListener('click', (e) => {
        if (e.target === savedPromptsModal) {
            hideSavedPrompts();
        }
    });

    contributeBtn.addEventListener('click', showContributeModal);
    closeContributeModalBtn.addEventListener('click', hideContributeModal);
     // Close modal if clicking outside the content
    contributeModal.addEventListener('click', (e) => {
        if (e.target === contributeModal) {
            hideContributeModal();
        }
    });
    contributeForm.addEventListener('submit', handleContributionSubmit);

    darkModeToggle.addEventListener('click', toggleDarkMode);

    // --- Initialization ---
    updateSavedCount();
    setInitialDarkModeIcon();
    // Disable save/copy initially if no prompt is loaded
    if (!currentPrompt) {
        saveBtn.disabled = true;
        copyBtn.disabled = true;
    }
    // Optional: Generate a prompt on initial load
    // generateNewPrompt();
});