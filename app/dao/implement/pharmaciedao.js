/**
 * Classe PharmacieDAO qui étend la classe abstraite DAO afin d'implémenter toute les méthodes CRUD d'accès aux données.
 */

const DAO = require('../dao'),
      Pharmacie = require('../../model/pharmacie'),
      debug = require('debug')('pharmacieplus:pharmaciedao');

'use strict';

// Classe PharmacieDAO
class PharmacieDAO extends DAO {

    constructor(...args){
        super(...args);
    }

     // Ajoute la pharmacie dans la base de données.
     // @param {Object} pharmacieData Objet JSON contenant les données de la pharmacie
    create(pharmacieData, callback){
        let pharmacie = new Pharmacie(pharmacieData);
        pharmacie.save(callback);
    }

    // Met à jour la pharmacie dans la base de données.
    // @param {Object} pharmacieData Objet JSON contenant les données de la pharmacie
    update(pharmacieData, options, callback){

        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        let conditions = { _id: pharmacieData._id }  // On matche sur le numéro d'établissement

        Pharmacie.update(conditions, pharmacieData, options, callback);
    }

    // Supprime la pharmacie de la base de données.
    // @param {Object} pharmacieData Objet JSON contenant les données de la pharmacie
    delete(pharmacieData, callback){
        let conditions = { nofinesset: pharmacieData.nofinesset };  // On matche sur le numéro d'établissement

        Pharmacie.remove(conditions, callback);
    }

    // Recherche une pharmacie à partir de critères de recherche dans la base de données.
    find(query, fields, options, callback){
        //mongoose.Types.ObjectId()

        if (typeof fields === 'function') {
            callback = fields;
            fields = '';
            options = {};
        } else if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        // Requête pour compter le nombre total d'éléments sans la prise en compte du range pour former le Content-Range
        Pharmacie.count(query, function(err, count) {
            // Requête pour récupérer les données avec la prise en compte du range
            Pharmacie.find(query, fields, options, function(err, docs) {
                // Consolidation des données du callback contenant la collection et le nombre toral
                callback(err, {
                    count: count,
                    docs: docs
                });
            });
        });
    }
}

module.exports = PharmacieDAO;