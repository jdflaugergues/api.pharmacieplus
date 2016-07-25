/**
 * Classe abstraite ayant les méthodes permettant de récupérer les différents DAO.
 * Et une méthode permettant d'instancier la bonne fabrique.
 * Cette classe abstraite implémente le pattern Factory.
 * Chaque type de Factory (XML, BDD, FS, ...) étendera cette classe abstraite.
 */

'use strict';

// Classe abstraite AbstractDAOFactory
class AbstractDAOFactory {

    constructor() {

        // On lance une exception si on tente d'instancier directement cette classe,
        // afin de simuler l'abstraction de la classe AbstractDAOFactory
        if (new.target === AbstractDAOFactory) {
            throw new TypeError('Cannot construct AbstractDAOFactory instances directly');
        }

        // Afin de simuler le concept de classe abstraite en JavaScript
        // On vérifie dans le constructeur que les méthodes de la classe
        // AbstractDAOFactory sont bien implémentées.

        // Méthode de récupération de l'objet PharmacieDAO
        if (typeof this.getPharmacieDAO !== 'function') {
            throw new TypeError('Must override method getPharmacieDAO');
        }
    }

    //Méthode permettant de récupérer les Factory
    // @params {number} type Type de la factory (0: DAO; 1: XMLDao, ...)
    static getFactory(type) {
        switch (type) {
            case AbstractDAOFactory.DAO_FACTORY:
                const DAOFactory = require('./daofactory');
                return new DAOFactory();

            // A décommenter pour une utilisation d'une factory XML
            // + implémenter la classe xmldaofactory
            //case AbstractDAOFactory.XML_DAO_FACTORY:
            //    const XmlDAOFactory = require('./xmldaofactory');
            //    return new XMLDAOFactory();
            default:
                return null;
        }
    }
}

AbstractDAOFactory.DAO_FACTORY = 0;
//AbstractDAOFactory.XML_DAO_FACTORY = 1; // A décommenter pour une utilisation d'une factory XML

module.exports = AbstractDAOFactory;
