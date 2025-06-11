import { expect } from '@open-wc/testing';
import { WebStorage } from '../src/web-storage.js';

const ls = WebStorage.createInstance();

describe('WebStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
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
    ls.setItem('p1', { foo: 'bar' });
    ls.setItem('p2', [1, 2, 3]);
    ls.setItem('p3', null);
    ls.setItem('p4', void 0);
    ls.setItem('p5', 10);
    ls.setItem('p6', NaN);
    ls.setItem('p7', Infinity);
    ls.setItem('p8', -Infinity);
    ls.setItem('p9', -0);

    expect(ls.getItem('p1')).to.deep.equal([{ foo: 'bar' }, null]);
    expect(ls.getItem('p2')).to.deep.equal([[1, 2, 3], null]);
    expect(ls.getItem('p3')).to.deep.equal([null, null]);
    expect(ls.getItem('p4')).to.deep.equal([null, null]);
    expect(ls.getItem('p5')).to.deep.equal([10, null]);
    expect(ls.getItem('p6')).to.deep.equal([null, null]);
    expect(ls.getItem('p7')).to.deep.equal([null, null]);
    expect(ls.getItem('p8')).to.deep.equal([null, null]);
    expect(ls.getItem('p9')).to.deep.equal([0, null]);
  });

  it('Should remove a saved item by its key', () => {
    ls.setItem('foo', { foo: 'bar' });
    expect(ls.getItem('foo')).to.deep.equal([{ foo: 'bar' }, null]);

    ls.removeItem('foo');
    expect(ls.getItem('foo')).to.deep.equal([null, null]);
  });

  it('Should clear all keys from a specific database, but leave any other saved data (not in database) intact', () => {
    ls.setItem('p1', { foo: 'bar' });
    ls.setItem('p2', 'foobar');
    ls.setItem('p3', [1, 2, 3]);
    localStorage.setItem('p4', 'Not in database');

    expect(ls.length()).to.deep.equal([3, null]);
    ls.clear();
    expect(ls.length()).to.deep.equal([0, null]);
    expect(localStorage).to.have.length(1);
  });

  it('Should return the keys of a datastore as an array of strings', () => {
    ls.setItem('p1', 'Item 1');
    ls.setItem('p2', 'Item 2');
    ls.setItem('p3', 'Item 3');

    const [keys] = ls.keys();
    expect(Array.isArray(keys)).to.be.true;
    expect(keys).to.have.length(3);
    expect(keys.indexOf('p1')).not.to.equal(-1);
    expect(keys.indexOf('p2')).not.to.equal(-1);
    expect(keys.indexOf('p3')).not.to.equal(-1);
    expect(keys.indexOf('p4')).to.equal(-1);
  });

  it('Should return the length of saved items for a specific database', () => {
    const ls1 = new WebStorage({ keyPrefix: 'App1/' });
    ls1.setItem('p1', 'Item 1');
    ls1.setItem('p2', 'Item 2');
    ls1.setItem('p3', 'Item 3');
    expect(ls1.length()).to.deep.equal([3, null]);

    const ls2 = new WebStorage({ keyPrefix: 'App2' });
    ls2.setItem('p1', 'Item 1');
    ls2.setItem('p2', 'Item 2');
    expect(ls2.length()).to.deep.equal([2, null]);
  });

  // --- Iteration ------------------------------------------------

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

    expect(values).to.have.length(3);
    expect(values.includes('Item 1')).to.be.true;
    expect(values.includes('Item 2')).to.be.true;
    expect(values.includes('Item 3')).to.be.true;
  });

  it('Should throw TypeError if "iteratorCallback is not a function"', () => {
    expect(() => ls.iterate()).to.throw("Failed to iterate on 'Storage': 'iteratorCallback' must be a function.");
  });

  // --- Edge Cases & Type Safety ------------------------------------------------

  it('getItem should throw TypeError if first argument is not a string', () => {
    expect(() => ls.getItem()).to.throw(
      "Failed to execute 'getItem' on 'Storage': The first argument must be a string."
    );
  });

  it('setItem should throw TypeError if first argument is not a string', () => {
    expect(() => ls.setItem()).to.throw(
      "Failed to execute 'setItem' on 'Storage': The first argument must be a string."
    );
  });

  it('removeItem should throw TypeError if first argument is not a string', () => {
    expect(() => ls.removeItem()).to.throw(
      "Failed to execute 'removeItem' on 'Storage': The first argument must be a string."
    );
  });

  it('setItem should save null if second argument is a function', () => {
    ls.setItem('somekey', () => {});
    expect(ls.getItem('somekey')).to.deep.equal([null, null]);
  });

  // --- Fallback / Noop Storage Behavior ------------------------------------------------

  it('Should fallback to a noop storage driver if Storage is not available', () => {
    const tempLocalStorage = window.localStorage;
    delete window.localStorage;

    const storage = WebStorage.createInstance();

    expect(storage._driver instanceof Storage).to.be.false;

    expect(() => storage.getItem('key')).not.to.throw();
    expect(storage.getItem('key')).to.deep.equal([null, null]);

    expect(() => storage.setItem('key', 'value')).not.to.throw();
    expect(storage.setItem('key')).to.deep.equal([true, null]);

    expect(() => storage.removeItem('key')).not.to.throw();
    expect(storage.removeItem('key')).to.deep.equal([true, null]);

    expect(() => storage.clear()).not.to.throw();
    expect(storage.clear()).to.deep.equal([true, null]);

    expect(() => storage.iterate(() => {})).not.to.throw();
    expect(storage.iterate(() => {})).to.deep.equal([true, null]);

    expect(() => storage.keys()).not.to.throw();
    expect(storage.keys()).to.deep.equal([[], null]);

    expect(() => storage.length()).not.to.throw();
    expect(storage.length()).to.deep.equal([0, null]);

    expect(WebStorage.isAvailable('localStorage')).to.be.false;

    window.localStorage = tempLocalStorage;
  });

  // --- Feature Detection ------------------------------------------------

  it('Should check if localStorage is available', () => {
    expect(WebStorage.isAvailable('fakeStorage')).to.be.false;
    expect(WebStorage.isAvailable('localStorage')).to.be.true;
  });
});
