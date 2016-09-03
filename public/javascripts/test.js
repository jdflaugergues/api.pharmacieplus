chai.should();

describe('API REST Pharmacie', function() {

    var acceptRange,    // max
        contentRange;   // step


    describe('Récupération de pharmacie à partir de son id.', function() {

        it('Doit retourner une erreur 404 pour une ressource inconnue', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/999999',
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

        it('Doit retourner la pharmacie demandée.', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/040002370',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    jqXHR.should.exist,jqXHR.status.should.exist;
                    jqXHR.status.should.deep.equal(200);
                    done();
                });
        });
    });

    describe('Nombre maximum de pharmacies pouvant être requêtées en une seule fois', function() {
        it('Doit retourner dans l\'entête de réponse un "Accept-Range" correcT.', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var acceptRange = jqXHR.getResponseHeader('Accept-Range');
                    acceptRange.should.deep.equal('pharmacie 25');
                    done();
                });
        });

        it('Doit retourner dans l\entête de réponse un "Accept-Range" correct.', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies',
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

    describe('Pagination des pharmacies', function() {

        it('Doit retourner une erreur "range_bad_syntax"', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?range=blabla',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist, jqXHR.status.should.exist,jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('range_bad_syntax');
                    done();
                });
        });

        it('Doit retourner une erreur "bad_byte_range_resp_spec"', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?range=10-5',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist, jqXHR.status.should.exist,jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('bad_byte_range_resp_spec');
                    done();
                });
        });

        it('Doit retourner une erreur "range_bad_count"', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?range=0-25',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist, jqXHR.status.should.exist,jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('range_bad_count');
                    done();
                });
        });

        it('Doit retourner le bon nombre de pharmacie', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?range=1-3',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    jqXHR.should.exist,jqXHR.status.should.exist;
                    data.length.should.deep.equal(3);
                    done();
                });
        });

        it('Doit retourner dans le header un "Content-Range" correct.', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?range=1-3',
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

        it('Doit retourner un status code correct', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?range=1-3',
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

    describe('Liens de navigation', function() {

        it('Doit retourner les 4 liens dans le entête de réponse "Link"', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?fields=rs&range=5-7',
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

        it('Doit retourner un lien "first" correct', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?fields=rs&range=5-7',
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

        it('Doit retourner un lien "prev" correct', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?fields=rs&range=5-7',
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

        it('Doit retourner un lien "next" correct', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?fields=rs&range=5-7',
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

        it('Doit retourner un lien "last" correct', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?fields=rs&range=5-7',
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

    describe('Filtrage des pharmacies sur les attributs.', function() {

        it('Doit retourner seulement les ressources requêtées', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?fields=rs',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    jqXHR.should.exist, jqXHR.status.should.exist, jqXHR.responseJSON.should.exist;
                    chai.expect(data[0].rs).to.exist;
                    chai.expect(data[0].telephone).to.not.exist;
                    done();
                });
        });
    });

    describe('Tri du résultat', function() {
        it('Doit retourner les résultats par ordre croissant sur la raison sociale', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?fields=rs&sort=rs',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    jqXHR.should.exist, jqXHR.status.should.exist, jqXHR.responseJSON.should.exist;
                    chai.expect(data[0].rs <= data[1].rs).to.be.true;
                    done();
                });
        });

        it('Doit retourner les résultats par ordre décroissant sur la raison sociale', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies?fields=rs&sort=rs&desc=rs',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    jqXHR.should.exist, jqXHR.status.should.exist, jqXHR.responseJSON.should.exist;
                    chai.expect(data[0].rs >= data[1].rs).to.be.true;
                    done();
                });
        });
    });

    describe('Recherche des ressources', function() {

        it('Doit retourner que des codes postaux 38100', function(done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/search?cpville=38100*',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {

                    var ok = true;

                    data.forEach(function(pharmacie) {
                        ok = ok && /^38100/.test(pharmacie.cpville);
                    })

                    chai.expect(ok).to.be.true;
                    done();
                });
        })

        it('Doit retourner que des codes postaux terminant par 8100', function(done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/search?cpville=*8100*',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {

                    var ok = true;

                    data.forEach(function(pharmacie) {
                        ok = ok && /8100/.test(pharmacie.cpville);
                    })

                    chai.expect(ok).to.be.true;
                    done();
                });
        })
    });

    describe('Recherche des ressources géolocalisés', function() {
        it('Doit retourner une erreur si pas de coordonnées GPS', function(done) {
            $.ajax({
                url: document.location.origin + '/v1/pharmacies/locations',
                type: 'get'
            })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist;
                    jqXHR.status.should.exist;
                    jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('missing_location_arg_long');
                    done();
                });
        });

        it('Doit retourner une erreur si pas de coordonnées GPS (latitude)', function(done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/locations?long=45',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist;
                    jqXHR.status.should.exist;
                    jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('missing_location_arg_lat');
                    done();
                });
        });

        it('Doit retourner une erreur si pas coordonnées GPS mauvaise (longitude)', function(done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/locations?long=aaaa&lat=5',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist;
                    jqXHR.status.should.exist;
                    jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('bad_location_arg_long');
                    done();
                });
        });

        it('Doit retourner une erreur si pas coordonnées GPS mauvaise (latitude)', function(done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/locations?long=45&lat=aaaa',
                    type: 'get'
                })
                .always(function (jqXHR, textStatus, errorThrown) {
                    jqXHR.should.exist;
                    jqXHR.status.should.exist;
                    jqXHR.responseJSON.should.exist;
                    jqXHR.status.should.deep.equal(400);
                    jqXHR.responseJSON.error.should.deep.equal('bad_location_arg_lat');
                    done();
                });
        });

        it('Doit retourner la liste des pharmacies de la plus proche à la plus éloignée', function(done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/locations?long=5.731214&lat=45.166471',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    chai.expect(data[0].distance < data[1].distance).to.be.true;
                    done();
                });
        });

    });

    describe('Ajout d\'un commentaire', function() {
        it('Doit créer le commentaire associée à la pharmacie', function(done) {
            $.post({
                url: document.location.origin + '/v1/pharmacies/1234/opinions/',
                data: {rate: 4, name: 'Jonathan', content: 'Cette pharmacie est une bonne pharmacie.'}
            })
            .always(function (data, textStatus, jqXHR) {

                jqXHR.should.exist,jqXHR.status.should.exist;
                jqXHR.status.should.deep.equal(201);

                var location = jqXHR.getResponseHeader('Location');
                location.should.deep.match(/\/v1\/pharmacies\/1234\/opinions\//);

                done();
            });
        });
    });

    describe('Recherche d\'avis d\'une pharmacie', function() {
        it('Doit retourner dans l\'entête de réponse un "Accept-Range" correct.', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/1234/opinions/',
                    type: 'get',
                })
                .always(function (data, textStatus, jqXHR) {
                    var acceptRange = jqXHR.getResponseHeader('Accept-Range');
                    acceptRange.should.deep.equal('opinion 25');
                    done();
                });
        });

        it('Doit retourner dans l\entête de réponse un "Accept-Range" correct.', function (done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/1234/opinions/',
                    type: 'get'
                })
                .always(function (data, textStatus, jqXHR) {
                    var ar = jqXHR.getResponseHeader('Accept-Range');
                    ar.should.deep.match(/^opinion \d*$/);

                    acceptRange = ar.match(/\d*$/)[0];

                    done();
                });
        });
    });

    describe(`Test Publish/Subscribe`, function() {
        it(`Abonnement d'un utilisateur à plusieurs pharmacie`, function(done) {
            $.ajax({
                    url: document.location.origin + '/v1/subscribe?pharmacies=[1234,2345]&listener=subscriber1',
                    type: 'get'
                })
                .always(function (jqXHR) {
                    jqXHR.status.should.deep.equal(200);
                    done();
                });
        });

        it(`Désabonnement d'un utilisateur à plusieurs pharmacie`, function(done) {
            $.ajax({
                    url: document.location.origin + '/v1/unsubscribe?pharmacies=[1234,2345]&listener=subscriber1',
                    type: 'get'
                })
                .always(function (jqXHR) {
                    jqXHR.status.should.deep.equal(200);
                    done();
                });
        });
    })

    describe(`Test horaires d'ouverture`, function() {
        it(`Ajout d'une horaire à une pharmacie`, function(done) {
            $.ajax({
                    url: document.location.origin + '/v1/pharmacies/040002271',
                    data: {hours: {
                        mo: { amo: 480, amc:720, pmo: 840, pmc: 1140 },
                        tu: { amo: 480, amc:720, pmo: 840, pmc: 1140 },
                        we: { amo: 480, amc:720, pmo: 840, pmc: 1140 },
                        th: { amo: 480, amc:720, pmo: 840, pmc: 1140 },
                        fr: { amo: 480, amc:720, pmo: 840, pmc: 1140 },
                        sa: { amo: 480, amc:720, pmo: 840, pmc: 1140 },
                        su: { amo: 0, amc:0, pmo: 0, pmc: 0 }
                    }},
                    type: 'patch'
                })
                .always(function (data) {
                    console.log(data)
                    done();
                });
        });
    });


});