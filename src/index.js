import trim from './utils/trim';
import removePrefix from './utils/remove-prefix';
import assign from './utils/assign';
import isString from './utils/is-string';
import isFunction from './utils/is-function';
import iterateStorage from './iterate-storage';

class WebStorage {
  /**
   * WebStorage constructor
   *
   * @constructor
   * @param {Object} [options] Object that contains config options to extend defaults.
   * @param {Object} [options.driver=localStorage] The preferred driver to use. Use one between `localStorage` and `sessionStorage`.
   * @param {String} [options.keyPrefix='web-storage/'] The prefix for all keys stored in the offline storage.
   *                 If provided any value that is not of type string, or an empty string (`''`) the default value will be used.
   *                 Keep in mind that the value provided is trimmed internally (both left and right) to avoid potential user mistakes.
   */
  constructor(options) {
    /**
     * Default configuration
     * @private
     * @type {Object}
     */
    const defaults = {
      driver: localStorage,
      keyPrefix: 'web-storage/'
    };

    this.options = assign({}, defaults, options);

    this.options.keyPrefix = !isString(this.options.keyPrefix) || trim(this.options.keyPrefix) === ''
      ? defaults.keyPrefix
      : trim(this.options.keyPrefix);
  }

  /**
   * Gets a saved item from storage by its key
   *
   * @this {WebStorage}
   * @param {String} key The property name of the saved item
   * @param {Function} [onErrorCallback = () => {}] Callback function to be executed if an error occurs
   * @throws {TypeError} Throws if `key` is not a string
   * @returns {*} Returns the retrieved value if found or `null` if value not found or operation has failed due to error
   */
  getItem(key, onErrorCallback = () => {}) {
    if (!isString(key)) {
      throw new TypeError('Failed to execute \'getItem\' on \'Storage\': The first argument must be a string.');
    }

    let res = null;

    try {
      const item = this.options.driver.getItem(this.options.keyPrefix + key);
      const parsed = JSON.parse(item);
      res = parsed;
    } catch (error) {
      onErrorCallback(error);
    }

    return res;
  }

  /**
   * Saves an item to storage
   *
   * @this {WebStorage}
   * @param {String} key The property name of the item to save
   * @param {*} value The item to save to the selected storage
   * @param {Function} [onErrorCallback = () => {}] Callback function to be executed if an error occurs
   * @throws {TypeError} Throws if `key` is not a string
   * @returns {undefined}
   */
  setItem(key, value, onErrorCallback = () => {}) {
    if (!isString(key)) {
      throw new TypeError('Failed to execute \'setItem\' on \'Storage\': The first argument must be a string.');
    }

    key = this.options.keyPrefix + key;
    value = value == null || isFunction(value) ? null : value;

    try {
      this.options.driver.setItem(key, JSON.stringify(value));
    } catch (error) {
      onErrorCallback(error);
    }
  }

  /**
   * Removes the item for the specific key from the storage
   *
   * @this {WebStorage}
   * @param {String} key The property name of the item to remove
   * @param {Function} [onErrorCallback = () => {}] Callback function to be executed if an error occurs
   * @throws {TypeError} Throws if `key` is not a string
   * @returns {undefined}
   */
  removeItem(key, onErrorCallback = () => {}) {
    if (!isString(key)) {
      throw new TypeError('Failed to execute \'removeItem\' on \'Storage\': The first argument must be a string.');
    }

    const keyPrefix = this.options.keyPrefix;

    try {
      this.options.driver.removeItem(keyPrefix + key);
    } catch (error) {
      onErrorCallback(error);
    }
  }

  /**
   * Removes all saved items from storage
   *
   * @this {WebStorage}
   * @param {Function} [onErrorCallback = () => {}] Callback function to be executed if an error occurs
   * @returns {undefined}
   */
  clear(onErrorCallback = () => {}) {
    const driver = this.options.driver;

    try {
      iterateStorage(this, driver.removeItem.bind(driver));
    } catch (error) {
      onErrorCallback(error);
    }
  }

  /**
   * Gets the list of all keys in the offline storage for a specific datastore
   *
   * @this {WebStorage}
   * @param {Function} [onErrorCallback = () => {}] Callback function to be executed if an error occurs
   * @returns {Array|undefined} Returns an array of all the keys that belong to a specific datastore. If any error occurs, returns `undefined`.
   */
  keys(onErrorCallback = () => {}) {
    const res = [];
    const keyPrefix = this.options.keyPrefix;

    try {
      iterateStorage(this, key => res.push(removePrefix(key, keyPrefix)));
      return res;
    } catch (error) {
      onErrorCallback(error);
    }
  }

  /**
   * Gets the number of items saved in a specific datastore
   *
   * @this {WebStorage}
   * @param {Function} [onErrorCallback = () => {}] Callback function to be executed if an error occurs
   * @returns {Number|undefined} Returns the number of items for a specific datastore. If any error occurs, returns `undefined`.
   */
  length(onErrorCallback = () => {}) {
    try {
      return this.keys().length;
    } catch (error) {
      onErrorCallback(error);
    }
  }

  /**
   * Iterate over all value/key pairs in datastore
   *
   * @this {WebStorage}
   * @param {function} iteratorCallback A callabck function to be executed for each iteration
   *        `iteratorCallback` is called once for each pair, with the following arguments:
   *        - {*} value The value of the saved item
   *        - {String} key The key of the saved item
   * @param {Function} [onErrorCallback = () => {}] Callback function to be executed if an error occurs
   * @throws {TypeError} If `iteratorCallback` is not a function
   * @returns {undefined}
   */
  iterate(iteratorCallback, onErrorCallback = () => {}) {
    if (!isFunction(iteratorCallback)) {
      throw new TypeError('Failed to iterate on \'Storage\': \'iteratorCallback\' must be a function.');
    }

    const keyPrefix = this.options.keyPrefix;

    try {
      iterateStorage(this, (key, value) => {
        const _key = removePrefix(key, keyPrefix);
        const _value = JSON.parse(value);
        iteratorCallback.call(this, _value, _key);
      });
    } catch (error) {
      onErrorCallback(error);
    }
  }
}

/**
 * Check if `storage` is supported and is available.
 * Storage might be unavailable due to no browser support or due to being full or due to browser privacy settings.
 *
 * @static
 * @param {Object} storage The storage type; available values `localStorage` or `sessionStorage`
 * @returns {Boolean} Returns `true` if `storage` available; otherwise `false`
 */
WebStorage.isAvailable = storage => {
  const key = '@georapbox/web-storage/test';

  try {
    storage.setItem(key, 'test');
    storage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
};

export default WebStorage;
