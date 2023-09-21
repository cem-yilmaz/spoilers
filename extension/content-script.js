console.log('content-script.js initialized!');

function checkForSpoilers() {
    let videoDataArray = [];

    // Universal selector to detect video items
    const videoElements = document.querySelectorAll("ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer");

    videoElements.forEach(videoElement => {
        let videoData = {};

        // Try to get video URL
        let urlAnchor = videoElement.querySelector("a[id='thumbnail'], a[id='video-title-link']");
        if (urlAnchor) {
            let url = urlAnchor.getAttribute("href");
            videoData["VIDEO_URL"] = url.startsWith("/watch?v=") ? `https://youtube.com${url}` : url;
            
            // Extract Thumbnail SRC
            let thumbnailImg = videoElement.querySelector('img');
            if (thumbnailImg) {
                videoData["VIDEO_THUMBNAIL_SRC"] = thumbnailImg.src;
                thumbnailImg.style.filter = 'blur(5px)';  // Apply the blur
            }

            // Extract Title
            let titleElement = videoElement.querySelector("#video-title, #video-title yt-formatted-string");
            if (titleElement) {
                videoData["VIDEO_TITLE"] = titleElement.textContent.trim();
                titleElement.textContent = "SponsorBlocked";  // Update the title
            }

            videoDataArray.push(videoData);
        }
    });

    console.log(videoDataArray);
}

checkForSpoilers();

// To handle YouTube's dynamic content loading
const targetNode = document.getElementById('content');
const config = { childList: true, subtree: true };

const observer = new MutationObserver(() => {
    checkForSpoilers();
});

observer.observe(targetNode, config);