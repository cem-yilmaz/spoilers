const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const server = require('../app');
const expect = chai.expect;

const Spoiler = require('../models/spoiler');
const spoiler = require('../models/spoiler');

chai.use(chaiHttp);

describe('Media', function() {
    let mediaId;  // will be used to store the ID of the created media document

    // Test for the successful creation of a media document
    it('should create a new media document', function(done) {
        const mediaData = {
            title: 'Test Media',
            type: 'Other',
            hasParts: true,
            parts: [{ title: 'Part 1' }, { title: 'Part 2' }] // part of media document
        };

        chai.request(server)
            .post('/media')
            .set('Accept', 'application/json')
            .send(mediaData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id');
                mediaId = res.body._id;
                done();
            });
    });

    // Test for the unsuccessful reading of a media document, due to invalid ID
    it('should return 404 Not Found for GETting an invalid ID', function(done) {
        chai.request(server)
            .get('/media/123456789012345678901234')
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(404);
                done();
            });
    });
    // Test for the successful reading of a media document
    it('should read an existing media document', function(done) {
        chai.request(server)
            .get(`/media/${mediaId}`)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id', mediaId);
                done();
            });
    });

    // Test for the successful update of a media document
    it('should update an existing media document', function(done) {
        const updatedData = {
            title: 'Updated Test Media',
            type: 'Other',
            hasParts: true,
            parts: [{ title: 'Updated Part 1' }, { title: 'Updated Part 2' }] // updated parts
        };

        chai.request(server)
            .put(`/media/${mediaId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('title', 'Updated Test Media');
                done();
            });
    });

    // Test for the successful deletion of parts from a media document
    it('should delete parts from an existing media document', function(done) {
        const updatedData = {
            title: 'Updated Test Media',
            type: 'Other',
            parts: []  // Empty array to delete all parts
        };

        chai.request(server)
            .put(`/media/${mediaId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body.parts).to.be.empty; // parts array should be empty
                done();
            });
    });

    // Tests for invalid POST requests
    it('should return 400 Bad Request if type field is missing', function(done) {
        const mediaData = {
            title: 'Test Media',
            parts: [{ title: 'Part 1' }, { title: 'Part 2' }]
        };
    
        chai.request(server)
            .post('/media')
            .set('Accept', 'application/json')
            .send(mediaData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('error', 'Invalid type');
                done();
            });
    });
    it('should return 400 Bad Request if type field has an invalid value', function(done) {
        const mediaData = {
            title: 'Test Media',
            type: 'InvalidType',
            parts: [{ title: 'Part 1' }, { title: 'Part 2' }]
        };
    
        chai.request(server)
            .post('/media')
            .set('Accept', 'application/json')
            .send(mediaData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('error', 'Invalid type');
                done();
            });
    });    
    it('should return 400 Bad Request if parts field has an invalid format', function(done) {
        const mediaData = {
            title: 'Test Media',
            type: 'Other',
            parts: 'InvalidPartsFormat'
        };
    
        chai.request(server)
            .post('/media')
            .set('Accept', 'application/json')
            .send(mediaData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('error', 'Invalid parts format');
                done();
            });
    });

    // Tests for invalid PUT requests
    it('should return 404 if media ID does not exist', function(done) {
        const updatedData = {
            title: 'Updated Test Media',
            type: 'Other',
            parts: [{ title: 'Updated Part 1' }, { title: 'Updated Part 2' }]
        };

        chai.request(server)
            .put('/media/123456789012345678901234')
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('error', 'Media not found');
                done();
            });
    });
    it('should return 400 for invalid type', function(done) {
        const updatedData = {
            title: 'Updated Test Media',
            type: 'InvalidType',
            hasParts: true,
            parts: [{ title: 'Updated Part 1' }, { title: 'Updated Part 2' }]
        };

        chai.request(server)
            .put(`/media/${mediaId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('error', 'Invalid type');
                done();
            });
    });
    it('should return 400 for invalid parts format', function(done) {
        const updatedData = {
            title: 'Updated Test Media',
            type: 'Other',
            parts: 'InvalidPartsFormat'
        };

        chai.request(server)
            .put(`/media/${mediaId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('error', 'Invalid parts format');
                done();
            });
    }); 

    // Test for invalid deletion of a media document
    it('should return 404 if media ID to delete does not exist', function(done) {
        chai.request(server)
            .delete('/media/123456789012345678901234')
            .end(function(err, res) {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('error', 'Media not found');
                done();
            });
    });
    // Test for the successful deletion of a media document
    it('should delete an existing media document', function(done) {
        chai.request(server)
            .delete(`/media/${mediaId}`)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });
});

describe('Media: stupid cascade delete', function() {
    let mediaId;

    beforeEach(function(done) {
        const mediaData = {
            title: 'Test Media',
            type: 'Other',
            hasParts: true,
            numParts: 2,
            parts: [{ title: 'Part 1' }, { title: 'Part 2' }] // part of media document
        };

        chai.request(server)
            .post('/media')
            .set('Accept', 'application/json')
            .send(mediaData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id');
                mediaId = res.body._id;
                console.info('Media HAS been created: ', res.body);
                done();
            });
    });

    it('should cascade delete all associated Spoilers when a media document is deleted', function(done) {
        // Create a new media document
        const mediaData = {
            title: 'Test Media',
            type: 'Other',
            hasParts: true,
            numParts: 2,
            parts: [{ title: 'Part 1' }, { title: 'Part 2' }] // part of media document
        };

        chai.request(server)
            .post('/media')
            .set('Accept', 'application/json')
            .send(mediaData)
            .end(function(err, res) {
                if (err) {
                    console.error('Error while making new media: ', err);
                } else {
                    console.info('No error while making new media: ', res.body);
                    console.info('res.status: ', res.status);
                }
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id');
                mediaId = res.body._id;

                // Double check we can get the media document back from the database
                chai.request(server)
                    .get(`/media/${mediaId}`)
                    .set('Accept', 'application/json')
                    .end(function(err, res) {
                        if (err) {
                            console.error('Error while getting media: ', err);
                        } else {
                            console.info(`Media with ID ${mediaId} successfully created: `, res.body);
                        }
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('_id', mediaId);
                    
                        // Create a new spoiler document
                        const spoilerData = {
                            intensity: 'No Spoilers',
                            reference: 'Test Spoiler Reference',
                            media: mediaId,
                        };

                        console.info('spoilerData: ', spoilerData);

                        chai.request(server)
                            .post('/spoilers')
                            .set('Accept', 'application/json')
                            .send(spoilerData)
                            .end(function(err, res) {
                                if (res.status === 200) {
                                    console.info('Successfully created spoiler: ', res.body);
                                } else {
                                    console.error(`Status ${res.status} while creating spoiler with MediaID ${mediaId}: `, res.body);
                                }
                                expect(res).to.have.status(200);
                                expect(res.body).to.be.an('object');
                                expect(res.body).to.have.property('_id');

                                // Delete the media document
                                chai.request(server)
                                    .delete(`/media/${mediaId}`)
                                    .end(function(err, res) {
                                        expect(res).to.have.status(200);

                                        // Check if the spoiler document was deleted
                                        Spoiler.findById(spoilerData._id)
                                            .then(spoiler => {
                                                expect(spoiler).to.be.null;
                                                done();
                                            })
                                            .catch(err => done(err));
                                    });
                            });
                    });
            });
    });

    it('should cascade delete all associated URLs that were associated with a Spoiler (associated to the media) when a media document is deleted', function(done) {
        // Create a new media document
        const mediaData = {
            title: 'Test Media',
            type: 'Other',
            hasParts: true,
            parts: [{ title: 'Part 1' }, { title: 'Part 2' }]
        };

        chai.request(server)
            .post('/media')
            .set('Accept', 'application/json')
            .send(mediaData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id');
                mediaId = res.body._id;

                // Create a new spoiler document
                const spoilerData = {
                    title: 'Test Spoiler',
                    intensity: 'No Spoilers',
                    reference: 'Test Spoiler Reference',
                    media: mediaId,
                };

                chai.request(server)
                    .post('/spoilers')
                    .set('Accept', 'application/json')
                    .send(spoilerData)
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('_id');
                        spoilerId = res.body._id;

                        // Create a new URL document
                        const urlData = {
                            video_id: '12345678901',
                            media: mediaId,
                            spoiler: spoilerId,
                            description: 'Test URL Description'
                        };

                        chai.request(server)
                            .post('/urls')
                            .set('Accept', 'application/json')
                            .send(urlData)
                            .end(function(err, res) {
                                expect(res).to.have.status(200);
                                expect(res.body).to.be.an('object');
                                expect(res.body).to.have.property('_id');

                                // Delete the media document
                                chai.request(server)
                                    .delete(`/media/${mediaId}`)
                                    .end(function(err, res) {
                                        expect(res).to.have.status(200);

                                        // Check if the URL document was deleted
                                        URL.findById(urlData._id)
                                            .then(url => {
                                                expect(url).to.be.null;
                                                done();
                                            })
                                            .catch(err => done(err));
                                    });
                            });
                    });
            });
    });
});

after(function(done) {
    // Close the database connection
    mongoose.connection.close()
        .then(() => done())
        .catch(err => done(err));
});