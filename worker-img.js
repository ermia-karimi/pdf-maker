// ==================== worker-img.js ====================
// Worker for processing images (PNG/JPG) at full quality

self.onmessage = async (e) => {
    const file = e.data;

    try {
        // Read file as DataURL
        const reader = new FileReader();
        reader.onload = async () => {
            const dataURL = reader.result;

            // Create Image element in worker
            const img = new Image();
            img.onload = async () => {
                // Use OffscreenCanvas to render image
                const canvas = new OffscreenCanvas(img.width, img.height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);

                // Convert to PNG DataURL (no compression)
                const blob = await canvas.convertToBlob({ type: 'image/png' });
                const blobReader = new FileReader();
                blobReader.onload = () => {
                    self.postMessage(blobReader.result); // Send DataURL back
                };
                blobReader.readAsDataURL(blob);
            };
            img.onerror = (err) => { self.postMessage(null); console.error('Image load error in worker', err); };
            img.src = dataURL;
        };
        reader.readAsDataURL(file);
    } catch (err) {
        console.error('Worker unexpected error', err);
        self.postMessage(null);
    }
};
