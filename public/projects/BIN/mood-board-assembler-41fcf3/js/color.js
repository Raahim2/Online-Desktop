// js/color.js

// Helper function to convert RGB to Hex
function rgbToHex(r, g, b) {
    const toHex = (c) => {
        const hex = Math.round(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Helper function to calculate color distance (Euclidean distance in RGB space)
function colorDistance(rgb1, rgb2) {
    const dr = rgb1[0] - rgb2[0];
    const dg = rgb1[1] - rgb2[1];
    const db = rgb1[2] - rgb2[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Generates a color palette from an image element using pixel sampling and basic clustering.
 * @param {HTMLImageElement} imgElement The image element to process.
 * @param {number} [numColors=5] The desired number of colors in the palette.
 * @param {number} [quality=10] Sampling quality (higher means more pixels sampled, potentially slower). 1-100 range suggested.
 * @returns {Promise<string[]>} A promise that resolves with an array of hex color strings.
 */
async function generatePaletteFromImage(imgElement, numColors = 5, quality = 10) {
    return new Promise((resolve, reject) => {
        if (!imgElement || imgElement.tagName !== 'IMG') {
            return reject(new Error("Invalid image element provided."));
        }
        if (!imgElement.complete || imgElement.naturalWidth === 0) {
             // Image might not be loaded yet, or is broken
             // Attempt to wait for load, but reject if it fails quickly
             imgElement.onload = () => generatePaletteFromImage(imgElement, numColors, quality).then(resolve).catch(reject);
             imgElement.onerror = () => reject(new Error("Image failed to load for palette generation."));
             // If already errored or loading hasn't started and src is present
             if(imgElement.src && !imgElement.complete) {
                 // Wait a short moment in case load event fires immediately
                 setTimeout(() => {
                     if (!imgElement.complete || imgElement.naturalWidth === 0) {
                         reject(new Error("Image could not be loaded or is invalid."));
                     }
                 }, 50); // Short delay
             } else if (!imgElement.src) {
                 reject(new Error("Image source is missing."));
             }
             return; // Exit promise execution until onload/onerror resolves it
        }


        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Hint for optimization

        // Use natural dimensions to preserve aspect ratio
        const naturalWidth = imgElement.naturalWidth;
        const naturalHeight = imgElement.naturalHeight;

        // Scale down for performance if image is large
        const maxDim = 120; // Max dimension for sampling canvas
        let sampleWidth, sampleHeight;
        if (naturalWidth > naturalHeight) {
            sampleWidth = Math.min(naturalWidth, maxDim);
            sampleHeight = Math.round(naturalHeight * (sampleWidth / naturalWidth));
        } else {
            sampleHeight = Math.min(naturalHeight, maxDim);
            sampleWidth = Math.round(naturalWidth * (sampleHeight / naturalHeight));
        }
        canvas.width = sampleWidth > 0 ? sampleWidth : 1; // Ensure non-zero dimension
        canvas.height = sampleHeight > 0 ? sampleHeight : 1;

        try {
            ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const pixelCount = canvas.width * canvas.height;

            if (pixelCount === 0 || data.length === 0) {
                return reject(new Error("Image has zero dimensions or no data."));
            }

            // --- Simple Pixel Sampling and Clustering ---
            const sampledPixels = [];
            // Adjust sampling step based on quality and pixel count
            const sampleRate = Math.max(0.01, Math.min(1, quality / 10)); // Quality 10 = ~10% sample rate
            const step = Math.max(1, Math.floor(1 / sampleRate));

            for (let i = 0; i < pixelCount; i += step) {
                const offset = i * 4;
                const r = data[offset];
                const g = data[offset + 1];
                const b = data[offset + 2];
                const a = data[offset + 3];

                // Consider only opaque pixels
                if (a >= 200) {
                    // Optional: filter out pure white/black if needed
                    // if (!((r > 250 && g > 250 && b > 250) || (r < 5 && g < 5 && b < 5))) {
                       sampledPixels.push([r, g, b]);
                    // }
                }
            }

            if (sampledPixels.length === 0) {
                // Fallback: sample center pixel if no others found
                const centerOffset = Math.floor(pixelCount / 2) * 4;
                 if (data[centerOffset + 3] >= 200) {
                     sampledPixels.push([data[centerOffset], data[centerOffset + 1], data[centerOffset + 2]]);
                 } else {
                     return reject(new Error("Could not sample any suitable pixels from the image."));
                 }
            }

            // Basic clustering (group similar colors)
            const colorGroups = [];
            // Adjust threshold based on desired distinctiveness
            const threshold = 35; // Lower = more distinct colors, Higher = broader groups

            sampledPixels.forEach(pixel => {
                let foundGroup = false;
                for (let i = 0; i < colorGroups.length; i++) {
                    const groupAvg = colorGroups[i].average;
                    if (colorDistance(pixel, groupAvg) < threshold) {
                        colorGroups[i].pixels.push(pixel);
                        // Recalculate average (simple running average)
                        const n = colorGroups[i].pixels.length;
                        colorGroups[i].average[0] = ((n - 1) * groupAvg[0] + pixel[0]) / n;
                        colorGroups[i].average[1] = ((n - 1) * groupAvg[1] + pixel[1]) / n;
                        colorGroups[i].average[2] = ((n - 1) * groupAvg[2] + pixel[2]) / n;
                        foundGroup = true;
                        break;
                    }
                }
                if (!foundGroup) {
                    // Start a new group
                    colorGroups.push({ pixels: [pixel], average: [...pixel] });
                }
            });

            // Sort groups by the number of pixels they represent
            colorGroups.sort((a, b) => b.pixels.length - a.pixels.length);

            // Extract the average color from the top N groups
            const palette = colorGroups.slice(0, numColors).map(group => {
                const avg = group.average;
                return rgbToHex(avg[0], avg[1], avg[2]);
            });

            // Ensure we return the requested number of colors, even if fewer groups found
            // (Could duplicate last color or add default colors if needed, here just return what we found)
            // while (palette.length < numColors && palette.length > 0) {
            //     palette.push(palette[palette.length - 1]); // Duplicate last color
            // }

             if (palette.length === 0) {
                 // If clustering failed, return average color of all samples
                 let avgR = 0, avgG = 0, avgB = 0;
                 sampledPixels.forEach(p => { avgR += p[0]; avgG += p[1]; avgB += p[2]; });
                 avgR /= sampledPixels.length;
                 avgG /= sampledPixels.length;
                 avgB /= sampledPixels.length;
                 palette.push(rgbToHex(avgR, avgG, avgB));
             }


            resolve(palette);

        } catch (error) {
            // Handle potential security errors with getImageData (less likely with data URLs)
            if (error.name === 'SecurityError') {
                reject(new Error("Cannot process image due to cross-origin restrictions."));
            } else {
                reject(new Error(`Error processing image data: ${error.message || error}`));
            }
        }
    });
}