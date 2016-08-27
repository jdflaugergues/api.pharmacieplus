/**
 * Classe OpinionDAO qui étend la classe abstraite DAO afin d'implémenter toute les méthodes CRUD d'accès aux données.
 */

const DAO = require('../dao'),
    Opinion = require('../../model/opinion'),
    debug = require('debug')('pharmacieplus:opiniondao');

'use strict';

// Classe OpinionDAO
class OpinionDAO extends DAO {

    constructor(...args){
    super(...args);
}

// Ajoute l'avis de la pharmacie dans la base de données.
// @param {Object} opinionData Objet JSON contenant les données de l'avis de la pharmacie
create(opinionData, callback){
    let opinion = new Opinion(opinionData);
    opinion.save(callback);
}

// Met à jour l'avis de la pharmacie dans la base de données.
// @param {Object} opinionData Objet JSON contenant les données de l'avis de la pharmacie
update(opinionData, options, callback){

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    let conditions = { _id: opinionData._id }  // On matche sur l'id de l'avis

    Opinion.update(conditions, opinionData, options, callback);
}

// Supprime l'avis de la pharmacie de la base de données.
// @param {Object} opinionData Objet JSON contenant les données de l'avis de la pharmacie
delete(opinionData, callback){
    let conditions = { _id: opinionData._id };  // On matche sur l'id

    Opinion.remove(conditions, callback);
}

// Recherche les avis d'une pharmacie à partir de critères de recherche dans la base de données.
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
    Opinion.count(query, function(err, count) {
        // Requête pour récupérer les données avec la prise en compte du range
        Opinion.find(query, fields, options, function(err, docs) {
            // Consolidation des données du callback contenant la collection et le nombre toral
            callback(err, {
                count: count,
                docs: docs
            });
        });
    });
}
}

module.exports = OpinionDAO;