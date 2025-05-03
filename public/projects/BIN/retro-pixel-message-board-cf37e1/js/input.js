const Input = (() => {

    // --- Simple 5x7 Pixel Font ---
    // 1 represents a pixel to draw, 0 is empty space
    // Stored as arrays of rows (binary strings for compactness)
    const pixelFont = {
        'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
        'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
        'C': ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
        'D': ['11100', '10010', '10001', '10001', '10001', '10010', '11100'],
        'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
        'F': ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
        'G': ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
        'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
        'I': ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
        'J': ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
        'K': ['10010', '10100', '11000', '11000', '10100', '10010', '10010'],
        'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
        'M': ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
        'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
        'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
        'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
        'Q': ['01110', '10001', '10001', '10001', '10101', '10010', '01111'],
        'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10010'],
        'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
        'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
        'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
        'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
        'W': ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
        'X': ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
        'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
        'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
        '0': ['01110', '10011', '10101', '10101', '11001', '10001', '01110'],
        '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
        '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
        '3': ['01110', '10001', '00001', '00110', '00001', '10001', '01110'],
        '4': ['00110', '01010', '10010', '11111', '00010', '00010', '00010'],
        '5': ['11111', '10000', '10000', '11110', '00001', '10001', '01110'],
        '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
        '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
        '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
        '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
        '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
        '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
        '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
        ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
        // Add more characters as needed
    };
    const charWidth = 5;
    const charHeight = 7;
    const charSpacing = 1; // Pixels between characters

    // --- Preset Shapes ---
    // 1 represents a pixel to draw, 0 is empty space
    const presets = {
        'heart': [
            [0, 1, 1, 0, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
        ],
        'smile': [
            [0, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [0, 1, 0, 0, 0, 0, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
        ],
         'star': [
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 0, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 0, 1, 0, 0],
        ]
        // Add more presets
    };

    const drawText = (text, startX, startY) => {
        let currentX = startX;
        let currentY = startY;
        const { width: gridW, height: gridH } = Graphics.getGridSize();

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charData = pixelFont[char];

            if (charData) {
                // Check if character fits horizontally
                if (currentX + charWidth > gridW) {
                    currentX = startX; // Wrap to next line
                    currentY += charHeight + charSpacing;
                }

                // Check if character fits vertically
                if (currentY + charHeight > gridH) {
                    console.warn("Text exceeds canvas height.");
                    break; // Stop drawing if no vertical space
                }

                // Draw the character
                for (let y = 0; y < charHeight; y++) {
                    for (let x = 0; x < charWidth; x++) {
                        if (charData[y] && charData[y][x] === '1') {
                            Graphics.drawPixel(currentX + x, currentY + y);
                        }
                    }
                }
                currentX += charWidth + charSpacing; // Move to next character position
            } else {
                console.warn(`Character '${char}' not found in pixel font.`);
                // Optionally skip or draw a placeholder
                 currentX += charWidth + charSpacing; // Still advance position
            }
        }
    };

    const drawPreset = (presetName, startX, startY) => {
        const presetData = presets[presetName];
        const { width: gridW, height: gridH } = Graphics.getGridSize();

        if (!presetData) {
            console.warn(`Preset '${presetName}' not found.`);
            return;
        }

        const presetHeight = presetData.length;
        const presetWidth = presetData[0]?.length || 0;

        if (startX + presetWidth > gridW || startY + presetHeight > gridH) {
             console.warn("Preset exceeds canvas boundaries.");
             // Optionally allow drawing partial preset or alert user
             // return; // Uncomment to prevent drawing if out of bounds
        }

        for (let y = 0; y < presetHeight; y++) {
            for (let x = 0; x < presetWidth; x++) {
                if (presetData[y][x] === 1) {
                    // Check bounds for each pixel before drawing
                    const drawX = startX + x;
                    const drawY = startY + y;
                    if (drawX < gridW && drawY < gridH) {
                         Graphics.drawPixel(drawX, drawY);
                    }
                }
            }
        }
    };

    // Expose public functions
    return {
        drawText,
        drawPreset
    };
})();