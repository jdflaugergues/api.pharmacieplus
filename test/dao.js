const expect = require('chai').expect;
const assert = require('chai').assert;
const DAO = require('../app/dao/dao');

describe('Classe abstraite DAO', () => {

    it('Non instanciation', () => {

        assert.throws(() => { new DAO(); }, TypeError);
    });

    it('Instanciation de toutes les méthodes', () => {

        var TestDao = class extends DAO{}
        assert.throws(() => { new TestDao(); }, TypeError);

        var TestDao = class extends DAO{
            create(){}
        }
        assert.throws(() => { new TestDao(); }, TypeError);

        var TestDao = class extends DAO{
            create(){}
            update(){}
        }
        assert.throws(() => { new TestDao(); }, TypeError);

        var TestDao = class extends DAO{
            create(){}
            update(){}
            delete(){}
        }
        assert.throws(() => { new TestDao(); }, TypeError);

        var TestDao = class extends DAO{
            create(){}
            update(){}
            delete(){}
            find(){}
        }

        assert.doesNotThrow(() => { new TestDao(); }, TypeError);

        assert.instanceOf(new TestDao(), TestDao, 'is an instance of TestDao');
        assert.instanceOf(new TestDao(), DAO, 'is an instance of Dao');


    });

});