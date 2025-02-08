document.addEventListener("DOMContentLoaded", function () {
    // Selecting buttons and elements only after the DOM is ready
    const detectButton = document.querySelector(".control__panel-detect");
    const toggleCameraButton = document.querySelector(".toggle-btn");
    const uploadBtn = document.querySelector(".upload-btn");
    const fileInput = document.getElementById("videoUpload");
    const videoGrid = document.getElementById("videoGrid");
    const videoContainer = document.getElementById("videoContainer");
    const buttonGroup = document.getElementById("buttonGroup");

    // Ensure all elements exist before adding event listeners
    if (toggleCameraButton) {
        toggleCameraButton.addEventListener("click", function () {
            this.classList.toggle("active");
        });
    }

    if (detectButton) {
        detectButton.addEventListener("click", function () {
            this.classList.toggle("active");
        
            // Get image URLs from data attributes
            const eyeIconOn = this.getAttribute("data-icon-on");
            const eyeIconOff = this.getAttribute("data-icon-off");
        
            // Check button state and apply correct image + class
            if (this.classList.contains("active")) {
                this.innerHTML = `<img src="${eyeIconOn}" class="icon eye_icon_on"> Deepfake Detection: On`;
            } else {
                this.innerHTML = `<img src="${eyeIconOff}" class="icon eye_icon_off"> Deepfake Detection: Off`;
            }
        });
    }

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener("click", function () {
            fileInput.click();
        });

        fileInput.addEventListener("change", function (event) {
            const files = event.target.files;

            if (files.length > 0) {
                // Ensure the video section stays open
                videoContainer.classList.add("open");
            }

            for (let file of files) {
                const videoURL = URL.createObjectURL(file);
                const videoElement = document.createElement("video");

                videoElement.src = videoURL;
                videoElement.controls = true;
                videoElement.classList.add("uploaded-video");

                videoGrid.appendChild(videoElement);
            }
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
