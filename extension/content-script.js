console.log('content-script.js locked and loaded!'); //DEBUG

function checkForSpoilers() {
    const videoLinks = document.querySelectorAll("a.ytd-thumbnail");
  
    // Get global filtered URLs from background.js
    chrome.runtime.sendMessage({ action: 'getFilteredUrls' }, (filteredUrls) => {
      videoLinks.forEach((linkElement) => {
        const videoUrl = linkElement.href;
    
        if (filteredUrls.includes(videoUrl)) {
          const titleElement = linkElement.querySelector('#video-title');
    
          // Update the title to "SpoilerBlocked"
          if (titleElement) {
            titleElement.textContent = "SpoilerBlocked";
          }
        }
      });
    });
  }
  
  // Run the check when the script is injected
  checkForSpoilers();
  
  // Run the check on dynamic page updates
  const targetNode = document.getElementById('content');
  const config = { childList: true, subtree: true };
  
  const observer = new MutationObserver(() => {
    checkForSpoilers();
  });
  
  observer.observe(targetNode, config);
  