document.addEventListener("DOMContentLoaded", function () {
    console.log("Upload.js loaded");

    // Function to handle video uploads and selection
    function handleVideoUpload(event, videoGrid, videoContainer, type) {
        const files = event.target.files;

        if (files.length > 0) {
            videoContainer.classList.add("open"); // Expand collapsible if videos are uploaded
        }

        for (let file of files) {
            const videoURL = URL.createObjectURL(file);
            const videoWrapper = document.createElement("div");
            videoWrapper.classList.add("video-wrapper");

            const videoElement = document.createElement("video");
            videoElement.src = videoURL;
            videoElement.controls = true;
            videoElement.classList.add("uploaded-video");

            // Create a radio button for selection
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = type + "-video"; // Ensure only one per collapsible
            radio.classList.add("video-radio");
            radio.id = `video-${type}-${Math.random().toString(36).substr(2, 9)}`;

            // Create a label for the custom radio button
            const label = document.createElement("label");
            label.setAttribute("for", radio.id);

            // When selecting a new video, update the chosen video
            radio.addEventListener("change", function () {
                if (radio.checked) {
                    if (type === "source") {
                        selectedSourceVideo = videoURL;
                    } else if (type === "detect") {
                        selectedDetectVideo = videoURL;
                    }
                }
                highlightSelected(videoGrid, "video");
            });

            // Append video and custom radio button
            videoWrapper.appendChild(radio);
            videoWrapper.appendChild(label); // Custom styled radio button
            videoWrapper.appendChild(videoElement);
            videoGrid.appendChild(videoWrapper);
        }
    }

    // Function to handle image uploads and selection
    function handleImageUpload(event, imageGrid, imageContainer, type) {
        const files = event.target.files;

        if (files.length > 0) {
            imageContainer.classList.add("open"); // Expand collapsible if images are uploaded
        }

        for (let file of files) {
            const imageURL = URL.createObjectURL(file);
            const imageWrapper = document.createElement("div");
            imageWrapper.classList.add("image-wrapper");

            const imageElement = document.createElement("img");
            imageElement.src = imageURL;
            imageElement.classList.add("uploaded-image");

            // Create a radio button for selection
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = type + "-image"; // Ensure only one per collapsible
            radio.classList.add("image-radio");
            radio.id = `image-${type}-${Math.random().toString(36).substr(2, 9)}`;

            // Create a label for the custom radio button
            const label = document.createElement("label");
            label.setAttribute("for", radio.id);

            // When selecting a new image, update the chosen image
            radio.addEventListener("change", async function () {
                if (radio.checked) {
                    if (type === "source") {
                        window.selectedSourceInput = await convertImageToBase64(imageElement.src);
                        console.log("Selected source image updated:", window.selectedSourceInput);
                    } else if (type === "detect") {
                        selectedDetectImage = imageURL;
                    }
                }
                highlightSelected(imageGrid, "image");
            });

            async function convertImageToBase64(imageSrc) {
                const response = await fetch(imageSrc);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            }

            // Append image and custom radio button
            imageWrapper.appendChild(radio);
            imageWrapper.appendChild(label); // Custom styled radio button
            imageWrapper.appendChild(imageElement);
            imageGrid.appendChild(imageWrapper);
        }
    }

    // Function to highlight the selected video or image
    function highlightSelected(grid, type) {
        grid.querySelectorAll(`.${type}-wrapper`).forEach(wrapper => {
            const radio = wrapper.querySelector(`.${type}-radio`);
            const media = wrapper.querySelector(type === "video" ? "video" : "img");

            if (radio.checked) {
                media.style.border = "4px solid var(--active-color)";
            } else {
                media.style.border = "none";
            }
        });
    }

    // Expose functions globally
    window.handleVideoUpload = handleVideoUpload;
    window.handleImageUpload = handleImageUpload;
});
