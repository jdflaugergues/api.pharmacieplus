/**
 * Classe utilitaire pour les API REST.
 */

const debug = require('debug')('pharmacieplus:tools:API:REST:tools'),
      _ = require('lodash'),
      LatLon = require('../movable-type/LatLon.js');

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
        let first = `0-${((currentRange-1) < instanceLength) && ('' + (currentRange - 1)) || instanceLength}`,
            prev = `${((offset - currentRange) >= 0) && (offset - currentRange) || 0}-${((offset - currentRange) >= 0) && (offset - 1) || (currentRange < instanceLength) && ('' + (currentRange - 1)) || instanceLength}`,
            next = `${((limit + 1) <= instanceLength ) && (limit + 1) || instanceLength }-${((limit + currentRange) < instanceLength) && (limit + currentRange) || instanceLength }`,
            last = `${((instanceLength - currentRange) >= 0) && (instanceLength - currentRange) || 0}-${instanceLength - 1}`;

        // On retourne les 4 liens pour l'insérer dans l'entête Link
        return [`<${fullUrl.replace(/\d+-\d+/, first)}>; rel="first"`,
                `<${fullUrl.replace(/\d+-\d+/, prev)}>; rel="prev"`,
                `<${fullUrl.replace(/\d+-\d+/, next)}>; rel="next"`,
                `<${fullUrl.replace(/\d+-\d+/, last)}>; rel="last"`
            ].join(',');
    }

    // Fonction permettant de créer le paramètre de recherche en fonction de la position géographique
    // dans la base MongoDB.
    // @param {object} request Requête contenant les paramètres long et lat pour longitude et latitude.
    //                         Ces paramètres sont obligatoires pour la prise en compte du recherche géolocalisée.
    // @return Le paramètre de recherche géolocalisée si paramètres ok; objet error sinon.
    static createLocationQuery(request){

        let error = {},
            query = {};

        let long = request.query.long,
            lat = request.query.lat;

        if (! long) {
            error = {
                error: 'missing_location_arg_long',
                error_description: `The longitude argument 'long' is missing in your request.`
            };
        } else if (! lat) {
            error = {
                error: 'missing_location_arg_lat',
                error_description: `The latitude argument 'lat' is missing in your request.`
            };
        } else {

            long = parseFloat(long);
            lat = parseFloat(lat);

            if (isNaN(long)) {
                error = {
                    error: 'bad_location_arg_long',
                    error_description: `The longitude argument 'long' must be a valid number in your request.`
                };
            } else if (isNaN(lat)) {
                error = {
                    error: 'bad_location_arg_lat',
                    error_description: `The latitude argument 'lat' must be a valid number in your request.`
                };
            } else {
                query = {loc: {'$near': [long, lat], '$maxDistance': 5000}};
            }
        }
        if( ! _.isEmpty(error)){
            return error;
        } else {
            return query;
        }
    }

    // Cette méthode étend les pharmacies de la collection avec la distance entre chaque pharmacie et la position
    // de l'utilisateur. La méthode de calcul de distance est issue du site : http://www.movable-type.co.uk/scripts/latlong.html
    // @param {object} request Requête contenant la position de l'utilisateur
    // @param {object} docs La liste des pharmacies à étendre.
    // @return La liste des pharmacies avec la distance.
    static getDistanceFromLocations(request, pharmacies){

        let origin;

        if (request.query.lat && request.query.long) {
            origin = new LatLon(parseFloat(request.query.lat), parseFloat(request.query.long));
        }

        if (request.query.loc) {
            let loc = JSON.parse(request.query.loc)
            origin = new LatLon(parseFloat(loc[1]), parseFloat(loc[0]));
        }

        if (origin) {

            // On étend chaque pharmacie de la collection avec la propriété distance qui correspond à la distance en mètre
            // entre la pharmacie et la position de la requête (position de l'utilisateur)
            _.map(pharmacies, (pharmacie) => {
                pharmacie.distance = parseInt(origin.distanceTo(new LatLon(pharmacie.loc[1], pharmacie.loc[0])));
            });

            // On tri la collection des pharmacies de la plus proche à la plus éloignée.
            pharmacies = _.orderBy(pharmacies, ['distance'], ['asc']);
        }
        return pharmacies;
    }

    // Formate les horaires d'ouverture contenu dans la requêt en un objet JSON correct pour l'insertion en base de données.
    static formatHours(request) {
        let rb = request.body;

        if (rb['hours[mo][amo]']){

            return {
                mo: { amo: rb['hours[mo][amo]'], amc: rb['hours[mo][amc]'], pmo: rb['hours[mo][pmo]'], pmc: rb['hours[mo][pmc]'] },
                tu: { amo: rb['hours[tu][amo]'], amc: rb['hours[tu][amc]'], pmo: rb['hours[tu][pmo]'], pmc: rb['hours[tu][pmc]'] },
                we: { amo: rb['hours[we][amo]'], amc: rb['hours[we][amc]'], pmo: rb['hours[we][pmo]'], pmc: rb['hours[we][pmc]'] },
                th: { amo: rb['hours[th][amo]'], amc: rb['hours[th][amc]'], pmo: rb['hours[th][pmo]'], pmc: rb['hours[th][pmc]'] },
                fr: { amo: rb['hours[fr][amo]'], amc: rb['hours[fr][amc]'], pmo: rb['hours[fr][pmo]'], pmc: rb['hours[fr][pmc]'] },
                sa: { amo: rb['hours[sa][amo]'], amc: rb['hours[sa][amc]'], pmo: rb['hours[sa][pmo]'], pmc: rb['hours[sa][pmc]'] },
                su: { amo: rb['hours[su][amo]'], amc: rb['hours[su][amc]'], pmo: rb['hours[su][pmo]'], pmc: rb['hours[su][pmc]'] }
            };
        } else return {};
    }

    // Fonction permettant de créer le paramètre de recherche dans la base de données MongoDB en fonction des paramètres
    // présents dans l'URL. Pour chaque paramètres de l'URL correspondant à un champ en base de données est associé la valeur
    // de recherche. Cette valeur de recherche peut être couplé au "joker (*)" au début et/ou à la fin de la valeur pour
    // un recherche sur tout caractères.
    // @param {object} request La requête contenant les paramètres de recherches
    // @return Le paramètre de recherche en base de données construit à partir des paramètres présents dans la requête.
    static createSearchQuery(request) {

        let error = {},
            queries = {};

        // On récupère les critères de recherche dans la requête en excluant les paramètres ne correspondant pas à la recherche (ex: sort, desc, range, ...)
        let searchParameters = _.pick(request.query, ['loc', '_id', 'numvoie', 'typvoie', 'voie', 'cpville', 'telephone', 'fax', 'coordxet', 'coordyet', 'hours.mo', 'hours.tu', 'hours.we', 'hours.th', 'hours.fr', 'hours.sa', 'hours.su']);

        // Parcours des champs de recherche
        _.forEach(searchParameters, (value, param) => {

            // Recherche géolocalisée
            if (param === "loc") {
            
                if (/\[-?\d+\.?\d*,-?\d+\.?\d*\]/.test(value))
                    queries[param] = {'$near': JSON.parse(value), '$maxDistance': 10000};

            // Recherche sur une collection (ex: rs=[1234,1235,1236])
            } else if (/^\[([\wàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ-\s]+\,)*[\wàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ-\s]+\]$/
                .test(value)) {
                queries[param] = { "$in": value.substr(1,value.length-2).split(',') };
            } else if (param.indexOf('hours') != -1) {
                let queryAm = {};
                queryAm[param+'.amo'] = { "$lt": parseInt(value)};
                queryAm[param+'.amc'] = { "$gt": parseInt(value)};

                let queryPm = {};
                queryPm[param+'.pmo'] = { "$lt": parseInt(value)};
                queryPm[param+'.pmc'] = { "$gt": parseInt(value)};

                queries["$or"] = [queryAm, queryPm];

            } else {
                // Erreur si la valeur du paramètre de recherche n'est pas bonne
                if (!/^\*?[\wàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ-\s]*\*?$/.test(value)) {
                    error = {
                        error: 'search_bad_syntax',
                        error_description: `Bad syntax of search parameter '${param}'`
                    };
                } else {
                    value = (value[0] === '*') && value.substr(1, value.length) || '^' + value;
                    value = (value[value.length - 1] === '*') && value.substr(0, value.length - 1) || value + '$';
                    queries[param] = new RegExp(value, 'i');
                }
            }
        });

        if( ! _.isEmpty(error)){
            return error;
        } else {
            return queries;
        }
    }

    // Fonction rajoutant dans les options les paramètres de tri du résultat.
    // @param request Requête contenant les paramètres
    // @param options Les options courantes de la requêtes.
    // @return Les options de la requêtes surchargé avec les paramètres de tri.
    static createSortOptions(request, options) {
        let sort = request.query.sort;

        // Si le tri est demandé dans la requête.
        if (sort) {

            // Récupération des paramètres de tri descendant
            let desc = request.query.desc,
                descOptions = {},
                listDesc = [];

            desc && (listDesc = desc.split(/,/));

            // Récupération des paramètres de tri sur les champs
            let listSort = sort.split(/,/),
                sortOptions = {};

            // Parcours des noms d'attributs de tri pour les ajouter aux options.
            _.each(listSort, (item) => {
                sortOptions[item] = (listDesc.indexOf(item) === -1) && 1 || -1;
            });

            // On ajoute aux options courantes, les options de tri
            options = _.extend(options, {sort: sortOptions})
        }

        return options;
    }

    // Fonction permettant à partir du range passer en paramètre de la requête HTTP, de créer l'objet
    // options correspondant pour la requête MongoDB.
    // Si le paramètre range est incorrect, on ne retourne pas les options mais un objet error.
    // @param request Requête contenant les paramètres
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
