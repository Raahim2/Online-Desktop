document.addEventListener('DOMContentLoaded', () => {
    const dashboardGrid = document.getElementById('dashboard-grid');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const subjectModal = document.getElementById('subject-modal');
    const subjectForm = document.getElementById('subject-form');
    const cancelSubjectBtn = document.getElementById('cancel-subject-btn');
    const modalTitle = document.getElementById('modal-title');
    const editSubjectIdInput = document.getElementById('edit-subject-id');
    const subjectNameInput = document.getElementById('subject-name');
    const subjectDescriptionInput = document.getElementById('subject-description');
    const subjectIconInput = document.getElementById('subject-icon');

    const itemModal = document.getElementById('item-modal');
    const itemForm = document.getElementById('item-form');
    const cancelItemBtn = document.getElementById('cancel-item-btn');
    const itemModalTitle = document.getElementById('item-modal-title');
    const itemSubjectIdInput = document.getElementById('item-subject-id');
    const itemTypeInput = document.getElementById('item-type');

    // Item specific fields
    const resourceFields = document.getElementById('resource-fields');
    const goalFields = document.getElementById('goal-fields');
    const noteFields = document.getElementById('note-fields');
    const resourceNameInput = document.getElementById('resource-name');
    const resourceUrlInput = document.getElementById('resource-url');
    const goalDescriptionInput = document.getElementById('goal-description');
    const goalDueDateInput = document.getElementById('goal-due-date');
    const noteContentInput = document.getElementById('note-content');

    let draggedItem = null;

    // --- Initialization ---
    function initializeDashboard() {
        const subjects = Storage.getSubjects();
        UI.clearDashboard();
        subjects.forEach(subject => UI.addSubjectToDashboard(subject));
        addDragAndDropListeners();
    }

    // --- Event Listeners ---

    // Add Subject Button
    addSubjectBtn.addEventListener('click', () => {
        UI.showSubjectModal();
    });

    // Cancel Subject Modal
    cancelSubjectBtn.addEventListener('click', () => {
        UI.hideSubjectModal();
    });

    // Submit Subject Form (Add/Edit)
    subjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = editSubjectIdInput.value;
        const name = subjectNameInput.value.trim();
        const description = subjectDescriptionInput.value.trim();
        const icon = subjectIconInput.value.trim() || 'fas fa-book'; // Default icon

        if (!name) return; // Basic validation

        if (id) {
            // Editing existing subject
            const updatedSubject = Storage.updateSubject(id, { name, description, icon });
            if (updatedSubject) {
                UI.updateSubjectInDashboard(updatedSubject);
            }
        } else {
            // Adding new subject
            const newSubject = Modules.createSubject(name, description, icon);
            Storage.addSubject(newSubject);
            UI.addSubjectToDashboard(newSubject);
            addDragAndDropListeners(); // Re-add listeners if a new item was added
        }

        UI.hideSubjectModal();
    });

    // Cancel Item Modal
    cancelItemBtn.addEventListener('click', () => {
        UI.hideItemModal();
    });

    // Submit Item Form (Add Resource/Goal/Note)
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subjectId = itemSubjectIdInput.value;
        const type = itemTypeInput.value;

        let newItem = null;

        if (type === 'resource') {
            const name = resourceNameInput.value.trim();
            const url = resourceUrlInput.value.trim();
            if (name && url) {
                newItem = Modules.createResource(name, url);
                Storage.addItemToSubject(subjectId, type, newItem);
                UI.addResourceToSubject(subjectId, newItem);
            }
        } else if (type === 'goal') {
            const description = goalDescriptionInput.value.trim();
            const dueDate = goalDueDateInput.value;
            if (description) {
                newItem = Modules.createGoal(description, dueDate);
                Storage.addItemToSubject(subjectId, type, newItem);
                UI.addGoalToSubject(subjectId, newItem);
            }
        } else if (type === 'note') {
            const content = noteContentInput.value.trim();
            if (content) {
                newItem = Modules.createNote(content);
                Storage.addItemToSubject(subjectId, type, newItem);
                UI.addNoteToSubject(subjectId, newItem);
            }
        }

        if (newItem) {
            UI.hideItemModal();
        } else {
            // Handle validation feedback if needed
            console.warn("Item data invalid or missing.");
        }
    });


    // Dashboard Grid Event Delegation
    dashboardGrid.addEventListener('click', (e) => {
        const subjectElement = e.target.closest('.module');
        if (!subjectElement) return;
        const subjectId = subjectElement.dataset.subjectId;

        // Edit Subject Button
        if (e.target.closest('.edit-subject-btn')) {
            const subject = Storage.getSubjectById(subjectId);
            if (subject) {
                UI.showSubjectModal(subject);
            }
        }

        // Delete Subject Button
        else if (e.target.closest('.delete-subject-btn')) {
            if (confirm('Are you sure you want to delete this subject and all its contents?')) {
                Storage.deleteSubject(subjectId);
                UI.removeSubjectFromDashboard(subjectId);
            }
        }

        // Add Resource Button
        else if (e.target.closest('.add-resource-btn')) {
            UI.showItemModal(subjectId, 'resource');
        }

        // Add Goal Button
        else if (e.target.closest('.add-goal-btn')) {
            UI.showItemModal(subjectId, 'goal');
        }

        // Add Note Button
        else if (e.target.closest('.add-note-btn')) {
             UI.showItemModal(subjectId, 'note');
        }

        // Delete Resource Button
        else if (e.target.closest('.delete-resource-btn')) {
            const resourceElement = e.target.closest('li');
            const resourceId = resourceElement.dataset.itemId;
            if (confirm('Delete this resource?')) {
                Storage.deleteItemFromSubject(subjectId, 'resources', resourceId);
                UI.removeItemFromSubject(subjectId, 'resources', resourceId);
            }
        }

        // Delete Goal Button
        else if (e.target.closest('.delete-goal-btn')) {
            const goalElement = e.target.closest('li');
            const goalId = goalElement.dataset.itemId;
             if (confirm('Delete this goal?')) {
                Storage.deleteItemFromSubject(subjectId, 'goals', goalId);
                UI.removeItemFromSubject(subjectId, 'goals', goalId);
            }
        }

         // Delete Note Button (Assuming notes might become deletable later)
         // else if (e.target.closest('.delete-note-btn')) { ... }

        // Toggle Goal Completion
        else if (e.target.matches('input[type="checkbox"]') && e.target.closest('.goals-list')) {
             const goalElement = e.target.closest('li');
             const goalId = goalElement.dataset.itemId;
             const isCompleted = e.target.checked;
             Storage.updateGoalCompletion(subjectId, goalId, isCompleted);
             UI.updateGoalStyle(goalElement, isCompleted);
        }

    });

     // Progress Slider Input Delegation
    dashboardGrid.addEventListener('input', (e) => {
        if (e.target.classList.contains('progress-slider')) {
            const subjectElement = e.target.closest('.module');
            const subjectId = subjectElement.dataset.subjectId;
            const newProgress = parseInt(e.target.value, 10);
            Storage.updateSubjectProgress(subjectId, newProgress);
            UI.updateProgressDisplay(subjectElement, newProgress);
        }
    });


    // --- Drag and Drop ---
    function addDragAndDropListeners() {
        const modules = dashboardGrid.querySelectorAll('.module');

        modules.forEach(module => {
            module.addEventListener('dragstart', handleDragStart);
            module.addEventListener('dragend', handleDragEnd);
            // Ensure the handle initiates drag, not the whole card if needed
            const handle = module.querySelector('.handle');
             if (handle) {
                 handle.addEventListener('mousedown', () => {
                     module.setAttribute('draggable', 'true');
                 });
                 handle.addEventListener('mouseup', () => {
                     // Delay removal slightly to ensure dragstart fires if needed
                     setTimeout(() => module.setAttribute('draggable', 'false'), 0);
                 });
                 module.setAttribute('draggable', 'false'); // Initially not draggable unless handle is used
             } else {
                 module.setAttribute('draggable', 'true'); // Default draggable if no handle
             }
        });

        dashboardGrid.addEventListener('dragover', handleDragOver);
        dashboardGrid.addEventListener('dragenter', handleDragEnter);
        dashboardGrid.addEventListener('dragleave', handleDragLeave);
        dashboardGrid.addEventListener('drop', handleDrop);
    }

    function handleDragStart(e) {
        // Only allow dragging if initiated from the handle or if no handle exists
        if (e.target.classList.contains('module') && (e.target.querySelector('.handle') === null || e.target.querySelector('.handle').contains(e.target))) {
           // Check if the event target is the handle itself or a child of the handle
            let targetElement = e.target;
            let isHandleOrChild = false;
            const handle = this.querySelector('.handle');

            if (!handle) { // If no handle, the whole module is draggable
                isHandleOrChild = true;
            } else {
                while (targetElement && targetElement !== this) {
                    if (targetElement === handle) {
                        isHandleOrChild = true;
                        break;
                    }
                    targetElement = targetElement.parentNode;
                }
                 // Also check if the direct target IS the handle
                 if (e.target === handle) isHandleOrChild = true;
            }


            if(isHandleOrChild) {
                draggedItem = this;
                // Use setTimeout to allow the browser to render the drag image before applying styles
                setTimeout(() => {
                    this.classList.add('module-dragging');
                }, 0);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', this.dataset.subjectId); // Pass subject ID
            } else {
                 e.preventDefault(); // Prevent dragging if not started on the handle
            }

        } else {
             e.preventDefault(); // Prevent dragging if target isn't the module itself
        }


    }

    function handleDragEnd(e) {
        // Use setTimeout to ensure styles are removed after drop potentially completes
        setTimeout(() => {
            if (draggedItem) {
                draggedItem.classList.remove('module-dragging');
            }
            draggedItem = null;
             // Reset draggable attribute if handle exists
            const handle = this.querySelector('.handle');
            if (handle) {
                this.setAttribute('draggable', 'false');
            }
        }, 0);

        // Clean up drag-over styles from all potential targets
        dashboardGrid.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    }

    function handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        const targetModule = e.target.closest('.module');
        if (targetModule && targetModule !== draggedItem) {
             // Optional: Add visual feedback on the potential drop target
             dashboardGrid.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over')); // Clear previous
             targetModule.classList.add('drag-over');
        }
    }

     function handleDragEnter(e) {
        e.preventDefault();
        const targetModule = e.target.closest('.module');
        if (targetModule && targetModule !== draggedItem) {
            targetModule.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
         const targetModule = e.target.closest('.module');
         // Check if the relatedTarget (where the mouse is going) is still within the module
         if (targetModule && !targetModule.contains(e.relatedTarget)) {
            targetModule.classList.remove('drag-over');
         }
         // If leaving the grid entirely
         if (!dashboardGrid.contains(e.relatedTarget)) {
             dashboardGrid.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
         }
    }

    function handleDrop(e) {
        e.preventDefault();
        const targetModule = e.target.closest('.module');
        dashboardGrid.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over')); // Clean up visual feedback

        if (targetModule && draggedItem && targetModule !== draggedItem) {
            const targetId = targetModule.dataset.subjectId;
            const draggedId = draggedItem.dataset.subjectId;

            // Determine drop position relative to target
            const rect = targetModule.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            const insertBefore = offsetY < rect.height / 2;

            if (insertBefore) {
                dashboardGrid.insertBefore(draggedItem, targetModule);
            } else {
                dashboardGrid.insertBefore(draggedItem, targetModule.nextSibling);
            }

            // Update the order in storage
            const newOrder = Array.from(dashboardGrid.querySelectorAll('.module')).map(module => module.dataset.subjectId);
            Storage.updateSubjectOrder(newOrder);
        }
         // Reset draggable attribute if handle exists
         if(draggedItem){
            const handle = draggedItem.querySelector('.handle');
            if (handle) {
                draggedItem.setAttribute('draggable', 'false');
            }
         }

    }


    // --- Initial Load ---
    initializeDashboard();

});