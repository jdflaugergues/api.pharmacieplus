const gcm = require('node-gcm'),
      config = require('../../../data/config.json'),
      Pushwoosh = require('pushwoosh-client'),
      debug = require('debug')('pharmacieplus:publishSubscribe');

const client = new Pushwoosh('BBDA9-09114', 'REZnzS4WWu5bSVH8sIEpP38qIEZeyh296XQrfXKO71tTGzI27AZ7XFcAhIUYvMPuQpVMxDUtRx9ou4pQEaDv');

'use strict';

// Cette classe implémente la pattern publish/subscribe.
// Le principe, un abonné s'abonne à une pharmacie.
// Lorsqu'un commentaire est ajouté à une pharmacie, tous les abonnés de celle-ci sont notifiés.
class Events {

    // Souscription d'un abonné à une pharmacie
    static subscribe(pharmacie, subscriber) {
        // Si la pharmacie à laquelle la personne s'abonne n'existe pas dans la liste, on la rajoute.
        if (!Events.pharmacies.hasOwnProperty.call(Events.pharmacies, pharmacie)) {
            Events.pharmacies[pharmacie] = [];
        }

        // On ajouter dans la liste des abonnés de la pharmacie, le nouvel abonné.
        Events.pharmacies[pharmacie].push(subscriber);
        debug('Subscribe : '+JSON.stringify(Events.pharmacies));
    }

    // Désabonne un abonné d'une pharmacie
    static unsubscribe(pharmacie, subscriber) {

        // Si la pharmacie existe dans la liste
        if (Events.pharmacies.hasOwnProperty.call(Events.pharmacies, pharmacie)) {

            // Récupération de la position de l'abonné dans la liste des abonnés de la pharmacie
            var index = Events.pharmacies[pharmacie].indexOf(subscriber)

            // Si l'abonné existe dans la liste on le supprime.
            if (index !== -1) {
                Events.pharmacies[pharmacie].splice(index, 1);
            }
        }
    }

    // On publie un commentaire sur une pharmacie
    // Tous les abonnés sont notifiés.
    static publish(pharmacie, message) {

        // Si il n'y aucun abonné sur cette pharmacie, on ne fait rien.
        if (!Events.pharmacies.hasOwnProperty.call(Events.pharmacies, pharmacie.id)) return;

        // Envoi de la notification push à tous les abonnés
        client.sendMessage(message, Events.pharmacies[pharmacie.id], (error, response) => {
            if (error) {
                debug(`Some error occurs: ${error}`);
            }

            debug(`Pushwoosh API response is ${response}`);
        });
    }
}

// Liste des pharamacies avec ses abonnés
// Ex: Events.pharmacies = { "pharmacieid1": ["token1", "token2"], "pharmacieid2": ["token2", "token3"] }
Events.pharmacies = {};

module.exports = Events;