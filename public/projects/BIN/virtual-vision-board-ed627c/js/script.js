document.addEventListener('DOMContentLoaded', () => {
    const visionBoard = document.getElementById('vision-board');
    const visionBoardContainer = document.getElementById('vision-board-container');
    const textInput = document.getElementById('text-input');
    const addTextBtn = document.getElementById('add-text-btn');
    const imageUpload = document.getElementById('image-upload');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const bgImageUpload = document.getElementById('bg-image-upload');
    const removeBgImageBtn = document.getElementById('remove-bg-image-btn');
    const saveBoardBtn = document.getElementById('save-board-btn');
    const loadBoardBtn = document.getElementById('load-board-btn');
    const clearBoardBtn = document.getElementById('clear-board-btn');
    const dropZone = document.getElementById('drop-zone');

    // Styling Controls
    const stylingControls = document.getElementById('styling-controls');
    const selectedElementIdInput = document.getElementById('selected-element-id');
    const textStyleOptions = document.getElementById('text-style-options');
    const elementTextColor = document.getElementById('element-text-color');
    const elementFontSize = document.getElementById('element-font-size');
    const elementBgColor = document.getElementById('element-bg-color');
    const elementZIndex = document.getElementById('element-z-index');
    const deleteElementBtn = document.getElementById('delete-element-btn');
    const closeStyleBtn = document.getElementById('close-style-btn');

    let elementCounter = 0;
    let selectedElement = null;

    // --- Element Creation ---

    function createElementBase(type, id) {
        const element = document.createElement('div');
        element.id = id || `element-${elementCounter++}`;
        element.classList.add('draggable', 'absolute', 'cursor-move', 'p-2', 'border', 'border-transparent', 'hover:border-blue-400', 'focus:border-blue-600', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-300', 'select-none');
        element.style.left = '10px';
        element.style.top = '10px';
        element.style.zIndex = '1'; // Default z-index
        element.tabIndex = 0; // Make it focusable
        element.dataset.type = type;

        element.addEventListener('focus', () => handleElementSelection(element));
        element.addEventListener('blur', (e) => {
            // Don't hide controls if focus moves to the controls panel itself
            if (!stylingControls.contains(e.relatedTarget)) {
               // Delay slightly to allow clicks within controls
               setTimeout(() => {
                    if (document.activeElement !== element && !stylingControls.contains(document.activeElement)) {
                       hideStylingControls();
                       element.classList.remove('border-blue-600', 'ring-2', 'ring-blue-300');
                       selectedElement = null;
                    }
               }, 100);
            }
        });

        makeDraggable(element); // From dragdrop.js
        visionBoard.appendChild(element);
        return element;
    }

    function addTextElement(text, id, styles = {}, position = { x: '10px', y: '10px' }) {
        if (!text.trim()) return;
        const element = createElementBase('text', id);
        element.textContent = text;
        element.style.backgroundColor = styles.backgroundColor || 'rgba(255, 255, 255, 0.7)';
        element.style.color = styles.color || '#000000';
        element.style.fontSize = styles.fontSize || '16px';
        element.style.zIndex = styles.zIndex || '1';
        element.style.left = position.x;
        element.style.top = position.y;
        element.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
        element.style.wordBreak = 'break-word'; // Prevent long text overflow
        element.style.maxWidth = '300px'; // Default max width
        element.style.minWidth = '50px'; // Default min width
        textInput.value = ''; // Clear input
        element.focus(); // Select the new element
    }

    function addImageElement(src, id, styles = {}, position = { x: '10px', y: '10px' }) {
        const element = createElementBase('image', id);
        const img = document.createElement('img');
        img.src = src;
        img.classList.add('max-w-full', 'h-auto', 'pointer-events-none'); // Prevent image dragging interference
        img.style.display = 'block'; // Remove extra space below image
        element.appendChild(img);
        element.style.borderWidth = '0px'; // Images often don't need borders unless styled
        element.style.padding = '0'; // Remove padding for images
        element.style.backgroundColor = 'transparent'; // Usually no bg for image container
        element.style.zIndex = styles.zIndex || '1';
        element.style.left = position.x;
        element.style.top = position.y;
        if (styles.width) element.style.width = styles.width; // Allow resizing later
        if (styles.height) element.style.height = styles.height;
        element.focus(); // Select the new element
    }

    // --- Event Listeners ---

    addTextBtn.addEventListener('click', () => addTextElement(textInput.value));

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => addImageElement(e.target.result);
            reader.readAsDataURL(file);
            imageUpload.value = ''; // Reset file input
        }
    });

    bgColorPicker.addEventListener('input', (event) => {
        visionBoard.style.backgroundColor = event.target.value;
        visionBoard.style.backgroundImage = 'none'; // Clear background image when color is set
    });

    bgImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                visionBoard.style.backgroundImage = `url('${e.target.result}')`;
                visionBoard.style.backgroundColor = ''; // Clear background color
            };
            reader.readAsDataURL(file);
            bgImageUpload.value = ''; // Reset file input
        }
    });

    removeBgImageBtn.addEventListener('click', () => {
        visionBoard.style.backgroundImage = 'none';
        // Optionally revert to default color or last picked color
        if (!visionBoard.style.backgroundColor) {
            visionBoard.style.backgroundColor = bgColorPicker.value || '#FFFFFF';
        }
    });

    clearBoardBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the entire board?')) {
            clearBoard();
        }
    });

    saveBoardBtn.addEventListener('click', saveBoardState);
    loadBoardBtn.addEventListener('click', loadBoardState);

    // --- Drag and Drop for Files ---

    visionBoardContainer.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove('hidden');
        event.dataTransfer.dropEffect = 'copy';
    });

    visionBoardContainer.addEventListener('dragleave', (event) => {
        event.preventDefault();
        event.stopPropagation();
        // Hide drop zone only if leaving the container itself, not child elements
        if (event.target === visionBoardContainer || event.target === dropZone) {
            dropZone.classList.add('hidden');
        }
    });

    visionBoardContainer.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.add('hidden');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Calculate drop position relative to the board
                    const boardRect = visionBoard.getBoundingClientRect();
                    const dropX = event.clientX - boardRect.left;
                    const dropY = event.clientY - boardRect.top;
                    addImageElement(e.target.result, null, {}, { x: `${dropX}px`, y: `${dropY}px` });
                };
                reader.readAsDataURL(file);
            }
        }
    });


    // --- Styling Controls Logic ---

    function showStylingControls(element) {
        selectedElement = element;
        selectedElementIdInput.value = element.id;
        stylingControls.classList.remove('hidden');
        stylingControls.classList.add('flex');

        // Populate controls based on element type and current styles
        const isText = element.dataset.type === 'text';
        textStyleOptions.classList.toggle('hidden', !isText);
        textStyleOptions.classList.toggle('flex', isText);

        if (isText) {
            elementTextColor.value = rgbToHex(element.style.color || '#000000');
            elementFontSize.value = parseInt(element.style.fontSize) || 16;
            elementBgColor.value = rgbToHex(element.style.backgroundColor || 'rgba(255, 255, 255, 0.7)');
        }
        elementZIndex.value = element.style.zIndex || '1';
    }

    function hideStylingControls() {
        stylingControls.classList.add('hidden');
        stylingControls.classList.remove('flex');
        selectedElementIdInput.value = '';
        selectedElement = null;
    }

    function handleElementSelection(element) {
        if (selectedElement && selectedElement !== element) {
             selectedElement.classList.remove('border-blue-600', 'ring-2', 'ring-blue-300');
        }
        element.classList.add('border-blue-600', 'ring-2', 'ring-blue-300');
        showStylingControls(element);
    }

    function applyStyles() {
        if (!selectedElement) return;

        const isText = selectedElement.dataset.type === 'text';

        if (isText) {
            selectedElement.style.color = elementTextColor.value;
            selectedElement.style.fontSize = `${elementFontSize.value}px`;
            selectedElement.style.backgroundColor = elementBgColor.value;
        }
        selectedElement.style.zIndex = elementZIndex.value;
    }

    function deleteSelectedElement() {
        if (selectedElement && confirm('Delete this element?')) {
            selectedElement.remove();
            hideStylingControls();
        }
    }

    // Add listeners to style controls
    elementTextColor.addEventListener('input', applyStyles);
    elementFontSize.addEventListener('input', applyStyles);
    elementBgColor.addEventListener('input', applyStyles);
    elementZIndex.addEventListener('input', applyStyles);
    deleteElementBtn.addEventListener('click', deleteSelectedElement);
    closeStyleBtn.addEventListener('click', () => {
         if(selectedElement) {
            selectedElement.classList.remove('border-blue-600', 'ring-2', 'ring-blue-300');
            selectedElement.blur(); // Remove focus
         }
         hideStylingControls();
    });

    // Helper to convert rgb() to hex for color inputs
    function rgbToHex(rgb) {
        if (!rgb || rgb.startsWith('#')) return rgb; // Already hex or invalid
        if (rgb === 'transparent') return '#ffffff'; // Default for transparent? Or specific handling?

        // Handle rgba - extract rgb part, ignore alpha for the picker
        if (rgb.startsWith('rgba')) {
            rgb = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(',')).trim();
        } else {
            rgb = rgb.substring(rgb.indexOf('(') + 1, rgb.indexOf(')')).trim();
        }

        let parts = rgb.split(',').map(Number);
        if (parts.length < 3) return '#000000'; // Fallback

        return "#" + parts.map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }


    // --- Board State Management ---

    function clearBoard() {
        visionBoard.innerHTML = ''; // Remove all elements
        // Reset background
        visionBoard.style.backgroundColor = '#FFFFFF';
        visionBoard.style.backgroundImage = 'none';
        bgColorPicker.value = '#FFFFFF';
        hideStylingControls();
        elementCounter = 0; // Reset counter if needed (or manage IDs differently)
    }

    function saveBoardState() {
        const boardState = {
            elements: [],
            background: {
                color: visionBoard.style.backgroundColor,
                image: visionBoard.style.backgroundImage
            },
            nextId: elementCounter
        };

        visionBoard.querySelectorAll('.draggable').forEach(el => {
            const elementData = {
                id: el.id,
                type: el.dataset.type,
                position: { x: el.style.left, y: el.style.top },
                styles: {
                    zIndex: el.style.zIndex || '1',
                }
            };

            if (elementData.type === 'text') {
                elementData.content = el.textContent;
                elementData.styles.color = el.style.color;
                elementData.styles.fontSize = el.style.fontSize;
                elementData.styles.backgroundColor = el.style.backgroundColor;
                 elementData.styles.width = el.style.width; // Save dimensions if needed
                 elementData.styles.height = el.style.height;
            } else if (elementData.type === 'image') {
                const img = el.querySelector('img');
                elementData.content = img ? img.src : ''; // Store image src (Data URL or original URL)
                 elementData.styles.width = el.style.width; // Save dimensions
                 elementData.styles.height = el.style.height;
            }
            boardState.elements.push(elementData);
        });

        saveBoard(boardState); // From storage.js
        alert('Board saved locally!');
    }

    function loadBoardState() {
        const boardState = loadBoard(); // From storage.js
        if (boardState) {
            clearBoard(); // Clear existing board before loading

            // Restore background
            visionBoard.style.backgroundColor = boardState.background.color || '#FFFFFF';
            visionBoard.style.backgroundImage = boardState.background.image || 'none';
            bgColorPicker.value = rgbToHex(visionBoard.style.backgroundColor);

            // Restore elements
            elementCounter = boardState.nextId || 0;
            boardState.elements.forEach(elData => {
                if (elData.type === 'text') {
                    addTextElement(elData.content, elData.id, elData.styles, elData.position);
                } else if (elData.type === 'image') {
                    addImageElement(elData.content, elData.id, elData.styles, elData.position);
                }
            });
             // Ensure elements are correctly layered after load
             visionBoard.querySelectorAll('.draggable').forEach(el => {
                const state = boardState.elements.find(e => e.id === el.id);
                if(state && state.styles.zIndex) {
                    el.style.zIndex = state.styles.zIndex;
                }
             });

            alert('Board loaded!');
        } else {
            alert('No saved board found.');
        }
    }

    // --- Initialization ---
    function init() {
        // Try loading existing board on startup
        loadBoardState();
        // Set initial background color picker value based on current board bg
        bgColorPicker.value = rgbToHex(visionBoard.style.backgroundColor || '#FFFFFF');
    }

    init();

});