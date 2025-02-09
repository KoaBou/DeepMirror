document.addEventListener("DOMContentLoaded", function () {
    console.log("Generate.js loaded");

    // Get elements for source upload
    const uploadSourceBtn = document.getElementById("uploadSourceBtn");
    const sourceFileInput = document.getElementById("sourceVideoUpload");
    const sourceVideoGrid = document.getElementById("sourceVideoGrid");
    const sourceVideoContainer = document.getElementById("sourceVideoContainer");

    // Get elements for destination upload
    const uploadDestinationBtn = document.getElementById("uploadDestinationBtn");
    const destinationFileInput = document.getElementById("destinationVideoUpload");
    const destinationVideoGrid = document.getElementById("destinationVideoGrid");
    const destinationVideoContainer = document.getElementById("destinationVideoContainer");

    const generateBtn = document.querySelector(".control__panel-generate");

    let selectedSourceVideo = null;
    let selectedDestinationVideo = null;

    // Upload Source Video
    uploadSourceBtn.addEventListener("click", () => sourceFileInput.click());
    sourceFileInput.addEventListener("change", function (event) {
        handleVideoUpload(event, sourceVideoGrid, sourceVideoContainer, "source");
    });

    // Upload Destination Video
    uploadDestinationBtn.addEventListener("click", () => destinationFileInput.click());
    destinationFileInput.addEventListener("change", function (event) {
        handleVideoUpload(event, destinationVideoGrid, destinationVideoContainer, "destination");
    });

    // Generate Deepfake Video
    generateBtn.addEventListener("click", function () {
        if (!selectedSourceVideo || !selectedDestinationVideo) {
            alert("Please select both a source and a destination video.");
            return;
        }

        // Simulate sending selected videos for deepfake generation
        console.log("Generating deepfake using:");
        console.log("Source Video:", selectedSourceVideo);
        console.log("Destination Video:", selectedDestinationVideo);

        alert("Deepfake generation started!");
    });
});

function toggleCollapse(id) {
    var content = document.getElementById(id);

    // Ensure collapsible expands/collapses
    if (content) {
        content.classList.toggle("open");
    }
}