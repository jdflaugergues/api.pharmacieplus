/**
 * Fichier de routage opinion.js
 * Gestionnaire de route modulaire pour les API REST Pharmacie.
 * @type {*|exports|module.exports}
 */
const express = require('express'),
    _ = require('lodash'),
    router = express.Router(),
    AbstractDAOFactory = require('../../app/dao/abstractdaofactory'),
    Events = require('../../app/publishSubscribe/Events'),
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


// Route '/v1/pharmacies/id/opinions'
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

                // On publie le commentaire pour que les abonnés de la pharmacie soient notifiés
                Events.publish(pharmacieId, newOpinion.content);

                response.setHeader('Access-Control-Allow-Origin', '*');
                // On retourne l'URI et l'identifiant du nouvel avis de la pharmacie dans le header "Location" de la réponse.
                response.location(`${request.get('origin')}/v1/pharmacies/${pharmacieId}/opinions/${numAffected._id}`);
                // On retourne le code HTTP 201 pour indiquer que l'avis de la pharmacie est bien créé.
                response.status(201).json(numAffected);
            }
        });
    })


    // Recherche d'une collection d'avis d'une pharmacie
    .get((request, response, next) => {

        // Création des options à partir du range de la requête.
        let options = Tools.createRangeOptions(request, RANGE_DEFAULT);

        // Ajout dans les options, les paramètres de tri.
        options = Tools.createSortOptions(request, options);

        // Erreur si la paramètre range est incorrect.
        if (options.error) {
            handleError(response, options.error, options.error_description, 400);
        } else {

            // Préparation du paramètre fields de la requête pour une réponse partielle.
            let fields = Tools.createFieldsArg(request);

            opinionDAO.find({pharmacie: request.params.id}, fields, options, (err, result) => {
                if (err) {
                    handleError(response, 'find_opinion_failed', err.message);
                } else {
                    let docs = result.docs,
                    count = result.count,
                    statusCode = (docs.length === count) ? 200 : 206;

                    response.setHeader('Access-Control-Allow-Origin', '*');
                    response.setHeader('Content-Range', `${options.skip}-${options.skip + docs.length - 1}/${count}`);
                    response.setHeader('Accept-Range', `opinion ${RANGE_DEFAULT}`);

                    // On n'ajoute l'entête "Link" seulement sur les requêtes demandant une pagination.
                    if (request.query.range) {
                        let linkHttpHeader = Tools.createLinkHTTPHeader(request, options.skip, options.limit, parseInt(count, 10));
                        response.setHeader('Link', linkHttpHeader);
                    }

                    response.status(statusCode).json(docs);
                }
            });
        }
    });

module.exports = router;