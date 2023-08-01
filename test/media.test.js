const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Media', function() {
    let mediaId;  // will be used to store the ID of the created media document

    // Test for the successful creation of a media document
    it('should create a new media document', function(done) {
        const mediaData = {
            name: 'Test Media',
            description: 'Test Media Description',
            parts: [{ title: 'Part 1' }, { title: 'Part 2' }] // part of media document
        };

        chai.request(server)
            .post('/media')
            .send(mediaData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id');
                mediaId = res.body._id;
                done();
            });
    });

    // Test for the successful reading of a media document
    it('should read an existing media document', function(done) {
        chai.request(server)
            .get(`/media/${mediaId}`)
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
            name: 'Updated Test Media',
            parts: [{ title: 'Updated Part 1' }, { title: 'Updated Part 2' }] // updated parts
        };

        chai.request(server)
            .put(`/media/${mediaId}`)
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', 'Updated Test Media');
                done();
            });
    });

    // Test for the successful deletion of parts from a media document
    it('should delete parts from an existing media document', function(done) {
        const updatedData = {
            name: 'Updated Test Media',
            parts: []  // Empty array to delete all parts
        };

        chai.request(server)
            .put(`/media/${mediaId}`)
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body.parts).to.be.empty; // parts array should be empty
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
