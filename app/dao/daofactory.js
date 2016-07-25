/**
 * Factory dans le pattern DAO qui sert à construire les instances d'objets d'accès aux données.
 * Cette factory implémente le pattern Factory.
 */

const PPConnection = require('../connection/PPConnection'),
      AbstractDAOFactory = require('./abstractdaofactory'),
      PharmacieDAO = require('./implement/pharmaciedao');

'use strict';

const conn = PPConnection.getInstance();

// Factory de type BDD étendant la classe abstraite AbstractDAOFactory
class DAOFactory extends AbstractDAOFactory {

    constructor(...args){
        super(...args);
    }

    // Retourne un objet Pharmacie interagissant avec la BDD
    getPharmacieDAO(){
        return new PharmacieDAO(conn);
    }
}

module.exports = DAOFactory;