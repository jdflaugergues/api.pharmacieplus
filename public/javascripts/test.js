chai.should();

describe('REST API Pharmacie', function() {

    var acceptRange,    // max
        contentRange;   // step


    describe('GET by ID', function() {

        it('should get unknow pharmacie', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies/999999',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist;
                    jqXHR.status.should.exist;
                    jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(404);
                    jqXHR.responseJSON.error.should.deep.equal('find_pharmacie_failed');
                    done();
                });
        });

        it('should get know pharmacie', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies/1',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    jqXHR.should.exist,jqXHR.status.should.exist;
                    jqXHR.status.should.deep.equal(200);
                    done();
                });
        });
    });

    describe('Accept-Range Header', function() {
        it('should return correct Accept-Range', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var acceptRange = jqXHR.getResponseHeader('Accept-Range');
                    acceptRange.should.deep.equal('pharmacie 25');
                    done();
                });
        });

        it('should return correct Accept-Range', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var ar = jqXHR.getResponseHeader('Accept-Range');
                    ar.should.deep.match(/^pharmacie \d*$/);

                    acceptRange = ar.match(/\d*$/)[0];

                    done();
                });
        });
    });

    describe('Range parameter', function() {

        it('should range_bad_syntax error', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?range=blabla',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist, jqXHR.status.should.exist,jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('range_bad_syntax');
                    done();
                });
        });

        it('should bad_byte_range_resp_spec error', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?range=10-5',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist, jqXHR.status.should.exist,jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('bad_byte_range_resp_spec');
                    done();
                });
        });

        it('should range_bad_count error', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?range=0-25',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist, jqXHR.status.should.exist,jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('range_bad_count');
                    done();
                });
        });

        it('should return count pharmacie error', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?range=1-3',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    jqXHR.should.exist,jqXHR.status.should.exist;
                    data.length.should.deep.equal(3);
                    done();
                });
        });

        it('should return correct Content-Range', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?range=1-3',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var cr = jqXHR.getResponseHeader('Content-Range');
                    cr.should.deep.match(/^\d*-\d*\/\d*$/);
                    cr.should.deep.match(/^1-3\/\d*$/);
                    contentRange = cr.match(/\d*$/)[0];
                    console.log(contentRange);
                    done();
                });
        });

        it('should return Status Code', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?range=1-3',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var contentRange = jqXHR.getResponseHeader('Content-Range');
                    contentRange.should.deep.match(/^\d*-\d*\/\d*$/);
                    contentRange.should.deep.match(/^1-3\/\d*$/);

                    var instanceLength = contentRange.split('/')[1];
                    var statusCodeExpected = (instanceLength === data.length) ? 200 : 206;

                    jqXHR.status.should.deep.equal(statusCodeExpected);

                    done();
                });
        });
    });

    describe('Link Header Response', function() {

        it('should return 4 links in Link header', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?fields=rs&range=5-7',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var link = jqXHR.getResponseHeader('Link');

                    link.should.contain('; rel="first"');
                    link.should.contain('; rel="prev"');
                    link.should.contain('; rel="next"');
                    link.should.contain('; rel="last"');
                    done();
                });
        });

        it('should return good first Link', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?fields=rs&range=5-7',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var link = jqXHR.getResponseHeader('Link');
                    var currentRange = link.match(/range=\d*-\d*>; rel="first"/)[0].match(/\d*-\d*/)[0].split(/-/);

                    parseInt(currentRange[0], 10).should.equal(0);

                    if (contentRange > 3)
                        parseInt(currentRange[1], 10).should.equal(2);
                    else
                        parseInt(currentRange[1], 10).should.equal(contentRange - 1);

                    done();
                });
        });

        it('should return good prev Link', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?fields=rs&range=5-7',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var link = jqXHR.getResponseHeader('Link');
                    var currentRange = link.match(/range=\d*-\d*>; rel="prev"/)[0].match(/\d*-\d*/)[0].split(/-/);

                    parseInt(currentRange[0], 10).should.equal(2);
                    parseInt(currentRange[1], 10).should.equal(4);

                    done();
                });
        });

        it('should return good next Link', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?fields=rs&range=5-7',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var link = jqXHR.getResponseHeader('Link');
                    var currentRange = link.match(/range=\d*-\d*>; rel="next"/)[0].match(/\d*-\d*/)[0].split(/-/);

                    parseInt(currentRange[0], 10).should.equal(8);

                    if (contentRange > 10)
                        parseInt(currentRange[1], 10).should.equal(10);
                    else
                        parseInt(currentRange[1], 10).should.equal(contentRange - 1);

                    done();
                });
        });

        it('should return good last Link', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?fields=rs&range=5-7',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var link = jqXHR.getResponseHeader('Link');
                    var currentRange = link.match(/range=\d*-\d*>; rel="last"/)[0].match(/\d*-\d*/)[0].split(/-/);

                    parseInt(currentRange[0], 10).should.equal(contentRange - 3);
                    parseInt(currentRange[1], 10).should.equal(contentRange - 1);

                    done();
                });
        });

    });

    describe('fields parameter', function() {

        it('should range_bad_syntax error', function (done) {
            $.ajax({
                    url: 'http://localhost:3000/v1/pharmacies?fields=rs',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    //jqXHR.should.exist, jqXHR.status.should.exist, jqXHR.responseJSON.should.exist;
                    //jqXHR.status.should.deep.equal(400);
                    //jqXHR.responseJSON.error.should.deep.equal('range_bad_syntax');
                    done();
                });
        });
    });

    describe('Filtering request HTTP', function() {

    });

    describe('Sorting request HTTP', function() {


    });
});