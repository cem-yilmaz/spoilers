const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');  // adjust the path based on your server file location
const expect = chai.expect;

chai.use(chaiHttp);

describe('Media', function() {
    let mediaId;  // will be used to store the ID of the created media document

    // Test for the successful creation of a media document
    it('should create a new media document', function(done) {
        const mediaData = {
            name: 'Test Media',
            description: 'Test Media Description',
            // add any other fields you need for your media document
        };

        chai.request(server)
            .post('/media')  // adjust the path based on your route for creating media
            .send(mediaData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id');
                mediaId = res.body._id;  // store the ID for use in other tests
                done();
            });
    });

    // Test for the successful reading of a media document
    it('should read an existing media document', function(done) {
        chai.request(server)
            .get(`/media/${mediaId}`)  // adjust the path based on your route for reading media
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
            // add any other fields you need for your media document
        };

        chai.request(server)
            .put(`/media/${mediaId}`)  // adjust the path based on your route for updating media
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', 'Updated Test Media');
                done();
            });
    });

    // Test for the successful deletion of a media document
    it('should delete an existing media document', function(done) {
        chai.request(server)
            .delete(`/media/${mediaId}`)  // adjust the path based on your route for deleting media
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });
});
