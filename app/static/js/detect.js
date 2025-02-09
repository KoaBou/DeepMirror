document.addEventListener("DOMContentLoaded", function () {
    console.log("Detect.js loaded");

    // Selecting elements
    const detectButton = document.querySelector(".control__panel-detect");
    const uploadDetectVideoBtn = document.getElementById("uploadDetectVideoBtn");
    const detectFileInput = document.getElementById("detectVideoUpload");
    const detectVideoGrid = document.getElementById("detectVideoGrid");
    const detectVideoContainer = document.getElementById("detectVideoContainer");

    let selectedDetectVideo = null; // Store selected video

    // Handle Deepfake Detection Toggle
    if (detectButton) {
        detectButton.addEventListener("click", function () {
            this.classList.toggle("active");
        
            // Get image URLs from data attributes
            const eyeIconOn = this.getAttribute("data-icon-on");
            const eyeIconOff = this.getAttribute("data-icon-off");
        
            // Update button text and icon
            this.innerHTML = this.classList.contains("active")
                ? `<img src="${eyeIconOn}" class="icon eye_icon_on"> Deepfake Detection: On`
                : `<img src="${eyeIconOff}" class="icon eye_icon_off"> Deepfake Detection: Off`;
        });
    }

    // Handle Video Uploads
    if (uploadDetectVideoBtn && detectFileInput) {
        uploadDetectVideoBtn.addEventListener("click", () => detectFileInput.click());
        detectFileInput.addEventListener("change", function (event) {
            handleVideoUpload(event, detectVideoGrid, detectVideoContainer, "detect");
        });
    }

     // Function to toggle collapsible elements dynamically
     window.toggleCollapse = function (id) {
        var content = document.getElementById(id);
        
        // If the container is the video container, ensure it stays open after upload
        if (id === "videoContainer") {
            if (videoGrid.children.length > 0 && content.classList.contains("open")) {
                return; // Do nothing if videos are already uploaded
            }
        }

        content.classList.toggle("open");
    };

    // Function to toggle the button group visibility
    window.toggleButtonGroup = function () {
        if (buttonGroup) {
            buttonGroup.classList.toggle("open");
        }
    };
});
