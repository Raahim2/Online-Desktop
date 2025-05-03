document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('constellationCanvas');
    const ctx = canvas.getContext('2d');
    const nameInput = document.getElementById('constellationName');
    const saveButton = document.getElementById('saveButton');
    const loadSelect = document.getElementById('loadSelect');
    const loadButton = document.getElementById('loadButton');
    const deleteButton = document.getElementById('deleteButton');
    const clearButton = document.getElementById('clearButton');
    const randomStarsButton = document.getElementById('randomStarsButton');
    const starDragPlaceholder = document.getElementById('star-drag-placeholder'); // Optional visual aid

    let isDrawing = false;
    let isDraggingStar = false;
    let draggedStarIndex = -1;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // --- Canvas Setup ---
    function resizeCanvas() {
        const container = canvas.parentElement;
        // Use clientWidth/Height for dimensions influenced by padding/border
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        // Ensure drawing context is reset if needed after resize
        redrawCanvas();
    }

    // Debounce resize events for performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 150);
    });

    // --- Drawing Logic ---
    function redrawCanvas() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw elements in order
        drawLines(ctx); // From drawing.js
        drawStars(ctx); // From stars.js

        // Draw the line currently being created (if any)
        if (isDrawing && currentLineStartStarIndex !== -1) {
            const startStar = stars[currentLineStartStarIndex];
            ctx.beginPath();
            ctx.moveTo(startStar.x, startStar.y);
            ctx.lineTo(currentLineEndX, currentLineEndY); // Use temporary end coords
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    // --- Event Listeners ---

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedStarIndex = getStarAt(x, y);

        if (clickedStarIndex !== -1) {
            // Option 1: Start dragging a star
            // isDraggingStar = true;
            // draggedStarIndex = clickedStarIndex;
            // dragOffsetX = x - stars[draggedStarIndex].x;
            // dragOffsetY = y - stars[draggedStarIndex].y;
            // starDragPlaceholder.style.display = 'block'; // Show visual aid
            // starDragPlaceholder.style.left = `${e.clientX - starDragPlaceholder.offsetWidth / 2}px`;
            // starDragPlaceholder.style.top = `${e.clientY - starDragPlaceholder.offsetHeight / 2}px`;
            // canvas.style.cursor = 'grabbing';

            // Option 2: Start drawing a line FROM a star
            isDrawing = true;
            startDrawingLine(clickedStarIndex, x, y); // From drawing.js
            canvas.classList.add('drawing-cursor');

        } else {
            // Clicked on empty space - Add a new star
            addStar(x, y); // From stars.js
            redrawCanvas();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDraggingStar && draggedStarIndex !== -1) {
            // Update star position during drag
            stars[draggedStarIndex].x = x - dragOffsetX;
            stars[draggedStarIndex].y = y - dragOffsetY;
            // Update placeholder position
            // starDragPlaceholder.style.left = `${e.clientX - starDragPlaceholder.offsetWidth / 2}px`;
            // starDragPlaceholder.style.top = `${e.clientY - starDragPlaceholder.offsetHeight / 2}px`;
            redrawCanvas();
        } else if (isDrawing) {
            // Update the end position of the line being drawn
            updateDrawingLine(x, y); // From drawing.js
            redrawCanvas(); // Redraw to show the temporary line
        } else {
             // Change cursor if hovering over a star
            const hoverStarIndex = getStarAt(x, y);
            canvas.style.cursor = hoverStarIndex !== -1 ? 'pointer' : 'default';
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDraggingStar) {
            isDraggingStar = false;
            draggedStarIndex = -1;
            // starDragPlaceholder.style.display = 'none'; // Hide visual aid
            canvas.style.cursor = 'default'; // Reset cursor
            redrawCanvas(); // Final redraw after drag
        } else if (isDrawing) {
            finishDrawingLine(x, y); // From drawing.js
            isDrawing = false;
            canvas.classList.remove('drawing-cursor');
            redrawCanvas();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        // Stop drawing or dragging if mouse leaves canvas
        if (isDrawing) {
            // Optionally cancel the line or finish it at the boundary
             // For now, just cancel
            isDrawing = false;
            resetDrawingLine(); // Add this function to drawing.js if needed
            canvas.classList.remove('drawing-cursor');
            redrawCanvas();
        }
        if (isDraggingStar) {
            isDraggingStar = false;
            draggedStarIndex = -1;
            // starDragPlaceholder.style.display = 'none';
            canvas.style.cursor = 'default';
            redrawCanvas();
        }
         canvas.style.cursor = 'default'; // Ensure cursor resets
    });

    // --- Button Actions ---

    saveButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
            alert('Please enter a name for your constellation.');
            return;
        }
        if (stars.length === 0 && lines.length === 0) {
             alert('Cannot save an empty constellation.');
             return;
        }
        const constellationData = {
            name: name,
            stars: stars, // From stars.js
            lines: lines  // From drawing.js
        };
        saveConstellation(name, constellationData); // From storage.js
        populateLoadSelect(loadSelect); // Update dropdown
        alert(`Constellation "${name}" saved!`);
    });

    loadButton.addEventListener('click', () => {
        const name = loadSelect.value;
        if (!name) {
            alert('Please select a constellation to load.');
            return;
        }
        const constellationData = loadConstellation(name); // From storage.js
        if (constellationData) {
            setStars(constellationData.stars);   // Update state in stars.js
            setLines(constellationData.lines);   // Update state in drawing.js
            nameInput.value = constellationData.name;
            redrawCanvas();
            alert(`Constellation "${name}" loaded!`);
        } else {
            alert(`Could not load constellation "${name}".`);
        }
    });

     deleteButton.addEventListener('click', () => {
        const name = loadSelect.value;
        if (!name) {
            alert('Please select a constellation to delete.');
            return;
        }
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            const currentLoadedName = nameInput.value.trim();
            deleteConstellation(name); // From storage.js
            populateLoadSelect(loadSelect); // Update dropdown
            alert(`Constellation "${name}" deleted.`);
            // If the deleted constellation was the one currently loaded, clear the canvas
            if (name === currentLoadedName) {
                clearCanvas();
            }
        }
    });

    clearButton.addEventListener('click', clearCanvas);

    function clearCanvas() {
        setStars([]); // Clear state in stars.js
        setLines([]); // Clear state in drawing.js
        nameInput.value = '';
        resetDrawingLine(); // Ensure no line drawing state persists
        isDrawing = false;
        isDraggingStar = false;
        draggedStarIndex = -1;
        canvas.classList.remove('drawing-cursor');
        canvas.style.cursor = 'default';
        redrawCanvas();
    }


    randomStarsButton.addEventListener('click', () => {
        const numStars = 25; // Or make this configurable
        generateRandomStars(numStars, canvas.width, canvas.height); // From stars.js
        setLines([]); // Clear existing lines when generating new stars
        nameInput.value = ''; // Clear name as it's a new arrangement
        resetDrawingLine();
        isDrawing = false;
        redrawCanvas();
    });

    // --- Initialization ---
    populateLoadSelect(loadSelect); // Populate dropdown on initial load
    resizeCanvas(); // Initial canvas sizing
    // generateRandomStars(15, canvas.width, canvas.height); // Start with some random stars
    redrawCanvas(); // Initial draw

});