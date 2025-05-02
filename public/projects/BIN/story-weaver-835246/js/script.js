document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentStoryId = null;
    let storyUpdateInterval = null; // For real-time updates polling

    // DOM Elements
    const storyListView = document.getElementById('view-story-list');
    const singleStoryView = document.getElementById('view-single-story');
    const storyListContainer = document.getElementById('story-list-container');
    const loadingStoriesIndicator = document.getElementById('loading-stories');
    const storyTitleElement = document.getElementById('story-title');
    const storyContentElement = document.getElementById('story-content');
    const sentenceInputElement = document.getElementById('sentence-input');
    const addSentenceForm = document.getElementById('add-sentence-form');
    const addSentenceError = document.getElementById('add-sentence-error');
    const addSentenceButton = document.getElementById('add-sentence-btn');
    const backToListButton = document.getElementById('back-to-list-btn');
    const showNewStoryFormButton = document.getElementById('show-new-story-form-btn');
    const newStoryForm = document.getElementById('new-story-form');
    const cancelNewStoryButton = document.getElementById('cancel-new-story-btn');
    const newStoryTitleInput = document.getElementById('new-story-title');
    const firstSentenceInput = document.getElementById('first-sentence');
    const newStoryError = document.getElementById('new-story-error');

    // --- Initialization ---
    async function init() {
        ui.showStoryListView();
        await loadStories();
        setupEventListeners();
    }

    // --- Data Loading ---
    async function loadStories() {
        ui.setLoading(loadingStoriesIndicator, true);
        storyListContainer.innerHTML = ''; // Clear previous stories
        try {
            const stories = await api.getStories();
            ui.displayStories(storyListContainer, stories, handleStoryClick);
            if (stories.length === 0) {
                 storyListContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center">No stories yet. Why not start one?</p>';
            }
        } catch (error) {
            console.error("Failed to load stories:", error);
            storyListContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">Could not load stories. Please try again later.</p>';
        } finally {
            ui.setLoading(loadingStoriesIndicator, false);
        }
    }

    async function loadSingleStory(storyId) {
        stopRealtimeUpdates(); // Stop previous polling if any
        currentStoryId = storyId;
        ui.setLoading(storyContentElement, true, 'Loading story content...');
        ui.clearErrors(addSentenceError);
        sentenceInputElement.value = ''; // Clear input
        try {
            const story = await api.getStory(storyId);
            if (story) {
                ui.displaySingleStory(storyTitleElement, storyContentElement, story);
                ui.showSingleStoryView();
                startRealtimeUpdates(storyId); // Start polling for this story
            } else {
                // Handle story not found
                console.error(`Story with ID ${storyId} not found.`);
                ui.showStoryListView(); // Go back to list
                // Optionally show an error message on the list view
            }
        } catch (error) {
            console.error(`Failed to load story ${storyId}:`, error);
            ui.displayError(storyContentElement, 'Could not load story content.');
            // Don't switch view if loading fails initially
        } finally {
             ui.setLoading(storyContentElement, false);
        }
    }

    // --- Event Handlers ---
    function handleStoryClick(storyId) {
        loadSingleStory(storyId);
    }

    function handleNavigateBack() {
        stopRealtimeUpdates();
        currentStoryId = null;
        ui.showStoryListView();
        // Optionally refresh the list view when going back
        // loadStories();
    }

    async function handleAddSentence(event) {
        event.preventDefault();
        const sentence = sentenceInputElement.value.trim();
        if (!sentence || !currentStoryId) {
            ui.displayError(addSentenceError, "Sentence cannot be empty.");
            return;
        }

        ui.clearErrors(addSentenceError);
        addSentenceButton.disabled = true;
        addSentenceButton.textContent = 'Adding...';

        try {
            const updatedStory = await api.addSentence(currentStoryId, sentence);
            ui.appendSentence(storyContentElement, { text: sentence, author: 'You' }, true); // Optimistic UI update
            sentenceInputElement.value = ''; // Clear input
            // Optionally: Fully refresh story data after adding
            // loadSingleStory(currentStoryId);
        } catch (error) {
            console.error("Failed to add sentence:", error);
            ui.displayError(addSentenceError, error.message || "Could not add sentence. Please try again.");
            // Optional: Remove the optimistically added sentence if API call failed
        } finally {
            addSentenceButton.disabled = false;
            addSentenceButton.textContent = 'Add Sentence';
        }
    }

    function handleShowNewStoryForm() {
        ui.showNewStoryForm(newStoryForm);
        ui.clearErrors(newStoryError);
        newStoryTitleInput.value = '';
        firstSentenceInput.value = '';
    }

    function handleCancelNewStory() {
         ui.hideNewStoryForm(newStoryForm);
         ui.clearErrors(newStoryError);
    }

    async function handleCreateStory(event) {
        event.preventDefault();
        const title = newStoryTitleInput.value.trim(); // Title is optional
        const firstSentence = firstSentenceInput.value.trim();

        if (!firstSentence) {
            ui.displayError(newStoryError, "The first sentence is required.");
            return;
        }

        ui.clearErrors(newStoryError);
        const createButton = newStoryForm.querySelector('button[type="submit"]');
        createButton.disabled = true;
        createButton.textContent = 'Creating...';

        try {
            const newStory = await api.createStory(firstSentence, title);
            ui.hideNewStoryForm(newStoryForm);
            // Option 1: Navigate directly to the new story
            loadSingleStory(newStory.id);
            // Option 2: Refresh list and stay on list view
            // await loadStories();
        } catch (error) {
            console.error("Failed to create story:", error);
            ui.displayError(newStoryError, error.message || "Could not create story. Please try again.");
        } finally {
            createButton.disabled = false;
            createButton.textContent = 'Create Story';
        }
    }

    // --- Real-time Updates (Polling) ---
    function startRealtimeUpdates(storyId) {
        stopRealtimeUpdates(); // Ensure no duplicate intervals
        storyUpdateInterval = setInterval(async () => {
            if (document.hidden || !currentStoryId || currentStoryId !== storyId) {
                // Don't poll if tab is hidden or user navigated away
                return;
            }
            try {
                // Get only *new* sentences since the last one displayed
                const currentSentences = storyContentElement.querySelectorAll('.story-sentence').length;
                const story = await api.getStory(storyId); // Or a more efficient API endpoint if available
                if (story && story.sentences.length > currentSentences) {
                    // Only update if there are actually new sentences
                     ui.displaySingleStory(storyTitleElement, storyContentElement, story, true); // Update UI, highlight new
                }
            } catch (error) {
                console.warn("Real-time update failed:", error);
                // Optional: Stop polling after too many errors?
            }
        }, 5000); // Poll every 5 seconds
    }

    function stopRealtimeUpdates() {
        if (storyUpdateInterval) {
            clearInterval(storyUpdateInterval);
            storyUpdateInterval = null;
        }
    }

    // --- Event Listener Setup ---
    function setupEventListeners() {
        backToListButton.addEventListener('click', handleNavigateBack);
        addSentenceForm.addEventListener('submit', handleAddSentence);
        showNewStoryFormButton.addEventListener('click', handleShowNewStoryForm);
        cancelNewStoryButton.addEventListener('click', handleCancelNewStory);
        newStoryForm.addEventListener('submit', handleCreateStory);

        // Event delegation for story clicks
        storyListContainer.addEventListener('click', (event) => {
            const storyCard = event.target.closest('.story-card');
            if (storyCard && storyCard.dataset.storyId) {
                handleStoryClick(storyCard.dataset.storyId);
            }
        });

        // Stop polling if the page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Optionally stop polling completely when tab is hidden
                // stopRealtimeUpdates();
            } else if (currentStoryId && !storyUpdateInterval) {
                // Resume polling if returning to tab and viewing a story
                loadSingleStory(currentStoryId); // Refresh immediately on return
            }
        });
    }

    // --- Start the application ---
    init();
});