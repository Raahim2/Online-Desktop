const ColorUtils = {
    _hexToRgb: function(hex) {
        if (!hex) return null;
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    _rgbToHsl: function(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, l: l };
    },

    _hslToRgb: function(h, s, l) {
        let r, g, b;
        h /= 360;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },

    _rgbToHexComponent: function(c) {
        let hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    },

    isValidHex: function(hex) {
        return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
    },

    hexToHsl: function(hex) {
        if (!this.isValidHex(hex)) return null;
        const rgb = this._hexToRgb(hex);
        if (!rgb) return null;
        return this._rgbToHsl(rgb.r, rgb.g, rgb.b);
    },

    hslToHex: function(h, s, l) {
        const rgb = this._hslToRgb(h, s, l);
        return "#" + this._rgbToHexComponent(rgb.r) + this._rgbToHexComponent(rgb.g) + this._rgbToHexComponent(rgb.b);
    },

    getLuminance: function(hex) {
        const rgb = this._hexToRgb(hex);
        if (!rgb) return 0;
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },

    generateRandomColor: function(options = {}) {
        const h = Math.random() * 360;
        const s = options.sMin !== undefined ? (Math.random() * (options.sMax - options.sMin) + options.sMin) : (Math.random() * 0.5 + 0.5); // 0.5 - 1.0
        const l = options.lMin !== undefined ? (Math.random() * (options.lMax - options.lMin) + options.lMin) : (Math.random() * 0.3 + 0.4); // 0.4 - 0.7
        return this.hslToHex(h, s, l);
    },

    _varyColor(baseHsl, variationIndex, totalVariationsInStep) {
        // Systematic variation for additional colors in a harmony
        // variationIndex: 0, 1, 2... for each time we need a new variant of this hue
        let newL = baseHsl.l;
        let newS = baseHsl.s;

        // Alternate between lighter/darker, more/less saturated
        const step = 0.10; // Lightness step
        const sStep = 0.08; // Saturation step
        
        // Cycle through 4 types of variations: lighter, darker, less saturated, more saturated
        const variationType = variationIndex % 4;

        switch(variationType) {
            case 0: // Lighter
                newL = baseHsl.l + step * (Math.floor(variationIndex / 4) + 1);
                break;
            case 1: // Darker
                newL = baseHsl.l - step * (Math.floor(variationIndex / 4) + 1);
                break;
            case 2: // Less saturated
                newS = baseHsl.s - sStep * (Math.floor(variationIndex / 4) + 1);
                break;
            case 3: // More saturated
                newS = baseHsl.s + sStep * (Math.floor(variationIndex / 4) + 1);
                break;
        }

        return {
            h: baseHsl.h,
            s: Math.max(0.1, Math.min(1, newS)),
            l: Math.max(0.1, Math.min(0.9, newL)) // Clamp L to avoid pure white/black
        };
    },

    generatePalette: function(count, mode, lockedColorsDetails = []) {
        let finalPalette = new Array(count).fill(null);
        const lockedMap = {};
        lockedColorsDetails.forEach(lc => {
            if (lc && typeof lc.index === 'number' && this.isValidHex(lc.hex)) {
                lockedMap[lc.index] = lc.hex.startsWith('#') ? lc.hex : '#' + lc.hex;
            }
        });

        for (let i = 0; i < count; i++) {
            if (lockedMap[i]) {
                finalPalette[i] = lockedMap[i];
            }
        }

        let baseHsl;
        if (mode !== 'random') {
            let baseHexForHarmony = finalPalette[0]; // Use first color if locked
            if (!baseHexForHarmony) { // If first is not locked, find first available locked color
                for(let i=0; i<count; i++) {
                    if(finalPalette[i]) {
                        baseHexForHarmony = finalPalette[i];
                        break;
                    }
                }
            }
            if (!baseHexForHarmony) { // If no locked colors, generate a base for slot 0
                baseHexForHarmony = this.generateRandomColor();
                if (!finalPalette[0]) finalPalette[0] = baseHexForHarmony;
            }
            baseHsl = this.hexToHsl(baseHexForHarmony);
            if (!baseHsl) { // Fallback if hex is somehow invalid
                baseHsl = { h: Math.random() * 360, s: 0.75, l: 0.55 };
                if (!finalPalette[0] && this.isValidHex(baseHexForHarmony)) finalPalette[0] = this.hslToHex(baseHsl.h, baseHsl.s, baseHsl.l);
            }
        }

        const generatedHues = []; // To track hues for variations

        for (let i = 0; i < count; i++) {
            if (finalPalette[i]) { // If color is locked or was base for harmony
                 if (mode !== 'random' && this.hexToHsl(finalPalette[i]))