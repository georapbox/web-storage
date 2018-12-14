import chai from 'chai';
import sinonChai from 'sinon-chai';
import WebStorage from '../src';

const { expect } = chai;

chai.use(sinonChai);

global.window = {};
window.localStorage = global.localStorage;

let ls;

describe('webStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    ls = new WebStorage();
  });

  it('Should create a new instance', () => {
    expect(ls.constructor.name).to.equal('WebStorage');
  });

  it('Should create a new instance with a new namespace', () => {
    expect(new WebStorage({name: 'MyApp'}).storeKeyPrefix).to.equal('MyApp/');
  });

  it('should throw TypeError if "options.name" is not a string or an empty string', () => {
    expect(() => new WebStorage({ name: '' })).to.throw(TypeError);
    expect(() => new WebStorage({ name: ' ' })).to.throw(TypeError);
    expect(() => new WebStorage({ name: [] })).to.throw(TypeError);
    expect(() => new WebStorage({ name: {} })).to.throw(TypeError);
    expect(() => new WebStorage({ name: null })).to.throw(TypeError);
    expect(() => new WebStorage({ name: void 0 })).to.throw(TypeError);
  });

  it('sould throw TypeError if "options.keySeparator" is not a string or an empty string', () => {
    expect(() => new WebStorage({ keySeparator: '' })).to.throw(TypeError);
    expect(() => new WebStorage({ keySeparator: ' ' })).to.throw(TypeError);
    expect(() => new WebStorage({ keySeparator: [] })).to.throw(TypeError);
    expect(() => new WebStorage({ keySeparator: {} })).to.throw(TypeError);
    expect(() => new WebStorage({ keySeparator: null })).to.throw(TypeError);
    expect(() => new WebStorage({ keySeparator: void 0 })).to.throw(TypeError);
  });

  it('Should succesfully save and retrieve values to localStorage', done => {
    ls.setItem('foo', {foo: 'bar'}).then(() => ls.getItem('foo')).then(value => {
      expect(value).to.eql({foo: 'bar'});
      done();
    }).catch(done);
  });

  it('Should remove a saved item by its key', done => {
    ls.setItem('foo', {foo: 'bar'}).then(() => {
      return ls.getItem('foo');
    }).then(value => {
      expect(value).to.eql({foo: 'bar'});
      return ls.removeItem('foo');
    }).then(() => {
      return ls.getItem('foo');
    }).then(value => {
      expect(value).to.equal(null);
      done();
    }).catch(done);
  });

  it('Should clear all keys from a specific database, but leave any other saved data (not in database) intact', done => {
    const p1 = ls.setItem('p1', {foo: 'bar'});
    const p2 = ls.setItem('p2', 'foobar');
    const p3 = ls.setItem('p3', [1, 2, 3]);

    localStorage.setItem('p4', 'Not in database');

    Promise.all([p1, p2, p3]).then(() => {
      ls.length().then(len => {
        expect(len).to.equal(3);

        return ls.clear().then(() => {
          return ls.length().then(res => {
            expect(res).to.equal(0);
            expect(localStorage).to.have.have.lengthOf(1);
            done();
          });
        });
      }).catch(done);
    });
  });

  it('Should iterate over all value/key pairs in datastore', done => {
    const temp = [];

    const p1 = ls.setItem('p1', 'Item 1');
    const p2 = ls.setItem('p2', 'Item 2');
    const p3 = ls.setItem('p3', 'Item 3');

    Promise.all([p1, p2, p3]).then(() => {
      ls.iterate((key, value) => {
        temp.push(value);
      }).then(() => {
        expect(temp).to.have.lengthOf(3);
        expect(temp[0]).to.equal('Item 1');
        expect(temp[1]).to.equal('Item 2');
        expect(temp[2]).to.equal('Item 3');
        done();
      }).catch(done);
    });
  });

  it('Should return the keys of a datastore as an array of strings', done => {
    const p1 = ls.setItem('p1', 'Item 1');
    const p2 = ls.setItem('p2', 'Item 2');
    const p3 = ls.setItem('p3', 'Item 3');

    Promise.all([p1, p2, p3]).then(() => {
      ls.keys().then(keys => {
        expect(Array.isArray(keys)).to.equal(true);
        expect(keys).to.have.lengthOf(3)
        expect(keys.indexOf('p1')).to.not.equal(-1);
        expect(keys.indexOf('p2')).to.not.equal(-1);
        expect(keys.indexOf('p3')).to.not.equal(-1);
        expect(keys.indexOf('p4')).to.equal(-1);
        done();
      }).catch(done);
    });
  });

  it('Should return the length of saved items for a specific database', done => {
    const ls1 = new WebStorage({
      name: 'App1'
    });

    const ls2 = new WebStorage({
      name: 'App2'
    });

    const pA1 = ls1.setItem('p1', 'Item 1');
    const pA2 = ls1.setItem('p2', 'Item 2');
    const pA3 = ls1.setItem('p3', 'Item 3');

    const pB1 = ls2.setItem('p1', 'Item 1');
    const pB2 = ls2.setItem('p2', 'Item 2');

    Promise.all([pA1, pA2, pA3, pB1, pB2]).then(() => {
      ls1.length().then(len => {
        expect(len).to.equal(3);
      }).catch(done);

      ls2.length().then(len => {
        expect(len).to.equal(2);
        done();
      }).catch(done);
    });
  });
});
