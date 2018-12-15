import chai from 'chai';
import sinonChai from 'sinon-chai';
import WebStorage from '../src';

const { expect } = chai;

chai.use(sinonChai);

global.window = {};
window.localStorage = global.localStorage;

let ls;

describe('WebStorage', () => {
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

  it('Should succesfully save and retrieve values to localStorage', () => {
    ls.setItem('foo', {foo: 'bar'});

    const val = ls.getItem('foo');

    expect(val).to.eql({ foo: 'bar' });
  });

  it('Should remove a saved item by its key', () => {
    ls.setItem('foo', { foo: 'bar' });

    expect(ls.getItem('foo')).to.eql({ foo: 'bar' });

    ls.removeItem('foo');

    expect(ls.getItem('foo')).to.equal(null);
  });

  it('Should clear all keys from a specific database, but leave any other saved data (not in database) intact', () => {
    ls.setItem('p1', { foo: 'bar' });
    ls.setItem('p2', 'foobar');
    ls.setItem('p3', [1, 2, 3]);

    localStorage.setItem('p4', 'Not in database');

    expect(ls.length()).to.equal(3);

    ls.clear();

    expect(ls.length()).to.equal(0);
    expect(localStorage).to.have.lengthOf(1);
  });

  it('Should iterate over all value/key pairs in datastore', () => {
    const values = [];
    const keys = [];

    ls.setItem('p1', 'Item 1');
    ls.setItem('p2', 'Item 2');
    ls.setItem('p3', 'Item 3');

    ls.iterate((value, key) => {
      values.push(value);
      keys.push(key);
    });

    expect(values).to.have.lengthOf(3);
    expect(values[0]).to.equal('Item 1');
    expect(values[1]).to.equal('Item 2');
    expect(values[2]).to.equal('Item 3');

    expect(keys).to.have.lengthOf(3);
    expect(keys[0]).to.equal('p1');
    expect(keys[1]).to.equal('p2');
    expect(keys[2]).to.equal('p3');
  });

  it('Should throw TypeError if "iteratorCallback is not a function"', () => {
    expect(() => ls.iterate()).to.throw(TypeError);
    expect(() => ls.iterate({})).to.throw(TypeError);
    expect(() => ls.iterate([])).to.throw(TypeError);
    expect(() => ls.iterate(null)).to.throw(TypeError);
  });

  it('Should return the keys of a datastore as an array of strings', () => {
    ls.setItem('p1', 'Item 1');
    ls.setItem('p2', 'Item 2');
    ls.setItem('p3', 'Item 3');

    const keys = ls.keys();

    expect(Array.isArray(keys)).to.equal(true);
    expect(keys).to.have.lengthOf(3);
    expect(keys.indexOf('p1')).to.not.equal(-1);
    expect(keys.indexOf('p2')).to.not.equal(-1);
    expect(keys.indexOf('p3')).to.not.equal(-1);
    expect(keys.indexOf('p4')).to.equal(-1);
  });

  it('Should return the length of saved items for a specific database', () => {
    const ls1 = new WebStorage({
      name: 'App1'
    });

    const ls2 = new WebStorage({
      name: 'App2'
    });

    ls1.setItem('p1', 'Item 1');
    ls1.setItem('p2', 'Item 2');
    ls1.setItem('p3', 'Item 3');

    ls2.setItem('p1', 'Item 1');
    ls2.setItem('p2', 'Item 2');

    expect(ls1.length()).to.equal(3);

    expect(ls2.length()).to.equal(2);
  });
});
