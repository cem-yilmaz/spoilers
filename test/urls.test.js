const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const expect = chai.expect;

chai.use(chaiHttp);



describe('URLs', function() {
    let mediaId;    // will be used to store the ID of the associated media document
    let partId;     // will be used to store the ID of the part associated with the spoiler document, from the media document
    let spoilerId;  // will be used to store the ID of the created spoiler document
    let urlId;      // will be used to store the ID of the created URL document

    // We first create the media document, then the spoiler document that the URL will be attached to
    before(async function() {
        const mediaData = {
            title: 'Test Media',
            type: 'Other',
            parts: [{ title: 'Part 1' }, { title: 'Part 2' }]
        };

        let res = await chai.request(server)
            .post('/media')
            .set('Accept', 'application/json')
            .send(mediaData);

        mediaId = res.body._id;

        res = await chai.request(server)
            .get(`/media/${mediaId}`)
            .set('Accept', 'application/json');

        partId = res.body.parts[0]._id;

        const spoilerData = {
            title: 'Test Spoiler',
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            mediaId: mediaId
        };

        res = await chai.request(server)
            .post('/spoilers')
            .set('Accept', 'application/json')
            .send(spoilerData);

        spoilerId = res.body._id;

        if (mediaId && partId && spoilerId) {
            console.log('Media, part, and spoiler documents created successfully.');
        }
    });

    // Tests for invalid POST requests
    it('should fail to create a new URL document with missing fields', function(done) {
        const urlData = {
          media: mediaId,
          spoiler: spoilerId,
          description: 'Test URL'
        };
      
        chai.request(server)
          .post('/urls')
          .set('Accept', 'application/json')
          .send(urlData)
          .end(function(err, res) {
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message', 'Validation failed');
            expect(res.body.errors).to.have.property('url');
            done();
          });
    });
    it('should fail to create a new URL document with invalid media ID', function(done) {
        const urlData = {
          url: 'https://www.testurl.com',
          media: 'invalid-media-id',
          spoiler: spoilerId,
          description: 'Test URL'
        };
      
        chai.request(server)
          .post('/urls')
          .set('Accept', 'application/json')
          .send(urlData)
          .end(function(err, res) {
            expect(res).to.have.status(400); // or other appropriate error code
            done();
          });
    });
    it('should fail to create a new URL document with invalid spoiler ID', function(done) {
        const urlData = {
            url: 'https://www.testurl.com',
            media: mediaId,
            spoiler: 'invalid-spoiler-id',
            description: 'Test URL'
        };
        
        chai.request(server)
            .post('/urls')
            .set('Accept', 'application/json')
            .send(urlData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    // Test for the successful creation of a URL document
    it('should create a new URL document', function(done) {
        const urlData = {
            url: 'https://www.testurl.com',
            media: mediaId,
            spoiler: spoilerId,
            description: 'Test URL'
        };

        chai.request(server)
            .post('/urls')
            .set('Accept', 'application/json')
            .send(urlData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id');
                urlId = res.body._id;
                done();
            });
    });

    // Test for invalid GET request
    it('should return 404 when GETting a non-existent URL', function(done) {
        chai.request(server)
          .get('/urls/nonexistentid')
          .set('Accept', 'application/json')
          .end(function(err, res) {
            expect(res).to.have.status(404);
            done();
          });
    });

    // Test for the successful reading of a URL document
    it('should read an existing URL document', function(done) {
        chai.request(server)
            .get(`/urls/${urlId}`)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id', urlId);
                done();
            });
    });

    // Test for invalid PUT request
    it('should return 404 when updating a non-existent URL', function(done) {
        const updatedData = {
          url: 'https://www.updatedurl.com',
          media: mediaId,
          spoiler: spoilerId,
          description: 'Updated URL'
        };
      
        chai.request(server)
          .put('/urls/nonexistentid')
          .set('Accept', 'application/json')
          .send(updatedData)
          .end(function(err, res) {
            expect(res).to.have.status(404);
            done();
          });
    });

    // Test for editing a URL document
    it('should update an existing URL document', function(done) {
        const updatedData = {
            url: 'https://www.updatedurl.com',
            media: mediaId,
            spoiler: spoilerId,
            description: 'Updated URL'
        };

        chai.request(server)
            .put(`/urls/${urlId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(200);

                // Make a request to the API to check if the updated data was stored correctly
                chai.request(server)
                    .get(`/urls/${urlId}`)
                    .set('Accept', 'application/json')
                    .end(function(err, res) {
                        expect(res.body).to.have.property('url', updatedData.url);
                        expect(res.body).to.have.property('description', updatedData.description);
                        done();
                    });
            });
    });

    // Test for invalid DELETE request
    it('should return 404 when deleting a non-existent URL', function(done) {
        chai.request(server)
            .delete('/urls/nonexistentid')
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(404);
                done();
            });
    });

    // Test for deleting a URL document
    it('should delete an existing URL document', function(done) {
        chai.request(server)
            .delete(`/urls/${urlId}`)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    // We delete the media document and the associated spoiler document after the tests are done
    after(async function() {
        let res = await chai.request(server)
            .delete(`/media/${mediaId}`)
            .set('Accept', 'application/json');

        res = await chai.request(server)
            .delete(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json');
    });
});