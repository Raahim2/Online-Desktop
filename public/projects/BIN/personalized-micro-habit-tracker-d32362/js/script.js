document.addEventListener('DOMContentLoaded', () => {
    const addHabitForm = document.getElementById('add-habit-form');
    const habitList = document.getElementById('habit-list');
    const currentDateEl = document.getElementById('current-date');
    const currentYearEl = document.getElementById('current-year');
    const noHabitsMessage = document.getElementById('no-habits-message');
    const exportCsvButton = document.getElementById('export-csv-button');
    const exportJsonButton = document.getElementById('export-json-button');
    const visualizationSection = document.getElementById('visualization-section');
    const chartsContainer = document.getElementById('charts-container'); // Assuming charts.js uses this

    const today = new Date();
    const todayDateString = getFormattedDate(today);
    const todayDayOfWeek = getDayOfWeek(today); // e.g., "Mon", "Tue"

    // --- Initialization ---
    displayCurrentDate();
    displayCurrentYear();
    loadAndRenderHabits();
    updateVisualizationsIfVisible(); // Initial chart rendering if section is visible

    // --- Event Listeners ---
    addHabitForm.addEventListener('submit', handleAddHabit);
    habitList.addEventListener('click', handleHabitListClick);
    exportCsvButton.addEventListener('click', handleExportCsv);
    exportJsonButton.addEventListener('click', handleExportJson);

    // --- Event Handlers ---
    function handleAddHabit(event) {
        event.preventDefault();
        const nameInput = document.getElementById('habit-name');
        const descriptionInput = document.getElementById('habit-description');
        const scheduleCheckboxes = document.querySelectorAll('input[name="schedule-day"]:checked');

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const schedule = Array.from(scheduleCheckboxes).map(cb => cb.value);

        if (!name) {
            alert('Please enter a habit name.');
            return;
        }

        const newHabit = {
            id: crypto.randomUUID(),
            name: name,
            description: description,
            schedule: schedule.length > 0 ? schedule : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Default to daily if none selected
            createdAt: new Date().toISOString(),
            completions: {}, // { "YYYY-MM-DD": true/false }
            notes: {} // { "YYYY-MM-DD": "note text" }
        };

        Storage.saveHabit(newHabit);
        if (isScheduledForToday(newHabit, todayDayOfWeek)) {
            UI.renderHabit(newHabit, todayDateString);
            hideNoHabitsMessage();
        }
        updateVisualizationsIfVisible();

        addHabitForm.reset(); // Clear the form
    }

    function handleHabitListClick(event) {
        const target = event.target;
        const habitItem = target.closest('.habit-item');
        if (!habitItem) return;

        const habitId = habitItem.dataset.habitId;

        // Handle Checkbox Toggle
        if (target.classList.contains('habit-checkbox')) {
            const isChecked = target.checked;
            const habit = Storage.getHabitById(habitId);
            if (habit) {
                habit.completions[todayDateString] = isChecked;
                Storage.updateHabit(habit);
                const streak = calculateStreak(habit, todayDateString);
                UI.updateStreakDisplay(habitItem, streak);
                UI.updateHabitVisualFeedback(habitItem, isChecked); // Add visual cue
                updateVisualizationsIfVisible();
            }
        }

        // Handle Delete Button
        if (target.closest('.habit-delete-button')) {
            if (confirm(`Are you sure you want to delete the habit "${habitItem.querySelector('.habit-name').textContent}"? This cannot be undone.`)) {
                Storage.deleteHabit(habitId);
                UI.removeHabitElement(habitId);
                checkIfHabitsExist();
                updateVisualizationsIfVisible();
            }
        }

        // Handle Notes Button
        if (target.closest('.habit-notes-button')) {
            UI.toggleNotesArea(habitItem, todayDateString);
        }

        // Handle Save Note Button
        if (target.classList.contains('save-notes-button')) {
             const notesTextarea = habitItem.querySelector('.notes-textarea');
             const noteText = notesTextarea.value.trim();
             const habit = Storage.getHabitById(habitId);
             if (habit) {
                 if (noteText) {
                     habit.notes[todayDateString] = noteText;
                 } else {
                     delete habit.notes[todayDateString]; // Remove note if empty
                 }
                 Storage.updateHabit(habit);
                 // Optionally provide feedback like changing button text temporarily
                 target.textContent = 'Saved!';
                 setTimeout(() => { target.textContent = 'Save Note'; }, 1500);
             }
        }
    }

    function handleExportCsv() {
        const habits = Storage.loadHabits();
        if (habits.length === 0) {
            alert("No habits to export.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        // Header Row
        csvContent += "Habit ID,Name,Description,Created At,Date,Completed,Note\n";

        // Data Rows
        habits.forEach(habit => {
            // Iterate through completions and notes, ensuring alignment by date
            const dates = new Set([...Object.keys(habit.completions), ...Object.keys(habit.notes)]);
            const sortedDates = Array.from(dates).sort();

            sortedDates.forEach(date => {
                const completed = habit.completions[date] ? "Yes" : "No";
                const note = habit.notes[date] ? `"${habit.notes[date].replace(/"/g, '""')}"` : ""; // Escape quotes
                const row = [
                    habit.id,
                    `"${habit.name.replace(/"/g, '""')}"`,
                    `"${habit.description.replace(/"/g, '""')}"`,
                    habit.createdAt,
                    date,
                    completed,
                    note
                ].join(",");
                csvContent += row + "\r\n";
            });
             // Add row even if no completions/notes exist for basic habit info
            if (sortedDates.length === 0) {
                 const row = [
                    habit.id,
                    `"${habit.name.replace(/"/g, '""')}"`,
                    `"${habit.description.replace(/"/g, '""')}"`,
                    habit.createdAt,
                    "", // No date specific data
                    "",
                    ""
                ].join(",");
                csvContent += row + "\r\n";
            }
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `micro-habits_${todayDateString}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function handleExportJson() {
        const habits = Storage.loadHabits();
         if (habits.length === 0) {
            alert("No habits to export.");
            return;
        }
        const jsonContent = JSON.stringify(habits, null, 2); // Pretty print JSON
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `micro-habits_${todayDateString}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up blob URL
    }


    // --- Core Logic & Helpers ---
    function loadAndRenderHabits() {
        const habits = Storage.loadHabits();
        habitList.innerHTML = ''; // Clear existing list first
        let habitsExist = false;
        habits.forEach(habit => {
            if (isScheduledForToday(habit, todayDayOfWeek)) {
                UI.renderHabit(habit, todayDateString);
                habitsExist = true;
            }
        });
        if (!habitsExist) {
            showNoHabitsMessage();
        } else {
            hideNoHabitsMessage();
        }
    }

    function isScheduledForToday(habit, dayOfWeek) {
        // If schedule is empty or includes all 7 days (legacy or explicit), it's daily
        if (!habit.schedule || habit.schedule.length === 0 || habit.schedule.length === 7) {
            return true;
        }
        return habit.schedule.includes(dayOfWeek);
    }

    function calculateStreak(habit, checkDateStr) {
        let streak = 0;
        let currentDate = new Date(checkDateStr);

        // Check completion for the checkDate itself
        if (habit.completions[checkDateStr]) {
            streak = 1;
            // Go back day by day
            while (true) {
                currentDate.setDate(currentDate.getDate() - 1);
                const previousDateStr = getFormattedDate(currentDate);
                const previousDayOfWeek = getDayOfWeek(currentDate);

                // Only count if the habit was scheduled for that day
                if (isScheduledForToday(habit, previousDayOfWeek)) {
                    if (habit.completions[previousDateStr]) {
                        streak++;
                    } else {
                        // Streak broken if scheduled but not completed
                        break;
                    }
                }
                // If not scheduled, the streak continues (we skip the day)

                // Stop checking after a reasonable period (e.g., a year) to avoid infinite loops with sparse data
                 if (new Date(checkDateStr) - currentDate > 365 * 24 * 60 * 60 * 1000) {
                     break;
                 }
            }
        } else {
            // If not completed today, check yesterday for the end of a potential streak
             currentDate.setDate(currentDate.getDate() - 1);
             let yesterdayStreak = 0;
             while (true) {
                const previousDateStr = getFormattedDate(currentDate);
                const previousDayOfWeek = getDayOfWeek(currentDate);

                 if (isScheduledForToday(habit, previousDayOfWeek)) {
                     if (habit.completions[previousDateStr]) {
                         yesterdayStreak++;
                     } else {
                         break; // Streak ended before yesterday
                     }
                 }
                 currentDate.setDate(currentDate.getDate() - 1);
                  if (new Date(checkDateStr) - currentDate > 365 * 24 * 60 * 60 * 1000) {
                     break;
                 }
             }
             streak = yesterdayStreak; // Show the streak ending yesterday
        }


        return streak;
    }


    function getFormattedDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getDayOfWeek(date) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }

    function displayCurrentDate() {
        if (currentDateEl) {
            currentDateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

     function displayCurrentYear() {
        if (currentYearEl) {
            currentYearEl.textContent = today.getFullYear();
        }
    }

    function showNoHabitsMessage() {
        if (noHabitsMessage) noHabitsMessage.style.display = 'block';
    }

    function hideNoHabitsMessage() {
        if (noHabitsMessage) noHabitsMessage.style.display = 'none';
    }

     function checkIfHabitsExist() {
        const habits = Storage.loadHabits();
        const habitsForToday = habits.filter(habit => isScheduledForToday(habit, todayDayOfWeek));
        if (habitsForToday.length === 0) {
            showNoHabitsMessage();
        } else {
            hideNoHabitsMessage();
        }
    }

    function updateVisualizationsIfVisible() {
        // Check if the visualization section should be displayed
        const habits = Storage.loadHabits();
        if (habits.length > 0 && typeof Charts !== 'undefined' && Charts.renderCharts) {
             visualizationSection.classList.remove('hidden');
             Charts.renderCharts(habits, chartsContainer); // Pass data and container
        } else {
             visualizationSection.classList.add('hidden');
        }
    }

});