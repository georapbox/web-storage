import removePrefix from './utils/remove-prefix';
import assign from './utils/assign';
import createKeyPrefix from './create-key-prefix';
import iterateStorage from './iterate-storage';
import ensureOptionsValidity from './ensure-options-validity';

export default class WebStorage {
  /**
   * WebStorage constructor
   *
   * @constructor
   * @param {Object} [options] Object that contains config options to extend defaults.
   * @throws {TypeError} If `options.name` is not a string or an empty string.
   * @throws {TypeError} If `options.keySeparator` is not a string or an empty string.
   */
  constructor(options) {
    /**
     * Default configuration
     * @private
     * @type {Object}
     */
    const defaults = {
      driver: localStorage,
      name: 'web-storage',
      keySeparator: '/'
    };

    options = assign({}, defaults, options);
    ensureOptionsValidity(options);
    this.options = options;
    this.storeKeyPrefix = createKeyPrefix(this);
  }

  /**
   * Gets a saved item from storage by its key
   *
   * @this {WebStorage}
   * @param {String} key The property name of the saved item
   * @param {Function} [onCompletedCallback = () => {}] Callback function to be executed after operation completed
   * @returns {*} Returns the retrieved value if found or `null` if value not found or operation has failed due to error
   */
  getItem(key, onCompletedCallback = () => {}) {
    let res = null;
    let err = null;

    try {
      const item = this.options.driver.getItem(this.storeKeyPrefix + key);
      const parsed = JSON.parse(item);
      res = parsed;
    } catch (error) {
      err = error;
    }

    onCompletedCallback(err, res);

    return res;
  }

  /**
   * Saves an item to storage
   *
   * @this {WebStorage}
   * @param {String} key The property name of the item to save
   * @param {*} value The item to save to the selected storage
   * @param {Function} [onCompletedCallback = () => {}] Callback function to be executed after operation completed
   * @returns {undefined}
   */
  setItem(key, value, onCompletedCallback = () => {}) {
    let err = null;

    key = this.storeKeyPrefix + key;

    try {
      this.options.driver.setItem(key, JSON.stringify(value));
    } catch (error) {
      err = error;
    }

    onCompletedCallback(err);
  }

  /**
   * Removes the item for the specific key from the storage
   *
   * @this {WebStorage}
   * @param {String} key The property name of the item to remove
   * @param {Function} [onCompletedCallback = () => {}] Callback function to be executed after operation completed
   * @returns {undefined}
   */
  removeItem(key, onCompletedCallback = () => {}) {
    let err = null;

    try {
      this.options.driver.removeItem(this.storeKeyPrefix + key);
    } catch (error) {
      err = error;
    }

    onCompletedCallback(err);
  }

  /**
   * Removes all saved items from storage
   *
   * @this {WebStorage}
   * @param {Function} [onCompletedCallback = () => {}] Callback function to be executed after operation completed
   * @returns {undefined}
   */
  clear(onCompletedCallback = () => {}) {
    let err = null;
    const driver = this.options.driver;

    try {
      iterateStorage(this, driver.removeItem.bind(driver));
    } catch (error) {
      err = error;
    }

    onCompletedCallback(err);
  }

  /**
   * Gets the list of all keys in the offline storage for a specific database
   *
   * @this {WebStorage}
   * @param {Function} [onCompletedCallback = () => {}] Callback function to be executed after operation completed
   * @returns {Array|undefined} Returns an array of all the keys that belong to a specific database. If any error occurs, returns `undefined`.
   */
  keys(onCompletedCallback = () => {}) {
    let err = null;
    const res = [];
    const storeKeyPrefix = this.storeKeyPrefix;

    try {
      iterateStorage(this, key => res.push(removePrefix(key, storeKeyPrefix)));
    } catch (error) {
      err = error;
    }

    onCompletedCallback(err, err === null ? res : void 0);

    if (err === null) {
      return res;
    }
  }

  /**
   * Gets the number of items saved in a specific database
   *
   * @this {WebStorage}
   * @param {Function} [onCompletedCallback = () => {}] Callback function to be executed after operation completed
   * @returns {Number|undefined} Returns the number of items for a specific database. If any error occurs, returns `undefined`.
   */
  length(onCompletedCallback = () => {}) {
    let err = null;
    let res = 0;

    try {
      res = this.keys().length;
    } catch (error) {
      err = error;
    }

    onCompletedCallback(err, err === null ? res : void 0);

    if (err === null) {
      return res;
    }
  }

  /**
   * Iterate over all value/key pairs in datastore
   *
   * @this {WebStorage}
   * @param {function} iteratorCallback A callabck function to be executed for each iteration
   *        `iteratorCallback` is called once for each pair, with the following arguments:
   *        - {String} key The key of the saved item
   *        - {*} value The value of the saved item
   * @param {Function} [onCompletedCallback = () => {}] Callback function to be executed after operation completed
   * @throws {TypeError} If `iteratorCallback` is not a function
   * @returns {undefined}
   */
  iterate(iteratorCallback, onCompletedCallback = () => {}) {
    if (typeof iteratorCallback !== 'function') {
      throw new TypeError('"iteratorCallback" is expected to be a function');
    }

    let err = null;

    const storeKeyPrefix = this.storeKeyPrefix;

    try {
      iterateStorage(this, (key, value) => {
        const _key = removePrefix(key, storeKeyPrefix);
        const _value = JSON.parse(value);
        iteratorCallback.call(this, _key, _value);
      });
    } catch (error) {
      err = error;
    }

    onCompletedCallback(err);
  }
}
