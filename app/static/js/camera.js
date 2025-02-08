let cameraStream = null;

function toggleCamera() {
    const cameraFeed = document.getElementById('cameraFeed');
    const placeholderImage = document.getElementById('placeholderImage');

    if (!cameraStream) {
        // Request access to the webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                cameraStream = stream;
                cameraFeed.srcObject = stream;
                
                cameraFeed.style.display = 'block';
                cameraFeed.style.visibility = 'visible';

                placeholderImage.style.display = 'none';
                placeholderImage.style.visibility = 'hidden';
            })
            .catch(err => {
                console.error('Error accessing the camera:', err);
                alert('Camera access failed: ' + err.message);
            });
    } else {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        cameraFeed.srcObject = null;

        cameraFeed.style.display = 'none';
        cameraFeed.style.visibility = 'hidden';

        placeholderImage.style.display = 'block';
        placeholderImage.style.visibility = 'visible';
    }
}


