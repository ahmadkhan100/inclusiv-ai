// Initialize the zoom level
if (!window.zoomLevel) {
window.zoomLevel = 100;
}

// Function to increase the zoom level by 25%
function increaseZoom() {
    if (window.zoomLevel < 200) {
        window.zoomLevel += 25;
        document.body.style.zoom = window.zoomLevel + '%';
    }
}

// Function to decrease the zoom level by 25%
function decreaseZoom() {
    if (window.zoomLevel > 25) {
        window.zoomLevel -= 25;
        document.body.style.zoom = window.zoomLevel + '%';
    }
}

increaseZoom()
