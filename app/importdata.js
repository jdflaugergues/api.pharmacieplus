/**
 * Cette classe permet de lire le contenu d'un fichier CSV contenant la liste des pharmacies,
 * de parser ses informations pour insérer/mettre à jour les pharmacies dans la base de données
 * mongoDB.
 */
const fs = require('fs'),
      _ = require('lodash'),
      async = require('async'),
      debug = require('debug')('pharmacieplus:parserCSV'),
      AbstractDAOFactory = require('./dao/abstractdaofactory');

'use strict';

var csvFile = `finess;nofinesset;nofinessej;rs;rslongue;complrs;compldistrib;numvoie;typvoie;voie;compvoie;lieuditbp;commune;departement;libdepartement;ligneacheminement;telephone;telecopie;categetab;libcategetab;categagretab;libcategagretab;siret;codeape;codemft;libmft;codesph;libsph;dateouv;dateautor;datemaj;
structureet;010000024;010780054;CH FLEYRIAT;;;;900;RTE;DE PARIS;;BP 401 VIRIAT;53;1;AIN;01012 BOURG EN BRESSE CEDEX;474454647;474454114;355;Centre Hospitalier (C.H.);1102;Centres Hospitaliers;2,601E+13;8610Z;3;ARS établissements Publics de santé dotation globale;1;Etablissement public de santé;13/02/1979;13/02/1979;04/09/2013;
structureet;010000032;010780062;CH DOCTEUR RECAMIER BELLEY;CENTRE HOSPITALIER DOCTEUR RECAMIER BELLEY;;;52;R;GEORGES GIRERD;;BP 139;34;1;AIN;01300 BELLEY;479425959;479425996;355;Centre Hospitalier (C.H.);1102;Centres Hospitaliers;2,601E+13;8610Z;3;ARS établissements Publics de santé dotation globale;1;Etablissement public de santé;01/01/1901;01/01/1901;25/08/2010;
structureet;010002301;010002293;PHARMACIE VOLLENWEIDER PATRICE;;;;41;R;ALEXANDRE BERARD;;BP 107;4;1;AIN;01500 AMBERIEU EN BUGEY;474350415;;620;Pharmacie d'Officine;3201;Commerce de Biens à Usage Médicaux;3,31254E+13;;1;Etablissement Tarif Libre;;;12/06/1989;07/04/1989;27/03/2007;
structureet;010002335;010002327;PHARMACIE DE FLAUGERGUES ;;;;625;AV;LEON BLUM;;;4;1;AIN;01500 AMBERIEU EN BUGEY;;;620;Pharmacie d'Officine;3201;Commerce de Biens à Usage Médicaux;4,09527E+13;;1;Etablissement Tarif Libre;;;02/07/2013;02/08/2012;17/11/2015;
structureet;010002350;010002343;PHARMACIE GUSTIN J-J.& GUSTIN M-CH.;;;;68;AV;ROGER SALENGRO;;;4;1;AIN;01500 AMBERIEU EN BUGEY;474468146;474380624;620;Pharmacie d'Officine;3201;Commerce de Biens à Usage Médicaux;3,40556E+13;;1;Etablissement Tarif Libre;;;20/09/1990;22/11/1985;05/09/2006;
geolocalisation;010002301;882538.9;6542885.8;1;ATLASANTE;100;IGN;BD_ADRESSE;V2.1;LAMBERT_93;2016-02-29
geolocalisation;010002335;881398.6;6543082.9;1;ATLASANTE;100;IGN;BD_ADRESSE;V2.1;LAMBERT_93;2016-02-29
geolocalisation;010002350;881535.0;6542158.6;1;ATLASANTE;100;IGN;BD_ADRESSE;V2.1;LAMBERT_93;2016-02-29
`;

//csvFile = 'etalab_cs1100507_stock_20160620-0432.csv';


class ImportData {

    // Lit le fichier csv contenant la liste des pharmacies pour le mettre en mémoire.
    static readFile(fileName){

        fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) {
                console.log(`error happened during reading the file : ${csvFile}`);
                return console.log(err);
            }

            data = data.replace(/"/g,'');
            ImportData.parseData(data);
        });
    }

    // Parse les données issues de la lecture du fichier csv pour créer un objet JSON
    // contenant les données utiles et consolidées, à insérer en base de données noSQL
    static parseData(data){

        let eofStruct = data.indexOf('geolocalisation;'),
            csvStruct = data.substring(0, eofStruct-1),
            csvGeoloc = data.substring(eofStruct, data.length);

        async.parallel({
            structureet: (callback) => {

                let liststructureet = [];

                csvStruct.split('\n').forEach((line) => {
                    liststructureet.push(line.split(';'));
                });
                callback(null, liststructureet);
            },
            geolocation: (callback) => {
                let listgeolocation = [];

                csvGeoloc.split('\n').forEach((line) => {
                    listgeolocation.push(line.split(';'));
                });
                callback(null, listgeolocation);
            }
        }, (err, results) => {

            if (err) {
                return console.log(err);
            }

            let listPharmacies = [];
            let pharGeoloc = results.geolocation;
            let pharStruct = _.filter(results.structureet, (phar) => (phar[18] == 620));

            pharStruct.forEach((pharmacie, index) => {

                listPharmacies.push({
                    _id: pharmacie[1],
                    rs: pharmacie[3],
                    numvoie: pharmacie[7],
                    typvoie: pharmacie[8],
                    voie: pharmacie[9],
                    cpville: pharmacie[15],
                    telephone: pharmacie[16],
                    fax: pharmacie[17],
                    coordxet: _.find(pharGeoloc, (phar) => (phar[1] == pharmacie[1]) )[2],
                    coordyet: _.find(pharGeoloc, (phar) => (phar[1] == pharmacie[1]) )[3]
                });
            });

            ImportData.updateDb(listPharmacies)
        });
    }

    static updateDb(listPharmacies){

        let adf = AbstractDAOFactory.getFactory(AbstractDAOFactory.DAO_FACTORY);
        let pharmacieDao = adf.getPharmacieDAO();

        listPharmacies.forEach((pharmacieData) => {
            // On crée la pharmacie si elle n'existe pas, sinon on la met à jour (upsert: true)
            pharmacieDao.update(pharmacieData, {upsert: true} ,(err, numAffected) => {
                if (err) {
                    debug(`Failed to create new pharmacies : ${err.message}`);
                }
            });
        });

        debug(`Inserted ${listPharmacies.length} pharmacies into the pharmacie collection`);
    }

    static process(){
        ImportData.parseData(csvFile);
        //ImportData.readFile(csvFile);
    }
}

module.exports = ImportData;