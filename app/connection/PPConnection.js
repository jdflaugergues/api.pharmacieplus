/**
 * Module PPConnection (Pharmacie Plus Connection) implémentant le pattern Singleton
 * afin de garantir une seule et unique connexion vers la base de données mongoDB.
 */

'use strict';

// Importation du driver de connexion à la base de données mongoDB
const mongoose = require('mongoose'),
      config = require('../../config/config.json'),
      debug = require('debug')('pharmacieplus:PPConnection');

// Adresse de connexion à la base composée de l'hébergeur et du nom de la base de données.
let mongodbUri = config.mongodb.uri;

// Options de connexion à la base de données
let options = {
    user: config.mongodb.login,      // Login de connexion à la base
    pass: config.mongodb.password,   // Mot de passe de connexion à la base
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } }
};

// Classe PPConnection implémentant le pattern singleton.
class PPConnection {

    // Redéfinition du constructeur de la classe pour interdire son instanciation
    // en générant une exception le cas échéant.
    constructor() {
        throw new Error('Cannot instantiate this singleton class. Please use, getInstance static method instead.');
    }

    // Méthode qui va retourner l'instance du singleton et la créer si elle n'existe pas.
    static getInstance(callback) {

        let isCallback = (typeof callback === 'function');

        // Si il n'y a jamais de tentative de connexion.
        if (!PPConnection.connect) {

            mongoose.connect(mongodbUri, options);
            PPConnection.connect = mongoose.connection;

            // Erreur durant la connexion
            PPConnection.connect.on('error', debug.bind(console, 'connection error:'));

            // Connexion établie
            PPConnection.connect.once('open', () => {
                PPConnection.connected = true;
                debug(`Connection established to ${mongodbUri}`);

            });
        } else {
            // Si la connexion est établie on lance le callback si il y en a un.
            PPConnection.connected && isCallback && callback();
        }

        // Cas ou une connexion est en cours d'établissement mais pas encore établie.
        // On lancera le callback une fois la connexion établie.
        PPConnection.connect.once('open', () => {
            isCallback && callback();
        });

        return PPConnection.connect;
    }
}

// Variable statique de la classe PPConnection représentant le singleton.
PPConnection.connect;

// Variable statique de la classe PPConnection indiquant si une connexion est établie.
PPConnection.connected = false;

// Exportation du module
module.exports = PPConnection;
