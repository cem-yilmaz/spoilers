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
                        videoData["VIDEO_ID"] = videoId;
                        if (filteredUrls.includes(videoId) || blockAllVideos) {
                            //console.debug("DEBUG: Blocking content for URL", videoData["VIDEO_URL"]);  // Print debug message
                            
                            let thumbnailImg = videoElement.querySelector('img');
                            if (thumbnailImg) {
                                videoData["VIDEO_THUMBNAIL_SRC"] = thumbnailImg.src;
                                thumbnailImg.style.filter = 'blur(14px)';
                            }

                            let titleElement = videoElement.querySelector("#video-title, #video-title yt-formatted-string, #video-title-link yt-formatted-string, #video-title-link, #title"); // This is admittedly quite bad
                            if (titleElement) {
                                console.debug("Title: ", titleElement.textContent);  // Print debug message
                                originalTitle = titleElement.textContent.trim();
                                videoData["VIDEO_TITLE"] = originalTitle
                                replacementText = blockAllVideos ? originalTitle : spoilerFromID(videoId);
                                // Check to see if the title has already been modified
                                if (!originalTitle.startsWith("SpoilerBlocked | ")) {
                                    titleElement.textContent = `SpoilerBlocked | ${replacementText}`;
                                }
                            }
                        }
                        videoDataArray.push(videoData);
                    }
                });
                //console.log(videoDataArray);
            });
        } else {
            console.log("Extension is OFF"); //DEBUG
        }
    });
}
checkForSpoilers();

function spoilerFromID(video_id) {
    return "Spoiler from ID";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'rerunCheckForSpoilers') {
        console.log("Received rerunCheckForSpoilers message");
        checkForSpoilers();
    }
});

chrome.runtime.sendMessage({ action: 'getFilteredUrls' }, (response) => {
    const filteredUrls = response || [];
    checkForSpoilers(filteredUrls);

    const targetNode = document.getElementById('content');
    const config = { childList: true, subtree: true };

    const observer = new MutationObserver(() => {
        chrome.runtime.sendMessage({ action: 'getFilteredUrls' }, (response) => {
            const filteredUrls = response || [];
            checkForSpoilers(filteredUrls);
        });
    }); // This will need to be changed to a more efficient method later

    observer.observe(targetNode, config);
});