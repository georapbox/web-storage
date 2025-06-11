// @ts-check

/**
 * @typedef {'localStorage' | 'sessionStorage'} WebStorageType
 */

/**
 * @typedef {object} WebStorageOptions
 * @property {WebStorageType} [driver] - The preferred driver to use. Use one between "localStorage" and "sessionStorage".
 * @property {string} [keyPrefix] - The prefix for all keys stored in the offline storage. Value is trimmed internally (both left and right) to avoid potential user mistakes.
 */

const DEFAULT_DRIVER = 'localStorage';
const DEFAULT_KEY_PREFIX = 'web-storage/';

/**
 * Removes the specified prefix from a string if it exists.
 * If the string does not start with the prefix, it returns the original string.
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

/**
 * Checks if the specified storage type is available in the browser.
 *
 * @param {WebStorageType} storageType - The type of storage to check (e.g., 'localStorage', 'sessionStorage').
 * @returns {boolean} Returns true if the storage type is available, otherwise false.
 */
function hasStorage(storageType) {
  try {
    let storage = window[storageType];
    const testKey = '__web-storage__test';

    storage.setItem(testKey, 'test');
    storage.getItem(testKey);
    storage.removeItem(testKey);
  } catch {
    return false;
  }

  return true;
}

/**
 * Returns a storage instance based on the specified storage type.
 * If the storage type is not available, it returns a noop storage instance.
 *
 * @param {WebStorageType} storageType - The type of storage to retrieve (e.g., 'localStorage', 'sessionStorage').
 * @returns {Storage} - Returns the storage instance if available, otherwise a noop storage instance.
 */
function getStorage(storageType) {
  return hasStorage(storageType) ? window[storageType] : createNoopStorage();
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
   * @throws {Error} - Throws `Error` if `option.driver` is any value other than "localStorage" or "sessionStorage".
   * @throws {TypeError} - Throws `TypeError` if `option.keyPrefix` is not of type `String`.
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

    this.#driver = getStorage(opts.driver);
    this.#keyPrefix = opts.keyPrefix.trim();
  }

  /**
   * Gets a saved item from storage by its key
   *
   * @param {string} key - The property name of the saved item.
   * @throws {TypeError} - Throws if `key` is not a string.
   * @returns {[any, Error | null]} - Returns an array with two elements: the first is the value of the saved item, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
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
   * Saves an item to storage
   *
   * @param {string} key - The property name of the item to save.
   * @param {any} value - The item to save to the selected storage.
   * @throws {TypeError} - Throws if `key` is not a string.
   * @returns {[boolean, Error | null]} - Returns an array with two elements: the first is `true` if the item was saved successfully, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
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
   * Removes the item for the specific key from the storage.
   *
   * @param {string} key - The property name of the item to remove.
   * @throws {TypeError} - Throws if `key` is not a string.
   * @returns {[boolean, Error | null]} - Returns an array with two elements: the first is `true` if the item was removed successfully, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
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
   * Removes all saved items from storage.
   *
   * @returns {[boolean, Error | null]} - Returns an array with two elements: the first is `true` if all items were removed successfully, or `false` if they were not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
   */
  clear() {
    try {
      this.#iterateStorage(this.#driver.removeItem.bind(this.#driver));
      return [true, null];
    } catch (error) {
      return [false, error instanceof Error ? error : new Error(String(error))];
    }
  }

  /**
   * Gets the list of all keys in the offline storage for a specific datastore.
   *
   * @returns {[string[], Error | null]} - Returns an array with two elements: the first is an array of keys (without the prefix) for the saved items, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
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
   * Gets the number of items saved in a specific datastore.
   *
   * @returns {[number, Error | null]} - Returns an array with two elements: the first is the number of items saved in the datastore, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
   */
  length() {
    const [keys, err] = this.keys();
    return err ? [0, err] : [keys.length, null];
  }

  /**
   * Iterate over all value/key pairs in datastore.
   *
   * @param {(value: any, key: string) => void} iteratorCallback - The callback function to execute for each key-value pair.
   * @throws {TypeError} - If `iteratorCallback` is not a function.
   * @returns {[boolean, Error | null]} - Returns an array with two elements: the first is `true` if the iteration was successful, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.
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
   * Check if `storageType` is supported and is available.
   * Storage might be unavailable due to no browser support or due to being full or due to browser privacy settings.
   *
   * @param {WebStorageType} storageType - The storage type; available values "localStorage" or "sessionStorage".
   * @returns {boolean} - Returns `true` if `storage` available; otherwise `false`.
   */
  static isAvailable(storageType) {
    return hasStorage(storageType);
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
