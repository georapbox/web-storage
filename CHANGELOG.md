# CHANGELOG

## v3.0.0 (2025-06-XX)

### BREAKING CHANGES

- The `WebStorage` module is now exclusively available as an ES module (ESM), aligning with the modern JavaScript module standard. Additionally, it is no longer the default export — you must import it using a named import.  
  **v2.x.x**
  ```js
  import WebStorage from '@georapbox/web-storage';
  ```
  
  **v3.x.x**
  ```js
  import { WebStorage } from '@georapbox/web-storage';
  ```
- All API methods now return `[value, error]` tuple-like values instead of accepting error callbacks.
  This allows developers to handle errors in a clean, synchronous style without using `try/catch` or providing callbacks. For example:
  
  **v2.x.x**
  ```js
  const value = storage.getItem('key', value, (err) => {
    console.error(err);
  });
  ```
  
  **v3.x.x**
  ```js
  const [value, error] = storage.getItem('key', value);
  
  if (error) {
    console.error(error);
  }
  ```
- Removed support for error callback functions in all methods (`getItem`, `setItem`, `removeItem`, `clear`, `keys`, `length`, `iterate`). Errors must now be handled via the returned tuple.
- Internal `_keyPrefix` and `_driver` fields are now private class fields (`#keyPrefix`, `#driver`). They are no longer accessible outside the class.

## NEW FEATURES

- Export type declaration files (`.d.ts`) for TypeScript users, ensuring better type safety and autocompletion support in TypeScript projects.

### INTERNAL CHANGES

- Rewrite to use native class private fields.
- Internal noopStorage fallback now fully conforms to the Storage interface.
- Drop Jest in favor of @web/test-runner and Playwright for testing.
- Drop rollup in favor of esbuild for bundling.
- Update Node.js version requirement to 22.x.x.
- Update dependencies to their latest versions.

## v2.1.0 (2021-01-26)

- Generate minified versions for ESM and CommonJS exported bubdles.

### Internal changes

- Replace Mocha with Jest as testing framework.
- Replace Travis CI with Github actions.

## v2.0.0

### BREAKING CHANGES

- `driver` option in initialization configuration is now of type `String` and available values can be "localStorage" or "sessionStorage".

  In version 1.x it used to be the `localStorage` or `sessionStorage` object which resulted in throwing exception if Storage was not available due to privacy settings (eg. some browsers disable cookies and storage). See [issue #2](https://github.com/georapbox/web-storage/issues/2).

  As of version 2.x the library internally checks if Storage is available and fallbacks to `noop` storage otherwise.

  **v1.x.x**  
  ```js
  new WebStorage({ driver: window.localStorage })
  ```

  **v2.x.x**  
  ```js
  new WebStorage({ driver: 'localStorage' })
  ```
- `WebStorage.isAvailable` static method, as of v2.x, accepts "localStorage" or "sessionStorage" strings as arguments.
- On initialization the library **throws** if `driver` option is anything other than "localStorage" or "sessionStorage" and if `keyPrefix` option is not of type `String`.

### OTHER CHANGES

- Keep `devDependencies` up to date.

## v1.2.0
- Replace `Webpack` with `Rollup` for bundling the library.

## v1.1.0
- Add static method `WebStorage.createInstance([options])` as an alternative way to create a new instance.

## v1.0.0
- Initial realease
