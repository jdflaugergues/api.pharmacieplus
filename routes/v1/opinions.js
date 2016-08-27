/**
 * Fichier de routage opinion.js
 * Gestionnaire de route modulaire pour les API REST Pharmacie.
 * @type {*|exports|module.exports}
 */
const express = require('express'),
    _ = require('lodash'),
    router = express.Router(),
    AbstractDAOFactory = require('../../app/dao/abstractdaofactory'),
    Tools = require('./tools'),
    debug = require('debug')('pharmacieplus:opinions:API:REST');

const adf = AbstractDAOFactory.getFactory(AbstractDAOFactory.DAO_FACTORY);
const opinionDAO = adf.getOpinionDAO();

const RANGE_DEFAULT = 25;

// Generic error handler used by all endpoints.
function handleError(res, error, error_description, code) {
    debug(`ERROR : ${error_description}`);
    res.status(code || 500).json({
        'error': error,
        'error_description': error_description
    });
}

// Chargement d'une fonction middleware spécifique à ce routeur.
router.use(function timeLog(req, res, next) {
    debug(`Time: ${Date.now()}`);
    next();
});


// Route '/v1/pharmacies/id/'
router.route('/pharmacies/:id/opinions/')

    // Création d'un avis d'une pharmacie avec génération automatique de l'id.
    .post((request, response, next) => {
        let newOpinion = request.body,
            pharmacieId = request.params.id;

        newOpinion.createdDate = new Date();
        newOpinion.pharmacie = pharmacieId;

        opinionDAO.create(newOpinion, (err, numAffected) => {
            if (err) {
                handleError(response, 'create_opinion_failed', err.message);
            } else {
                debug(numAffected);
                response.setHeader('Access-Control-Allow-Origin', '*');
                // On retourne l'URI et l'identifiant du nouvel avis de la pharmacie dans le header "Location" de la réponse.
                response.location(`${request.get('origin')}/v1/pharmacies/${pharmacieId}/opinions/${numAffected._id}`);
                // On retourne le code HTTP 201 pour indiquer que l'avis de la pharmacie est bien créé.
                response.status(201).json(numAffected);
            }
    });
});


module.exports = router;