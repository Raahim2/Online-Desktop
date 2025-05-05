const Storage = (() => {
    const STORAGE_KEY = 'microHabits';

    const loadHabits = () => {
        try {
            const habitsJson = localStorage.getItem(STORAGE_KEY);
            return habitsJson ? JSON.parse(habitsJson) : [];
        } catch (error) {
            console.error("Error loading habits from localStorage:", error);
            // Optionally clear corrupted data: localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    };

    const saveAllHabits = (habits) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
        } catch (error) {
            console.error("Error saving habits to localStorage:", error);
            // Consider notifying the user if storage is full or failing
        }
    };

    const saveHabit = (newHabit) => {
        const habits = loadHabits();
        // Ensure no duplicate ID (highly unlikely with UUID, but good practice)
        if (habits.some(habit => habit.id === newHabit.id)) {
            console.warn(`Habit with ID ${newHabit.id} already exists. Skipping save.`);
            return; // Or handle differently, e.g., generate new ID
        }
        habits.push(newHabit);
        saveAllHabits(habits);
    };

    const updateHabit = (updatedHabit) => {
        const habits = loadHabits();
        const index = habits.findIndex(habit => habit.id === updatedHabit.id);
        if (index !== -1) {
            habits[index] = updatedHabit;
            saveAllHabits(habits);
        } else {
            console.warn(`Habit with ID ${updatedHabit.id} not found for update.`);
        }
    };

    const deleteHabit = (habitId) => {
        let habits = loadHabits();
        habits = habits.filter(habit => habit.id !== habitId);
        saveAllHabits(habits);
    };

    const getHabitById = (habitId) => {
        const habits = loadHabits();
        return habits.find(habit => habit.id === habitId);
    };

    return {
        loadHabits,
        saveHabit,
        updateHabit,
        deleteHabit,
        getHabitById
    };
})();