document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-btn');
    const previewArea = document.getElementById('preview-area');
    const downloadFormatSelect = document.getElementById('download-format');

    if (downloadBtn && previewArea && downloadFormatSelect) {
        downloadBtn.addEventListener('click', () => {
            // Ensure html2canvas is loaded (e.g., via CDN in index.html)
            if (typeof html2canvas === 'undefined') {
                console.error('html2canvas library is not loaded. Please include it in your HTML.');
                alert('Error: Could not generate image. Required library missing.');
                return;
            }

            const format = downloadFormatSelect.value || 'png'; // Default to png
            const mimeType = `image/${format}`;
            const filename = `lyrically-art.${format}`;

            // Options for html2canvas (adjust as needed)
            const options = {
                scale: 2, // Increase scale for better resolution
                useCORS: true, // Important if using external images/fonts
                backgroundColor: previewArea.style.backgroundColor || '#ffffff', // Use explicit background
                logging: false // Disable console logging from html2canvas
            };

            html2canvas(previewArea, options).then(canvas => {
                try {
                    const imageURL = canvas.toDataURL(mimeType, format === 'jpeg' ? 0.9 : 1.0); // Quality setting for JPEG

                    // Create a temporary link element
                    const link = document.createElement('a');
                    link.href = imageURL;
                    link.download = filename;

                    // Append to body, click, and remove
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                } catch (error) {
                    console.error('Error generating or downloading image:', error);
                    alert('An error occurred while trying to download the image.');
                }
            }).catch(error => {
                 console.error('html2canvas failed:', error);
                 alert('An error occurred while capturing the image.');
            });
        });
    } else {
        console.warn('Download button, preview area, or format selector not found.');
    }
});