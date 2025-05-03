const Download = (() => {

    const downloadCanvasAsPNG = (canvasElement, filename = 'pixel-art.png') => {
        if (!canvasElement) {
            console.error("Canvas element not provided for download.");
            return;
        }

        try {
            const dataURL = canvasElement.toDataURL('image/png');

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = filename;

            // Append to body to ensure click works in all browsers (especially Firefox)
            document.body.appendChild(link);

            // Programmatically click the link to trigger the download
            link.click();

            // Remove the link from the document
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error generating or downloading canvas image:", error);
            // Handle potential errors, e.g., tainted canvas if external images were used without CORS
            alert("Could not download the image. There might be a security restriction or an error.");
        }
    };

    // Expose public function
    return {
        downloadCanvasAsPNG
    };

})();