/**
 * Helper function that creates the storage key's prefix.
 *
 * @param {Object} instance The WebStorage instance.
 * @return {String} Returns the keys's prefix.
 */
function createKeyPrefix(instance) {
  return `${instance.options.name}${instance.options.keySeparator}`;
}

export default createKeyPrefix;
