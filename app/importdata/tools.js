/**
 * Classe utilitaire pour l'importation des pharmacies.
 * L'auteur de cet utilitaire disponible sur https://gist.github.com/blemoine/e6045ed93b3d90a52891,
 * est Benoit Lemoine <https://github.com/blemoine>.
 * Il est simplement adapté pour être utilisé en tant que module NodeJS.
 */

'use strict';

Math.tanh = Math.tanh || function(x) {
        if(x === Infinity) {
            return 1;
        } else if(x === -Infinity) {
            return -1;
        } else {
            return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
        }
    };

Math.atanh = Math.atanh || function(x) {
        return Math.log((1+x)/(1-x)) / 2;
    };

// Convertis des coordonnées géographiques Lambert 93  en coordonnées GPS (latitude/longitude).
// Les coordonnées de géolocalisation des pharmacies fournies par le ministère des affaires sociales et de la santé
// étant au format lambert93, et la recherche de pharmacie par localisation dans la base de données mongoDB se faisant
// depuis des coordonnées GPS, la conversion en GPS est obligatoire avant l'insertion d'une pharmacie en base.
function lambert93toWGPS(lambertE, lambertN) {

    let constantes = {
        GRS80E: 0.081819191042816,
        LONG_0: 3,
        XS: 700000,
        YS: 12655612.0499,
        n: 0.7256077650532670,
        C: 11754255.4261
    }

    let delX = lambertE - constantes.XS;
    let delY = lambertN - constantes.YS;
    let gamma = Math.atan(-delX / delY);
    let R = Math.sqrt(delX * delX + delY * delY);
    let latiso = Math.log(constantes.C / R) / constantes.n;
    let sinPhiit0 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * Math.sin(1)));
    let sinPhiit1 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit0));
    let sinPhiit2 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit1));
    let sinPhiit3 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit2));
    let sinPhiit4 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit3));
    let sinPhiit5 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit4));
    let sinPhiit6 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit5));

    let longRad = Math.asin(sinPhiit6);
    let latRad = gamma / constantes.n + constantes.LONG_0 / 180 * Math.PI;

    let longitude = latRad / Math.PI * 180;
    let latitude = longRad / Math.PI * 180;

    return {longitude: longitude, latitude: latitude};
}

module.exports = lambert93toWGPS;