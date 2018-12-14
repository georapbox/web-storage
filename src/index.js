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
   * @returns {Promise} Returns a Promise that when fulfilled resolves to the retrieved value
   */
  getItem(key) {
    return new Promise((resolve, reject) => {
      try {
        const item = this.options.driver.getItem(this.storeKeyPrefix + key);
        const parsed = JSON.parse(item);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Saves an item to storage
   *
   * @this {WebStorage}
   * @param {String} key The property name of the item to save
   * @param {*} [value=null] The item to save to the selected storage
   * @returns {Promise} Returns a Promise that when fulfilled resolves to the saved value
   */
  setItem(key, value) {
    return new Promise((resolve, reject) => {
      try {
        value = value == null ? null : value;
        key = this.storeKeyPrefix + key;
        this.options.driver.setItem(key, JSON.stringify(value));
        resolve(value);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Removes the item for the specific key from the storage
   *
   * @this {WebStorage}
   * @param {String} key The property name of the item to remove
   * @returns {Promise} Returns a Promise that when fulfilled resolves to `undefined`
   */
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.options.driver.removeItem(this.storeKeyPrefix + key));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Removes all saved items from storage
   *
   * @this {WebStorage}
   * @returns {Promise} Returns a Promise that when fulfilled resolves to `undefined`
   */
  clear() {
    return new Promise((resolve, reject) => {
      try {
        const driver = this.options.driver;
        iterateStorage(this, driver.removeItem.bind(driver));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Gets the list of all keys in the offline storage for a specific database
   *
   * @this {WebStorage}
   * @returns {Promise} Returns a Promise that when fulfilled resolves to an array of all the keys that belong to a specific database
   */
  keys() {
    return new Promise((resolve, reject) => {
      try {
        const keysArr = [];
        const storeKeyPrefix = this.storeKeyPrefix;
        iterateStorage(this, key => keysArr.push(removePrefix(key, storeKeyPrefix)));
        resolve(keysArr);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Gets the number of items saved in a specific database
   *
   * @this {WebStorage}
   * @returns {Promise} Returns a Promise that when fulfilled resolves to the number of items for a specific database
   */
  length() {
    return this.keys().then(keys => keys.length);
  }

  /**
   * Iterate over all value/key pairs in datastore
   *
   * @this {WebStorage}
   * @param {function} iteratorCallback A callabck function to be executed for each iteration
   *        `iteratorCallback` is called once for each pair, with the following arguments:
   *        - {String} key The key of the saved item
   *        - {*} value The value of the saved item
   * @returns {Promise} Returns a Promise that when fulfilled resolves to `undefined`
   */
  iterate(iteratorCallback) {
    return new Promise((resolve, reject) => {
      if (typeof iteratorCallback !== 'function') {
        reject('"iteratorCallback" is expected to be a function');
      }

      try {
        const storeKeyPrefix = this.storeKeyPrefix;

        iterateStorage(this, (key, value) => {
          const _key = removePrefix(key, storeKeyPrefix);
          const _value = JSON.parse(value);
          iteratorCallback.call(this, _key, _value);
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
