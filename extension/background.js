console.log("Background.js running!");

const serverURL = 'http://127.0.0.1:3000';

function fetchMediaList() {
    fetch(`${serverURL}/media`, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then((response) => response.text()) // Change this line to get the response as text
    .then((text) => {
        // Log the response text to understand what is being returned
        console.log('Response text:', text);
    })
    .catch((error) => {
        console.error('There was an error fetching the media:', error);
    });
}

fetchMediaList();