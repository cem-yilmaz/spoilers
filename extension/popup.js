let allMedia = [];

document.addEventListener('DOMContentLoaded', () => {
    // Load all media on page load
    chrome.runtime.sendMessage({ action: 'searchMedia', query: '' }, (response) => {
        if (response) {
            allMedia = response; // Store all media
        } else {
            console.error('No response received from background script');
        }
    });

    const trackedMediaList = document.getElementById('trackedMediaList');
    const mediaSearchInput = document.getElementById('mediaSearch');
    const mediaResultsDiv = document.getElementById('mediaResults');

    displayTrackedMedia();

    if (mediaSearchInput) {
        mediaSearchInput.addEventListener('input', searchMedia);
    }

    function searchMedia() {
        console.log('KeyUp event triggered'); //DEBUG
        const query = mediaSearchInput.value.trim();
        if (query.length === 0) {
            mediaResultsDiv.innerHTML = '';
            return;
        }
        console.log(`Searching for media containing query: '${query}'`); //DEBUG
        const filteredMedia = allMedia.filter(media => media.title.toLowerCase().includes(query.toLowerCase()));
        renderMediaResults(filteredMedia);
    }

    function renderMediaResults(mediaList) {
        if (!mediaList || !Array.isArray(mediaList)) {
            console.error('Invalid media list received. mediaList:', mediaList);
            return;
        }

        console.log('Media that contains this query:', mediaList); //DEBUG

        mediaResultsDiv.innerHTML = '';
        mediaList.slice(0, 5).forEach(media => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.innerHTML = getMediaEmoji(media.type) + ` ${media.title}`;
            mediaItem.addEventListener('click', () => addTrackedMedia(media));
            mediaResultsDiv.appendChild(mediaItem);
        });
    }

    function getMediaEmoji(type) {
        switch (type) {
            case 'Video Game': return '🕹️';
            case 'TV Show': return '📺';
            case 'Film': return '🎬';
            case 'Book': return '📖';
            case 'Sporting Event': return '⚽';
            default: return '💿';
        }
    }

    function addTrackedMedia(media) {
        if (media) { //This is stupid and needs to be got rid of.
            // addTrackedMedia should never be called with a null media.
            chrome.storage.local.get(['trackedMedia'], (result) => {
                const mediaList = result.trackedMedia || [];
                const defaultSensitivity = 'No Spoilers';
                // Defaulting to max spoiler sensitivity for now
                mediaList.push(
                    { id: media.id,
                      title: media.title,
                      type: media.type,
                      year: media.year,
                      parts: media.parts,
                      sensitivity: defaultSensitivity,
                      isNonLinear: false
                    }); 
                    // If it's non linear, the part selection will be an
                    // array of checkboxes, otherwise it will be a dropdown
                    // By implementing this now (with no option to change yet)
                    // we can preserve the previous functionality of the
                    // extension while still allowing for the new functionality
                chrome.storage.local.set({ trackedMedia: mediaList }, () => {
                    displayTrackedMedia();
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

    function displayTrackedMedia() {
        chrome.storage.local.get(['trackedMedia'], (result) => {
            const mediaList = result.trackedMedia || [];
            trackedMediaList.innerHTML = '';

            mediaList.forEach((media, index) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    ${getMediaEmoji(media.type)} <strong>${media.title}</strong> | ${media.year} | ${media.sensitivity}
                    <ul><li>Blocking for ${media.parts && media.parts.length > 0 ? media.parts.join(', ') : 'Entire Media'} [Edit]</li></ul>
                `; // Assuming media has type, sensitivity, and status
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.addEventListener('click', () => removeTrackedMedia(index));
                listItem.appendChild(removeButton);
                trackedMediaList.appendChild(listItem);
            });
        });
    }
});


document.querySelectorAll('.collapsible h2').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
    });
});
