import beginsWith from './utils/begins-with';

/**
 * Helper function that checks if a key belongs to a database.
 * Check is done using the keys' prefix.
 *
 * @param {Object} instance The WebStorage instance.
 * @param {String} key The key to check if belongs to a database.
 * @return {Boolean} Returns true if key belongs to a database else returns false.
 */
function keyBelongsToDB(instance, key) {
  return beginsWith(key, instance._keyPrefix);
}

export default keyBelongsToDB;
