[![npm version](https://img.shields.io/npm/v/@georapbox/web-storage.svg)](https://www.npmjs.com/package/@georapbox/web-storage)
[![npm license](https://img.shields.io/npm/l/@georapbox/web-storage.svg)](https://www.npmjs.com/package/@georapbox/web-storage)

[demo]: https://georapbox.github.io/alert-element/
[license]: https://github.com/georapbox/web-storage/blob/master/LICENSE
[changelog]: https://github.com/georapbox/web-storage/blob/master/CHANGELOG.md

# WebStorage

WebStorage is a lightweight JavaScript library that improves how you work with `localStorage` or `sessionStorage` by providing a clean, consistent API. It supports storing and retrieving any serializable value (not just strings) by automatically handling JSON encoding and decoding internally.

A key feature of WebStorage is its use of namespacing via a configurable key prefix (default: `'web-storage/'`). This ensures that all stored items are scoped to your application, preventing collisions with other data in storage. For example, using a prefix like `'my-app/'` means calling clear() will only remove items with that prefix—leaving unrelated data untouched.

WebStorage is also designed with error handling in mind. Instead of throwing exceptions, all methods return a `[result, error]` tuple-style value allowing you to handle errors gracefully—or ignore them entirely—without needing `try...catch`.

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

Creates a new instance of the WebStorage with the specified options. The following options can be set:

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

Same as the constructor, but returns a new instance of `WebStorage`. This is a convenience method to create an instance without using the `new` keyword.

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

Saves an item to storage with the specified key. You can store items of any of the following data types as long as data can be serialized to JSON.

- String
- Number
- Array
- Object

**Throws:** `TypeError` - Throws if `key` is not a string.  
**Returns:** `[boolean, Error | null]` - Returns an array with two elements: the first is `true` if the item was saved successfully, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `string` | - | The key under which to store the item. |
| value | `any` | - | The item to save to the selected storage. |

**Usage**

```js
const [saved, error] = myStore.setItem('somekey', { foo: 'bar' });
```

#### Note on value serialization

WebStorage uses `JSON.stringify()` internally to serialize values before saving them. While this supports most common JavaScript types, some special values are silently converted:

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
**Returns:** `[any, Error | null]` - Returns an array with two elements: the first is the value of the saved item, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

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

**Throws:** `TypeError` - Throws if `callback` is not a function.  
**Returns:** `[boolean, Error | null]` - Returns an array with two elements: the first is `true` if the iteration was successful, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| iteratorCallback | `(value: any, key: string) => void` | - | A callabck function to be executed for each iteration |

**Usage**

```js
const [iterated, error] = myStore.iterate((value, key) => {
  console.log(value, key);
});
```

## Development

### Build for development

```sh
$ npm run dev
```

Builds the library for development and watches for any changes.

### Build for production

```sh
$ npm run build
```

Builds the library for production; the output is minified and optimized for production use in the `dist` folder.

### Test

```sh
$ npm test
```

Runs the library tests. For coverage report, run:

```sh
$ npm run test:coverage
```

## Changelog

For API updates and breaking changes, check the [CHANGELOG][changelog].

## License

[The MIT License (MIT)][license]
