document.addEventListener("DOMContentLoaded", function () {
    console.log("Detect.js loaded");

    // Selecting elements
    const detectButton = document.querySelector(".control__panel-detect");
    const cameraButton = document.querySelector(".control__panel-camera");
    const uploadDetectVideoBtn = document.getElementById("uploadDetectVideoBtn");
    const detectFileInput = document.getElementById("detectVideoUpload");
    const detectVideoGrid = document.getElementById("detectVideoGrid");
    const detectVideoContainer = document.getElementById("detectVideoContainer");
    const showVideoButton = document.getElementById("showVideoButton");
    const statusInfo = document.getElementById("statusInfo");

    const cameraFeed = document.getElementById("cameraFeed");
    let selectedDetectVideo = null; 
    let isDetecting = false; 
    let isCameraOn = false;
    let cameraStream = null;


    const parametersInfo = document.getElementById("parametersInfo"); // Element to display distance

    if (detectButton) {
        detectButton.addEventListener("click", function () {
            this.classList.toggle("active");
    
            const eyeIconOn = this.getAttribute("data-icon-on");
            const eyeIconOff = this.getAttribute("data-icon-off");
    
            // Ensure button keeps working properly while updating UI
            this.innerHTML = this.classList.contains("active")
                ? `<img src="${eyeIconOn}" class="icon eye_icon_on"> Deepfake Detection: On`
                : `<img src="${eyeIconOff}" class="icon eye_icon_off"> Deepfake Detection: Off`;
    
            if (this.classList.contains("active")) {
                console.log("Deepfake detection is ON");
                isDetecting = true;
                detectDeepfakeLoop();
            } else {
                console.log("Deepfake detection is OFF");
                isDetecting = false;
                statusInfo.innerHTML = "DeepFake Detection Turned Off";
            }
        });
    }
    

    if (showVideoButton) {
        showVideoButton.addEventListener("click", function () {
            if (selectedDetectVideo) {
                showVideoOnCameraFeed(selectedDetectVideo);
            } else {
                statusInfo.innerHTML = "No video selected.";
            }
        });
    }

    if (cameraButton) {
        cameraButton.addEventListener("click", function () {
            this.classList.toggle("active");

            if (this.classList.contains("active")) {
                console.log("Camera turned ON");
                isCameraOn = true;
                startCamera();
            } else {
                console.log("Camera turned OFF");
                isCameraOn = false;
                stopCamera();
            }
        });
    }

    function showVideoOnCameraFeed(videoPath) {
        // Set the source of the video directly to the cameraFeed element
        cameraFeed.src = `/static/processed_videos/${videoPath.split('/')[3]}`;
        console.log("Video path:", cameraFeed.src);  // Log to verify path

        cameraFeed.style.display = "block";  // Make sure it's visible
        cameraFeed.style.visibility = "visible"; // Ensure visibility is on

        // Wait for the video to be ready to play
        cameraFeed.oncanplay = function () {
            console.log("Video is ready to play.");
        };
    }

    // Handle Video Uploads and Selection
    if (uploadDetectVideoBtn && detectFileInput) {
        uploadDetectVideoBtn.addEventListener("click", () => detectFileInput.click());

        detectFileInput.addEventListener("change", function (event) {
            handleVideoUpload(event, detectVideoGrid, detectVideoContainer, "detect");
        });
    }

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
            radio.name = type + "-video"; // Only one video can be selected
            radio.classList.add("video-radio");
            radio.id = `video-${type}-${Math.random().toString(36).substr(2, 9)}`;

            const label = document.createElement("label");
            label.setAttribute("for", radio.id);

            // When a user selects a video, update `selectedDetectVideo`
            radio.addEventListener("change", function () {
                if (radio.checked) {
                    selectedDetectVideo = file;
                }
            });

            videoWrapper.appendChild(radio);
            videoWrapper.appendChild(label);
            videoWrapper.appendChild(videoElement);
            videoGrid.appendChild(videoWrapper);
        }
    }

    // 🎥 Capture an image from the webcam
    function captureWebcamFrame(videoElement) {
        if (!videoElement || videoElement.readyState !== 4) {
            console.error("Webcam feed is not available.");
            return null;
        }
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg");
    }

    async function detectDeepfakeLoop() {
        if (isCameraOn) {
            // Real-time webcam detection loop
            while (isDetecting) {
                let imageData = captureWebcamFrame(cameraFeed);
                let sourceType = "webcam";
    
                try {
                    console.log("Sending webcam frame for deepfake detection...");
                    const response = await fetch("/predict_deepfake", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image: imageData, source: sourceType }),
                    });
    
                    const data = await response.json();
    
                    if (data.results) {
                        console.log("Real-time deepfake detection successful.");
                        statusInfo.innerHTML = `Detecting in real-time`;
                        if (data.results.face_id !== undefined) {
                            parametersInfo.innerHTML = `
                            <div style="text-align: left;">
                                <b>Label:</b> ${data.results.label} <br>
                                <b>Confidence:</b> ${(data.results.confidence * 100).toFixed(2)}% <br>
                                <b>Is Fake:</b> ${data.results.is_fake ? "Yes" : "No"} <br>
                                <b>Probabilities:</b> ${data.results.probabilities.join(", ")}
                            </div>
                            `;
                        }
                    } else {
                        console.log("No deepfake detected.");
                        statusInfo.innerHTML = "No deepfake detected.";
                    }
                } catch (error) {
                    console.error("Error detecting deepfake:", error);
                    statusInfo.innerHTML = "Error detecting deepfake.";
                }
    
                // Add a delay to avoid spamming requests
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second per frame
            }
        } 
        else if (selectedDetectVideo && isDetecting) {
            console.log("Processing selected video:", selectedDetectVideo.name);
            statusInfo.innerHTML = "Processing selected video."

            const reader = new FileReader();
            reader.readAsDataURL(selectedDetectVideo);
            reader.onload = async function (event) {
                let imageData = event.target.result;
                let sourceType = "video";
    
                console.log("Sending video to server for deepfake detection...");
                statusInfo.innerHTML = "Detecting..."
    
                try {
                    const response = await fetch("/predict_deepfake", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image: imageData, source: sourceType }),
                    });
    
                    const data = await response.json();
    
                    if (data.results) {
                        console.log("Deepfake detection successful.");
                        statusInfo.innerHTML = `Detection Process Completed`;
                        if (data.results.video_path) {
                            parametersInfo.innerHTML = `
                                <div style="text-align: left;">
                                    <b>Total Frames:</b> ${data.results.total_frames} <br>
                                    <b>Frames with Faces:</b> ${data.results.frames_with_faces} <br>
                                    <b>No Face Frames:</b> ${data.results.no_face_frames} <br>
                                    <b>Real Frames:</b> ${data.results.real_frames} <br>
                                    <b>Fake Frames:</b> ${data.results.fake_frames} <br>
                                    <b>Fake Percentage:</b> ${data.results.fake_percentage.toFixed(2)}% <br>
                                    <b>Avg Processing Time:</b> ${data.results.avg_processing_time.toFixed(4)}s <br>
                                    <b>Verdict:</b> ${data.results.verdict} <br>
                                    <b>Confidence:</b> ${(data.results.confidence * 100).toFixed(2)}% <br>
                                </div>
                            `;
                        }
                        const lineBreak = document.createElement("br");
                        statusInfo.appendChild(lineBreak);
                        const showVideoButton = document.createElement("button");
                        showVideoButton.textContent = "\n---Play video---";
                        showVideoButton.addEventListener("click", () => showVideoOnCameraFeed(data.results.output_path));
                        statusInfo.appendChild(showVideoButton);
                        
                    } else {
                        console.log("No deepfake detected.");
                        statusInfo.innerHTML = "No deepfake detected.";
                    }
                } catch (error) {
                    console.error("Error processing video:", error);
                    statusInfo.innerHTML = "Error processing video.";
                }
    
                // Stop detection after one video processing
                isDetecting = false;
                detectButton.classList.remove("active");
                console.log("Deepfake detection stopped.");
            };
        }
    }
    

    window.toggleCollapse = function (id) {
        var content = document.getElementById(id);
        if (id === "detectVideoContainer") {
            if (detectVideoGrid.children.length > 0 && content.classList.contains("open")) {
                return;
            }
        }
        content.classList.toggle("open");
    };
});
