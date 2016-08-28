const mongoose = require('mongoose');
const ObjectIdSchema = mongoose.Schema.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

'use strict';

// Schema de donnée du model Opinion
const OpinionSchema = new mongoose.Schema({
    _id: { $type: ObjectIdSchema, default: function () { return new ObjectId()} },
    rate: { $type: String },        // Note de l'avis
    name: { $type: String },        // Auteur de l'avis
    content: { $type: String },     // Contenu de l'avis
    pharmacie: { $type: String },   // Id de la pharmacie
    timestamp: { $type: String }    // Date de l'avis
}, { typeKey: '$type' });


// On exporte le modele d'avis de pharmacie Mongoose
module.exports = mongoose.model('Opinion', OpinionSchema);