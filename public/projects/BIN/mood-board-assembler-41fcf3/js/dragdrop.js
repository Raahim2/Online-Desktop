function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isResizing = false;
    let resizeHandle = null;
    const minWidth = 30; // Minimum width for elements
    const minHeight = 20; // Minimum height for text elements

    // Use the element itself as the drag trigger initially
    elmnt.onmousedown = dragMouseDown;
    elmnt.ontouchstart = dragMouseDown; // Basic touch support

    // Create resize handles (simple example: bottom-right)
    createResizeHandles(elmnt);

    function createResizeHandles(element) {
        // Remove existing handles first to prevent duplicates on reload/state restore
        element.querySelectorAll('.resize-handle').forEach(h => h.remove());

        const handleBR = document.createElement('div');
        handleBR.className = 'resize-handle bottom-right';
        handleBR.style.position = 'absolute';
        handleBR.style.bottom = '-4px';
        handleBR.style.right = '-4px';
        handleBR.style.width = '10px';
        handleBR.style.height = '10px';
        handleBR.style.backgroundColor = 'dodgerblue';
        handleBR.style.border = '1px solid white';
        handleBR.style.cursor = 'nwse-resize';
        handleBR.style.zIndex = '10000'; // Ensure handles are on top
        handleBR.style.display = 'none'; // Initially hidden

        element.appendChild(handleBR);

        handleBR.onmousedown = resizeMouseDown;
        handleBR.ontouchstart = resizeMouseDown;

        // Show handles only when the element is selected (handled by CSS or script.js)
        // We add a listener here to show/hide based on the 'selected' class added by script.js
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    const isSelected = element.classList.contains('selected');
                    element.querySelectorAll('.resize-handle').forEach(h => {
                        h.style.display = isSelected ? 'block' : 'none';
                    });
                }
            });
        });
        observer.observe(element, { attributes: true });
         // Initial check in case element is already selected when makeDraggable is called
         const isSelected = element.classList.contains('selected');
         element.querySelectorAll('.resize-handle').forEach(h => {
             h.style.display = isSelected ? 'block' : 'none';
         });
    }


    function dragMouseDown(e) {
        // Prevent dragging if clicking on a resize handle or contenteditable
        if (e.target.classList.contains('resize-handle') || e.target.isContentEditable) {
            return;
        }

        e = e || window.event;
        // e.preventDefault(); // Prevent default image drag only if needed, can interfere with text selection

        isResizing = false;

        // Get the mouse cursor position at startup:
        pos3 = e.clientX || (e.touches && e.touches[0].clientX);
        pos4 = e.clientY || (e.touches && e.touches[0].clientY);

        document.onmouseup = closeDragElement;
        document.ontouchend = closeDragElement;
        // Call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
        document.ontouchmove = elementDrag;

        elmnt.style.cursor = 'grabbing';

        // Notify script.js that this element is potentially selected
        if (typeof window.notifyElementSelected === 'function') {
            window.notifyElementSelected(elmnt);
        }
    }

    function elementDrag(e) {
        if (isResizing) return; // Don't drag while resizing

        e = e || window.event;
        // Calculate the new cursor position:
        const currentX = e.clientX || (e.touches && e.touches[0].clientX);
        const currentY = e.clientY || (e.touches && e.touches[0].clientY);
        pos1 = pos3 - currentX;
        pos2 = pos4 - currentY;
        pos3 = currentX;
        pos4 = currentY;

        // Calculate the new element position:
        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        // Boundary checks (relative to the canvas)
        const canvas = document.getElementById('moodboard-canvas');
        const canvasRect = canvas.getBoundingClientRect();
        const elmntRect = elmnt.getBoundingClientRect(); // Use current rect for dimensions

        // Prevent dragging top/left edge beyond canvas
        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;

        // Prevent dragging bottom/right edge beyond canvas
        if (newTop + elmntRect.height > canvasRect.height) {
            newTop = canvasRect.height - elmntRect.height;
        }
        if (newLeft + elmntRect.width > canvasRect.width) {
            newLeft = canvasRect.width - elmntRect.width;
        }

        // Set the element's new position:
        elmnt.style.top = newTop + 'px';
        elmnt.style.left = newLeft + 'px';
    }

    function resizeMouseDown(e) {
        e = e || window.event;
        e.preventDefault(); // Prevent text selection/drag during resize
        e.stopPropagation(); // Prevent triggering dragMouseDown on the element itself

        isResizing = true;
        resizeHandle = e.target;
        elmnt.classList.add('resizing'); // Add visual cue if needed

        // Get the initial mouse position and element dimensions
        pos3 = e.clientX || (e.touches && e.touches[0].clientX);
        pos4 = e.clientY || (e.touches && e.touches[0].clientY);
        const initialWidth = elmnt.offsetWidth;
        const initialHeight = elmnt.offsetHeight;
        const initialLeft = elmnt.offsetLeft;
        const initialTop = elmnt.offsetTop;

        document.onmouseup = closeDragElement;
        document.ontouchend = closeDragElement;
        document.onmousemove = elementResize;
        document.ontouchmove = elementResize;

        function elementResize(e) {
            e = e || window.event;
            const currentX = e.clientX || (e.touches && e.touches[0].clientX);
            const currentY = e.clientY || (e.touches && e.touches[0].clientY);

            const dx = currentX - pos3;
            const dy = currentY - pos4;

            let newWidth = initialWidth;
            let newHeight = initialHeight;

            // Handle resizing based on the handle clicked (only bottom-right here)
            if (resizeHandle.classList.contains('bottom-right')) {
                newWidth = initialWidth + dx;
                newHeight = initialHeight + dy;
            }
            // Add logic for other handles (top-left, top-right, bottom-left, sides) if implemented

            // Apply minimum size constraints
            newWidth = Math.max(newWidth, minWidth);
            if (elmnt.classList.contains('text-element')) {
                 newHeight = Math.max(newHeight, minHeight);
            } else {
                 // For images, maintain aspect ratio if needed (simple approach)
                 if (elmnt.tagName === 'IMG' && initialWidth > 0 && initialHeight > 0) {
                     const aspectRatio = initialWidth / initialHeight;
                     // Adjust height based on width change, or vice versa
                     if (Math.abs(dx) > Math.abs(dy)) { // Width changed more
                         newHeight = newWidth / aspectRatio;
                     } else { // Height changed more
                         newWidth = newHeight * aspectRatio;
                     }
                     newWidth = Math.max(newWidth, minWidth); // Re-apply min width after ratio calc
                     newHeight = Math.max(newHeight, minHeight); // Re-apply min height
                 } else {
                     newHeight = Math.max(newHeight, minHeight); // Apply min height for non-image/non-text?
                 }
            }


            // Boundary checks for resize
            const canvas = document.getElementById('moodboard-canvas');
            const canvasRect = canvas.getBoundingClientRect();

            if (initialLeft + newWidth > canvasRect.width) {
                newWidth = canvasRect.width - initialLeft;
                 if (elmnt.tagName === 'IMG') newHeight = newWidth / (initialWidth / initialHeight); // Adjust height based on constrained width
            }
            if (initialTop + newHeight > canvasRect.height) {
                newHeight = canvasRect.height - initialTop;
                 if (elmnt.tagName === 'IMG') newWidth = newHeight * (initialWidth / initialHeight); // Adjust width based on constrained height
            }

            // Apply new dimensions
            elmnt.style.width = newWidth + 'px';
            elmnt.style.height = elmnt.tagName === 'IMG' ? 'auto' : newHeight + 'px'; // Let images scale height automatically based on width
             if (elmnt.classList.contains('text-element')) {
                 elmnt.style.height = newHeight + 'px'; // Explicitly set height for text divs
             }

        }
    }


    function closeDragElement() {
        // Stop moving/resizing when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;

        elmnt.style.cursor = 'grab';
        elmnt.classList.remove('resizing');

        // Notify script.js that the operation ended to save state
        if (typeof window.notifyDragEnd === 'function') {
            window.notifyDragEnd();
        }

        isResizing = false;
        resizeHandle = null;
    }
}

// Initial setup: Ensure existing elements on load are draggable
// This might run before script.js loads everything, so script.js
// should also call makeDraggable on loaded elements.
// document.addEventListener('DOMContentLoaded', () => {
//     document.querySelectorAll('#moodboard-canvas .draggable').forEach(el => {
//         makeDraggable(el);
//     });
// });
// Note: Relying on script.js to call makeDraggable after loading/adding elements is safer.