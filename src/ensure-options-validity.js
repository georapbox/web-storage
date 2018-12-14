import trim from './utils/trim';

/**
 * Validate options passed by user to ensure that they are supported.
 *
 * @param {Object} options User's options object.
 * @throws {Error|TypeError} It throws if at least one option is not supported.
 * @returns {undefined}
 */
const ensureOptionsValidity = options => {
  if (typeof options.name !== 'string' || trim(options.name) === '') {
    throw new TypeError('name" option must be a non empty string.');
  }

  if (typeof options.keySeparator !== 'string' || trim(options.keySeparator) === '') {
    throw new TypeError('"keySeparator" option must be a non empty string');
  }
};

export default ensureOptionsValidity;
