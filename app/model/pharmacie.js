const mongoose = require('mongoose');

'use strict';

// Schema de donnée du model Pharmacie
const PharmacieSchema = new mongoose.Schema({
    //nofinesset: String,        // Numéro d'établissement utilisé comme id.
    _id: { $type: String },
    rs: { $type: String },         // Raison sociale
    numvoie: { $type: String },    // Numéro de la voie
    typvoie: { $type: String },    // Type de voie
    voie: { $type: String },       // Nom de la voie
    cpville: { $type: String },    // Code Postal + Ville
    telephone: { $type: String },  // Numéro de téléphone
    fax: { $type: String },        // Numéro de fax
    loc: [Number],                 // Coordonnées Géographiques
    hours: {
        mo: { amo: {$type: Number}, amc: {$type: Number}, pmo: {$type: Number}, pmc: {$type: Number} },
        tu: { amo: {$type: Number}, amc: {$type: Number}, pmo: {$type: Number}, pmc: {$type: Number} },
        we: { amo: {$type: Number}, amc: {$type: Number}, pmo: {$type: Number}, pmc: {$type: Number} },
        th: { amo: {$type: Number}, amc: {$type: Number}, pmo: {$type: Number}, pmc: {$type: Number} },
        fr: { amo: {$type: Number}, amc: {$type: Number}, pmo: {$type: Number}, pmc: {$type: Number} },
        sa: { amo: {$type: Number}, amc: {$type: Number}, pmo: {$type: Number}, pmc: {$type: Number} },
        su: { amo: {$type: Number}, amc: {$type: Number}, pmo: {$type: Number}, pmc: {$type: Number} },
    },
    distance: Number               // Distance de la pharmacie par rapport à un point donnée (en mètre)
}, { typeKey: '$type' });

PharmacieSchema.index({loc: '2d'});

// Définition du champ virtuel nofinesset correspondant à l'id du Schema.
PharmacieSchema.virtual('nofinesset').get(() => this._id);

// On exporte le modele de pharmacie Mongoose
module.exports = mongoose.model('Pharmacie', PharmacieSchema);