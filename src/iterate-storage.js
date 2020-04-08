import keyBelongsToDB from './key-belongs-to-db';

/**
 * Helper function that iterates over storage keys.
 *
 * @param {Object} instance The WebStorage instance.
 * @param {function} callback A function to be executed for each iteration.
 * @return {undefined}
 */
function iterateStorage(instance, callback) {
  const driver = instance._driver;

  Object.keys(driver).forEach(function (key) {
    if (keyBelongsToDB(instance, key)) {
      callback(key, driver[key]);
    }
  });
}

export default iterateStorage;
