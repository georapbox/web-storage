# CHANGELOG

## v3.0.0 (2025-06-18)

### BREAKING CHANGES

#### Switch to ES modules and named exports

The `WebStorage` module is now exclusively available as an ES module (ESM), aligning with the modern JavaScript module standard. Additionally, it is no longer the default export — you must import it using a named import.

**v2.x.x**
```js
import WebStorage from '@georapbox/web-storage';
```

**v3.x.x**
```js
import { WebStorage } from '@georapbox/web-storage';
```

#### API methods return [value, error] tuples

All API methods now return `[value, error]` tuple-like values instead of accepting error callbacks. This allows developers to handle errors in a clean, synchronous style without using `try/catch` or providing callbacks. For example:

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

#### Removed noop storage fallback

In previous versions, if `localStorage` or `sessionStorage` was unavailable (e.g., due to privacy settings or Safari private mode), a silent in-memory fallback was used that mimicked the Storage API. This allowed methods like `setItem()` to return success even though no actual data was stored.

This behavior has been removed to improve transparency and correctness. As of v3.0.0:

- No fallback is used.
- Errors are captured and returned via the `[_, error]` tuple-like value.
- Developers can use `WebStorage.isAvailable()` for feature detection, or gracefully handle errors based on method output.

This ensures failures are explicit and prevents false assumptions about persistence.

### NEW FEATURES

#### Type declarations for TypeScript

Export type declaration files (`.d.ts`) for TypeScript users, ensuring better type safety and autocompletion support in TypeScript projects.

### INTERNAL CHANGES

- Update Node.js version requirement and dev dependencies to the latest versions.
- Drop Jest in favor of @web/test-runner and Playwright for testing.
- Drop rollup in favor of esbuild for bundling.

## v2.1.0 (2021-01-26)

- Generate minified versions for ESM and CommonJS exported bubdles.

### INTERNAL CHANGES

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

### INTERNAL CHANGES

- Keep `devDependencies` up to date.

## v1.2.0
- Replace `Webpack` with `Rollup` for bundling the library.

## v1.1.0
- Add static method `WebStorage.createInstance([options])` as an alternative way to create a new instance.

## v1.0.0
- Initial realease
