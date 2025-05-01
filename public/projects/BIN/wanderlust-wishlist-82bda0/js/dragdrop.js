let draggedItem = null;

function initializeDragAndDrop(container, onDropCallback) {
    // Use event delegation on the container

    // DRAG START: Identify the item being dragged
    container.addEventListener('dragstart', (e) => {
        const targetCard = e.target.closest('.destination-card');
        if (targetCard && targetCard.draggable) {
            draggedItem = targetCard;
            // Add a slight delay to allow the browser to render the drag image
            setTimeout(() => {
                if (draggedItem) { // Check if still dragging
                    draggedItem.classList.add('opacity-50', 'shadow-xl', 'scale-105'); // Visual cue
                }
            }, 0);
            // Optional: Set dataTransfer data if needed elsewhere, but not strictly necessary for this implementation
            // e.dataTransfer.setData('text/plain', targetCard.dataset.id);
            e.dataTransfer.effectAllowed = 'move';
        } else {
            e.preventDefault(); // Prevent dragging non-card elements within the container
        }
    });

    // DRAG OVER: Determine where the item would be dropped
    container.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';

        if (!draggedItem) return; // Only proceed if an item is being dragged

        const afterElement = getDragAfterElement(container, e.clientY);
        const currentParent = draggedItem.parentNode;

        if (currentParent !== container) return; // Ensure we are within the same container

        // Insert the dragged item at the calculated position
        if (afterElement == null) {
            container.appendChild(draggedItem);
        } else {
            container.insertBefore(draggedItem, afterElement);
        }
    });

    // DRAG END: Clean up styles, regardless of where it was dropped
    container.addEventListener('dragend', (e) => {
         // Check target directly as draggedItem might be cleared by drop
        const targetCard = e.target.closest('.destination-card');
        if (targetCard) {
            targetCard.classList.remove('opacity-50', 'shadow-xl', 'scale-105');
        }
        // Also ensure the globally tracked item is cleared and styled correctly
        if (draggedItem) {
             draggedItem.classList.remove('opacity-50', 'shadow-xl', 'scale-105');
        }
        draggedItem = null; // Clear the reference
    });

    // DROP: Finalize the drop action
    container.addEventListener('drop', (e) => {
        e.preventDefault(); // Prevent default drop behavior (like opening link)
        if (draggedItem) {
            // Styles are removed in dragend, which fires after drop
            // Call the callback to update storage/state
            if (typeof onDropCallback === 'function') {
                onDropCallback();
            }
        }
        // draggedItem is cleared in dragend
    });
}


function getDragAfterElement(container, y) {
    // Get all draggable elements within the container, excluding the one being dragged
    const draggableElements = [...container.querySelectorAll('.destination-card:not(.opacity-50)')]; // Use opacity class as marker

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        // Calculate the vertical midpoint of the element
        const offset = y - box.top - box.height / 2;

        // We want the element whose midpoint is just *below* the cursor
        // So, we look for negative offsets (cursor is above midpoint)
        // and find the one closest to zero (smallest negative offset)
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element; // Initial value: find the element with the largest negative offset (closest below cursor)
}