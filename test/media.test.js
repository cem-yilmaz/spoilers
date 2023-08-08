const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const server = require('../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Media', function() {
    let mediaId;  // will be used to store the ID of the created media document

    // Test for the successful creation of a media document
    it('should create a new media document', function(done) {
        const mediaData = {
            title: 'Test Media',
            type: 'Other',
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

after(function(done) {
    // Close the database connection
    mongoose.connection.close()
        .then(() => done())
        .catch(err => done(err));
});