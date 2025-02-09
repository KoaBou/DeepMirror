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
                    } else if (type === "destination") {
                        selectedDestinationVideo = videoURL;
                    } else if (type === "detect") {
                        selectedDetectVideo = videoURL;
                    }
                }
                highlightSelected(videoGrid);
            });

            // Append video and custom radio button
            videoWrapper.appendChild(radio);
            videoWrapper.appendChild(label); // Custom styled radio button
            videoWrapper.appendChild(videoElement);
            videoGrid.appendChild(videoWrapper);
        }
    }

    // Function to highlight the selected video
    function highlightSelected(videoGrid) {
        videoGrid.querySelectorAll(".video-wrapper").forEach(wrapper => {
            const radio = wrapper.querySelector(".video-radio");
            const video = wrapper.querySelector("video");

            if (radio.checked) {
                video.style.border = "4px solid var(--active-color)";
            } else {
                video.style.border = "none";
            }
        });
    }

    // Expose function globally
    window.handleVideoUpload = handleVideoUpload;
});
