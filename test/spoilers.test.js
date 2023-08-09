const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Spoilers', function() {
    let spoilerId;  // will be used to store the ID of the created spoiler document
    let mediaId;    // will be used to store the ID of the associated media document
    let partId;     // will be used to store the ID of the part associated with the spoiler document, from the media document

    // Spoilers need a media document to be associated with
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
    });

    // Tests for invalid POST requests
    it('should not create a new spoiler document with missing title', function(done) {
        const spoilerData = {
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            media: mediaId
        };

        chai.request(server)
            .post('/spoilers')
            .set('Accept', 'application/json')
            .send(spoilerData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not create a new spoiler document with missing intensity', function(done) {
        const spoilerData = {
            title: 'Test Spoiler',
            reference: 'Test Reference',
            media: mediaId
        };

        chai.request(server)
            .post('/spoilers')
            .set('Accept', 'application/json')
            .send(spoilerData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not create a new spoiler document with an invalid intensity', function(done) {
        const spoilerData = {
            title: 'Test Spoiler',
            intensity: 'Invalid Intensity',
            reference: 'Test Reference',
            media: mediaId
        };

        chai.request(server)
            .post('/spoilers')
            .set('Accept', 'application/json')
            .send(spoilerData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not create a new spoiler document with missing reference', function(done) {
        const spoilerData = {
            title: 'Test Spoiler',
            intensity: 'No Spoilers',
            media: mediaId
        };

        chai.request(server)
            .post('/spoilers')
            .set('Accept', 'application/json')
            .send(spoilerData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not create a new spoiler document without associating it with a media', function(done) {
        const spoilerData = {
            title: 'Test Spoiler',
            intensity: 'No Spoilers',
            reference: 'Test Reference'
        };

        chai.request(server)
            .post('/spoilers')
            .set('Accept', 'application/json')
            .send(spoilerData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not create a new spoiler document with an invalid media ID', function(done) {
        const spoilerData = {
            title: 'Test Spoiler',
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            media: 'Invalid Media ID'
        };

        chai.request(server)
            .post('/spoilers')
            .set('Accept', 'application/json')
            .send(spoilerData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not create a new spoiler document with an invalid part ID', function(done) {
        const spoilerData = {
            title: 'Test Spoiler',
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            media: mediaId,
            part: 'Invalid Part ID'
        };

        chai.request(server)
            .post('/spoilers')
            .set('Accept', 'application/json')
            .send(spoilerData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    
    // Test for the successful creation of a spoiler document, not associated with a part
    it('should create a new spoiler document with no part associtation', function(done) {
        const spoilerData = {
            title: 'Test Spoiler',
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            mediaId: mediaId
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
                done();
            });
    }); 
    
    // Test for the successful reading of a spoiler document, not associated with a part
    it('should read an existing spoiler document with no part associtation', function(done) {
        chai.request(server)
            .get(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id', spoilerId);
                done();
            });
    });

    // Tests for invalid PUT requests
    it('should not update an existing spoiler document with missing title', function(done) {
        const updatedData = {
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            media: mediaId
        };

        chai.request(server)
            .put(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not update an existing spoiler document with missing intensity', function(done) {
        const updatedData = {
            title: 'Updated Test Spoiler',
            reference: 'Test Reference',
            media: mediaId
        };

        chai.request(server)
            .put(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not update an existing spoiler document with missing reference', function(done) {
        const updatedData = {
            title: 'Updated Test Spoiler',
            intensity: 'No Spoilers',
            media: mediaId
        };

        chai.request(server)
            .put(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not update an existing spoiler document with a missing media association', function(done) {
        const updatedData = {
            title: 'Updated Test Spoiler',
            intensity: 'No Spoilers',
            reference: 'Test Reference'
        };

        chai.request(server)
            .put(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not update an existing spoiler document with an invalid media ID', function(done) {
        const updatedData = {
            title: 'Updated Test Spoiler',
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            media: 'Invalid Media ID'
        };

        chai.request(server)
            .put(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('should not update an existing spoiler document with an invalid part ID', function(done) {
        const updatedData = {
            title: 'Updated Test Spoiler',
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            media: mediaId,
            part: 'Invalid Part ID'
        };

        chai.request(server)
            .put(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    // Test for editing a spoiler document, not associated with a part
    it('should update an existing spoiler document with no part association', function(done) {
        const updatedData = {
            title: 'Updated Test Spoiler',
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            mediaId: mediaId
        };

        chai.request(server)
            .put(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('title', 'Updated Test Spoiler');
                done();
            });
    });

    // Test for deleting a spoiler document, not associated with a part
    it('should delete an existing spoiler document with no part association', function(done) {
        chai.request(server)
            .delete(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    // Test for the successful creation of a spoiler document, associated with a part
    it('should create a new spoiler document with a part associtation', function(done) {
        const spoilerData = {
            title: 'Test Spoiler with part attached',
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            mediaId: mediaId,
            part: partId
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
                done();
            });
    });

    // Test for the successful reading of a spoiler document, associated with a part
    it('should read an existing spoiler document with a part associtation', function(done) {
        chai.request(server)
            .get(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id', spoilerId);
                done();
            });
    });

    // Test for editing a spoiler document, associated with a part
    it('should update an existing spoiler document with a part associtation', function(done) {
        const updatedData = {
            title: 'Updated Test Spoiler with part attached',
            intensity: 'No Spoilers',
            reference: 'Test Reference',
            mediaId: mediaId,
            part: partId
        };

        chai.request(server)
            .put(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .send(updatedData)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('title', 'Updated Test Spoiler with part attached');
                done();
            });
    });

    // Test for deleting a spoiler document, associated with a part
    it('should delete an existing spoiler document with a part associtation', function(done) {
        chai.request(server)
            .delete(`/spoilers/${spoilerId}`)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    // Still necessary to delete the media document created for these tests

    after(async function() {
        const res = await chai.request(server)
            .delete(`/media/${mediaId}`)
            .set('Accept', 'application/json');
    });

});