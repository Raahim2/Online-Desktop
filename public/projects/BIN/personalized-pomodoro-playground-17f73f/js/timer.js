let timerInterval = null;
let isRunning = false;
let isWorkSession = true; // Start with a work session
let timeLeft = 0; // Will be set based on duration inputs
let workDuration = 25 * 60; // Default 25 minutes in seconds
let breakDuration = 5 * 60; // Default 5 minutes in seconds

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const sessionTypeDisplay = document.getElementById('session-type');
const startPauseButton = document.getElementById('start-pause-button');
const resetButton = document.getElementById('reset-button');
const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    document.title = `${formatTime(timeLeft)} - ${isWorkSession ? 'Work' : 'Break'} - Pomodoro`;
    sessionTypeDisplay.textContent = isWorkSession ? 'Work Session' : 'Break Session';
}

function updateDurations() {
    const workMinutes = parseInt(workDurationInput.value, 10);
    const breakMinutes = parseInt(breakDurationInput.value, 10);

    if (!isNaN(workMinutes) && workMinutes > 0) {
        workDuration = workMinutes * 60;
    } else {
        workDurationInput.value = workDuration / 60; // Reset invalid input
    }

    if (!isNaN(breakMinutes) && breakMinutes > 0) {
        breakDuration = breakMinutes * 60;
    } else {
        breakDurationInput.value = breakDuration / 60; // Reset invalid input
    }

    // If timer is not running, update timeLeft immediately
    if (!isRunning) {
        resetTimer();
    }
}

function switchSession() {
    isWorkSession = !isWorkSession;
    timeLeft = isWorkSession ? workDuration : breakDuration;
    updateDisplay();
    // Play notification sound (assuming playNotificationSound exists in sounds.js)
    if (typeof playNotificationSound === 'function') {
        playNotificationSound();
    }
    // Add data to chart if a work session just finished
    if (!isWorkSession && typeof addPomodoroData === 'function') { // Switched TO break
        addPomodoroData();
    }
}

function tick() {
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
    } else {
        pauseTimer(); // Stop the interval
        switchSession();
        // Optionally auto-start the next session
        // startTimer();
    }
}

function startTimer() {
    if (isRunning) return; // Prevent multiple intervals

    if (timeLeft <= 0) { // Ensure time is set if starting from 0
       timeLeft = isWorkSession ? workDuration : breakDuration;
       updateDisplay();
    }

    isRunning = true;
    startPauseButton.innerHTML = '<i class="fas fa-pause mr-2"></i>Pause';
    startPauseButton.classList.remove('bg-green-500', 'hover:bg-green-600');
    startPauseButton.classList.add('bg-yellow-500', 'hover:bg-yellow-600');

    timerInterval = setInterval(tick, 1000);
}

function pauseTimer() {
    isRunning = false;
    startPauseButton.innerHTML = '<i class="fas fa-play mr-2"></i>Start';
    startPauseButton.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
    startPauseButton.classList.add('bg-green-500', 'hover:bg-green-600');

    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    pauseTimer();
    isWorkSession = true; // Always reset to a work session
    timeLeft = workDuration;
    updateDisplay();
}

function setupTimerControls() {
    // Initial setup
    updateDurations(); // Read initial values
    resetTimer(); // Set initial display

    // Event Listeners
    startPauseButton.addEventListener('click', () => {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    resetButton.addEventListener('click', resetTimer);

    workDurationInput.addEventListener('change', updateDurations);
    breakDurationInput.addEventListener('change', updateDurations);
}

// Make setupTimerControls globally accessible if called from script.js
window.setupTimerControls = setupTimerControls;