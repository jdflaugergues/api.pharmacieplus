const expect = require('chai').expect;
const assert = require('chai').assert;
const PPConnection = require('../app/connection/PPConnection');
const PharmacieDAO = require('../app/dao/implement/pharmaciedao');

describe('Classe Pharmacie DAO', () => {

    let pharmacieDao = new PharmacieDAO(PPConnection.getInstance());

    let pharmacieData = {
        nofinesset: "test-010002350",
        rs: "PHARMACIE GUSTIN J-J.& GUSTIN M-CH.",
        numvoie: "68",
        typvoie: "AV",
        voie: "ROGER SALENGRO",
        cpville: "01500 AMBRIEU EN BUGEY",
        telephone: "474468146",
        fax: "474380624",
        coordxet: "882538.9",
        coordyet: "6542885.8"};

    it('Insertion pharmacie', () => {

        pharmacieDao.create(pharmacieData);
    });

    it('Updated pharmacie', () => {

        pharmacieDao.update(pharmacieData);
    });

    it('find pharmacie', () => {

        pharmacieDao.find({nofinesset: "010002350"});
    });

    it('Removed pharmacie', () => {

        pharmacieDao.remove(pharmacieData);
    });

});