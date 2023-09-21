console.log('content-script.js initialized!');

function checkForSpoilers() {
    // Array to store all video data
    let videoDataArray = [];

    // Iterate through all videos on the page
    const videoLinks = document.querySelectorAll("[data-context-item-id]");

    videoLinks.forEach((linkElement) => {
        let videoData = {};

        // Extract URL
        const videoId = linkElement.getAttribute("data-context-item-id");
        videoData["VIDEO_URL"] = `https://youtube.com/watch?v=${videoId}`;

        // Extract Title
        const titleElement = linkElement.querySelector("#video-title");
        if (titleElement) {
            videoData["VIDEO_TITLE"] = titleElement.textContent.trim();
        }

        // Extract Thumbnail SRC
        const thumbnailElement = linkElement.querySelector('img');
        if (thumbnailElement) {
            videoData["VIDEO_THUMBNAIL_SRC"] = thumbnailElement.src;
        }

        videoDataArray.push(videoData);

        // Implement other manipulations here (like changing the title and blurring the thumbnail)
        if (titleElement) {
            titleElement.textContent = "SponsorBlocked";
        }

        if (thumbnailElement) {
            thumbnailElement.style.filter = 'blur(5px)';
        }
    });

    console.log(videoDataArray);
}

// Run the check when the script is injected
checkForSpoilers();

// To handle YouTube's dynamic content loading
const targetNode = document.getElementById('content');
const config = { childList: true, subtree: true };

const observer = new MutationObserver(() => {
    checkForSpoilers();
});

observer.observe(targetNode, config);
