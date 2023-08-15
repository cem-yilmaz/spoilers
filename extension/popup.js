document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded!'); // DEBUG
    const trackedMediaList = document.getElementById('trackedMediaList');
    const clearAllButton = document.getElementById('clearAll');
  
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