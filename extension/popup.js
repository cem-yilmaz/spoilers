document.addEventListener('DOMContentLoaded', () => {
    const trackedMediaList = document.getElementById('trackedMediaList');
    const clearAllButton = document.getElementById('clearAll');

    // Function to save tracked media
    function saveTrackedMedia(media) {
    chrome.storage.local.get(['trackedMedia'], (result) => {
        const currentMedia = result.trackedMedia || [];
        currentMedia.push(media);
        chrome.storage.local.set({ trackedMedia: currentMedia });
    });
    }

    // Function to display tracked media
    function displayTrackedMedia() {
    chrome.storage.local.get(['trackedMedia'], (result) => {
        const mediaList = result.trackedMedia || [];
        trackedMediaList.innerHTML = '';
        mediaList.forEach((media, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = media;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => removeTrackedMedia(index));
        listItem.appendChild(removeButton);
        trackedMediaList.appendChild(listItem);
        });
    });
    }

    // Function to remove tracked media by index
    function removeTrackedMedia(index) {
    chrome.storage.local.get(['trackedMedia'], (result) => {
        const mediaList = result.trackedMedia || [];
        mediaList.splice(index, 1);
        chrome.storage.local.set({ trackedMedia: mediaList }, () => {
        displayTrackedMedia();
        });
    });
    }

    // Clear all tracked media
    clearAllButton.addEventListener('click', () => {
    chrome.storage.local.set({ trackedMedia: [] }, () => {
        displayTrackedMedia();
    });
    });

    // Add dummy media to test display
    chrome.storage.local.set({ "trackedMedia": ["Example Media"] });

    // Initial call to display tracked media
    displayTrackedMedia();
});