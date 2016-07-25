const expect = require('chai').expect;
const assert = require('chai').assert;
const AbstractDAOFactory = require('../app/dao/abstractdaofactory');

describe('Classe abstraite DAO Factory', () => {

    it('Test Pharmacie DAO', () => {

        let adf = AbstractDAOFactory.getFactory(AbstractDAOFactory.DAO_FACTORY);
        let pharmacieDao = adf.getPharmacieDAO();

        let pharmacieData = {
            nofinesset: "010002354",
            rs: "PHARMACIE DE LA PLACE CLICHY",
            numvoie: "45",
            typvoie: "PLACE",
            voie: "CLICHY",
            cpville: "75007 PARIS",
            telephone: "174468146",
            fax: "174380624",
            coordxet: "882538.9",
            coordyet: "6542885.8"};

        pharmacieDao.update(pharmacieData, () => {
            pharmacieDao.find({coordxet: "882538.9"}, (results) => {
                console.log(results);
            });
        });
    });

});