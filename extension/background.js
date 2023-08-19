console.log("Background.js running!");

const serverURL = 'http://127.0.0.1:3000';

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'searchMedia') {
        fetchMediaList(message.query)
        .then((data) => {
            sendResponse(data);
        });
        // This line is necessary to make sendResponse work asynchronously
        return true;
    }
});
