# CHANGELOG

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
  WebStorage.createInstance({
    driver: window.localStorage
  })
  ```

  **v2.x.x**  
  ```js
  WebStorage.createInstance({
    driver: 'localStorage'
  })
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
