import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import WebStorage from '../src';

const { expect } = chai;

chai.use(sinonChai);

const DEFAULT_KEY_PREFIX = 'web-storage/';

global.window = {};
window.localStorage = global.localStorage;

const ls = new WebStorage();

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
    }).options.keyPrefix).to.equal('MyApp/');
  });

  it('Should leave default key prefix if "keyPrefix" provided by user is not of type string or empty string', () => {
    expect(new WebStorage({ keyPrefix: '' }).options.keyPrefix).to.equal(DEFAULT_KEY_PREFIX);
    expect(new WebStorage({ keyPrefix: '   ' }).options.keyPrefix).to.equal(DEFAULT_KEY_PREFIX);
    expect(new WebStorage({ keyPrefix: {} }).options.keyPrefix).to.equal(DEFAULT_KEY_PREFIX);
    expect(new WebStorage({ keyPrefix: [] }).options.keyPrefix).to.equal(DEFAULT_KEY_PREFIX);
    expect(new WebStorage({ keyPrefix: null }).options.keyPrefix).to.equal(DEFAULT_KEY_PREFIX);
    expect(new WebStorage({ keyPrefix: void 0 }).options.keyPrefix).to.equal(DEFAULT_KEY_PREFIX);
    expect(new WebStorage({ keyPrefix: 10 }).options.keyPrefix).to.equal(DEFAULT_KEY_PREFIX);
    expect(new WebStorage({ keyPrefix: NaN }).options.keyPrefix).to.equal(DEFAULT_KEY_PREFIX);
    expect(new WebStorage({ keyPrefix: Infinity }).options.keyPrefix).to.equal(DEFAULT_KEY_PREFIX);
  });

  it('Should trim (left and right) the "keyPrefix"', () => {
    expect(new WebStorage({ keyPrefix: ' my-app ' }).options.keyPrefix).to.equal('my-app');
    expect(new WebStorage({ keyPrefix: ' my-app' }).options.keyPrefix).to.equal('my-app');
    expect(new WebStorage({ keyPrefix: 'my-app ' }).options.keyPrefix).to.equal('my-app');
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

  it('Should call "onErrorCallback" functions for each method if Storage not available', () => {
    const myStore = new WebStorage({
      driver: null
    });

    const noop = () => {};

    const onErrorCallback = sinon.spy();

    myStore.setItem('p1', 'Item 1', onErrorCallback);
    myStore.getItem('p1', onErrorCallback);
    myStore.keys(onErrorCallback);
    myStore.length(onErrorCallback);
    myStore.iterate(noop, onErrorCallback);
    myStore.removeItem('p1', onErrorCallback);
    myStore.clear(onErrorCallback);

    expect(onErrorCallback.called).to.equal(true);
    expect(onErrorCallback.callCount).to.equal(7);

    onErrorCallback.resetHistory();
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
    const fakeStore = null;

    expect(WebStorage.isAvailable(fakeStore)).to.equal(false);

    expect(WebStorage.isAvailable(localStorage)).to.equal(true);
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
