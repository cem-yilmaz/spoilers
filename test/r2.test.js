const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const server = require('../app');
const spoiler = require('../models/spoiler');
const expect = chai.expect;
const assert = require('assert');

const mediaTypes = ['Video Game', 'TV Show', 'Film', 'Book', 'Sporting Event', 'Other'];
const spoilerIntensities = ['No Spoilers', 'Story Beats/Mild Spoilers', 'Major Spoilers'];
const years = [2018, 2019, 2020]; // Sample years 
const parts = ['Part 1', 'Part 2']; // & sample parts for simplicity during testing

const generateMockData = () => {
    const mediaData = [];
    const spoilerData = [];
    const urlData = [];

    // Populating all possible media
    mediaTypes.forEach(mediaType => {
        years.forEach(year => {
            mediaData.push({ title: `${mediaType} | ${year}`}, mediaType, year, parts);
        });
    });

    // Populating all possible spoilers
    mediaData.forEach(media => {
        spoilerIntensities.forEach(intensity => {
            parts.forEach(part => {
                const spoiler = {
                    title: `${media.title} | Spoiler: ${intensity}`,
                    intensity,
                    media,
                    part
                };
                spoilerData.push(spoiler);
            });
        });
    });

    // Populating all URLs
    spoilerData.forEach(spoiler => {
        const url = {
            video_id: Math.random().toString(36).substring(2, 11), // random youtube id
            media: spoiler.media,
            spoiler
        };
        urlData.push(url);
    });

    return { mediaData, spoilerData, urlData };
};

const { mediaData, spoilerData, urlData } = generateMockData();

function generateTestData() {
    const testData = [];
    mediaData.forEach(media => {
        const trackedMedia = {
            title: media.title,
            sensitivity: spoilerIntensities[Math.floor(Math.random() * spoilerIntensities.length)], // Choose random intensity
            currentPart: parts[Math.floor(Math.random() * parts.length)] // Choose random part
        };
        testData.push({
            trackedMedia, 
            expectedReturnedURLs: urlData
                .filter(url => 
                    url.media === media && 
                    spoilerIntensities.indexOf(url.spoiler.intensity) <= spoilerIntensities.indexOf(trackedMedia.sensitivity))
        });
    });
    return testData;
}

function simulateExtensionQuery(trackedMedia) {
    // This function simulates the actual logic contained in background.js
    let filteredUrls = [];

    spoilerData.forEach(spoiler => {
        if (spoiler.media.title === trackedMedia.title) {
            // Sensitivity filter
            if (spoilerIntensities.indexOf(spoiler.intensity) <= spoilerIntensities.indexOf(trackedMedia.sensitivity)) {
                // Part filter
                const fromPartIndex = parts.findIndex(part => part === trackedMedia.currentPart);
                const spoilerPartIndex = parts.findIndex(part => part === spoiler.part);
                if (fromPartIndex <= spoilerPartIndex) {
                    // Add URLs
                    filteredUrls.push(...urlData.filter(url => url.spoiler === spoiler).map(url => url.video_id));
                }
            }
        }
    });
    return filteredUrls;
}

function validateResponse(queryResult, testCase) {
    assert.deepEqual(queryResult.sort(), testCase.expectedReturnedURLs.map(url => url.video_id).sort());
}

//Actual test suite
describe('Extension Query Formulation Combinatorial Tests', function() {
    it('should correctly handle all combinations of media, spoilers, and URLs', function() {
        const testData = generateTestData();

        testData.forEach(testCase => {
            const queryResult = simulateExtensionQuery(testCase.trackedMedia);
            validateResponse(queryResult, testCase);
        });
    })
})