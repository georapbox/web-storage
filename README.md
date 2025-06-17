[![npm version](https://img.shields.io/npm/v/@georapbox/web-storage.svg)](https://www.npmjs.com/package/@georapbox/web-storage)
[![npm license](https://img.shields.io/npm/l/@georapbox/web-storage.svg)](https://www.npmjs.com/package/@georapbox/web-storage)

[demo]: https://georapbox.github.io/alert-element/
[license]: https://github.com/georapbox/web-storage/blob/master/LICENSE
[changelog]: https://github.com/georapbox/web-storage/blob/master/CHANGELOG.md

# WebStorage

`WebStorage` is a lightweight JavaScript library that improves how you work with `localStorage` or `sessionStorage` by providing a clean, consistent API. It supports storing and retrieving any serializable value (not just strings) by automatically handling JSON encoding and decoding internally.

A key feature of `WebStorage` is its use of namespacing via a configurable key prefix (default: `'web-storage/'`). This ensures that all stored items are scoped to your application, preventing collisions with other data in storage. For example, using a prefix like `'my-app/'` means calling clear() will only remove items with that prefix—leaving unrelated data untouched.

`WebStorage` is also designed with error handling in mind. Instead of throwing exceptions, all methods return a `[result, error]` tuple-style value allowing you to handle errors gracefully—or ignore them entirely—without needing `try...catch`.

## Install

```sh
$ npm install --save @georapbox/web-storage
```

## Import

The library is exported in ESM format.

```js
import { WebStorage } from '@georapbox/web-storage';
```

## API

## Constructor

### new WebStorage(options = {})

Creates a new instance of the `WebStorage` with the specified options. The following options can be set:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| **driver** | `String` | "localStorage" | Specifies the storage driver to use. Accepts either "localStorage" or "sessionStorage". This determines where data will be persisted. |
| **keyPrefix** | `String` | "web-storage/" | A prefix applied to all keys stored in offline storage. It is automatically trimmed on both sides to prevent user errors. You only need to set `keyPrefix` when creating a `WebStorage` instance. After that, API methods should be used with plain keys—`keyPrefix` is applied internally. |

**Example**

```js
const myStore = new WebStorage({
  driver: 'sessionStorage',
  keyPrefix: 'my-storage/'
});
```

## Static methods

### WebStorage.createInstance(options = {})

Creates and returns a new `WebStorage` instance, just like the constructor. This convenience method allows you to instantiate without using the `new` keyword.

**Example**

```js
const myStore = WebStorage.createInstance({
  driver: 'sessionStorage',
  keyPrefix: 'my-storage/'
});
```

### WebStorage.isAvailable(storageType)

Checks if `storageType` is supported and is available.
Storage might be unavailable due to no browser support or due to being full or due to browser privacy settings.

**Returns**: `boolean` - Returns `true` if Storage available; otherwise `false`.

| Param | Type | Description |
| ----- | ---- | ----------- |
| storageType | `string` | The storage type; available values "localStorage" or "sessionStorage" |

**Usage**

```js
WebStorage.isAvailable('localStorage');
```

## Instance methods

### setItem(key, value)

Saves an item to storage with the specified key. Any value that can be serialized to JSON can be stored, including objects, arrays, strings, numbers, and booleans.

**Throws:** `TypeError` - Throws if `key` is not a string.  
**Returns:** `[boolean, Error | null]` - Returns an array with two elements: the first is `true` if the item was saved successfully, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `string` | - | The key under which to store the item. |
| value | `unknown` | - | The item to save to the selected storage. |

**Usage**

```js
const [saved, error] = myStore.setItem('somekey', { foo: 'bar' });
```

#### Note on value serialization

`WebStorage` uses `JSON.stringify()` internally to serialize values before saving them. While this supports most common JavaScript types, some special values are silently converted:

- `NaN`, `Infinity`, `-Infinity`, and `undefined` → become null
- Functions and symbols → are omitted or stored as `null/undefined`
- Circular references → will throw a `TypeError`

For example:

```js
storage.setItem('foo', NaN);
// Will be stored as: "null"

storage.getItem('foo');
// => [null, null]
```

**Why this matters:**

If you store special or non-JSON-safe values, they may not round-trip exactly as expected. This is a deliberate design decision to keep the API simple and compatible with `Storage` constraints. If needed, consider manually encoding such values before storing them.

### getItem(key)

Gets the saved item for the specified key from the storage for a specific datastore.

**Throws:** `TypeError` - Throws if `key` is not a string.  
**Returns:** `[unknown, Error | null]` - Returns an array with two elements: the first is the value of the saved item, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `string` | - | The key of the item to retrieve. |

**Usage**

```js
const [value, error] = myStore.getItem('somekey');
```

### removeItem(key)

Removes the saved item for the specified key from storage.

**Throws:** `TypeError` - Throws if `key` is not a string.  
**Returns:** `[boolean, Error | null]` - Returns an array with two elements: the first is `true` if the item was removed successfully, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `string` | - | The key of the item to remove. |

**Usage**

```js
const [removed, error] = myStore.removeItem('somekey');
```

### clear()

Removes all saved items from storage for a specific datastore.

**Returns:** `[boolean, Error | null]` - Returns an array with two elements: the first is `true` if all items were removed successfully, or `false` if they were not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

**Usage**

```js
const [cleared, error] = myStore.clear();
```

### keys()

Gets all keys (unprefixed) of saved items in a specific datastore.

**Returns:** `[string[], Error | null]` - Returns an array with two elements: the first is an array of keys (without the prefix) for the saved items, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

**Usage**

```js
const [keys, error] = myStore.keys();
```

### length()

Gets the number of saved items in a specific datastore.

**Returns:** `[number, Error | null]` - Returns an array with two elements: the first is the number of items saved in the datastore, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

**Usage**

```js
const [len, error] = myStore.length();
```

### iterate(iteratorCallback)

Iterates over all saved items in storage for a specific datastore and execute a callback function for each key-value pair.

> [!IMPORTANT]
> `iterate` does not guarantee the order of iteration. The order may vary depending on the browser implementation and storage driver used.

**Throws:** `TypeError` - Throws if `callback` is not a function.  
**Returns:** `[boolean, Error | null]` - Returns an array with two elements: the first is `true` if the iteration was successful, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| iteratorCallback | `(value: unknown, key: string) => void` | - | A callabck function to be executed for each iteration |

**Usage**

```js
const [iterated, error] = myStore.iterate((value, key) => {
  console.log(value, key);
});
```

## Development

Below are the instructions for setting up the development environment.

### Prerequisites

- Node.js (v22.x.x)
- npm (v10.x.x)

### Installation

Clone the repository and install the dependencies:

```sh
$ git clone git@github.com:georapbox/web-storage.git
$ cd web-storage
$ npm install
```

### Build for development

Build the library for development and watch for any changes to the source files:

```sh
$ npm run dev
```

### Build for production

Build the library for production. This will create a minified version of the library in the `dist` directory.

```sh
$ npm run build
```

### Test

Run the tests to ensure everything is working correctly:

```sh
$ npm test
```

### Test with coverage

Generate a test coverage report. This will run the tests and generate a coverage report in the `coverage` directory.

```sh
$ npm run test:coverage
```

### Linting

Run the linter to check for any code style issues:

```sh
$ npm run lint
```

## Changelog

For API updates and breaking changes, check the [CHANGELOG][changelog].

## License

[The MIT License (MIT)][license]
