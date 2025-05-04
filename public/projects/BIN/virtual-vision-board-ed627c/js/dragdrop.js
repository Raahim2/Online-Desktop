function makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    const dragArea = document.getElementById('vision-board'); // The container where elements can be dragged

    element.addEventListener('mousedown', dragStart);
    element.addEventListener('touchstart', dragStart, { passive: false }); // Use passive: false to allow preventDefault

    function dragStart(e) {
        // Prevent dragging if the click target is interactive (like a button inside the element, if any)
        // For this project, we assume the whole element is draggable unless specific inner elements are added later.
        // if (e.target !== element) return;

        e.preventDefault(); // Prevent text selection during drag

        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        // Calculate offset from the element's top-left corner
        const rect = element.getBoundingClientRect();
        const parentRect = dragArea.getBoundingClientRect(); // Get parent bounds for relative positioning

        if (e.type === "touchstart") {
             xOffset = e.touches[0].clientX - (rect.left - parentRect.left);
             yOffset = e.touches[0].clientY - (rect.top - parentRect.top);
        } else {
             xOffset = e.clientX - (rect.left - parentRect.left);
             yOffset = e.clientY - (rect.top - parentRect.top);
        }


        isDragging = true;
        element.style.cursor = 'grabbing';
        // Bring element to front while dragging (optional, handled by z-index controls now)
        // element.style.zIndex = 1000;

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
        document.addEventListener('touchcancel', dragEnd); // Handle cancellation
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault(); // Prevent scrolling on touch devices

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - xOffset;
                currentY = e.touches[0].clientY - yOffset;
            } else {
                currentX = e.clientX - xOffset;
                currentY = e.clientY - yOffset;
            }

            // Boundary checks against the dragArea
            const parentRect = dragArea.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            // Adjust currentX/Y to keep the element within bounds
            // Left boundary
            if (currentX < 0) {
                currentX = 0;
            }
            // Top boundary
            if (currentY < 0) {
                currentY = 0;
            }
            // Right boundary
            if (currentX + elementRect.width > parentRect.width) {
                currentX = parentRect.width - elementRect.width;
            }
            // Bottom boundary
            if (currentY + elementRect.height > parentRect.height) {
                currentY = parentRect.height - elementRect.height;
            }


            setTranslate(currentX, currentY, element);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.left = `${xPos}px`;
        el.style.top = `${yPos}px`;
    }

    function dragEnd(e) {
        if (!isDragging) return; // Avoid issues if dragEnd fires unexpectedly

        initialX = currentX;
        initialY = currentY;

        isDragging = false;
        element.style.cursor = 'move';
        // Reset z-index if it was changed during drag (handled by controls now)
        // const baseZ = element.dataset.baseZ || '1'; // Retrieve original or default z-index
        // element.style.zIndex = baseZ;

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('touchend', dragEnd);
        document.removeEventListener('touchcancel', dragEnd);

         // Refocus after drag to keep styling controls visible if they were open
         // Check if the element still exists in the DOM before focusing
         if (document.body.contains(element)) {
            element.focus();
         }
    }
}