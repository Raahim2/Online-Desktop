document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const lyricsInput = document.getElementById('lyrics-input');
    const fontSelect = document.getElementById('font-select');
    const fontSizeInput = document.getElementById('font-size-input');
    const textColorInput = document.getElementById('text-color-input');
    const bgColorInput = document.getElementById('bg-color-input');
    const layoutSelect = document.getElementById('layout-select');
    const bgImageUpload = document.getElementById('bg-image-upload');
    const removeBgImageBtn = document.getElementById('remove-bg-image');
    const presetSelect = document.getElementById('preset-select');
    const downloadBtn = document.getElementById('download-btn'); // Referenced for potential future interactions if needed
    const downloadFormatSelect = document.getElementById('download-format'); // Referenced for potential future interactions if needed

    const previewArea = document.getElementById('preview-area');
    const textLayer = document.getElementById('text-layer');
    const backgroundLayer = document.getElementById('background-layer');

    // --- Initial State ---
    updateTextContent(); // Set initial placeholder text
    updateFontFamily();
    updateFontSize();
    updateTextColor();
    updateBackgroundColor();
    updateLayout();
    loadPresets(); // Load presets into the dropdown

    // --- Event Listeners ---
    lyricsInput.addEventListener('input', updateTextContent);
    fontSelect.addEventListener('change', updateFontFamily);
    fontSizeInput.addEventListener('input', updateFontSize);
    textColorInput.addEventListener('input', updateTextColor);
    bgColorInput.addEventListener('input', updateBackgroundColor);
    layoutSelect.addEventListener('change', updateLayout);
    bgImageUpload.addEventListener('change', handleBackgroundImageUpload);
    removeBgImageBtn.addEventListener('click', removeBackgroundImage);
    presetSelect.addEventListener('change', applySelectedPreset);

    // --- Update Functions ---
    function updateTextContent() {
        textLayer.innerText = lyricsInput.value || 'Your lyrics will appear here...';
    }

    function updateFontFamily() {
        applyStyle(textLayer, 'fontFamily', fontSelect.value);
    }

    function updateFontSize() {
        applyStyle(textLayer, 'fontSize', `${fontSizeInput.value}px`);
    }

    function updateTextColor() {
        applyStyle(textLayer, 'color', textColorInput.value);
    }

    function updateBackgroundColor() {
        if (!backgroundLayer.style.backgroundImage || backgroundLayer.style.backgroundImage === 'none') {
             applyStyle(previewArea, 'backgroundColor', bgColorInput.value);
             applyStyle(backgroundLayer, 'backgroundColor', 'transparent'); // Ensure layer doesn't obscure preview bg color
        } else {
             applyStyle(previewArea, 'backgroundColor', '#ffffff'); // Default bg if image is present
             applyStyle(backgroundLayer, 'backgroundColor', bgColorInput.value); // Apply color behind potential transparent image parts
        }
    }

    function updateLayout() {
        // Reset Tailwind classes potentially added by previous selections
        textLayer.classList.remove('text-center', 'text-left', 'text-right', 'text-justify');
        // Add the selected class
        textLayer.classList.add(layoutSelect.value);
    }

    function handleBackgroundImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                applyStyle(backgroundLayer, 'backgroundImage', `url('${e.target.result}')`);
                applyStyle(previewArea, 'backgroundColor', '#ffffff'); // Reset preview area bg when image is set
                applyStyle(backgroundLayer, 'backgroundColor', bgColorInput.value); // Keep bg color behind image
                removeBgImageBtn.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    }

    function removeBackgroundImage() {
        applyStyle(backgroundLayer, 'backgroundImage', 'none');
        applyStyle(previewArea, 'backgroundColor', bgColorInput.value); // Restore preview area bg color
        bgImageUpload.value = ''; // Clear the file input
        removeBgImageBtn.classList.add('hidden');
        updateBackgroundColor(); // Re-apply background color logic
    }

    // --- Preset Handling ---
    function loadPresets() {
        if (typeof presetStyles !== 'undefined' && Array.isArray(presetStyles)) {
            presetStyles.forEach((preset, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = preset.name;
                presetSelect.appendChild(option);
            });
        } else {
            console.warn("Preset styles (presetStyles array in assets/presets.js) not found or is not an array.");
            presetSelect.disabled = true;
             const option = document.createElement('option');
             option.textContent = "No presets loaded";
             presetSelect.appendChild(option);
        }
    }

    function applySelectedPreset() {
        const selectedIndex = presetSelect.value;
        if (selectedIndex === "" || typeof presetStyles === 'undefined') {
             // Optionally reset to default or do nothing
            return;
        }

        const preset = presetStyles[parseInt(selectedIndex)];
        if (!preset) return;

        // Apply preset values to controls and update preview
        fontSelect.value = preset.fontFamily || "'Roboto', sans-serif";
        fontSizeInput.value = preset.fontSize ? parseInt(preset.fontSize) : 16;
        textColorInput.value = preset.textColor || '#333333';
        bgColorInput.value = preset.bgColor || '#FFFFFF';
        layoutSelect.value = preset.layout || 'text-center';

        // Handle potential background image from preset (if applicable, e.g., a URL)
        if (preset.backgroundImage) {
             applyStyle(backgroundLayer, 'backgroundImage', `url('${preset.backgroundImage}')`);
             applyStyle(previewArea, 'backgroundColor', '#ffffff');
             applyStyle(backgroundLayer, 'backgroundColor', bgColorInput.value);
             removeBgImageBtn.classList.remove('hidden'); // Show remove button if preset adds image
             bgImageUpload.value = ''; // Clear file input if preset image is applied
        } else {
            // If preset doesn't have an image, remove any existing one
            removeBackgroundImage(); // This also handles resetting background colors correctly
        }


        // Trigger updates
        updateFontFamily();
        updateFontSize();
        updateTextColor();
        updateBackgroundColor(); // Call this after potential bg image changes
        updateLayout();

        // Apply any custom styles defined in the preset (using styling.js function)
        if (typeof applyCustomPresetStyles === 'function') {
            applyCustomPresetStyles(textLayer, backgroundLayer, previewArea, preset.custom || {});
        }
    }

    // --- Utility ---
    // Defined globally or imported if using modules
    // Moved to styling.js as per structure
    // function applyStyle(element, property, value) {
    //     element.style[property] = value;
    // }

});