/**
 * Fichier de routeage pharmacie.js
 * Gestionnaire de route modulaire pour les API REST Pharmacie.
 * @type {*|exports|module.exports}
 */
const express = require('express'),
      _ = require('lodash'),
      router = express.Router(),
      AbstractDAOFactory = require('../../app/dao/abstractdaofactory'),
      Tools = require('./tools'),
      debug = require('debug')('pharmacieplus:pharmacies:API:REST');

const adf = AbstractDAOFactory.getFactory(AbstractDAOFactory.DAO_FACTORY);
const pharmacieDao = adf.getPharmacieDAO();

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



// Définition des routes

// Route '/v1/pharmacies'
router.route('/')

// Recherche d'une collection de pharmacies
.get((request, response, next) => {

    // Création des options à partir du range de la requête.
    let options = Tools.createRangeOptions(request, RANGE_DEFAULT);

    // Erreur si la paramètre range est incorrect.
    if (options.error) {
        handleError(response, options.error, options.error_description, 400);
    } else {

        // Préparation du paramètre fields de la requête pour une réponse partielle.
        let fields = Tools.createFieldsArg(request);

        pharmacieDao.find({}, fields, options, (err, result) => {
            if (err) {
                handleError(response, 'find_pharmacie_failed', err.message);
            } else {
                let docs = result.docs,
                    count = result.count;
                    statusCode = (docs.length === count) ? 200 : 206 ;

                response.setHeader('Content-Range', `${options.skip}-${options.skip + docs.length - 1}/${count}`);
                response.setHeader('Accept-Range', `pharmacie ${RANGE_DEFAULT}`);

                // On n'ajoute l'entête "Link" seulement sur les requêtes demandant une pagination.
                if (request.query.range) {
                    let linkHttpHeader = Tools.createLinkHTTPHeader(request, options.skip, options.limit, parseInt(count, 10));
                    response.setHeader('Link', linkHttpHeader);
                }

                response.status(statusCode).json(docs);
            }
        });
    }
})

// Création d'une pharmacie avec génération automatique de l'id.
.post((request, response, next) => {
    let newPharmacie = request.body;
    newPharmacie.createdDate = new Date();

    pharmacieDao.update(newPharmacie, (err, numAffected) => {
        if (err) {
            handleError(response, 'create_pharmacie_failed', err.message);
        } else {
            // On retourne l'URI et l'identifiant de la nouvelle pharmacie dans le header "Location" de la réponse.
            response.location(`${request.get('origin')}/v1/pharmacies/${numAffected.upserted[0]._id}`);
            // On retourne le code HTTP 201 pour indiquer que la pharmacie est bien créée.
            response.status(201).json(numAffected);
        }
    });
});


// Route '/v1/pharmacies/:id'
router.route('/:id')

// Recherche d'une pharmacie à partir de son id.
.get((request, response, next) => {

    // Préparation du paramètre fields de la requête pour une réponse partielle.
    let fields = Tools.createFieldsArg(request);

    pharmacieDao.find({ _id: request.params.id }, fields, (err, result) => {
        if (err) {
            handleError(response, 'find_pharmacie_failed', err.message);
        } else {
            var doc = result.docs;
            // La pharmacie avec cet id n'existe pas, on génère une erreur 404
            if (doc.length === 0) {
                handleError(response, 'find_pharmacie_failed', `La pharmacie d'id ${request.params.id} n'existe pas`, 404);
                return;
            }

            // On retourne la pharmacie avec un HTTP Status Code 200.
            response.status(200).json(doc[0]);
        }
    });
})

// Création ou Mise à jour d'une pharmacie par id.
.put((request, response, next) => {
    var pharmacie = _.extend(request.body, {_id: request.params.id});

    //TODO: Sur un update, supprimer les champs de la pharmacie qui ne sont pas renseignées dans le body de la requête

    pharmacieDao.update(pharmacie, {upsert: true}, (err, doc) => {
        if (err) {
            handleError(response, 'create_or_update_pharmacie_failed', err.message);
        } else {
            // Définition du status code suivant la pharmacie est créée, mise à jour ou aucune mise à jour.
            let statusCode = (doc.upserted) ? 201 : (doc.nModified) ? 200 : 204 ;

            // Si création de la pharmacie, on retourne l'URI et l'identifiant de la nouvelle pharmacie dans le header "Location" de la réponse.
            doc.upserted && response.location(`${request.get('origin')}/v1/pharmacies/${doc.upserted[0]._id}`);

            response.status(statusCode).json(doc);
        }
    });
})

// Mise à jour partielle d'une pharmacie.
.patch((request, response, next) => {
    var pharmacie = _.extend(request.body, {_id: request.params.id});

    pharmacieDao.update(pharmacie, (err, doc) => {

        if (err) {
            handleError(response, 'update_pharmacie_failed', err.message);
        }else {
            // La pharmacie avec cet id n'existe pas, on génère une erreur 404
            if (doc.n === 0) {
                handleError(response, 'update_pharmacie_failed', `La pharmacie d'id ${request.params.id} n'existe pas`, 404);
                return;
            }

            // Définition du status code suivant la pharmacie est mise à jour ou si il n'y a eu aucune mise à jour.
            let statusCode = (doc.nModified) ? 200 : 204 ;

            response.status(statusCode).json(doc);
        }
    });
})

// Suppression d'une pharmacie à partir de son id
.delete((request, response, next) => {
    pharmacieDao.delete({_id: req.params.id}, (err, doc) => {
        if (err) {
            handleError(response, 'delete_pharmacie_failed', err.message);
        } else {
            response.status(204).end();
        }
    });
});


module.exports = router;
