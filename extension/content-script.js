console.log('content-script.js initialized!');

function checkForSpoilers() {
    // Check if the extension is turned ON
    chrome.storage.local.get(['extensionState'], (result) => {
        const isOn = true;//result.extensionState !== false; // default to ON
        const blockAllVideos = true; // default to ON
        if (isOn) {
            chrome.runtime.sendMessage({ action: 'getFilteredUrls' }, (filteredUrls) => {
                let videoDataArray = [];

                const videoElements = document.querySelectorAll("ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer");
                videoElements.forEach(videoElement => {
                    let videoData = {};
                    
                    let urlAnchor = videoElement.querySelector("a[id='thumbnail'], a[id='video-title-link']");
                    if (urlAnchor) {
                        let url = urlAnchor.getAttribute("href");
                        videoData["VIDEO_URL"] = url.startsWith("/watch?v=") ? `https://youtube.com${url}` : url;
                        
                        let videoId = new URL(videoData["VIDEO_URL"]).searchParams.get("v");
                        if (filteredUrls.includes(videoId) || blockAllVideos) {
                            console.debug("DEBUG: Blocking content for URL", videoData["VIDEO_URL"]);  // Print debug message
                            
                            let thumbnailImg = videoElement.querySelector('img');
                            if (thumbnailImg) {
                                videoData["VIDEO_THUMBNAIL_SRC"] = thumbnailImg.src;
                                thumbnailImg.style.filter = 'blur(12px)';
                            }

                            let titleElement = videoElement.querySelector("#video-title, #video-title yt-formatted-string");
                            if (titleElement) {
                                videoData["VIDEO_TITLE"] = titleElement.textContent.trim();
                                let wordCount = titleElement.textContent.trim().split(" ").length;
                                if (!titleElement.textContent.startsWith('SponsorBlocked')) {
                                    titleElement.textContent = `SponsorBlocked | Words: ${wordCount}`;
                                }
                            }
                        }
                        videoDataArray.push(videoData);
                    }
                });
                console.log(videoDataArray);
            });
        } else {
            console.log("Extension is OFF"); //DEBUG
        }
    });
}
checkForSpoilers();

chrome.runtime.sendMessage({ action: 'getFilteredUrls' }, (response) => {
    const filteredUrls = response || [];
    checkForSpoilers(filteredUrls);

    // To handle YouTube's dynamic content loading
    const targetNode = document.getElementById('content');
    const config = { childList: true, subtree: true };

    const observer = new MutationObserver(() => {
        chrome.runtime.sendMessage({ action: 'getFilteredUrls' }, (response) => {
            const filteredUrls = response || [];
            checkForSpoilers(filteredUrls);
        });
    });

    observer.observe(targetNode, config);
});
