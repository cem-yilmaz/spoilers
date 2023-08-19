document.addEventListener('DOMContentLoaded', () => {
    const trackedMediaList = document.getElementById('trackedMediaList');
    const mediaSearchInput = document.getElementById('mediaSearch');
    const mediaResultsDiv = document.getElementById('mediaResults');

    displayTrackedMedia();

    if (mediaSearchInput) {
        mediaSearchInput.addEventListener('keyup', searchMedia);
    }

    function searchMedia() {
        const query = mediaSearchInput.value.trim();
        chrome.runtime.sendMessage({ action: 'searchMedia', query: query }, (response) => {
            if (response) {
                renderMediaResults(response);
            } else {
                console.error('No response received from background script');
            }
        });
    }

    function renderMediaResults(mediaList) {
        if (!mediaList || !Array.isArray(mediaList)) {
            console.error('Invalid media list received. mediaList:', mediaList);
            return;
        }

        mediaResultsDiv.innerHTML = '';
        mediaList.slice(0, 5).forEach(media => {
            const mediaItem = document.createElement('div');
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
        if (media) {
            chrome.storage.local.get(['trackedMedia'], (result) => {
                const mediaList = result.trackedMedia || [];
                mediaList.push({ id: media.id, title: media.title, parts: media.parts }); // Assuming media has id and parts
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
                    ${getMediaEmoji(media.type)} <strong>${media.title}</strong> | ${media.sensitivity} | ${media.status}
                    <ul><li>Blocking for ${media.parts.join(', ')} [Edit]</li></ul>
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
