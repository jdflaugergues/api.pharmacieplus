/**
 * Classe utilitaire pour les API REST.
 */

const debug = require('debug')('pharmacieplus:tools:API:REST'),
      _ = require('lodash');

'use strict';

// Classe abstraite Tools
class Tools {

    constructor() {

        // On lance une exception si on tente d'instancier directement cette classe
        if (new.target === AbstractDAOFactory) {
            throw new TypeError('Cannot construct Tools instances directly');
        }
    }

    // Crée l'argument fields pour l'appel à la fonction .find de Mongoose ain de ne récupérer
    // que les champs qui nous interesse.
    // @params request Requête contenant le paramètre 'fields'.
    static createFieldsArg(request) {
        let fields = request.query.fields && request.query.fields.replace(/ *, */g, ' ') || '';
        return fields;
    }

     // Crée les données depuis une collection pour former une réponse partielle à partir d'une liste de champ.
     // @deprecated Utiliser le paramètre fields de la requête mongoDB plutot.
     // @param request Requête contenant les champs à récupérer uniquement sur la collection
     // @param collection Collection issue de la requête
     // @return La collection avec uniquement les champs demandés.
    static createPartialCollection(request, collection) {

        let partialCollection = collection;

        // Liste des champs à conserver dans la collection
        let fields = request.query.fields && request.query.fields.split(',');

        // Si la requête contient des champs en paramètres, on conserve; sinon on retourne la collection avec tous les champs.
        if (fields) {

            //TODO: Prendre en compte la notation field(subfield1,subfield2,...), pour les sous-objets.

            partialCollection = _.map(partialCollection, (item) => _.pick(item, fields));
        }

        return partialCollection;
    }

    // Crée l'entête de réponse "Link" contenant les liens vers les autres plages (first, prev, next, last)
    // @param request Requête HTTP client pour récupérer l'URL
    // @param offset indice du premier élément de la collection à retourner
    // @param currentRange Nombre d'éléments à retourner
    // @param instanceLength Nombre total d'éléments sans pagination.
    // @return l'entête "Link"
    static createLinkHTTPHeader(request, offset, currentRange, instanceLength) {

        let fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl; // URL complète HTTP
        let limit = offset + currentRange - 1; // indice du dernier élément de la collection à retourner.

        // On définit les range pour les 4 liens (first, prev, next & last)
        let first = `0-${((currentRange-1) < instanceLength) && (currentRange - 1) || instanceLength}`,
            prev = `${((offset - currentRange) >= 0) && (offset - currentRange) || 0}-${((offset - currentRange) >= 0) && (offset - 1) || (currentRange < instanceLength) && (currentRange - 1) || instanceLength}`,
            next = `${((limit + 1) <= instanceLength ) && (limit + 1) || instanceLength }-${((limit + currentRange) < instanceLength) && (limit + currentRange) || instanceLength }`,
            last = `${((instanceLength - currentRange) >= 0) && (instanceLength - currentRange) || 0}-${instanceLength - 1}`;

        // On retourne les 4 liens pour l'insérer dans l'entête Link
        return [`<${fullUrl.replace(/\d+-\d+/, first)}>; rel="first"`,
                `<${fullUrl.replace(/\d+-\d+/, prev)}>; rel="prev"`,
                `<${fullUrl.replace(/\d+-\d+/, next)}>; rel="next"`,
                `<${fullUrl.replace(/\d+-\d+/, last)}>; rel="last"`
            ].join(',');
    }

    // Fonction permettant à partir du range passer en paramètre de la requête HTTP, de créer l'objet
    // options correspondant pour la requête MongoDB.
    // Si le paramètre range est incorrect, on ne retourne pas les options mais un objet error.
    // @param request Requête contenant les paramètre
    // @param defaultRange Count maximal autorisé pour la pagination
    // @return Si le range le JSON correspondant au param options de la requête find mongoDB; sinon un objet error.
    static createRangeOptions(request, defaultRange) {
        let range = request.query.range,
            error = {},
            options = {skip: 0, limit: defaultRange};

        if (range) {
            if ( !/^\d+-\d+$/.test(range)){
                error = {
                    error: 'range_bad_syntax',
                    error_description: 'Bad syntax of range parameter'
                };
            } else {
                range = range.split('-');
                let firstBytePos = parseInt(range[0], 10),
                    lastBytePos = parseInt(range[1], 10);

                if (firstBytePos > lastBytePos) {
                    error = {
                        error: 'bad_byte_range_resp_spec',
                        error_description: 'First byte position of range parameter must be lower or equal than last byte position.'
                    };
                } else {
                    if (lastBytePos - firstBytePos + 1 > defaultRange) {
                        error = {
                            error: 'range_bad_count',
                            error_description: `Count of range parameter '${lastBytePos - firstBytePos + 1}' must be lower or equal than default count '${defaultRange}'`
                        };
                    } else {
                        options = {
                            skip: firstBytePos,
                            limit: lastBytePos - firstBytePos + 1
                        };
                    }
                }
            }
        }
        if( ! _.isEmpty(error)){
            return error;
        } else {
            return options;
        }
    }
}

module.exports = Tools;
