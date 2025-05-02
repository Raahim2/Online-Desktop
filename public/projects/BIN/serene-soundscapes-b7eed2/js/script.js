document.addEventListener('DOMContentLoaded', () => {
    const soundControlsContainer = document.getElementById('sound-controls');
    const masterVolumeSlider = document.getElementById('master-volume');
    const playPauseButton = document.getElementById('play-pause-button');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const timerDurationInput = document.getElementById('timer-duration');
    const setTimerButton = document.getElementById('set-timer-button');
    const timerDisplay = document.getElementById('timer-display');
    const saveNameInput = document.getElementById('save-name-input');
    const saveButton = document.getElementById('save-button');
    const loadSelect = document.getElementById('load-select');
    const loadButton = document.getElementById('load-button');

    const playIconPath = 'assets/icons/play.svg';
    const pauseIconPath = 'assets/icons/pause.svg';

    let audioContext; // Delay creation until first interaction
    let masterGainNode;
    let isPlaying = false;
    let soundSources = {}; // { id: { audio: AudioElement, gainNode: GainNode, slider: InputElement, data: SoundData } }
    let timerInterval = null;
    let timerEndTime = 0;

    // --- Initialization ---

    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            masterGainNode = audioContext.createGain();
            masterGainNode.gain.value = masterVolumeSlider.value;
            masterGainNode.connect(audioContext.destination);
        }
    }

    function createSoundControl(sound) {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'p-4 bg-white bg-opacity-60 rounded-lg shadow';

        const label = document.createElement('label');
        label.htmlFor = `volume-${sound.id}`;
        label.textContent = sound.name;
        label.className = 'block text-lg font-medium text-gray-700 mb-2 capitalize';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `volume-${sound.id}`;
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.01';
        slider.value = '0'; // Start silent
        slider.className = 'w-full cursor-pointer sound-slider';
        slider.dataset.soundId = sound.id;

        controlDiv.appendChild(label);
        controlDiv.appendChild(slider);
        soundControlsContainer.appendChild(controlDiv);

        // Create Audio element and GainNode *after* context is initialized
        slider.addEventListener('input', handleIndividualVolumeChange);

        // Store references but don't create audio nodes yet
        soundSources[sound.id] = {
            audio: null,
            gainNode: null,
            slider: slider,
            data: sound,
            sourceNode: null // To store the MediaElementAudioSourceNode
        };
    }

    function setupAudioNodes(soundId) {
        if (!audioContext || !soundSources[soundId] || soundSources[soundId].audio) return; // Already setup or context not ready

        const soundInfo = soundSources[soundId];
        const audio = new Audio(soundInfo.data.path);
        audio.loop = true;
        audio.preload = 'auto'; // Start loading

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0; // Start silent

        const sourceNode = audioContext.createMediaElementSource(audio);
        sourceNode.connect(gainNode);
        gainNode.connect(masterGainNode);

        soundInfo.audio = audio;
        soundInfo.gainNode = gainNode;
        soundInfo.sourceNode = sourceNode; // Store the source node

        // Set initial volume based on slider (usually 0)
        handleIndividualVolumeChange({ target: soundInfo.slider });
    }

    soundsData.forEach(createSoundControl);
    populateLoadSelect();

    // --- Event Listeners ---

    masterVolumeSlider.addEventListener('input', () => {
        if (!masterGainNode) return;
        masterGainNode.gain.value = masterVolumeSlider.value;
    });

    playPauseButton.addEventListener('click', togglePlayPause);

    setTimerButton.addEventListener('click', startTimer);

    saveButton.addEventListener('click', handleSaveSoundscape);
    loadButton.addEventListener('click', handleLoadSoundscape);

    // --- Core Logic ---

    function handleIndividualVolumeChange(event) {
        const slider = event.target;
        const soundId = slider.dataset.soundId;
        const volume = parseFloat(slider.value);

        if (!soundSources[soundId]) return;

        // Ensure audio context and nodes are ready for this sound
        if (!soundSources[soundId].audio) {
             if(!audioContext) initAudioContext(); // Init context if first interaction
             setupAudioNodes(soundId);
        }

        const soundInfo = soundSources[soundId];

        if (soundInfo.gainNode) {
             soundInfo.gainNode.gain.value = volume;
        }

        // Play/pause individual sound based on volume and master state
        if (soundInfo.audio) {
            if (volume > 0 && isPlaying && soundInfo.audio.paused) {
                soundInfo.audio.play().catch(e => console.error(`Error playing ${soundId}:`, e));
            } else if (volume === 0 && !soundInfo.audio.paused) {
                soundInfo.audio.pause();
            }
        }
    }


    function togglePlayPause() {
        // Crucial: Initialize AudioContext on first user interaction (play)
        if (!audioContext) {
            initAudioContext();
            // Now that context exists, ensure all nodes are set up for sounds with initial volume > 0
             Object.keys(soundSources).forEach(id => {
                if (!soundSources[id].audio && parseFloat(soundSources[id].slider.value) > 0) {
                    setupAudioNodes(id);
                }
            });
        }

        // Resume context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        isPlaying = !isPlaying;

        Object.values(soundSources).forEach(soundInfo => {
            if (soundInfo.audio) { // Only control sounds that have been initialized
                const individualVolume = parseFloat(soundInfo.slider.value);
                if (isPlaying && individualVolume > 0) {
                    soundInfo.audio.play().catch(e => console.error(`Error playing ${soundInfo.data.id}:`, e));
                } else {
                    soundInfo.audio.pause();
                }
            }
        });

        updatePlayPauseButton();
    }

    function updatePlayPauseButton() {
        if (isPlaying) {
            playPauseIcon.src = pauseIconPath;
            playPauseIcon.alt = 'Pause';
        } else {
            playPauseIcon.src = playIconPath;
            playPauseIcon.alt = 'Play';
        }
    }

    // --- Timer ---

    function startTimer() {
        const durationMinutes = parseInt(timerDurationInput.value, 10);
        if (isNaN(durationMinutes) || durationMinutes <= 0) {
            alert("Please enter a valid positive number for the timer duration.");
            return;
        }

        if (timerInterval) {
            clearInterval(timerInterval); // Clear existing timer
        }

        timerEndTime = Date.now() + durationMinutes * 60 * 1000;
        updateTimerDisplay(); // Show initial time immediately

        timerInterval = setInterval(() => {
            const remainingTime = timerEndTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerDisplay.textContent = "--:--";
                timerDurationInput.value = "";
                if (isPlaying) {
                    togglePlayPause(); // Stop playback
                }
                alert("Timer finished!");
            } else {
                updateTimerDisplay(remainingTime);
            }
        }, 1000);
    }

    function updateTimerDisplay(remainingTime = timerEndTime - Date.now()) {
         if (remainingTime < 0 || !timerInterval) {
             timerDisplay.textContent = "--:--";
             return;
         }
        const totalSeconds = Math.max(0, Math.floor(remainingTime / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // --- Save/Load ---

    function handleSaveSoundscape() {
        const name = saveNameInput.value.trim();
        if (!name) {
            alert("Please enter a name for the soundscape.");
            return;
        }

        const soundscapeState = {
            masterVolume: masterVolumeSlider.value,
            sounds: {}
        };

        Object.keys(soundSources).forEach(id => {
            soundscapeState.sounds[id] = soundSources[id].slider.value;
        });

        saveSoundscape(name, soundscapeState);
        saveNameInput.value = ''; // Clear input
        populateLoadSelect(); // Update dropdown
        alert(`Soundscape "${name}" saved!`);
    }

    function handleLoadSoundscape() {
        const name = loadSelect.value;
        if (!name) {
            alert("Please select a soundscape to load.");
            return;
        }

        const loadedState = loadSoundscape(name);
        if (!loadedState) {
            alert(`Could not load soundscape "${name}".`);
            return;
        }

        // Apply master volume first
        masterVolumeSlider.value = loadedState.masterVolume || 0.5; // Default if missing
        if (masterGainNode) {
             masterGainNode.gain.value = masterVolumeSlider.value;
        }


        // Apply individual volumes and potentially initialize/play sounds
        Object.keys(soundSources).forEach(id => {
            const soundInfo = soundSources[id];
            const loadedVolume = loadedState.sounds[id] !== undefined ? parseFloat(loadedState.sounds[id]) : 0;

            soundInfo.slider.value = loadedVolume;

            // Manually trigger the volume change handler to ensure audio nodes are created and volume applied
            handleIndividualVolumeChange({ target: soundInfo.slider });

             // If master play is active, ensure sounds with volume > 0 start playing
            if (isPlaying && soundInfo.audio && loadedVolume > 0 && soundInfo.audio.paused) {
                 soundInfo.audio.play().catch(e => console.error(`Error playing ${id} after load:`, e));
            } else if (soundInfo.audio && loadedVolume === 0 && !soundInfo.audio.paused) {
                 soundInfo.audio.pause();
            }
        });

         alert(`Soundscape "${name}" loaded!`);

    }

    function populateLoadSelect() {
        const saved = getSavedSoundscapes();
        // Clear existing options except the placeholder
        loadSelect.innerHTML = '<option value="">Load a Soundscape...</option>';

        Object.keys(saved).sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            loadSelect.appendChild(option);
        });
    }

});