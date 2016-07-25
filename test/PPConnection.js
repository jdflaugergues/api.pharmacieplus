const expect = require('chai').expect;
const assert = require('chai').assert;
const PPConnection = require('../app/connection/PPConnection');

describe('Pharmacie Plus Connection Pattern Singleton', () => {

    it('Instance unique de la classe', () => {

        let conn1 = PPConnection.getInstance();
        let conn2 = PPConnection.getInstance();

        assert.equal(conn1, conn2, '== deux instances de PPConnection');
        assert.throws(() => { new PPConnection(); }, Error);
    });

    it('Appel du callback.', () => {

    });

});