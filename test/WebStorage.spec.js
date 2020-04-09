import chai from 'chai';
// import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import WebStorage from '../src';

const { expect } = chai;

chai.use(sinonChai);

global.window = {};
window.localStorage = global.localStorage;

const ls = WebStorage.createInstance();

describe('WebStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('Should create a new instance', () => {
    expect(ls.constructor.name).to.equal('WebStorage');
  });

  it('Should create a new instance with a new namespace', () => {
    expect(new WebStorage({
      keyPrefix: 'MyApp/'
    })._keyPrefix).to.equal('MyApp/');
  });

  it('Should create a new instance with default options if not provided by user', () => {
    expect(new WebStorage()._storageType).to.equal('localStorage');
    expect(new WebStorage()._keyPrefix).to.equal('web-storage/');
  });

  it('Should throw Error if driver option is not "localStorage" or "sessionStorage"', () => {
    expect(() => new WebStorage({
      driver: 'fakeStorage'
    })).to.throw(Error);
  });

  it('Should throw TypeError if keyPrefix option is not a string', () => {
    expect(() => new WebStorage({
      keyPrefix: null
    })).to.throw(TypeError);
  });

  it('Should trim (left and right) the "keyPrefix"', () => {
    expect(new WebStorage({ keyPrefix: ' my-app ' })._keyPrefix).to.equal('my-app');
    expect(new WebStorage({ keyPrefix: ' my-app' })._keyPrefix).to.equal('my-app');
    expect(new WebStorage({ keyPrefix: 'my-app ' })._keyPrefix).to.equal('my-app');
  });

  it('Should succesfully save and retrieve values to localStorage', () => {
    ls.setItem('p1', {foo: 'bar'});
    ls.setItem('p2', [1, 2, 3]);
    ls.setItem('p3', null);
    ls.setItem('p4', void 0);
    ls.setItem('p5', 10);
    ls.setItem('p6', NaN);
    ls.setItem('p7', Infinity);
    ls.setItem('p8', -Infinity);
    ls.setItem('p9', -0);

    expect(ls.getItem('p1')).to.eql({ foo: 'bar' });
    expect(ls.getItem('p2')).to.eql([1, 2, 3]);
    expect(ls.getItem('p3')).to.equal(null);
    expect(ls.getItem('p4')).to.equal(null);
    expect(ls.getItem('p5')).to.equal(10);
    expect(ls.getItem('p6')).to.equal(null);
    expect(ls.getItem('p7')).to.equal(null);
    expect(ls.getItem('p8')).to.equal(null);
    expect(ls.getItem('p9')).to.equal(0);
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
      keyPrefix: 'App1/'
    });

    const ls2 = new WebStorage({
      keyPrefix: 'App2'
    });

    ls1.setItem('p1', 'Item 1');
    ls1.setItem('p2', 'Item 2');
    ls1.setItem('p3', 'Item 3');

    ls2.setItem('p1', 'Item 1');
    ls2.setItem('p2', 'Item 2');

    expect(ls1.length()).to.equal(3);

    expect(ls2.length()).to.equal(2);
  });

  it('Should check if localStorage is available', () => {
    expect(WebStorage.isAvailable('fakeStorage')).to.equal(false);

    expect(WebStorage.isAvailable('localStorage')).to.equal(true);
  });

  it('getItem should throw TypeError if first argument is not a string', () => {
    expect(() => ls.getItem()).to.throw(TypeError);
  });

  it('setItem should throw TypeError if first argument is not a string', () => {
    expect(() => ls.setItem()).to.throw(TypeError);
  });

  it('removeItem should throw TypeError if first argument is not a string', () => {
    expect(() => ls.removeItem()).to.throw(TypeError);
  });

  it('setItem should save null if second argument is a function', () => {
    ls.setItem('somekey', () => {});
    expect(ls.getItem('somekey')).to.equal(null);
  });
});
