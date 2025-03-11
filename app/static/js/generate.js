document.addEventListener("DOMContentLoaded", function () {
    console.log("Generate.js loaded");

    const uploadSourceBtn = document.getElementById("uploadSourceBtn");
    const sourceFileInput = document.getElementById("sourceImageUpload");
    const sourceImageGrid = document.getElementById("sourceImageGrid");
    const sourceImageContainer = document.getElementById("sourceImageContainer");
    const generateBtn = document.querySelector(".control__panel-generate");

    const deepfakeImage = document.getElementById("deepfakeImage");
    const cameraFeed = document.getElementById("cameraFeed");
    const fpsDisplay = document.getElementById("fpsDisplay"); // Element to display FPS

    let selectedSourceInput = null;
    let isGenerating = false; // Flag to control the loop

    if (uploadSourceBtn && sourceFileInput) {
        uploadSourceBtn.addEventListener("click", () => sourceFileInput.click());

        sourceFileInput.addEventListener("change", function (event) {
            handleImageUpload(event, sourceImageGrid, sourceImageContainer, "Gen");
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    selectedSourceInput = e.target.result;
                    console.log("Source image uploaded.");
                };
                reader.readAsDataURL(file);
            }
        });
    }

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

    async function generateDeepfakeLoop() {
        while (isGenerating) {
            if (!selectedSourceInput) {
                alert("Please upload a source image first.");
                isGenerating = false;
                return;
            }

            const targetImage = captureWebcamFrame(cameraFeed);
            if (!targetImage) {
                alert("Could not capture webcam frame.");
                isGenerating = false;
                return;
            }

            try {
                const response = await fetch("/generate_deepfake", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ source: selectedSourceInput, target: targetImage }),
                });

                const data = await response.json();
                if (data.deepfake_image) {
                    console.log("Deepfake generated successfully.");

                    cameraFeed.style.display = "none"; // Hide webcam feed
                    deepfakeImage.src = data.deepfake_image;
                    deepfakeImage.style.display = "block"; // Show deepfake image

                    // Update FPS display
                    fpsDisplay.textContent = `FPS: ${data.fps.toFixed(2)}`; // Display FPS with 2 decimal places

                } else {
                    alert("Deepfake generation failed: " + data.error);
                }
            } catch (error) {
                console.error("Error generating deepfake:", error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 0)); // Wait 1 second before next frame
        }
    }

    generateBtn.addEventListener("click", function () {
        isGenerating = !isGenerating; // Toggle generating state
        if (isGenerating) {
            generateDeepfakeLoop();
            generateBtn.textContent = "Stop Generating";
        } else {

            // Stop generating: hide the deepfake and show the webcam feed
            generateBtn.textContent = "Generate Deepfake";
            cameraFeed.style.display = "block"; // Show webcam feed again
            deepfakeImage.style.display = "none"; // Hide deepfake image

        }
    });

    window.toggleCollapse = function (id) {
        var content = document.getElementById(id);
        if (id === "sourceImageContainer") {
            if (sourceImageGrid.children.length > 0 && content.classList.contains("open")) {
                return;
            }
        }
        content.classList.toggle("open");
    };
});
