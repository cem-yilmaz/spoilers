console.log("Background.js running!");

const serverURL = 'http://127.0.0.1:3000';

function fetchMediaList() {
    fetch(`${serverURL}/media`, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('Fetched Media:', data);
    })
    .catch((error) => {
        console.error('There was an error fetching the media:', error);
    });
}

fetchMediaList();