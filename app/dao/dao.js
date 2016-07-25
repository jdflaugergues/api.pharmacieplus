/**
 * Classe "abstraite" mettant en oeuvre les opérations CRUD (Create, Retrieve, Update, Delete)
 * vers la base de données.
 * Cette classe abstraite respecte le pattern DAO qui permet de faire le lien entre
 * la couche d'accès aux données et la couche métier.
 */

'use strict';

let connect; // Objet Connection Mongoose d'accès à la base de donnée MongoDB

// Classe abstraite DAO.
class DAO {

    constructor(conn) {

        connect = conn;

        // On lance une exception si on tente d'instancier directement cette classe,
        // afin de simuler l'abstraction de la classe DAO
        if (new.target === DAO) {
            throw new TypeError('Cannot construct DAO instances directly');
        }

        // Afin de simuler le concept de classe abstraite en JavaScript
        // On vérifie dans le constructeur que les méthodes de la classe
        // DAO sont bien implémentées.

        // Méthode de création
        if (typeof this.create !== 'function') {
            throw new TypeError('Must override method create');
        }

        // Méthode pour effacer
        if (typeof this.delete !== 'function') {
            throw new TypeError('Must override method delete');
        }

        // Méthode de mise à jour
        if (typeof this.update !== 'function') {
            throw new TypeError('Must override method update');
        }

        // Méthode de recherche d'information
        if (typeof this.find !== 'function') {
            throw new TypeError('Must override method find');
        }
    }
}

module.exports = DAO;