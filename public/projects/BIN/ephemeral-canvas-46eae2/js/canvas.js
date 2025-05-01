class Canvas {
    constructor(canvasElement, onDrawStartCallback = null) {
        if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement)) {
            throw new Error("Invalid canvas element provided.");
        }
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.brushColor = '#000000';
        this.brushSize = 10;
        this.onDrawStart = onDrawStartCallback;

        // Ensure context settings are applied initially and after resize
        this.applyContextSettings();

        this.addEventListeners();
        this.resizeCanvas(); // Initial resize
    }

    applyContextSettings() {
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    setColor(color) {
        this.brushColor = color;
        this.ctx.strokeStyle = this.brushColor;
    }

    setBrushSize(size) {
        this.brushSize = size;
        this.ctx.lineWidth = this.brushSize;
    }

    getCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;

        if (event.touches && event.touches.length > 0) {
            // Use the first touch point
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            // Use the first changed touch point for touchend/touchcancel
             clientX = event.changedTouches[0].clientX;
             clientY = event.changedTouches[0].clientY;
        } else {
            // Mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        }

        // Calculate position relative to the canvas
        const scaleX = this.canvas.width / rect.width; // Relationship bitmap vs. element for X
        const scaleY = this.canvas.height / rect.height; // Relationship bitmap vs. element for Y

        const canvasX = (clientX - rect.left) * scaleX;
        const canvasY = (clientY - rect.top) * scaleY;

        return { x: canvasX, y: canvasY };
    }


    startDrawing(e) {
        // Prevent default only for touch events to avoid scrolling
        if (e.type.startsWith('touch')) {
           e.preventDefault();
        }

        this.isDrawing = true;
        const { x, y } = this.getCoordinates(e);
        [this.lastX, this.lastY] = [x, y];

        // Trigger the callback if it exists, indicating drawing has started
        if (this.onDrawStart && typeof this.onDrawStart === 'function') {
            this.onDrawStart();
        }

        // Draw a dot for single clicks/taps
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.brushColor;
        this.ctx.fill();
        this.ctx.beginPath(); // Reset path for line drawing
        this.ctx.moveTo(this.lastX, this.lastY); // Start path for potential drag
    }

    draw(e) {
        if (!this.isDrawing) return;

        // Prevent default only for touch events to avoid scrolling
        if (e.type.startsWith('touch')) {
           e.preventDefault();
        }

        const { x, y } = this.getCoordinates(e);

        // Re-apply settings just in case (though ideally set elsewhere)
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath(); // Start a new path segment
        this.ctx.moveTo(x, y); // Move to the new position
        [this.lastX, this.lastY] = [x, y];
    }

    stopDrawing(e) {
         if (!this.isDrawing) return;
         // Prevent default only for touch events
         if (e && e.type.startsWith('touch')) {
            e.preventDefault();
         }
         this.ctx.closePath(); // Close the current path
         this.isDrawing = false;
    }

    addEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this)); // Stop if mouse leaves canvas

        // Touch events
        this.canvas.addEventListener('touchstart', this.startDrawing.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.draw.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this.stopDrawing.bind(this), { passive: false }); // Stop if touch is interrupted
    }

    resizeCanvas() {
        // Save current content if needed (optional, depends on desired behavior)
        // const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        const parent = this.canvas.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Set the internal drawing buffer size (higher resolution)
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Set the display size (CSS pixels)
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;

        // Scale the context to account for high DPI displays
        this.ctx.scale(dpr, dpr);

        // Re-apply context settings that might be reset
        this.applyContextSettings();

        // Restore content if saved (optional)
        // if (imageData) {
        //    this.ctx.putImageData(imageData, 0, 0);
        // }

        console.log(`Canvas resized to: ${this.canvas.width}x${this.canvas.height} (display: ${rect.width}x${rect.height})`);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width / (window.devicePixelRatio || 1), this.canvas.height / (window.devicePixelRatio || 1));
        console.log("Canvas cleared.");
    }

    // Optional: Method to redraw content if needed (e.g., after resize if not clearing)
    // redrawContent(imageData) {
    //     if (imageData) {
    //         this.ctx.putImageData(imageData, 0, 0);
    //     }
    // }
}