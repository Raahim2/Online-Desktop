document.addEventListener('DOMContentLoaded', () => {
    const soundListContainer = document.getElementById('sound-list');
    const masterPlayPauseBtn = document.getElementById('master-play-pause-btn');
    const masterPlayIcon = document.getElementById('master-play-icon');
    const masterPauseIcon = document.getElementById('master-pause-icon');
    const masterPlayPauseText = document.getElementById('master-play-pause-text');

    const presetSelect = document.getElementById('preset-select');
    const loadPresetBtn = document.getElementById('load-preset-btn');

    const saveCustomBtn = document.getElementById('save-custom-btn');
    const customSoundscapeNameInput = document.getElementById('custom-soundscape-name');
    const loadSavedSelect = document.getElementById('load-saved-select');
    const loadSavedBtn = document.getElementById('load-saved-btn');
    const deleteSavedBtn = document.getElementById('delete-saved-btn');

    const timerDurationInput = document.getElementById('timer-duration');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const stopTimerBtn = document.getElementById('stop-timer-btn');
    const timerDisplay = document.getElementById('timer-display');

    let audioElements = {};
    let currentActiveSoundsConfig = {}; // { soundName: volume }
    let masterIsPlaying = false;
    let timerId = null;
    let timerEndTime = 0;

    function initializeAudioElements() {
        SOUND_DATA.availableSounds.forEach(sound => {
            const audio = new Audio(sound.file);
            audio.loop = true;
            audioElements[sound.id] = audio;
        });
    }

    function renderSoundList() {
        soundListContainer.innerHTML = '';
        SOUND_DATA.availableSounds.forEach(sound => {
            const soundCard = document.createElement('div');
            soundCard.className = 'sound-card p-4 rounded-lg shadow-md flex flex-col space-y-3';
            soundCard.dataset.soundName = sound.id;

            soundCard.innerHTML = `
                <div class="flex justify-between items-center">
                    <label for="volume-${sound.id}" class="text-lg font-medium text-slate-700">${sound.name}</label>
                    <button class="toggle-active-sound-btn icon-btn p-2 rounded-full hover:bg-slate-200 transition-colors" data-sound-name="${sound.id}" aria-label="Toggle ${sound.name} in mix">
                        <svg class="w-6 h-6 add-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>
                        <svg class="w-6 h-6 remove-icon hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15"></path></svg>
                    </button>
                </div>
                <input type="range" id="volume-${sound.id}" name="volume-${sound.id}" min="0" max="1" step="0.01" value="${sound.defaultVolume || 0.5}" class="w-full volume-slider" disabled title="Adjust volume for ${sound.name}">
            `;
            soundListContainer.appendChild(soundCard);

            const toggleBtn = soundCard.querySelector('.toggle-active-sound-btn');
            const volumeSlider = soundCard.querySelector('.volume-slider');

            toggleBtn.addEventListener('click', () => toggleSoundActive(sound.id));
            volumeSlider.addEventListener('input', (e) => {
                if (currentActiveSoundsConfig.hasOwnProperty(sound.id)) {
                    updateVolume(sound.id, parseFloat(e.target.value));
                }
            });
        });
    }

    function updateSoundCardUI(soundName, isActive, volume) {
        const soundCard = soundListContainer.querySelector(`.sound-card[data-sound-name="${soundName}"]`);
        if (!soundCard) return;

        const toggleBtn = soundCard.querySelector('.toggle-active-sound-btn');
        const addIcon = toggleBtn.querySelector('.add-icon');
        const removeIcon = toggleBtn.querySelector('.remove-icon');
        const volumeSlider = soundCard.querySelector(`#volume-${soundName}`);

        volumeSlider.disabled = !isActive;
        volumeSlider.value = volume;
        addIcon.classList.toggle('hidden', isActive);
        removeIcon.classList.toggle('hidden', !isActive);
        toggleBtn.classList.toggle('active', isActive);
    }

    function toggleSoundActive(soundName) {
        const soundData = SOUND_DATA.availableSounds.find(s => s.id === soundName);
        if (!soundData) return;

        if (currentActiveSoundsConfig.hasOwnProperty(soundName)) { // Deactivate
            delete currentActiveSoundsConfig[soundName];
            audioElements[soundName].pause();
            updateSoundCardUI(soundName, false, soundData.defaultVolume || 0.5);
        } else { // Activate
            const defaultVolume = soundData.defaultVolume || 0.5;
            currentActiveSoundsConfig[soundName] = defaultVolume;
            audioElements[soundName].volume = defaultVolume;
            if (masterIsPlaying) {
                audioElements[soundName].play().catch(e => console.error("Error playing sound:", e));
            }
            updateSoundCardUI(soundName, true, defaultVolume);
        }
        updateMasterPlayPauseButtonState();
    }

    function updateVolume(soundName, volume) {
        if (currentActiveSoundsConfig.hasOwnProperty(soundName)) {
            currentActiveSoundsConfig[soundName] = volume;
            audioElements[soundName].volume = volume;
        }
    }

    function playMaster() {
        if (Object.keys(currentActiveSoundsConfig).length === 0) {
            masterIsPlaying = false; // Cannot play if no sounds are active
            updateMasterPlayPauseButtonState();
            return;
        }
        masterIsPlaying = true;
        Object.keys(currentActiveSoundsConfig).forEach(soundName => {
            audioElements[soundName].volume = currentActiveSoundsConfig[soundName];
            audioElements[soundName].play().catch(e => console.error("Error playing sound:", e));
        });
        updateMasterPlayPauseButtonState();
    }

    function pauseMaster() {
        masterIsPlaying = false;
        Object.keys(audioElements).forEach(soundName => {
            audioElements[soundName].pause();
        });
        updateMasterPlayPauseButtonState();
    }

    function toggleMasterPlayPause() {
        if (masterIsPlaying) {
            pauseMaster();
        } else {
            playMaster();
        }
    }
    
    function updateMasterPlayPauseButtonState() {
        const canPlay = Object.keys(currentActiveSoundsConfig).length > 0;
        masterPlayPauseBtn.disabled = !canPlay && !masterIsPlaying;

        if (masterIsPlaying && canPlay) {
            masterPlayIcon.classList.add('hidden');
            masterPauseIcon.classList.remove('hidden');
            masterPlayPauseText.textContent = 'Pause Mix';
        } else {
            masterPlayIcon.classList.remove('hidden');
            masterPauseIcon.classList.add('hidden');
            masterPlayPauseText.textContent = 'Play Mix';
            if (!canPlay) masterIsPlaying = false; // Ensure masterIsPlaying is false if no sounds are active
        }
    }


    function renderPresetOptions() {
        presetSelect.innerHTML = '<option value="">-- Select a Preset --</option>';
        SOUND_DATA.presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.name;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });
    }

    function applySoundscapeConfig(config) {
        pauseMaster(); // Stop current sounds before applying new config
        
        // Deactivate all current sounds
        Object.keys(currentActiveSoundsConfig).forEach(sn => {
            const soundData = SOUND_DATA.availableSounds.find(s => s.id === sn);
            updateSoundCardUI(sn, false, soundData.defaultVolume || 0.5);
        });
        currentActiveSoundsConfig = {};

        // Activate and set volumes for sounds in the new config
        for (const soundName in config) {
            if (audioElements[soundName]) {
                const volume = config[soundName];
                currentActiveSoundsConfig[soundName] = volume;
                updateSoundCardUI(soundName, true, volume);
                audioElements[soundName].volume = volume; // Set volume even if not playing yet
            }
        }
        updateMasterPlayPauseButtonState(); // Update button based on new active sounds
    }

    function loadPreset() {
        const presetName = presetSelect.value;
        if (!presetName) return;
        const preset = SOUND_DATA.presets.find(p => p.name === presetName);
        if (preset) {
            applySoundscapeConfig(preset.sounds);
        }
    }

    function renderSavedSoundscapes() {
        const savedScapes = StorageManager.getAllSoundscapes();
        loadSavedSelect.innerHTML = '<option value="">-- Load Saved Mix --</option>';
        const hasSavedScapes = Object.keys(savedScapes).length > 0;

        for (const name in savedScapes) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            loadSavedSelect.appendChild(option);
        }
        loadSavedBtn.disabled = !hasSavedScapes;
        deleteSavedBtn.disabled = !hasSavedScapes;
        loadSavedSelect.disabled = !hasSavedScapes;
    }

    function saveCustomSoundscape() {
        const name = customSoundscapeNameInput.value.trim();
        if (!name) {
            alert("Please enter a name for your soundscape.");
            return;
        }
        if (Object.keys(currentActiveSoundsConfig).length === 0) {
            alert("Please select and activate at least one sound to save.");
            return;
        }
        StorageManager.saveSoundscape(name, currentActiveSoundsConfig);
        customSoundscapeNameInput.value = '';
        renderSavedSoundscapes();
        alert(`Soundscape "${name}" saved!`);
    }

    function loadCustomSoundscape() {
        const name = loadSavedSelect.value;
        if (!name) return;
        const scapeConfig = StorageManager.getSoundscape(name);
        if (scapeConfig) {
            applySoundscapeConfig(scapeConfig);
        }
    }

    function deleteCustomSoundscape() {
        const name = loadSavedSelect.value;
        if (!name) return;
        if (confirm(`Are you sure you want to delete the soundscape "${name}"?`)) {
            StorageManager.deleteSoundscape(name);
            renderSavedSoundscapes();
            alert(`Soundscape "${name}" deleted.`);
        }
    }

    function updateTimerDisplay() {
        if (!timerId) {
            timerDisplay.textContent = "00:00";
            return;
        }
        const now = Date.now();
        const timeLeft = Math.max(0, Math.round((timerEndTime - now) / 1000));
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (timeLeft === 0) {
            pauseMaster();
            stopTimer(false); // false to not clear display immediately
            alert("Timer finished!");
        }
    }

    function startTimer() {
        const durationMinutes = parseInt(timerDurationInput.value);
        if (isNaN(durationMinutes) || durationMinutes <= 0) {
            alert("Please enter a valid duration for the timer (minutes).");
            return;
        }

        if (Object.keys(currentActiveSoundsConfig).length === 0) {
            alert("Please select some sounds before starting the timer.");
            return;
        }

        if (timerId) { // Clear existing timer if any
            clearInterval(timerId);
        }

        if (!masterIsPlaying) {
            playMaster();
        }
        // If playMaster failed (e.g. no sounds), don't start timer
        if (!masterIsPlaying) return;


        timerEndTime = Date.now() + durationMinutes * 60 * 1000;
        timerId = setInterval(updateTimerDisplay, 1000);
        updateTimerDisplay(); // Initial display
        startTimerBtn.disabled = true;
        stopTimerBtn.disabled = false;
        timerDurationInput.disabled = true;
    }

    function stopTimer(resetDisplay = true) {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        if (resetDisplay) {
            timerDisplay.textContent = "00:00";
        }
        startTimerBtn.disabled = false;
        stopTimerBtn.disabled = true;
        timerDurationInput.disabled = false;
    }

    // Event Listeners
    masterPlayPauseBtn.addEventListener('click', toggleMasterPlayPause);
    loadPresetBtn.addEventListener('click', loadPreset);
    saveCustomBtn.addEventListener('click', saveCustomSoundscape);
    loadSavedBtn.addEventListener('click', loadCustomSoundscape);
    deleteSavedBtn.addEventListener('click', deleteCustomSoundscape);
    startTimerBtn.addEventListener('click', startTimer);
    stopTimerBtn.addEventListener('click', () => stopTimer(true));

    // Initial Setup Calls
    initializeAudioElements();
    renderSoundList();
    renderPresetOptions();
    renderSavedSoundscapes();
    updateMasterPlayPauseButtonState();
    stopTimerBtn.disabled = true; // Timer initially stopped
});