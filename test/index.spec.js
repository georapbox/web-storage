import WebStorage from '../src';

const ls = WebStorage.createInstance();

describe('WebStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('Should create a new instance', () => {
    expect(ls.constructor.name).toBe('WebStorage');
  });

  it('Should create a new instance with a new namespace', () => {
    expect(new WebStorage({
      keyPrefix: 'MyApp/'
    })._keyPrefix).toBe('MyApp/');
  });

  it('Should create a new instance with default options if not provided by user', () => {
    expect(new WebStorage()._storageType).toBe('localStorage');
    expect(new WebStorage()._keyPrefix).toBe('web-storage/');
  });

  it('Should throw Error if driver option is not "localStorage" or "sessionStorage"', () => {
    expect(() => new WebStorage({
      driver: 'fakeStorage'
    })).toThrow(new Error('The "driver" option must be one of "localStorage" or "sessionStorage".'));
  });

  it('Should throw TypeError if keyPrefix option is not a string', () => {
    expect(() => new WebStorage({
      keyPrefix: null
    })).toThrow(new TypeError('The "keyPrefix" option must be a string.'));
  });

  it('Should trim (left and right) the "keyPrefix"', () => {
    expect(new WebStorage({ keyPrefix: ' my-app ' })._keyPrefix).toBe('my-app');
    expect(new WebStorage({ keyPrefix: ' my-app' })._keyPrefix).toBe('my-app');
    expect(new WebStorage({ keyPrefix: 'my-app ' })._keyPrefix).toBe('my-app');
  });

  it('Should succesfully save and retrieve values to localStorage', () => {
    ls.setItem('p1', { foo: 'bar' });
    ls.setItem('p2', [1, 2, 3]);
    ls.setItem('p3', null);
    ls.setItem('p4', void 0);
    ls.setItem('p5', 10);
    ls.setItem('p6', NaN);
    ls.setItem('p7', Infinity);
    ls.setItem('p8', -Infinity);
    ls.setItem('p9', -0);

    expect(ls.getItem('p1')).toEqual({ foo: 'bar' });
    expect(ls.getItem('p2')).toEqual([1, 2, 3]);
    expect(ls.getItem('p3')).toBeNull();
    expect(ls.getItem('p4')).toBeNull();
    expect(ls.getItem('p5')).toBe(10);
    expect(ls.getItem('p6')).toBeNull();
    expect(ls.getItem('p7')).toBeNull();
    expect(ls.getItem('p8')).toBeNull();
    expect(ls.getItem('p9')).toBe(0);
  });

  it('Should remove a saved item by its key', () => {
    ls.setItem('foo', { foo: 'bar' });

    expect(ls.getItem('foo')).toEqual({ foo: 'bar' });

    ls.removeItem('foo');

    expect(ls.getItem('foo')).toBeNull();
  });

  it('Should clear all keys from a specific database, but leave any other saved data (not in database) intact', () => {
    ls.setItem('p1', { foo: 'bar' });
    ls.setItem('p2', 'foobar');
    ls.setItem('p3', [1, 2, 3]);

    localStorage.setItem('p4', 'Not in database');

    expect(ls.length()).toBe(3);

    ls.clear();

    expect(ls.length()).toBe(0);
    expect(localStorage).toHaveLength(1);
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

    expect(values).toHaveLength(3);
    expect(values[0]).toBe('Item 1');
    expect(values[1]).toBe('Item 2');
    expect(values[2]).toBe('Item 3');

    expect(keys).toHaveLength(3);
    expect(keys[0]).toBe('p1');
    expect(keys[1]).toBe('p2');
    expect(keys[2]).toBe('p3');
  });

  it('Should throw TypeError if "iteratorCallback is not a function"', () => {
    expect(() => ls.iterate()).toThrow(new TypeError('Failed to iterate on \'Storage\': \'iteratorCallback\' must be a function.'));
  });

  it('Should return the keys of a datastore as an array of strings', () => {
    ls.setItem('p1', 'Item 1');
    ls.setItem('p2', 'Item 2');
    ls.setItem('p3', 'Item 3');

    const keys = ls.keys();

    expect(Array.isArray(keys)).toBe(true);
    expect(keys).toHaveLength(3);
    expect(keys.indexOf('p1')).not.toBe(-1);
    expect(keys.indexOf('p2')).not.toBe(-1);
    expect(keys.indexOf('p3')).not.toBe(-1);
    expect(keys.indexOf('p4')).toBe(-1);
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

    expect(ls1.length()).toBe(3);

    expect(ls2.length()).toBe(2);
  });

  it('Should check if localStorage is available', () => {
    expect(WebStorage.isAvailable('fakeStorage')).toBe(false);

    expect(WebStorage.isAvailable('localStorage')).toBe(true);
  });

  it('getItem should throw TypeError if first argument is not a string', () => {
    expect(() => ls.getItem()).toThrow(TypeError('Failed to execute \'getItem\' on \'Storage\': The first argument must be a string.'));
  });

  it('setItem should throw TypeError if first argument is not a string', () => {
    expect(() => ls.setItem()).toThrow(TypeError('Failed to execute \'setItem\' on \'Storage\': The first argument must be a string.'));
  });

  it('removeItem should throw TypeError if first argument is not a string', () => {
    expect(() => ls.removeItem()).toThrow(new TypeError('Failed to execute \'removeItem\' on \'Storage\': The first argument must be a string.'));
  });

  it('setItem should save null if second argument is a function', () => {
    ls.setItem('somekey', () => {});
    expect(ls.getItem('somekey')).toBeNull();
  });

  it('Should mock getItem, setItem and removeItem methods if for any reason Storage is not available in global namespace', () => {
    const tempLocalStorage = global.localStorage;
    delete global.localStorage;

    const storage = WebStorage.createInstance();

    expect(storage._driver instanceof Storage).toBe(false);
    expect(() => storage.getItem('key')).not.toThrow();
    expect(() => storage.setItem('key', 'value')).not.toThrow();
    expect(() => storage.removeItem('key')).not.toThrow();

    global.localStorage = tempLocalStorage;
  });
});
