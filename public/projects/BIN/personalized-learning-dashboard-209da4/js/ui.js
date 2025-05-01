const UI = (() => {
    const dashboardGrid = document.getElementById('dashboard-grid');
    const subjectModal = document.getElementById('subject-modal');
    const subjectForm = document.getElementById('subject-form');
    const modalTitle = document.getElementById('modal-title');
    const editSubjectIdInput = document.getElementById('edit-subject-id');
    const subjectNameInput = document.getElementById('subject-name');
    const subjectDescriptionInput = document.getElementById('subject-description');
    const subjectIconInput = document.getElementById('subject-icon');

    const itemModal = document.getElementById('item-modal');
    const itemForm = document.getElementById('item-form');
    const itemModalTitle = document.getElementById('item-modal-title');
    const itemSubjectIdInput = document.getElementById('item-subject-id');
    const itemTypeInput = document.getElementById('item-type');
    const resourceFields = document.getElementById('resource-fields');
    const goalFields = document.getElementById('goal-fields');
    const noteFields = document.getElementById('note-fields');

    // --- Subject Rendering ---

    const createSubjectElement = (subject) => {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-lg shadow-md p-5 flex flex-col module';
        // div.setAttribute('draggable', 'true'); // Draggable attribute managed in script.js based on handle interaction
        div.dataset.subjectId = subject.id;

        // Sanitize potential HTML in user input before inserting
        const sanitize = (str) => {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        };

        div.innerHTML = `
            <div class="flex justify-between items-center mb-3 cursor-move handle">
                <h2 class="text-xl font-semibold text-slate-700 flex items-center">
                   <i class="${sanitize(subject.icon)} mr-2 text-blue-500 text-lg w-5 text-center"></i>
                   <span class="subject-name-display">${sanitize(subject.name)}</span>
                </h2>
                <div>
                    <button class="text-slate-500 hover:text-blue-600 px-1 edit-subject-btn" aria-label="Edit Subject"><i class="fas fa-edit"></i></button>
                    <button class="text-slate-500 hover:text-red-600 px-1 delete-subject-btn" aria-label="Delete Subject"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p class="text-slate-600 text-sm mb-4 flex-grow subject-description-display">${sanitize(subject.description)}</p>

            <div class="mb-4">
                <h3 class="text-sm font-semibold text-slate-500 mb-2">Progress (<span class="progress-value">${subject.progress}</span>%)</h3>
                <div class="w-full bg-slate-200 rounded-full h-2.5">
                    <div class="bg-green-500 h-2.5 rounded-full progress-bar" style="width: ${subject.progress}%"></div>
                </div>
                <input type="range" min="0" max="100" value="${subject.progress}" class="w-full h-1 mt-2 accent-green-500 cursor-pointer progress-slider" aria-label="Subject Progress">
            </div>

            <div class="mb-4">
                <h3 class="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
                    <span>Goals</span>
                    <button class="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-0.5 rounded add-goal-btn"><i class="fas fa-plus"></i> Add</button>
                </h3>
                <ul class="list-disc list-inside text-sm text-slate-700 space-y-1 goals-list max-h-24 overflow-y-auto no-scrollbar">
                    ${subject.goals.map(goal => createGoalElement(goal).outerHTML).join('')}
                </ul>
            </div>

            <div class="mb-4">
                 <h3 class="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
                    <span>Resources</span>
                    <button class="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-0.5 rounded add-resource-btn"><i class="fas fa-plus"></i> Add</button>
                </h3>
                <ul class="text-sm space-y-1 resources-list max-h-24 overflow-y-auto no-scrollbar">
                     ${subject.resources.map(resource => createResourceElement(resource).outerHTML).join('')}
                </ul>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
                    <span>Notes</span>
                     <button class="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-0.5 rounded add-note-btn"><i class="fas fa-plus"></i> Add</button>
                </h3>
                <div class="notes-area text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 max-h-24 overflow-y-auto no-scrollbar">
                     ${subject.notes.map(note => createNoteElement(note).outerHTML).join('')}
                </div>
            </div>
        `;
        return div;
    };

    const addSubjectToDashboard = (subject) => {
        const subjectElement = createSubjectElement(subject);
        dashboardGrid.appendChild(subjectElement);
    };

    const updateSubjectInDashboard = (subject) => {
        const subjectElement = dashboardGrid.querySelector(`.module[data-subject-id="${subject.id}"]`);
        if (subjectElement) {
            const sanitize = (str) => {
                const temp = document.createElement('div');
                temp.textContent = str;
                return temp.innerHTML;
            };
            subjectElement.querySelector('.subject-name-display').textContent = sanitize(subject.name);
            subjectElement.querySelector('.subject-description-display').textContent = sanitize(subject.description);
            const iconElement = subjectElement.querySelector('h2 i');
            iconElement.className = `${sanitize(subject.icon)} mr-2 text-blue-500 text-lg w-5 text-center`; // Update icon class
            updateProgressDisplay(subjectElement, subject.progress); // Update progress too
        }
    };

    const removeSubjectFromDashboard = (subjectId) => {
        const subjectElement = dashboardGrid.querySelector(`.module[data-subject-id="${subjectId}"]`);
        if (subjectElement) {
            subjectElement.remove();
        }
    };

    const clearDashboard = () => {
        dashboardGrid.innerHTML = '';
    };

    // --- Item Rendering ---

    const createResourceElement = (resource) => {
        const li = document.createElement('li');
        li.dataset.itemId = resource.id;
        li.className = "flex justify-between items-center group";
        // Sanitize URL before using in href
        let safeUrl = '#';
        try {
            const parsedUrl = new URL(resource.url);
             // Allow specific protocols if needed, otherwise default behavior is usually safe enough for modern browsers
             safeUrl = parsedUrl.toString();
        } catch (e) {
            console.warn("Invalid resource URL:", resource.url);
             // Keep safeUrl as '#'
        }

        const sanitize = (str) => {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        };

        li.innerHTML = `
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline truncate pr-2" title="${sanitize(resource.name)} (${sanitize(resource.url)})">${sanitize(resource.name)}</a>
            <button class='text-red-500 text-xs ml-1 delete-resource-btn opacity-0 group-hover:opacity-100 transition-opacity' aria-label="Delete Resource">x</button>
        `;
        return li;
    };

    const createGoalElement = (goal) => {
        const li = document.createElement('li');
        li.dataset.itemId = goal.id;
        li.className = `flex items-center group ${goal.completed ? 'line-through text-slate-500' : ''}`;

        const sanitize = (str) => {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        };

        const dueDateString = goal.dueDate ? ` (Due: ${sanitize(goal.dueDate)})` : '';

        li.innerHTML = `
            <input type="checkbox" class="mr-2 accent-blue-500 flex-shrink-0" ${goal.completed ? 'checked' : ''} aria-label="Mark goal complete">
            <span class="flex-grow truncate pr-1" title="${sanitize(goal.description)}${dueDateString}">${sanitize(goal.description)}${dueDateString}</span>
            <button class='text-red-500 text-xs ml-1 delete-goal-btn opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0' aria-label="Delete Goal">x</button>
        `;
        return li;
    };

     const createNoteElement = (note) => {
        const p = document.createElement('p');
        p.dataset.itemId = note.id;
        // Basic sanitization for note content display
        p.textContent = note.content;
        p.className = "mb-1 last:mb-0"; // Add some spacing between notes
        // Add delete button if notes should be deletable individually
        // p.innerHTML = `${sanitize(note.content)} <button class='text-red-500 text-xs ml-1 delete-note-btn'>x</button>`;
        return p;
    };

    const addResourceToSubject = (subjectId, resource) => {
        const subjectElement = dashboardGrid.querySelector(`.module[data-subject-id="${subjectId}"]`);
        if (subjectElement) {
            const resourcesList = subjectElement.querySelector('.resources-list');
            const resourceElement = createResourceElement(resource);
            resourcesList.appendChild(resourceElement);
        }
    };

    const addGoalToSubject = (subjectId, goal) => {
        const subjectElement = dashboardGrid.querySelector(`.module[data-subject-id="${subjectId}"]`);
        if (subjectElement) {
            const goalsList = subjectElement.querySelector('.goals-list');
            const goalElement = createGoalElement(goal);
            goalsList.appendChild(goalElement);
        }
    };

     const addNoteToSubject = (subjectId, note) => {
        const subjectElement = dashboardGrid.querySelector(`.module[data-subject-id="${subjectId}"]`);
        if (subjectElement) {
            const notesArea = subjectElement.querySelector('.notes-area');
            const noteElement = createNoteElement(note);
            notesArea.appendChild(noteElement);
        }
    };

    const removeItemFromSubject = (subjectId, itemType, itemId) => {
         const subjectElement = dashboardGrid.querySelector(`.module[data-subject-id="${subjectId}"]`);
         if (subjectElement) {
             // itemType will be 'resources', 'goals', or 'notes' (matching the storage key)
             let listSelector;
             if (itemType === 'resources') listSelector = '.resources-list';
             else if (itemType === 'goals') listSelector = '.goals-list';
             else if (itemType === 'notes') listSelector = '.notes-area';
             else return; // Unknown item type

             const listElement = subjectElement.querySelector(listSelector);
             if (listElement) {
                 const itemElement = listElement.querySelector(`[data-item-id="${itemId}"]`);
                 if (itemElement) {
                     itemElement.remove();
                 }
             }
         }
    };

    const updateGoalStyle = (goalElement, isCompleted) => {
        if (isCompleted) {
            goalElement.classList.add('line-through', 'text-slate-500');
        } else {
            goalElement.classList.remove('line-through', 'text-slate-500');
        }
    };


    // --- Modal Handling ---

    const showSubjectModal = (subject = null) => {
        subjectForm.reset(); // Clear previous data
        if (subject) {
            // Edit mode
            modalTitle.textContent = 'Edit Subject';
            editSubjectIdInput.value = subject.id;
            subjectNameInput.value = subject.name;
            subjectDescriptionInput.value = subject.description;
            subjectIconInput.value = subject.icon || 'fas fa-book'; // Set icon or default
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Subject';
            editSubjectIdInput.value = ''; // Ensure ID is empty for add mode
            subjectIconInput.value = 'fas fa-book'; // Reset to default icon
        }
        subjectModal.classList.remove('hidden');
        subjectNameInput.focus(); // Focus the first input
    };

    const hideSubjectModal = () => {
        subjectModal.classList.add('hidden');
        subjectForm.reset();
        editSubjectIdInput.value = ''; // Clear ID explicitly
    };

    const showItemModal = (subjectId, itemType) => {
        itemForm.reset();
        itemSubjectIdInput.value = subjectId;
        itemTypeInput.value = itemType;

        // Hide all specific field sections first
        resourceFields.classList.add('hidden');
        goalFields.classList.add('hidden');
        noteFields.classList.add('hidden');

        // Show the relevant section and set title
        let focusInput = null;
        if (itemType === 'resource') {
            itemModalTitle.textContent = 'Add Resource';
            resourceFields.classList.remove('hidden');
            focusInput = document.getElementById('resource-name');
        } else if (itemType === 'goal') {
            itemModalTitle.textContent = 'Add Goal';
            goalFields.classList.remove('hidden');
            focusInput = document.getElementById('goal-description');
        } else if (itemType === 'note') {
            itemModalTitle.textContent = 'Add Note';
            noteFields.classList.remove('hidden');
            focusInput = document.getElementById('note-content');
        }

        itemModal.classList.remove('hidden');
        if (focusInput) {
            focusInput.focus();
        }
    };

    const hideItemModal = () => {
        itemModal.classList.add('hidden');
        itemForm.reset();
        itemSubjectIdInput.value = '';
        itemTypeInput.value = '';
    };

    // --- Progress Update ---
    const updateProgressDisplay = (subjectElement, progress) => {
         const progressBar = subjectElement.querySelector('.progress-bar');
         const progressValue = subjectElement.querySelector('.progress-value');
         const progressSlider = subjectElement.querySelector('.progress-slider');

         const clampedProgress = Math.max(0, Math.min(100, progress)); // Ensure 0-100

         if (progressBar) progressBar.style.width = `${clampedProgress}%`;
         if (progressValue) progressValue.textContent = clampedProgress;
         if (progressSlider) progressSlider.value = clampedProgress;
    };


    return {
        addSubjectToDashboard,
        updateSubjectInDashboard,
        removeSubjectFromDashboard,
        clearDashboard,
        addResourceToSubject,
        addGoalToSubject,
        addNoteToSubject,
        removeItemFromSubject,
        updateGoalStyle,
        showSubjectModal,
        hideSubjectModal,
        showItemModal,
        hideItemModal,
        updateProgressDisplay
    };

})();