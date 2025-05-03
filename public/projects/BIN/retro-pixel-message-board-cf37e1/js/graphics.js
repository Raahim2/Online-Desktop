const Graphics = (() => {
    let canvas = null;
    let ctx = null;
    let gridWidth = 16;
    let gridHeight = 16;
    let pixelSize = 20;
    let currentColor = '#FFFFFF';
    let gridData = []; // 2D array to store pixel colors

    const initializeCanvas = (canvasElement, width, height, pSize, initialColor) => {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        currentColor = initialColor;
        resizeCanvas(width, height, pSize); // Use resize function for initial setup
    };

    const resizeCanvas = (newWidth, newHeight, pSize) => {
        gridWidth = newWidth;
        gridHeight = newHeight;
        pixelSize = pSize; // Use provided pixel size

        canvas.width = gridWidth * pixelSize;
        canvas.height = gridHeight * pixelSize;

        // Disable image smoothing for crisp pixels
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false; // For Safari/WebKit
        ctx.mozImageSmoothingEnabled = false;    // For Firefox
        ctx.msImageSmoothingEnabled = false;     // For IE/Edge

        // Initialize or resize gridData, preserving existing content where possible
        const oldGridData = gridData;
        gridData = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null)); // Fill with null (transparent/background)

        // Copy old data to new grid if resizing
        for (let y = 0; y < Math.min(oldGridData.length, gridHeight); y++) {
            for (let x = 0; x < Math.min(oldGridData[y]?.length || 0, gridWidth); x++) {
                gridData[y][x] = oldGridData[y][x];
            }
        }

        redrawAll(); // Redraw the entire canvas based on new size and data
    };

    const setCurrentColor = (color) => {
        currentColor = color;
    };

    const drawPixel = (x, y, color = null) => {
        const drawColor = color !== null ? color : currentColor;

        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            gridData[y][x] = drawColor; // Store color in grid data

            ctx.fillStyle = drawColor;
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    };

    const clearCanvas = () => {
        // Reset grid data
        gridData = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null));
        // Clear visual canvas
        ctx.fillStyle = '#000000'; // Background color (black)
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Optional: Redraw grid lines if needed
        // drawGridLines();
    };

    const redrawAll = () => {
        ctx.fillStyle = '#000000'; // Background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                if (gridData[y][x]) {
                    ctx.fillStyle = gridData[y][x];
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
        // Optional: Redraw grid lines if needed
        // drawGridLines();
    };

    // Optional: Function to draw grid lines (can be performance intensive)
    // const drawGridLines = () => {
    //     ctx.strokeStyle = '#444'; // Grid line color
    //     ctx.lineWidth = 1;
    //     for (let x = 0; x <= gridWidth; x++) {
    //         ctx.beginPath();
    //         ctx.moveTo(x * pixelSize, 0);
    //         ctx.lineTo(x * pixelSize, canvas.height);
    //         ctx.stroke();
    //     }
    //     for (let y = 0; y <= gridHeight; y++) {
    //         ctx.beginPath();
    //         ctx.moveTo(0, y * pixelSize);
    //         ctx.lineTo(canvas.width, y * pixelSize);
    //         ctx.stroke();
    //     }
    // };

     const getPixelColor = (x, y) => {
        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            return gridData[y][x]; // Return stored color or null
        }
        return null; // Out of bounds
    };

    const getCanvas = () => {
        return canvas;
    };

    const getGridSize = () => {
        return { width: gridWidth, height: gridHeight };
    };

    // Expose public functions
    return {
        initializeCanvas,
        resizeCanvas,
        setCurrentColor,
        drawPixel,
        clearCanvas,
        redrawAll,
        getPixelColor,
        getCanvas,
        getGridSize
    };
})();