document.addEventListener("DOMContentLoaded", function () {
    console.log("Generate.js loaded");

    const uploadSourceBtn = document.getElementById("uploadSourceBtn");
    const sourceFileInput = document.getElementById("sourceImageUpload");
    const sourceImageGrid = document.getElementById("sourceImageGrid");
    const sourceImageContainer = document.getElementById("sourceImageContainer");
    const generateBtn = document.querySelector(".control__panel-generate");

    const deepfakeImage = document.getElementById("deepfakeImage");
    const cameraFeed = document.getElementById("cameraFeed");
    // const fpsDisplay = document.getElementById("fpsDisplay"); // Element to display FPS
    const parametersInfo = document.getElementById("parametersInfo"); // Element to display distance

    window.selectedSourceInput = null;
    let isGenerating = false; // Flag to control the loop

    if (uploadSourceBtn && sourceFileInput) {
        uploadSourceBtn.addEventListener("click", () => sourceFileInput.click());

        sourceFileInput.addEventListener("change", function (event) {
            handleImageUpload(event, sourceImageGrid, sourceImageContainer, "source");
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    console.log("Image uploaded. Select an image before generating.");
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
            if (!window.selectedSourceInput) {
                console.warn("Please select a source image.");
                isGenerating = false;
                return;
            }
            console.log("Using source image:", window.selectedSourceInput);     
            
            const targetImage = captureWebcamFrame(cameraFeed);
            if (!targetImage) {
                console.warn("Could not capture webcam frame.");
                isGenerating = false;
                return;
            }

            try {
                const response = await fetch("/generate_deepfake", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ source: window.selectedSourceInput, target: targetImage }),
                });
    
                const data = await response.json();
    
                if (data.deepfake_image) {
                    console.log("Deepfake generated successfully.");
    
                    // Swap to deepfake image
                    deepfakeImage.src = data.deepfake_image;
                    deepfakeImage.style.display = "block";
                    cameraFeed.style.display = "none"; // Hide webcam only when deepfake is active
    
                    // Update FPS display
                    // fpsDisplay.textContent = `FPS: ${data.fps.toFixed(2)}`;
                    
                    // Update distance value in Parameters Info
                    parametersInfo.innerHTML = `
                    <div style="text-align: left;">
                        <b>FPS: ${data.fps.toFixed(2)}<br>
                        <b>Distance: ${data.distance.toFixed(4)}<br>
                    </div>
                    `;
                } else {
                    console.log("No face detected. Keeping the camera feed active.");
    
                    // Ensure the camera remains visible and functional
                    cameraFeed.style.display = "block";
                    deepfakeImage.style.display = "none"; // Hide deepfake image if no generation happened
                    
                    // Update Parameters Info to show waiting message
                    parametersInfo.innerHTML = "Waiting for data...";
                }
            } catch (error) {
                console.error("Error generating deepfake:", error);
    
                // Ensure the camera remains visible even if there's an error
                cameraFeed.style.display = "block";
                deepfakeImage.style.display = "none"; 

                // Update Parameters Info to show error message
                parametersInfo.innerHTML = "Error generating deepfake.";
            }
    
            await new Promise(resolve => setTimeout(resolve, 0)); // Wait 1 second before next frame

            if (!isGenerating) {
                cameraFeed.style.display = "block";
                deepfakeImage.style.display = "none";
                parametersInfo.innerHTML = "Waiting for data..."; // Reset to waiting when stopped
            }
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

            // Reset Parameters Info to waiting
            parametersInfo.innerHTML = "Waiting for data...";
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
