import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { WebStorage } from '../src/web-storage.js';

function createStorageWithThrowingMethod(methodName, message) {
  const storage = {
    getItem: sinon.stub().returns(null),
    setItem: sinon.stub(),
    removeItem: sinon.stub(),
    clear: sinon.stub(),
    key: sinon.stub(),
    length: 0
  };

  storage[methodName] = sinon.stub().throws(new Error(message));

  // Save at least one item to ensure the storage is not empty.
  // This is for testing at a later point methods like iterate and clear
  // which expect at least one item to be present to iterate over.
  Object.defineProperty(storage, 'web-storage/test', {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'value'
  });

  return storage;
}

function overrideWindowLocalStorage(fakeStorage) {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get: () => fakeStorage
  });
}

function restoreWindowLocalStorage(original) {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get: () => original
  });
}

describe('WebStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // --- Feature Detection ------------------------------------------------

  it('Should check if localStorage is available', () => {
    expect(WebStorage.isAvailable('fakeStorage')).to.be.false;
    expect(WebStorage.isAvailable('localStorage')).to.be.true;
  });

  // --- Constructor ------------------------------------------------
  it('Should create a WebStorage instance when initializing with `new` keyword', () => {
    const store = new WebStorage();
    expect(store).to.be.an.instanceof(WebStorage);
  });

  it('Should create a WebStorage instance when initializing with `createInstance` static mothod', () => {
    const store = WebStorage.createInstance();
    expect(store).to.be.an.instanceof(WebStorage);
  });

  // --- Constructor Validations ------------------------------------------------

  it('Should throw Error if driver option is not "localStorage" or "sessionStorage"', () => {
    expect(() => {
      return new WebStorage({ driver: 'fakeStorage' });
    }).to.throw('The "driver" option must be one of "localStorage" or "sessionStorage".');
  });

  it('Should throw TypeError if keyPrefix option is not a string', () => {
    expect(() => {
      return new WebStorage({ keyPrefix: null });
    }).to.throw('The "keyPrefix" option must be a string.');
  });

  // --- Storage API Behavior ------------------------------------------------

  it('Should successfully save and retrieve values to localStorage', () => {
    const store = new WebStorage();

    store.setItem('p1', { foo: 'bar' });
    store.setItem('p2', [1, 2, 3]);
    store.setItem('p3', null);
    store.setItem('p4', void 0);
    store.setItem('p5', 10);
    store.setItem('p6', NaN);
    store.setItem('p7', Infinity);
    store.setItem('p8', -Infinity);
    store.setItem('p9', -0);
    store.setItem('p10', [{ foo: 'bar' }, 'foo', [1, 2, 3]]);

    expect(store.getItem('p1')).to.deep.equal([{ foo: 'bar' }, null]);
    expect(store.getItem('p2')).to.deep.equal([[1, 2, 3], null]);
    expect(store.getItem('p3')).to.deep.equal([null, null]);
    expect(store.getItem('p4')).to.deep.equal([null, null]);
    expect(store.getItem('p5')).to.deep.equal([10, null]);
    expect(store.getItem('p6')).to.deep.equal([null, null]);
    expect(store.getItem('p7')).to.deep.equal([null, null]);
    expect(store.getItem('p8')).to.deep.equal([null, null]);
    expect(store.getItem('p9')).to.deep.equal([0, null]);
    expect(store.getItem('p10')).to.deep.equal([[{ foo: 'bar' }, 'foo', [1, 2, 3]], null]);
  });

  it('Should remove a saved item by its key', () => {
    const store = new WebStorage();

    store.setItem('foo', { foo: 'bar' });
    expect(store.getItem('foo')).to.deep.equal([{ foo: 'bar' }, null]);

    store.removeItem('foo');
    expect(store.getItem('foo')).to.deep.equal([null, null]);
  });

  it('Should clear all keys from a specific database, but leave any other saved data (not in database) intact', () => {
    const store = new WebStorage();

    store.setItem('p1', { foo: 'bar' });
    store.setItem('p2', 'foobar');
    store.setItem('p3', [1, 2, 3]);
    localStorage.setItem('p4', 'Not in database');

    expect(store.length()).to.deep.equal([3, null]);
    store.clear();
    expect(store.length()).to.deep.equal([0, null]);
    expect(localStorage).to.have.length(1);
  });

  it('Should return the keys of a datastore as an array of strings', () => {
    const store = new WebStorage();

    store.setItem('p1', 'Item 1');
    store.setItem('p2', 'Item 2');
    store.setItem('p3', 'Item 3');

    const [keys] = store.keys();
    expect(Array.isArray(keys)).to.be.true;
    expect(keys).to.have.length(3);
    expect(keys.indexOf('p1')).not.to.equal(-1);
    expect(keys.indexOf('p2')).not.to.equal(-1);
    expect(keys.indexOf('p3')).not.to.equal(-1);
    expect(keys.indexOf('p4')).to.equal(-1);
  });

  it('Should return the length of saved items for a specific database', () => {
    const store1 = new WebStorage({ keyPrefix: 'App1/' });
    store1.setItem('p1', 'Item 1');
    store1.setItem('p2', 'Item 2');
    store1.setItem('p3', 'Item 3');
    expect(store1.length()).to.deep.equal([3, null]);

    const store2 = new WebStorage({ keyPrefix: 'App2' });
    store2.setItem('p1', 'Item 1');
    store2.setItem('p2', 'Item 2');
    expect(store2.length()).to.deep.equal([2, null]);
  });

  // --- Iteration ------------------------------------------------

  it('Should iterate over all value/key pairs in datastore', () => {
    const store = new WebStorage();
    const values = [];
    const keys = [];

    store.setItem('p1', 'Item 1');
    store.setItem('p2', 'Item 2');
    store.setItem('p3', 'Item 3');

    store.iterate((value, key) => {
      values.push(value);
      keys.push(key);
    });

    expect(values).to.have.length(3);
    expect(values.includes('Item 1')).to.be.true;
    expect(values.includes('Item 2')).to.be.true;
    expect(values.includes('Item 3')).to.be.true;
  });

  it('Should throw TypeError if "iteratorCallback is not a function"', () => {
    const store = new WebStorage();

    expect(() => store.iterate()).to.throw("Failed to iterate on 'Storage': 'iteratorCallback' must be a function.");
  });

  // --- Edge Cases & Type Safety ------------------------------------------------

  it('getItem should throw TypeError if first argument is not a string', () => {
    const store = new WebStorage();

    expect(() => store.getItem()).to.throw(
      "Failed to execute 'getItem' on 'Storage': The first argument must be a string."
    );
  });

  it('setItem should throw TypeError if first argument is not a string', () => {
    const store = new WebStorage();

    expect(() => store.setItem()).to.throw(
      "Failed to execute 'setItem' on 'Storage': The first argument must be a string."
    );
  });

  it('removeItem should throw TypeError if first argument is not a string', () => {
    const store = new WebStorage();

    expect(() => store.removeItem()).to.throw(
      "Failed to execute 'removeItem' on 'Storage': The first argument must be a string."
    );
  });

  it('setItem should save null if second argument is a function', () => {
    const store = new WebStorage();

    store.setItem('somekey', () => {});
    expect(store.getItem('somekey')).to.deep.equal([null, null]);
  });

  // --- Error values ------------------------------------------------

  it('should return an error if getItem method throws', () => {
    const originalLocalStorage = window.localStorage;
    const throwingStorage = createStorageWithThrowingMethod('getItem', 'Forced read error');

    overrideWindowLocalStorage(throwingStorage);

    const store = new WebStorage();
    const [value, error] = store.getItem('key');

    expect(value).to.be.null;
    expect(error).to.be.an('error');
    expect(error.message).to.equal('Forced read error');

    restoreWindowLocalStorage(originalLocalStorage);
  });

  it('should return an error if setItem method throws', () => {
    const originalLocalStorage = window.localStorage;
    const throwingStorage = createStorageWithThrowingMethod('setItem', 'Forced write error');

    overrideWindowLocalStorage(throwingStorage);

    const store = new WebStorage();
    const [ok, error] = store.setItem('key', 'value');

    expect(ok).to.be.false;
    expect(error).to.be.an('error');
    expect(error.message).to.equal('Forced write error');

    restoreWindowLocalStorage(originalLocalStorage);
  });

  it('should return an error if removeItem method throws', () => {
    const originalLocalStorage = window.localStorage;
    const throwingStorage = createStorageWithThrowingMethod('removeItem', 'Forced remove error');

    overrideWindowLocalStorage(throwingStorage);

    const store = new WebStorage();
    const [ok, error] = store.removeItem('key');

    expect(ok).to.be.false;
    expect(error).to.be.an('error');
    expect(error.message).to.equal('Forced remove error');

    restoreWindowLocalStorage(originalLocalStorage);
  });

  it('should return an error if clear method throws', () => {
    const originalLocalStorage = window.localStorage;
    const throwingStorage = createStorageWithThrowingMethod('removeItem', 'Forced remove error');

    overrideWindowLocalStorage(throwingStorage);

    const store = new WebStorage();
    const [ok, error] = store.clear();

    expect(ok).to.be.false;
    expect(error).to.be.an('error');
    expect(error.message).to.equal('Forced remove error');

    restoreWindowLocalStorage(originalLocalStorage);
  });

  it('should return an error if keys method throws', () => {
    const originalLocalStorage = window.localStorage;
    const throwingStorage = createStorageWithThrowingMethod('getItem', 'Forced read error');

    overrideWindowLocalStorage(throwingStorage);

    const store = new WebStorage();
    const [keys, error] = store.keys();

    expect(keys).to.deep.equal([]);
    expect(error).to.be.an('error');
    expect(error.message).to.equal('Forced read error');

    restoreWindowLocalStorage(originalLocalStorage);
  });

  it('should return an error if length method throws', () => {
    const originalLocalStorage = window.localStorage;
    const throwingStorage = createStorageWithThrowingMethod('getItem', 'Forced read error');

    overrideWindowLocalStorage(throwingStorage);

    const store = new WebStorage();
    const [len, error] = store.length();

    expect(len).to.equal(0);
    expect(error).to.be.an('error');
    expect(error.message).to.equal('Forced read error');

    restoreWindowLocalStorage(originalLocalStorage);
  });

  it('should return an error if iterate method throws', () => {
    const originalLocalStorage = window.localStorage;
    const throwingStorage = createStorageWithThrowingMethod('getItem', 'Forced read error');

    overrideWindowLocalStorage(throwingStorage);

    const store = new WebStorage();
    const callback = sinon.stub();
    const [ok, error] = store.iterate(callback);

    expect(ok).to.be.false;
    expect(error).to.be.an('error');
    expect(error.message).to.equal('Forced read error');
    expect(callback.called).to.be.false;

    restoreWindowLocalStorage(originalLocalStorage);
  });
});
