# api.pharmacieplus

Ce dépôt représente les sources de l'API REST de mon projet de fin de l'UE [NSY209 : Architecture, Patterns, et Intégration : systèmes embarqués et mobiles en Java et Android (2)] (http://deptinfo.cnam.fr/new/spip.php?rubrique235).
Ce projet est une application mobile hybride permettant de lister/rechercher rapidement les pharmacies suivant plusieurs critères (géolocalisation, nom, ville, etc...)
Ainsi, l'application mobile intéragit avec une API REST pour rerchercher/créer/mettre à jour les pharmacies. 
Ce projet est réalisé sous NodeJS.

## Base de données

La base de données stockant les pharmacies est de type MongoDB. Elle est hebergée par [mLab] (https://mlab.com/).
Les informations de connexion à la base MongoDB sont contenu dans le fichier de conf `./config/config.json` (qui n'est pas versionné) qui doit présenter la structure suivante :

    {
        "mongodb": {
          "uri": "mongodb://domain:port/databasename",
          "login": "login",
          "password": "password"
        }
    }

## Designs pattern

Ce projet implémente les différents designs pattern suivants :

### Pattern Singleton

L'accès à la base de donnée se fait via le fichier `.app/connection/PPConnection` qui implémente le pattern singleton.
Cela permet de garantir qu'une seule et unique connexion vers la base de données est établie.

### Pattern DAO

Le lien entre la couche d'accès aux données et la couche métier de l'application se fait par l'implémentation du pattern DAO.
Ainsi, le fichier **./app/dao/dao.js** contient la classe abstraite *DAO* qui met en oeuvre les méthodes CRUD :

* find
* create
* update
* delete

Les objets DAO implémentant cette méthode cette classe se trouve dans le répertoire **./app/dao/implement**. (ex: pharmaciedao.js).
Chaque classe DAO utilise un modèle de données associé qui se trouve dans le répertoire **./app/model**. (ex: pharmacie.js)

### Pattern Factory

Le pattern DAO implémente aussi le pattern factory qui consiste à déléguer l'instanciation des objets à une classe.
La fabrique DAO se trouve dans le fichier **./app/dao/daofactory.js**
Afin de pouvoir gérer plusieurs système de sauvegarde de données (XML, BDD, FS, ...), on utilise la classe abstraire *AbstractDAOFactory* présent dans
le fichier **./app/dao/abstractdaofactory.js** ayant les méthodes permettant de récupérer les différents DAO.
Elle contient une méthode statique permettant d'instancier la bonne fabrique à partir d'un paramètre.


## API REST

La mise en oeuvre de l'API prend en compte les principes des API Restful.
Les bonnes pratiques utilisées sont issues du [blog suivant] (http://blog.octo.com/designer-une-api-rest/)

Les routes accédant à l'API se trouvent dans le répertorie ./routes/v1/ (ex: pharmacie.js)

### API documentation

**/pharmacies**

####GET /pharmacies         Recherche d'une collection de pharmacies

####POST /pharmacies        Création d'une pharmacie (génération auto de l'id)

####GET /pharmacies/{id}    Recherche d'une pharmacie à partir de son id

####PUT /pharmacies/{id}    Création ou mise à jour d'une pharmacie à partir de son id

####PATCH /pharmacies/{id}  Mise à jour partielle d'une pharmacie à partir de son id

####DELETE /pharmacie/{id}  Suppression d'une pharmacie à partir de son id

## Tests

Les test sont réalisés à partir des modules npm suivants :

* mocha
* chai
* sinon

### côté serveur

Les tests côté serveur se trouvent dans le répertoire **./test**
Leurs exécution se fait via la commande suivante : `npm test`

### côté client

Les tests côté client se trouvent dans le fichier **./public/javascripts/test.js**
Leurs exécution se fait via la route *testrunner* (ex: http://api-pharmacieplus.rhcloud.com/testrunner)