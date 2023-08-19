document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded!'); // DEBUG
    
    const trackedMediaList = document.getElementById('trackedMediaList');
    const clearAllButton = document.getElementById('clearAll');
    const newMediaInput = document.getElementById('newMedia');
    const addMediaButton = document.getElementById('addMediaButton');
    const mediaSearchInput = document.getElementById('mediaSearch');
    const mediaResultsDiv = document.getElementById('mediaResults');
    
    if (mediaSearchInput) {
        mediaSearchInput.addEventListener('keyup', searchMedia);
    }
    
    function searchMedia() {
        const query = mediaSearchInput.value;
        chrome.runtime.sendMessage({ action: 'searchMedia', query: query }, (response) => {
            if (response) {
				renderMediaResults(response);
			} else {
				console.error('No response recieved from background script');
			}
        });
    }

    function renderMediaResults(mediaList) {
		if (!mediaList || !Array.isArray(mediaList)) {
			console.error('Invalid media list recieved. mediaList:', mediaList);
			return;
		}

        if (mediaResultsDiv) {
            mediaResultsDiv.innerHTML = '';
            mediaList.slice(0, 5).forEach(media => {
                const mediaItem = document.createElement('div');
                mediaItem.textContent = '💿';
                switch (media.type) {
                    case 'Video Game':
                        mediaItem.textContent = '🕹️';
                        break;
                    case 'TV Show':
                        mediaItem.textContent = '📺';
                        break;
                    case 'Film':
                        mediaItem.textContent = '🎬';
                        break;
                    case 'Book':
                        mediaItem.textContent = '📖';
                        break;
                    case 'Sporting Event':
                        mediaItem.textContent = '⚽';
                        break;
                    default:
                        mediaItem.textContent = '💿';
                        break;
                }
                mediaItem.textContent += ` ${media.title}`; // Adding title text
                mediaItem.addEventListener('click', () => addTrackedMedia(media.title));
                mediaResultsDiv.appendChild(mediaItem);
            });
        }
    }

    if (clearAllButton) {
        clearAllButton.addEventListener('click', () => {
            chrome.storage.local.set({ trackedMedia: [] }, () => {
                displayTrackedMedia();
            });
        });
    }

    if (addMediaButton) {
        addMediaButton.addEventListener('click', () => addTrackedMedia(newMediaInput.value));
    }

    function displayTrackedMedia() {
        if (trackedMediaList) {
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
    }

    function removeTrackedMedia(index) {
        chrome.storage.local.get(['trackedMedia'], (result) => {
            const mediaList = result.trackedMedia || [];
            mediaList.splice(index, 1);
            chrome.storage.local.set({ trackedMedia: mediaList }, () => {
                displayTrackedMedia();
            });
        });
    }

    function addTrackedMedia(mediaTitle) {
        if (mediaTitle) {
            chrome.storage.local.get(['trackedMedia'], (result) => {
                const mediaList = result.trackedMedia || [];
                mediaList.push(mediaTitle);
                chrome.storage.local.set({ trackedMedia: mediaList }, () => {
                    displayTrackedMedia();
                });
            });
        }
    }

    chrome.storage.local.get(['trackedMedia'], (result) => {
        if (!result.trackedMedia || result.trackedMedia.length === 0) {
            chrome.storage.local.set({ trackedMedia: ["Example Media"] }, () => {
                displayTrackedMedia();
            });
        } else {
            displayTrackedMedia();
        }
    });
});

document.querySelectorAll('.collapsible h2').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
    });
});
