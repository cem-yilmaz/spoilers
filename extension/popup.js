let allMedia = [];

document.addEventListener('DOMContentLoaded', () => {
    // Load all media on page load
    chrome.runtime.sendMessage({ action: 'searchMedia', query: '' }, (response) => {
        if (response) {
            allMedia = response;
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
        const query = mediaSearchInput.value.trim();
        if (query.length === 0) {
            mediaResultsDiv.innerHTML = '';
            return;
        }
        const filteredMedia = allMedia.filter(media => media.title.toLowerCase().includes(query.toLowerCase()));
        renderMediaResults(filteredMedia);
    }

    function renderMediaResults(mediaList) {
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
        chrome.storage.local.get(['trackedMedia'], (result) => {
            const mediaList = result.trackedMedia || [];
            const defaultSensitivity = 'No Spoilers';
            mediaList.push({
                id: media.id,
                title: media.title,
                type: media.type,
                year: media.year,
                parts: media.parts,
                sensitivity: defaultSensitivity,
                isNonLinear: false,
                currentPart: "Entire Media"
            });
            chrome.storage.local.set({ trackedMedia: mediaList }, () => {
                displayTrackedMedia();
            });
        });
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

    function updateTrackedMedia(index, updatedMedia) {
        chrome.storage.local.get(['trackedMedia'], (result) => {
            const mediaList = result.trackedMedia || [];
            mediaList[index] = updatedMedia;
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
                const partTitles = media.parts ? media.parts.map(part => part.title) : ['Entire Media'];
                const selectedPart = media.currentPart || "Entire Media";
    
                listItem.innerHTML = `
                    ${getMediaEmoji(media.type)} <strong>${media.title}</strong> | ${media.year} | ${media.sensitivity}
                    <ul><li id="info-${index}">Blocking from ${selectedPart} onwards [<span class="edit-button" id="edit-${index}">Edit</span>]</li></ul>
                `;
                trackedMediaList.appendChild(listItem);
    
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.addEventListener('click', () => removeTrackedMedia(index));
                listItem.appendChild(removeButton);
    
                const editButton = document.getElementById(`edit-${index}`);
                if (editButton) {
                    editButton.addEventListener('click', () => {
                        const infoElement = document.getElementById(`info-${index}`);
                        infoElement.innerHTML = `
                            <select id="sensitivity-${index}">
                                <option value="No Spoilers">No Spoilers</option>
                                <option value="Story Beats/Mild Spoilers">Story Beats/Mild Spoilers</option>
                                <option value="Major Spoilers">Major Spoilers</option>
                            </select>
                            Blocking from
                            <select id="part-${index}">
                                ${partTitles.map(title => `<option value="${title}">${title}</option>`).join('')}
                            </select>
                            onwards
                            [<span class="save-button" id="save-${index}">Save</span>]
                        `;
                        
                        document.getElementById(`sensitivity-${index}`).value = media.sensitivity;
                        document.getElementById(`part-${index}`).value = selectedPart;
                        
                        const saveButton = document.getElementById(`save-${index}`);
                        saveButton.addEventListener('click', () => {
                            media.sensitivity = document.getElementById(`sensitivity-${index}`).value;
                            media.currentPart = document.getElementById(`part-${index}`).value;
                            
                            // Save the updated media list
                            chrome.storage.local.set({ trackedMedia: mediaList }, () => {
                                displayTrackedMedia();
                            });
                        });
                    });
                } else {
                    console.error(`Edit button with id edit-${index} not found`);
                }
            });
        });
    }
    

    document.querySelectorAll('.collapsible h2').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
        });
    });
});
