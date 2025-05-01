const Storage = (() => {
    const STORAGE_KEY = 'learningDashboardSubjects';

    // --- Helper Functions ---
    const getSubjectsInternal = () => {
        const subjectsJson = localStorage.getItem(STORAGE_KEY);
        try {
            return subjectsJson ? JSON.parse(subjectsJson) : [];
        } catch (e) {
            console.error("Error parsing subjects from localStorage:", e);
            return []; // Return empty array on error
        }
    };

    const saveSubjectsInternal = (subjects) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
        } catch (e) {
            console.error("Error saving subjects to localStorage:", e);
            // Handle potential storage quota errors if necessary
        }
    };

    // --- Public API ---
    const getSubjects = () => {
        return getSubjectsInternal();
    };

    const getSubjectById = (id) => {
        const subjects = getSubjectsInternal();
        return subjects.find(subject => subject.id === id) || null;
    };

    const addSubject = (newSubject) => {
        const subjects = getSubjectsInternal();
        // Check for duplicates if necessary, though ID should be unique
        if (!subjects.some(s => s.id === newSubject.id)) {
            subjects.push(newSubject);
            saveSubjectsInternal(subjects);
        } else {
            console.warn(`Subject with ID ${newSubject.id} already exists.`);
        }
    };

    const updateSubject = (id, updatedData) => {
        const subjects = getSubjectsInternal();
        const subjectIndex = subjects.findIndex(subject => subject.id === id);
        if (subjectIndex !== -1) {
            // Merge existing subject with updated data
            subjects[subjectIndex] = { ...subjects[subjectIndex], ...updatedData };
            saveSubjectsInternal(subjects);
            return subjects[subjectIndex]; // Return the updated subject
        }
        return null; // Subject not found
    };

     const updateSubjectProgress = (id, progress) => {
        const subjects = getSubjectsInternal();
        const subjectIndex = subjects.findIndex(subject => subject.id === id);
        if (subjectIndex !== -1) {
            subjects[subjectIndex].progress = Math.max(0, Math.min(100, progress)); // Clamp between 0-100
            saveSubjectsInternal(subjects);
            return subjects[subjectIndex];
        }
        return null;
    };

    const deleteSubject = (id) => {
        let subjects = getSubjectsInternal();
        subjects = subjects.filter(subject => subject.id !== id);
        saveSubjectsInternal(subjects);
    };

    const addItemToSubject = (subjectId, itemType, item) => {
        const subjects = getSubjectsInternal();
        const subjectIndex = subjects.findIndex(subject => subject.id === subjectId);
        if (subjectIndex !== -1) {
            // Ensure the item type array exists
            if (!subjects[subjectIndex][itemType]) {
                subjects[subjectIndex][itemType] = [];
            }
            subjects[subjectIndex][itemType].push(item);
            saveSubjectsInternal(subjects);
            return true;
        }
        return false; // Subject not found
    };

    const deleteItemFromSubject = (subjectId, itemType, itemId) => {
        const subjects = getSubjectsInternal();
        const subjectIndex = subjects.findIndex(subject => subject.id === subjectId);
        if (subjectIndex !== -1 && subjects[subjectIndex][itemType]) {
            subjects[subjectIndex][itemType] = subjects[subjectIndex][itemType].filter(item => item.id !== itemId);
            saveSubjectsInternal(subjects);
            return true;
        }
        return false; // Subject or item type not found
    };

     const updateGoalCompletion = (subjectId, goalId, isCompleted) => {
        const subjects = getSubjectsInternal();
        const subjectIndex = subjects.findIndex(subject => subject.id === subjectId);
        if (subjectIndex !== -1) {
            const goalIndex = subjects[subjectIndex].goals.findIndex(goal => goal.id === goalId);
            if (goalIndex !== -1) {
                subjects[subjectIndex].goals[goalIndex].completed = isCompleted;
                saveSubjectsInternal(subjects);
                return true;
            }
        }
        return false; // Subject or goal not found
    };

     const updateSubjectOrder = (orderedIds) => {
        const subjects = getSubjectsInternal();
        // Create a map for quick lookup
        const subjectMap = new Map(subjects.map(subject => [subject.id, subject]));
        // Create the new ordered array
        const orderedSubjects = orderedIds.map(id => subjectMap.get(id)).filter(Boolean); // Filter out any potential undefined if IDs mismatch

        // Check if the length matches to ensure no subjects were lost
        if (orderedSubjects.length === subjects.length) {
            saveSubjectsInternal(orderedSubjects);
        } else {
            console.error("Error updating subject order: ID mismatch or missing subjects.");
            // Optionally revert or handle the error differently
        }
    };


    return {
        getSubjects,
        getSubjectById,
        addSubject,
        updateSubject,
        updateSubjectProgress,
        deleteSubject,
        addItemToSubject,
        deleteItemFromSubject,
        updateGoalCompletion,
        updateSubjectOrder
    };

})();