const debug = require('debug')('pharmacieplus:publishSubscribe');

'use strict';


// Cette classe implémente la pattern publish/subscribe.
// Le principe, un abonné s'abonne à une pharmacie.
// Lorsqu'un commentaire est ajouté à une pharmacie, tous les abonnés de celle-ci sont notifiés.
class Events {

    // Souscription d'un abonné à une pharmacie
    static subscribe(pharmacie, listener) {
        // Si la pharmacie à laquelle la personne s'abonne n'existe pas dans la liste, on la rajoute.
        if (!Events.pharmacies.hasOwnProperty.call(Events.pharmacies, pharmacie)) {
            Events.pharmacies[pharmacie] = [];
        }

        // On ajouter dans la liste des abonnés de la pharmacie, le nouvel abonné.
        Events.pharmacies[pharmacie].push(listener);
        debug('Subscribe : '+JSON.stringify(Events.pharmacies));
    }

    // Désabonne un abonné d'une pharmacie
    static unsubscribe(pharmacie, listener) {

        // Si la pharmacie existe dans la liste
        if (Events.pharmacies.hasOwnProperty.call(Events.pharmacies, pharmacie)) {

            // Récupération de la position de l'abonné dans la liste des abonnés de la pharmacie
            var index = Events.pharmacies[pharmacie].indexOf(listener)

            // Si l'abonné existe dans la liste on le supprime.
            if (index !== -1) {
                Events.pharmacies[pharmacie].splice(index, 1);
            }
        }
    }

    // On publie un commentaire sur une pharmacie
    // Tous les abonnés sont notifiés.
    static publish(pharmacie, opinion) {

        // Si il n'y aucun abonné sur cette pharmacie, on ne fait rien.
        if (!Events.pharmacies.hasOwnProperty.call(Events.pharmacies, pharmacie.id)) return;

        // On parcours tous les abonnés de cette pharmacie, pour les notifier
        Events.pharmacies[pharmacie].forEach((listener) => {
            console.log(`Notification de l'abonné ${listener}`)

        }) ;
    }
}

// Liste des pharamacies avec ses abonnés
// Ex: Events.pharmacies = { "pharmacieid1": ["listner1", "listener2"], "pharmacieid2": ["listner2", "listener3"] }
Events.pharmacies = {};

module.exports = Events;