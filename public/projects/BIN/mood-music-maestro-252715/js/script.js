document.addEventListener('DOMContentLoaded', () => {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const historyList = document.getElementById('history-list');
    const preferredGenresInput = document.getElementById('preferred-genres');
    const preferredArtistsInput = document.getElementById('preferred-artists');
    const loadingIndicator = document.getElementById('loading-indicator');
    const playlistResultSection = document.getElementById('playlist-result');
    const trackListElement = document.getElementById('track-list');
    const playlistLinkElement = document.getElementById('playlist-link');
    const errorMessageElement = document.getElementById('error-message');

    // Function to display loading state
    const showLoading = () => {
        loadingIndicator.classList.remove('hidden');
        playlistResultSection.classList.add('hidden');
        errorMessageElement.textContent = ''; // Clear previous errors
    };

    // Function to hide loading state
    const hideLoading = () => {
        loadingIndicator.classList.add('hidden');
    };

    // Function to display results
    const displayResults = (playlistData) => {
        hideLoading();
        trackListElement.innerHTML = ''; // Clear previous tracks

        if (playlistData && playlistData.tracks && playlistData.tracks.length > 0) {
            playlistData.tracks.slice(0, 10).forEach(track => { // Display first 10 tracks as preview
                const li = document.createElement('li');
                li.textContent = `${track.name} - ${track.artists.map(a => a.name).join(', ')}`;
                li.classList.add('truncate', 'mb-1');
                trackListElement.appendChild(li);
            });
            playlistLinkElement.href = playlistData.external_urls.spotify;
            playlistResultSection.classList.remove('hidden');
            errorMessageElement.textContent = '';
        } else {
             displayError('Could not generate playlist or no tracks found.');
        }
    };

    // Function to display errors
    const displayError = (message) => {
        hideLoading();
        errorMessageElement.textContent = `Error: ${message}`;
        playlistResultSection.classList.add('hidden'); // Hide result section on error
        console.error("Playlist Generation Error:", message);
    };

    // Main function to handle playlist generation request
    const handlePlaylistRequest = async (mood) => {
        showLoading();
        saveMoodToHistory(mood); // Save mood immediately
        displayMoodHistory(); // Update history display

        const preferredGenres = preferredGenresInput.value.trim().split(',').map(g => g.trim()).filter(g => g);
        const preferredArtists = preferredArtistsInput.value.trim().split(',').map(a => a.trim()).filter(a => a);

        try {
            // Ensure generatePlaylist is available (defined in api.js)
            if (typeof generatePlaylist !== 'function') {
                throw new Error("API function 'generatePlaylist' not found. Make sure api.js is loaded correctly.");
            }
            const playlistData = await generatePlaylist(mood, preferredGenres, preferredArtists);
            displayResults(playlistData);
        } catch (error) {
            displayError(error.message || 'Failed to generate playlist.');
        }
    };

    // Add event listeners to mood buttons
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.getAttribute('data-mood');
            if (mood) {
                handlePlaylistRequest(mood);
            }
        });
    });

     // Add event listener for history buttons (using event delegation)
    historyList.addEventListener('click', (event) => {
        const target = event.target.closest('.history-btn'); // Find the closest button ancestor
        if (target) {
            const mood = target.getAttribute('data-mood');
            if (mood) {
                // Optionally clear customization fields when using history, or keep them
                // preferredGenresInput.value = '';
                // preferredArtistsInput.value = '';
                handlePlaylistRequest(mood);
            }
        }
    });


    // Initial setup on page load
    displayMoodHistory(); // Load and display history from storage.js

});