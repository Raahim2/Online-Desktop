const UI = (() => {
    const habitList = document.getElementById('habit-list');
    const habitTemplate = document.getElementById('habit-item-template');
    const noHabitsMessage = document.getElementById('no-habits-message');

    const _getHabitElementById = (habitId) => {
        return habitList.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
    };

    const renderHabit = (habit, todayDateString) => {
        if (!habitTemplate) {
            console.error("Habit template not found!");
            return;
        }
        const templateContent = habitTemplate.content.cloneNode(true);
        const habitItem = templateContent.querySelector('.habit-item');
        const checkbox = templateContent.querySelector('.habit-checkbox');
        const nameEl = templateContent.querySelector('.habit-name');
        const descriptionEl = templateContent.querySelector('.habit-description');
        const streakCountEl = templateContent.querySelector('.streak-count');
        const notesTextarea = templateContent.querySelector('.notes-textarea');
        // const progressBar = templateContent.querySelector('.habit-progress-bar'); // For potential future use

        habitItem.dataset.habitId = habit.id;
        nameEl.textContent = habit.name;
        descriptionEl.textContent = habit.description || ''; // Handle empty description
        descriptionEl.style.display = habit.description ? 'block' : 'none'; // Hide if no description

        // Set initial checkbox state based on today's completion
        checkbox.checked = habit.completions?.[todayDateString] || false;
        updateHabitVisualFeedback(habitItem, checkbox.checked); // Apply initial visual state

        // Calculate and display initial streak (using the main script's logic indirectly)
        // The main script will call updateStreakDisplay after loading/adding
        // We can set a default or calculate here if needed immediately, but might be redundant
        // For now, rely on script.js to call updateStreakDisplay after render
        const streak = calculateStreak(habit, todayDateString); // Use the global function for consistency
        updateStreakDisplay(habitItem, streak);

        // Pre-fill notes if they exist for today
        notesTextarea.value = habit.notes?.[todayDateString] || '';

        // Remove the 'no habits' message if it's currently shown
        hideNoHabitsMessage();

        habitList.appendChild(templateContent);
    };

    const removeHabitElement = (habitId) => {
        const habitElement = _getHabitElementById(habitId);
        if (habitElement) {
            habitElement.remove();
        }
        // Check if the list is now empty
        if (habitList.children.length === 0) {
           showNoHabitsMessage();
        }
    };

    const updateStreakDisplay = (habitElement, streak) => {
        const streakCountEl = habitElement.querySelector('.streak-count');
        if (streakCountEl) {
            streakCountEl.textContent = streak;
        }
    };

    const updateHabitVisualFeedback = (habitElement, isCompleted) => {
         if (!habitElement) return;
         if (isCompleted) {
            habitElement.classList.add('border-l-4', 'border-green-500', 'bg-green-50');
         } else {
            habitElement.classList.remove('border-l-4', 'border-green-500', 'bg-green-50');
         }
    };

    const toggleNotesArea = (habitElement, todayDateString) => {
        const notesArea = habitElement.querySelector('.habit-notes-area');
        const notesTextarea = habitElement.querySelector('.notes-textarea');
        const notesButton = habitElement.querySelector('.habit-notes-button');

        if (notesArea) {
            const isHidden = notesArea.classList.contains('hidden');
            if (isHidden) {
                // Load current note before showing
                const habitId = habitElement.dataset.habitId;
                const habit = Storage.getHabitById(habitId); // Assumes Storage is globally accessible
                if (habit) {
                    notesTextarea.value = habit.notes?.[todayDateString] || '';
                }
                notesArea.classList.remove('hidden');
                notesTextarea.focus();
                notesButton?.classList.add('text-blue-600'); // Indicate active state
            } else {
                notesArea.classList.add('hidden');
                notesButton?.classList.remove('text-blue-600');
            }
        }
    };

     const showNoHabitsMessage = () => {
        if (noHabitsMessage) noHabitsMessage.style.display = 'block';
    };

    const hideNoHabitsMessage = () => {
        if (noHabitsMessage && noHabitsMessage.style.display !== 'none') {
            noHabitsMessage.style.display = 'none';
        }
    };

    // Expose necessary functions
    return {
        renderHabit,
        removeHabitElement,
        updateStreakDisplay,
        updateHabitVisualFeedback,
        toggleNotesArea,
        hideNoHabitsMessage, // Allow script.js to control this initially
        showNoHabitsMessage // Allow script.js to control this
    };
})();

// Helper function needed by UI.renderHabit for initial streak calculation.
// This assumes script.js defines these globally or they are passed appropriately.
// Ideally, this dependency should be managed more cleanly (e.g., dependency injection or event bus).
// For simplicity here, we assume script.js defines them globally before ui.js runs or UI calls it.
function calculateStreak(habit, checkDateStr) {
    // This is a placeholder - the actual implementation resides in script.js
    // It needs access to the habit's full completion data and scheduling.
    // console.warn("calculateStreak called from UI - ensure it's defined globally in script.js");
     let streak = 0;
     let currentDate = new Date(checkDateStr);
     const todayDayOfWeek = getDayOfWeek(currentDate); // Assumes getDayOfWeek is global

     // Check completion for the checkDate itself
     if (habit.completions?.[checkDateStr] && isScheduledForToday(habit, todayDayOfWeek)) { // Check schedule too
         streak = 1;
         // Go back day by day
         while (true) {
             currentDate.setDate(currentDate.getDate() - 1);
             const previousDateStr = getFormattedDate(currentDate); // Assumes getFormattedDate is global
             const previousDayOfWeek = getDayOfWeek(currentDate);

             // Only count if the habit was scheduled for that day
             if (isScheduledForToday(habit, previousDayOfWeek)) { // Assumes isScheduledForToday is global
                 if (habit.completions?.[previousDateStr]) {
                     streak++;
                 } else {
                     // Streak broken if scheduled but not completed
                     break;
                 }
             }
             // If not scheduled, the streak continues (we skip the day)

             // Stop checking after a reasonable period
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
                  if (habit.completions?.[previousDateStr]) {
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

// Assume these helper functions are defined globally by script.js
// Declare them here to satisfy linter / avoid runtime errors if UI loads first,
// but the actual implementation should be in script.js.
function getFormattedDate(date) {
    // Placeholder - actual implementation in script.js
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDayOfWeek(date) {
    // Placeholder - actual implementation in script.js
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

function isScheduledForToday(habit, dayOfWeek) {
     // Placeholder - actual implementation in script.js
     if (!habit.schedule || habit.schedule.length === 0 || habit.schedule.length === 7) {
         return true;
     }
     return habit.schedule.includes(dayOfWeek);
}