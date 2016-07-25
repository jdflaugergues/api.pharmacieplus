const mongoose = require('mongoose');

'use strict';

// Schema de donnée du model Pharmacie
const PharmacieSchema = new mongoose.Schema({
    //nofinesset: String,        // Numéro d'établissement utilisé comme id.
    _id: String,
    rs: String,         // Raison sociale
    numvoie: String,    // Numéro de la voie
    typvoie: String,    // Type de voie
    voie: String,       // Nom de la voie
    cpville: String,    // Code Postal + Ville
    telephone: String,  // Numéro de téléphone
    fax: String,        // Numéro de fax
    coordxet: String,   // Latitude
    coordyet: String    // Longitude
});

// Définition du champ virtuel nofinesset correspondant à l'id du Schema.
PharmacieSchema.virtual('nofinesset').get(() => this._id);

// On exporte le modele de pharmacie Mongoose
module.exports = mongoose.model('Pharmacie', PharmacieSchema);