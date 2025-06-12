// @ts-check

/**
 * The type of web storage to use.
 *
 * @typedef {'localStorage' | 'sessionStorage'} WebStorageType
 */

/**
 * Options for configuring the WebStorage instance.
 *
 * @typedef {object} WebStorageOptions
 * @property {WebStorageType} [driver] - The preferred driver to use. Use one between "localStorage" and "sessionStorage".
 * @property {string} [keyPrefix] - The prefix for all keys stored in the offline storage. Value is trimmed internally (both left and right) to avoid potential user mistakes.
 */

/**
 * A tuple representing either a successful value or an error.
 *
 * @template T
 * @typedef {[T, Error | null]} Result
 */

const DEFAULT_DRIVER = 'localStorage';
const DEFAULT_KEY_PREFIX = 'web-storage/';
const STORAGE_TEST_KEY = '__web-storage-test__';

/**
 * Removes the specified prefix from a string if it exists.
 * If the string does not start with the prefix, it returns the original string.
 *
 * @param {string} str - The string from which to remove the prefix.
 * @param {string} prefix - The prefix to remove from the string.
 * @returns {string} - The string without the prefix, or the original string if the prefix was not found.
 */
function removePrefix(str, prefix) {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length);
  }
  return str;
}

/**
 * Creates a no-operation fallback implementation of the Web Storage API.
 *
 * This function returns an object that conforms to the `Storage` interface
 * but performs no actual storage operations. It is intended for use in
 * environments where `localStorage` or `sessionStorage` is unavailable or restricted.
 *
 * Behavior:
 * - `getItem` and `key` always return `null`
 * - `setItem`, `removeItem`, and `clear` do nothing and return `undefined`
 * - `length` is always `0`
 *
 * This allows safe use of the storage API without requiring availability checks or try/catch blocks.
 *
 * @returns {Storage} A noop-compatible storage object that safely mimics the `Storage` API
 */
function createNoopStorage() {
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    key: () => null,
    clear: () => undefined,
    length: 0
  };
}

class WebStorage {
  /** @type {Storage} */
  #driver;

  /** @type {string} */
  #keyPrefix;

  /**
   * Creates a new instance of WebStorage.
   *
   * @param {WebStorageOptions} [options={}] - The options to configure the WebStorage instance.
   * @throws {Error} - Throws if `option.driver` is any value other than "localStorage" or "sessionStorage".
   * @throws {TypeError} - Throws if `option.keyPrefix` is not of type `String`.
   */
  constructor(options = {}) {
    const defaults = { driver: DEFAULT_DRIVER, keyPrefix: DEFAULT_KEY_PREFIX };
    const opts = { ...defaults, ...options };

    if (opts.driver !== 'localStorage' && opts.driver !== 'sessionStorage') {
      throw new Error('The "driver" option must be one of "localStorage" or "sessionStorage".');
    }

    if (typeof opts.keyPrefix !== 'string') {
      throw new TypeError('The "keyPrefix" option must be a string.');
    }

    this.#driver = WebStorage.isAvailable(opts.driver) ? window[opts.driver] : createNoopStorage();
    this.#keyPrefix = opts.keyPrefix.trim();
  }

  /**
   * Gets the saved item for the specified key from the storage for a specific datastore.
   *
   * @param {string} key - The key of the item to retrieve.
   * @throws {TypeError} - Throws if `key` is not a string.
   * @returns {Result<unknown>} - Returns an array with two elements: the first is the value of the saved item, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
   */
  getItem(key) {
    if (typeof key !== 'string') {
      throw new TypeError("Failed to execute 'getItem' on 'Storage': The first argument must be a string.");
    }

    try {
      const raw = this.#driver.getItem(this.#keyPrefix + key);
      return raw === null ? [null, null] : [JSON.parse(raw), null];
    } catch (error) {
      return [null, error instanceof Error ? error : new Error(String(error))];
    }
  }

  /**
   * Saves an item to storage with the specified key.
   *
   * @param {string} key - The key under which to store the item.
   * @param {any} value - The item to save to the selected storage.
   * @throws {TypeError} - Throws if `key` is not a string.
   * @returns {Result<boolean>} - Returns an array with two elements: the first is `true` if the item was saved successfully, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
   */
  setItem(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError("Failed to execute 'setItem' on 'Storage': The first argument must be a string.");
    }

    try {
      const storageKey = this.#keyPrefix + key;
      const safeValue = value == null || typeof value === 'function' ? null : value;
      this.#driver.setItem(storageKey, JSON.stringify(safeValue));
      return [true, null];
    } catch (error) {
      return [false, error instanceof Error ? error : new Error(String(error))];
    }
  }

  /**
   * Removes the saved item for the specified key from storage.
   *
   * @param {string} key - The key of the item to remove.
   * @throws {TypeError} - Throws if `key` is not a string.
   * @returns {Result<boolean>} - Returns an array with two elements: the first is `true` if the item was removed successfully, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
   */
  removeItem(key) {
    if (typeof key !== 'string') {
      throw new TypeError("Failed to execute 'removeItem' on 'Storage': The first argument must be a string.");
    }

    try {
      this.#driver.removeItem(this.#keyPrefix + key);
      return [true, null];
    } catch (error) {
      return [false, error instanceof Error ? error : new Error(String(error))];
    }
  }

  /**
   * Removes all saved items from storage for a specific datastore.
   *
   * @returns {Result<boolean>} - Returns an array with two elements: the first is `true` if all items were removed successfully, or `false` if they were not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
   */
  clear() {
    try {
      this.#iterateStorage(key => this.#driver.removeItem(key));
      return [true, null];
    } catch (error) {
      return [false, error instanceof Error ? error : new Error(String(error))];
    }
  }

  /**
   * Gets all keys (unprefixed) of saved items in a specific datastore.
   *
   * @returns {Result<string[]>} - Returns an array with two elements: the first is an array of keys (without the prefix) for the saved items, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
   */
  keys() {
    try {
      /** @type {string[]} */
      const result = [];

      this.#iterateStorage(key => {
        const unprefixedKey = removePrefix(key, this.#keyPrefix);
        result.push(unprefixedKey);
      });
      return [result, null];
    } catch (error) {
      return [[], error instanceof Error ? error : new Error(String(error))];
    }
  }

  /**
   * Gets the number of saved items in a specific datastore.
   *
   * @returns {Result<number>} - Returns an array with two elements: the first is the number of items saved in the datastore, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
   */
  length() {
    const [keys, err] = this.keys();
    return err ? [0, err] : [keys.length, null];
  }

  /**
   * Iterates over all saved items in storage for a specific datastore and execute a callback function for each key-value pair.
   *
   * @param {(value: any, key: string) => void} iteratorCallback - The callback function to execute for each key-value pair.
   * @throws {TypeError} - Throws if `iteratorCallback` is not a function.
   * @returns {Result<boolean>} - Returns an array with two elements: the first is `true` if the iteration was successful, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
   */
  iterate(iteratorCallback) {
    if (typeof iteratorCallback !== 'function') {
      throw new TypeError("Failed to iterate on 'Storage': 'iteratorCallback' must be a function.");
    }

    try {
      this.#iterateStorage((key, value) => {
        const unprefixedKey = removePrefix(key, this.#keyPrefix);
        const parsedValue = JSON.parse(value);
        iteratorCallback.call(this, parsedValue, unprefixedKey);
      });
      return [true, null];
    } catch (error) {
      return [false, error instanceof Error ? error : new Error(String(error))];
    }
  }

  /**
   * Iterates over all keys in the storage and executes a callback function for each key-value pair.
   *
   * @param {(key: string, value: any) => void} callback - The callback function to execute for each key-value pair.
   */
  #iterateStorage(callback) {
    const keys = Object.keys(this.#driver);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (key.startsWith(this.#keyPrefix)) {
        callback(key, this.#driver.getItem(key));
      }
    }
  }

  /**
   * Checks if `storageType` is supported and is available.
   * Storage might be unavailable due to no browser support or due to being full or due to browser privacy settings.
   *
   * @param {WebStorageType} storageType - The storage type; available values "localStorage" or "sessionStorage".
   * @returns {boolean} - Returns `true` if `storage` available; otherwise `false`.
   */
  static isAvailable(storageType) {
    try {
      const storage = window[storageType];
      const testKey = STORAGE_TEST_KEY;

      storage.setItem(testKey, 'test');
      storage.getItem(testKey);
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates a new instance of WebStorage with the provided options.
   *
   * @param {WebStorageOptions} [options] - The options to configure the WebStorage instance.
   * @returns {WebStorage} - Returns a new instance of WebStorage.
   */
  static createInstance(options) {
    return new WebStorage(options);
  }
}

export { WebStorage };
