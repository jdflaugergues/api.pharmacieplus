const express = require('express'),
    _ = require('lodash'),
    router = express.Router(),
    AbstractDAOFactory = require('../../app/dao/abstractdaofactory'),
    Events = require('../../app/publishSubscribe/Events'),
    Tools = require('./tools'),
    debug = require('debug')('pharmacieplus:pharmacies:API:REST');


// Route '/v1/subscribe'
router.route('/subscribe')

    // Abonnement d'un utilisateur à une ou plusieurs pharmacie
    .get((request, response, next) => {

    // Récupération de tous les ids auxquelles l'abonné veut souscrire.
    let pharmaciesSubscribed = request.query.pharmacies.substr(1,request.query.pharmacies.length-2).split(',')

    // On abonne l'utilisateur à tous les ids des pharmacies demandées.
    _.each(pharmaciesSubscribed, (pharmacieId) => Events.subscribe(pharmacieId, request.query.listener) );

    response.setHeader('Access-Control-Allow-Origin', '*');

    // On retourne un HTTP Status Code 200 pour dire que tout est ok
    response.status(200).json();
});


// Route '/v1/unsubscribe'
router.route('/unsubscribe')

    // Désabonnement d'un utilisateur à une ou plusieurs pharmacie
    .get((request, response, next) => {

    // Récupération de tous les ids auxquelles l'abonné veut souscrire.
    let pharmaciesSubscribed = request.query.pharmacies.substr(1,request.query.pharmacies.length-2).split(',')

    // On abonne l'utilisateur à tous les ids des pharmacies demandées.
    _.each(pharmaciesSubscribed, (pharmacieId) => Events.unsubscribe(pharmacieId, request.query.listener) );

    response.setHeader('Access-Control-Allow-Origin', '*');

    // On retourne un HTTP Status Code 200 pour dire que tout est ok
    response.status(200).json();
});


module.exports = router;