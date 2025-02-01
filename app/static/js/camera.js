let cameraStream = null;

    function toggleCamera() {
        const cameraFeed = document.getElementById('cameraFeed');
        const placeholderImage = document.getElementById('placeholderImage');
        const statusDisplay = document.getElementById('statusDisplay');

        if (!cameraStream) {
            // Request access to the webcam
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    cameraFeed.srcObject = stream;
                    cameraStream = stream;
                    cameraFeed.style.display = 'block';
                    placeholderImage.style.display = 'none'; // Hide the placeholder image
                    statusDisplay.textContent = 'Camera is on';
                })
                .catch(err => {
                    console.error('Error accessing the camera:', err);
                    statusDisplay.textContent = 'Failed to access camera';
                });
        } else {
            // Stop all video streams
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            cameraFeed.style.display = 'none';
            placeholderImage.style.display = 'block'; // Show the placeholder image
            statusDisplay.textContent = 'Camera is off';
        }
    }