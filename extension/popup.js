document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded!'); // DEBUG
    const trackedMediaList = document.getElementById('trackedMediaList');
    const clearAllButton = document.getElementById('clearAll');
	const newMediaInput = document.getElementById('newMedia');
	const addMediaButton = document.getElementById('addMediaButton');

	const mediaSearchInput = document.getElementById('mediaSearch');
	const mediaResultsDiv = document.getElementById('mediaResults');

	function searchMedia() {
		const query = mediaSearchInput.value;
		chrome.runtime.sendMessage({ action: 'searchMedia', query: query }, (response) => {
			renderMediaResults(response);
		});
	}

	function renderMediaResults(mediaList) {
		mediaResultsDiv.innerHTML = '';
		mediaList.slice(0, 5).forEach(media => {
			const mediaItem = document.createElement('div');
			// switch statement to determine media type emoji
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
	

	// Update filtered media
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.action === "searchMedia") {
			const query = request.query.toLowerCase();
			const filteredMedia = mediaList.filter(media => media.title.toLowerCase().includes(query));
			sendResponse(filteredMedia);
		}
	});
	  
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

	// Function to add tracked media
	function addTrackedMedia(mediaTitle) {
		if (mediaTitle) { // If media is not empty
			chrome.storage.local.get(['trackedMedia'], (result) => {
				const mediaList = result.trackedMedia || [];
				mediaList.push(mediaTitle);
				chrome.storage.local.set({ trackedMedia: mediaList }, () => {
					displayTrackedMedia(); // Refresh display
				});
			});
		}
	}
	
  
    // Clear all tracked media
    clearAllButton.addEventListener('click', () => {
		chrome.storage.local.set({ trackedMedia: [] }, () => {
			displayTrackedMedia();
		});
    });

	// Add new tracked media
	addMediaButton.addEventListener('click', addTrackedMedia);
  
    // Initialize tracked media if empty
    chrome.storage.local.get(['trackedMedia'], (result) => {
        console.log('Initial get result:', result); // DEBUG
            if (!result.trackedMedia || result.trackedMedia.length === 0) {
                console.log('Setting Example Media'); // DEBUG
                chrome.storage.local.set({ trackedMedia: ["Example Media"] }, () => {
					console.log('Example Media Set'); // DEBUG
                    displayTrackedMedia();
            });
        } else {
			console.log('Displaying Existing Media'); // DEBUG
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