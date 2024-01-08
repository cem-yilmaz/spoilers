console.log("Background.js running!");

const defaultURL = 'http://127.0.0.1:3000'; // Master server URL 
let serverURL = defaultURL; // Set default server URL
let globalFilteredUrls = [];

function fetchMediaList(query = '') {
    return fetch(`${serverURL}/media?query=${query}`, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error('There was an error fetching the media:', error);
        return [];
    });
}

function fetchFilteredUrls(trackedMedia) {
    Promise.all(trackedMedia.map(media => {
        return fetch(`${serverURL}/spoilers/media/${media.id}`, {
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json());
    }))
    .then(spoilersLists => {
        let filteredUrls = [];
        trackedMedia.forEach((media, index) => {
            const spoilers = spoilersLists[index];
            spoilers.forEach(spoiler => {
                // Sensitivity filter
                const sensitivityLevels = ["No Spoilers", "Story Beats/Mild Spoilers", "Major Spoilers"];
                if (sensitivityLevels.indexOf(spoiler.intensity) < sensitivityLevels.indexOf(media.sensitivity)) {
                    return;
                }
                // Current Part filter
                if (media.currentPart !== "Entire Media") {
                    const fromPartIndex = media.parts.findIndex(part => part.title === media.currentPart);
                    if (spoiler.part) {
                        const spoilerPartIndex = media.parts.findIndex(part => part.title === spoiler.part.title);
                        if (spoilerPartIndex < fromPartIndex) {
                            return;
                        }
                    }
                }
                // If we're here, the spoiler passed all filters
                
                // Fetch actual url from the url id
                for (let urlId of spoiler.urls) {
                    fetch(`${serverURL}/urls/${urlId}`, {
                        headers: {
                            'Accept': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(urlDocument => {
                        filteredUrls.push(urlDocument.video_id);
                    });
                }
            });
        });
        console.log("Filtered URLs:", filteredUrls);
        globalFilteredUrls = filteredUrls;
    })
    .catch(error => console.error("Error fetching filtered URLs:", error));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //console.log('Message received in background:', message); //DEBUG
    if (message.action === 'searchMedia') {
        fetchMediaList(message.query)
        .then((data) => {
            sendResponse(data);
        });
        // This line is necessary to make sendResponse work asynchronously
        return true;
    } else if (message.action === 'fetchFilteredUrls') {
        fetchFilteredUrls(message.trackedMedia);
        console.log("Global filtered URLs:", globalFilteredUrls);
    } else if (message.action === 'getFilteredUrls') {
        sendResponse(globalFilteredUrls);
    }
});
