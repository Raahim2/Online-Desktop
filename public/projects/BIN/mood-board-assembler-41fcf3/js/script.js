document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('moodboard-canvas');
    const canvasContainer = document.getElementById('moodboard-canvas-container');
    const addImageInput = document.getElementById('add-image-input');
    const addTextBtn = document.getElementById('add-text-btn');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const saveBtn = document.getElementById('save-btn');
    const clearBtn = document.getElementById('clear-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    // Element Toolbar
    const elementToolbar = document.getElementById('element-toolbar');
    const elementFontSizeInput = document.getElementById('element-font-size');
    const elementColorInput = document.getElementById('element-color');
    const elementFontFamilySelect = document.getElementById('element-font-family');
    const deleteElementBtn = document.getElementById('delete-element-btn');
    const bringForwardBtn = document.getElementById('bring-forward-btn');
    const sendBackwardBtn = document.getElementById('send-backward-btn');

    // Color Palette Section (basic interaction)
    const paletteButtons = document.querySelectorAll('#color-palette-section button[data-palette]');
    const generatePaletteBtn = document.getElementById('generate-palette-btn'); // Assuming color.js handles generation logic

    let selectedElement = null;
    let history = [];
    let historyIndex = -1;
    let maxZIndex = 1; // Track the highest z-index

    // --- Initialization ---

    function initializeBoard() {
        // Load from local storage if available
        const savedBoard = loadBoardState(); // From storage.js
        if (savedBoard) {
            canvas.innerHTML = savedBoard.html || '';
            canvas.style.backgroundColor = savedBoard.bgColor || '#FFFFFF';
            bgColorPicker.value = savedBoard.bgColor || '#FFFFFF';
            updateMaxZIndex(); // Recalculate max z-index from loaded elements
        } else {
             canvas.innerHTML = ''; // Start fresh
             canvas.style.backgroundColor = '#FFFFFF';
             bgColorPicker.value = '#FFFFFF';
        }

        // Make existing elements draggable/resizable (assuming dragdrop.js handles this)
        canvas.querySelectorAll('.draggable').forEach(el => {
            if (typeof makeDraggable === 'function') { // Check if dragdrop.js is loaded
                 makeDraggable(el);
            }
             // Add selection listener here as well for loaded elements
            el.addEventListener('click', handleElementClick);
            el.addEventListener('touchstart', handleElementClick, { passive: true }); // Basic touch support
        });

        saveState(); // Initial state for undo/redo
        updateUndoRedoButtons();
        deselectElement(); // Ensure nothing is selected initially
    }

    function updateMaxZIndex() {
        maxZIndex = 1;
        canvas.querySelectorAll('.draggable').forEach(el => {
            const z = parseInt(el.style.zIndex || '1', 10);
            if (z >= maxZIndex) {
                maxZIndex = z + 1;
            }
        });
    }


    // --- Element Creation ---

    function addImageElement(src) {
        const img = document.createElement('img');
        img.src = src;
        img.classList.add('draggable');
        img.style.position = 'absolute';
        img.style.left = '20px';
        img.style.top = '20px';
        img.style.width = '150px'; // Default size
        img.style.height = 'auto';
        img.style.cursor = 'grab';
        img.style.zIndex = maxZIndex++;
        img.setAttribute('data-type', 'image');

        canvas.appendChild(img);
        if (typeof makeDraggable === 'function') { // Check if dragdrop.js is loaded
            makeDraggable(img); // Make the new element draggable
        }
        img.addEventListener('click', handleElementClick);
        img.addEventListener('touchstart', handleElementClick, { passive: true });
        selectElement(img);
        saveState();
    }

    function addTextElement() {
        const textDiv = document.createElement('div');
        textDiv.classList.add('draggable', 'text-element');
        textDiv.style.position = 'absolute';
        textDiv.style.left = '50px';
        textDiv.style.top = '50px';
        textDiv.style.fontSize = '20px';
        textDiv.style.fontFamily = 'Arial, sans-serif';
        textDiv.style.color = '#000000';
        textDiv.style.cursor = 'grab';
        textDiv.style.padding = '5px';
        textDiv.style.border = '1px dashed transparent'; // Show border on hover/select
        textDiv.style.zIndex = maxZIndex++;
        textDiv.setAttribute('contenteditable', 'true');
        textDiv.setAttribute('data-type', 'text');
        textDiv.textContent = 'Edit Text';

        canvas.appendChild(textDiv);
        if (typeof makeDraggable === 'function') { // Check if dragdrop.js is loaded
            makeDraggable(textDiv); // Make the new element draggable
        }
        textDiv.addEventListener('click', handleElementClick);
        textDiv.addEventListener('touchstart', handleElementClick, { passive: true });
        textDiv.addEventListener('input', saveState); // Save state on text edit
        textDiv.addEventListener('blur', () => {
             if (textDiv.textContent.trim() === '') {
                 // Optionally remove empty text boxes on blur
                 // deleteElement(textDiv);
             }
        });

        selectElement(textDiv);
        textDiv.focus(); // Focus to edit immediately
        saveState();
    }

    // --- Element Selection & Manipulation ---

    function handleElementClick(event) {
        event.stopPropagation(); // Prevent canvas click from deselecting
        const targetElement = event.currentTarget; // Use currentTarget for the element the listener is attached to
        if (targetElement.classList.contains('draggable')) {
            selectElement(targetElement);
        }
    }

    function selectElement(element) {
        if (selectedElement && selectedElement !== element) {
            deselectElement(); // Deselect previous
        }
        if (!element) {
             deselectElement();
             return;
        }

        selectedElement = element;
        selectedElement.classList.add('selected');
        selectedElement.style.border = '1px dashed dodgerblue'; // Visual cue

        // Show and configure toolbar
        elementToolbar.classList.remove('hidden');
        updateToolbar(selectedElement);
    }

    function deselectElement() {
        if (selectedElement) {
            selectedElement.classList.remove('selected');
            selectedElement.style.border = '1px dashed transparent'; // Hide border
             if (selectedElement.getAttribute('data-type') === 'text') {
                 selectedElement.blur(); // Remove focus from text element
             }
        }
        selectedElement = null;
        elementToolbar.classList.add('hidden');
    }

    function updateToolbar(element) {
        const elementType = element.getAttribute('data-type');
        if (elementType === 'text') {
            elementFontSizeInput.value = parseInt(element.style.fontSize || '16', 10);
            elementColorInput.value = rgbToHex(element.style.color || 'rgb(0, 0, 0)');
            elementFontFamilySelect.value = element.style.fontFamily || 'Arial, sans-serif';
            // Show text-specific controls
            elementFontSizeInput.disabled = false;
            elementColorInput.disabled = false;
            elementFontFamilySelect.disabled = false;
        } else {
            // Disable text controls for images or other types
            elementFontSizeInput.disabled = true;
            elementColorInput.disabled = true;
            elementFontFamilySelect.disabled = true;
        }
    }

    function updateElementStyle(property, value) {
        if (!selectedElement) return;

        const elementType = selectedElement.getAttribute('data-type');

        if (elementType === 'text') {
            if (property === 'fontSize') {
                selectedElement.style.fontSize = `${value}px`;
            } else if (property === 'color') {
                selectedElement.style.color = value;
            } else if (property === 'fontFamily') {
                selectedElement.style.fontFamily = value;
            }
        }
        // Add other style updates if needed (e.g., opacity, rotation for all types)
        saveState();
    }

    function deleteElement() {
        if (selectedElement) {
            selectedElement.remove();
            deselectElement();
            saveState();
        }
    }

    function changeZIndex(direction) {
        if (!selectedElement) return;

        let currentZ = parseInt(selectedElement.style.zIndex || '1', 10);

        if (direction === 'forward') {
             // Bring forward: Increase z-index, but cap if needed or re-assign others
             selectedElement.style.zIndex = maxZIndex++; // Simple increment and update max
        } else if (direction === 'backward') {
            // Send backward: Decrease z-index, ensure it's >= 0
            if (currentZ > 0) {
                 // Simple decrement - might collide, better approach needed for complex layering
                 selectedElement.style.zIndex = Math.max(0, currentZ - 1);
                 // Ideally, shift other elements' z-indices if needed
            }
        }
        saveState();
    }

    // --- Canvas Actions ---

    function setCanvasBackground(color) {
        canvas.style.backgroundColor = color;
        saveState();
    }

    function clearCanvas() {
        if (confirm('Are you sure you want to clear the entire mood board? This cannot be undone easily.')) {
            canvas.innerHTML = '';
            setCanvasBackground('#FFFFFF'); // Reset background
            bgColorPicker.value = '#FFFFFF';
            maxZIndex = 1;
            deselectElement();
            history = []; // Clear history too
            historyIndex = -1;
            saveState(); // Save the cleared state
            updateUndoRedoButtons();
            saveBoardState({ html: '', bgColor: '#FFFFFF' }); // Clear local storage
        }
    }

    async function saveAsPNG() {
        deselectElement(); // Ensure no selection borders are in the output
        // Use html2canvas library (assuming it's loaded via CDN or locally)
        if (typeof html2canvas === 'function') {
            try {
                // Temporarily remove borders for capture if any visual artifacts appear
                const tempStyle = canvasContainer.style.border;
                canvasContainer.style.border = 'none'; // Hide container border

                const canvasElement = await html2canvas(canvasContainer, {
                    backgroundColor: canvas.style.backgroundColor || '#ffffff', // Ensure background is captured
                    logging: false, // Reduce console noise
                    useCORS: true // Important for external images if any
                });

                canvasContainer.style.border = tempStyle; // Restore border

                const link = document.createElement('a');
                link.download = 'moodboard.png';
                link.href = canvasElement.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Error saving canvas:', error);
                alert('Could not save the mood board. See console for details.');
                 canvasContainer.style.border = tempStyle; // Restore border on error
            }
        } else {
            alert('html2canvas library not found. Cannot save as PNG.');
            console.error('html2canvas is not defined. Please include the library.');
        }
    }

    // --- Undo/Redo ---

    function saveState() {
        // Debounce or throttle saving if performance becomes an issue
        const currentState = {
            html: canvas.innerHTML,
            bgColor: canvas.style.backgroundColor || '#FFFFFF'
        };

        // If we undo, then make a change, truncate the future history
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }

        // Avoid saving identical consecutive states
        if (history.length > 0 && JSON.stringify(history[history.length - 1]) === JSON.stringify(currentState)) {
            return;
        }


        history.push(currentState);
        historyIndex++;

        // Limit history size (optional)
        const maxHistory = 50;
        if (history.length > maxHistory) {
            history.shift();
            historyIndex--;
        }

        updateUndoRedoButtons();
        // Also save to local storage
        saveBoardState(currentState); // From storage.js
    }

    function restoreState(state) {
        canvas.innerHTML = state.html;
        canvas.style.backgroundColor = state.bgColor;
        bgColorPicker.value = state.bgColor; // Sync picker
        updateMaxZIndex(); // Recalculate max z-index

        // Re-attach listeners and make draggable AFTER innerHTML is set
        canvas.querySelectorAll('.draggable').forEach(el => {
            if (typeof makeDraggable === 'function') {
                makeDraggable(el);
            }
            el.addEventListener('click', handleElementClick);
            el.addEventListener('touchstart', handleElementClick, { passive: true });
            if (el.getAttribute('data-type') === 'text') {
                 el.addEventListener('input', saveState); // Re-attach text input listener
            }
        });
        deselectElement(); // Ensure nothing is selected after restore
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            restoreState(history[historyIndex]);
            updateUndoRedoButtons();
             // Save the undone state to local storage as well
             saveBoardState(history[historyIndex]);
        }
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            restoreState(history[historyIndex]);
            updateUndoRedoButtons();
            // Save the redone state to local storage
            saveBoardState(history[historyIndex]);
        }
    }

    function updateUndoRedoButtons() {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= history.length - 1;
    }

    // --- Event Listeners Setup ---

    addImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addImageElement(e.target.result);
            };
            reader.readAsDataURL(file);
        }
        // Reset input to allow uploading the same file again
        event.target.value = null;
    });

    addTextBtn.addEventListener('click', addTextElement);

    bgColorPicker.addEventListener('input', (event) => {
        setCanvasBackground(event.target.value);
    });
     bgColorPicker.addEventListener('change', () => { // Ensure final color is saved
        saveState();
    });


    saveBtn.addEventListener('click', saveAsPNG);
    clearBtn.addEventListener('click', clearCanvas);
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    // Deselect when clicking outside elements
    canvasContainer.addEventListener('click', (event) => {
        // Check if the click is directly on the canvas container or canvas itself, not an element
         if (event.target === canvasContainer || event.target === canvas) {
             deselectElement();
         }
    });

    // Element Toolbar Listeners
    elementFontSizeInput.addEventListener('input', (e) => updateElementStyle('fontSize', e.target.value));
    elementColorInput.addEventListener('input', (e) => updateElementStyle('color', e.target.value));
    elementFontFamilySelect.addEventListener('change', (e) => updateElementStyle('fontFamily', e.target.value));
    // Save state after toolbar changes are finalized (e.g., on change/blur)
    elementFontSizeInput.addEventListener('change', saveState);
    elementColorInput.addEventListener('change', saveState);
    elementFontFamilySelect.addEventListener('change', saveState);


    deleteElementBtn.addEventListener('click', deleteElement);
    bringForwardBtn.addEventListener('click', () => changeZIndex('forward'));
    sendBackwardBtn.addEventListener('click', () => changeZIndex('backward'));

    // Palette Button Listeners (Example: Apply first color as background)
    paletteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const colors = button.getAttribute('data-palette').split(',');
            if (colors.length > 0) {
                const firstColor = `#${colors[0]}`;
                 setCanvasBackground(firstColor);
                 bgColorPicker.value = firstColor; // Sync picker
                 // Optionally, could apply colors to selected element or add swatches
            }
        });
    });

     // Generate Palette Button Listener (assuming color.js provides generatePaletteFromImage)
     generatePaletteBtn.addEventListener('click', () => {
         if (selectedElement && selectedElement.tagName === 'IMG') {
             if (typeof generatePaletteFromImage === 'function') {
                 generatePaletteFromImage(selectedElement)
                     .then(palette => {
                         // console.log('Generated Palette:', palette);
                         // TODO: Display or use the generated palette (e.g., update palette section)
                         alert('Palette generated (check console). UI update needed.');
                     })
                     .catch(err => {
                         console.error("Palette generation failed:", err);
                         alert('Could not generate palette from image.');
                     });
             } else {
                 alert('Color generation function not available.');
             }
         } else {
             alert('Please select an image first to generate a palette.');
         }
     });

    // Keyboard shortcuts (basic example)
    document.addEventListener('keydown', (e) => {
        // Allow typing in text elements
        if (e.target.getAttribute('contenteditable') === 'true' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undo();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            redo();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
             if (selectedElement) {
                 e.preventDefault();
                 deleteElement();
             }
        } else if (e.key === 'Escape') {
            deselectElement();
        }
    });

    // --- Utility Functions ---
    function rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return '#000000'; // Default or handle non-rgb
        // Choose correct separator
        const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
        // Turn "rgb(r,g,b)" into [r,g,b]
        rgb = rgb.substr(4).split(')')[0].split(sep);

        let r = (+rgb[0]).toString(16),
            g = (+rgb[1]).toString(16),
            b = (+rgb[2]).toString(16);

        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;

        return '#' + r + g + b;
    }


    // --- Global drag/drop related functions (if needed by dragdrop.js) ---
    // These might be called by dragdrop.js after an operation is complete
    window.notifyDragEnd = () => {
        // A drag/resize operation finished, save the state
        saveState();
    };

    window.notifyElementSelected = (element) => {
        // dragdrop.js might handle selection visually, script.js handles toolbar logic
        selectElement(element);
    };


    // --- Initial Load ---
    initializeBoard();

});