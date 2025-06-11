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

## Static methods

### WebStorage.createInstance(options = {})

Creates a new instance of the WebStorage. The following options can be set:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| **driver** | `String` | "localStorage" | The preferred driver to use. Use one between "localStorage" or "sessionStorage". |
| **keyPrefix<sup>1</sup>** | `String` | "web-storage/" | The prefix for all keys stored in the offline storage. The value provided is trimmed (both left and right) internally to avoid potential user mistakes. |

**<sup>1</sup>** *`keyPrefix` needs to be declared only when creating an instance of `WebStorage`. Afterwards, when using any of the API methods that accept `key` as argument, we just use the key to refer to the item we want to manipulate.*

**Example**

```js
const myStore = WebStorage.createInstance({
  driver: 'sessionStorage',
  keyPrefix: 'my-storage/'
});
```

### WebStorage.isAvailable(storageType)

Check if `storageType` is supported and is available.
Storage might be unavailable due to no browser support or due to being full or due to browser privacy settings.

**Kind**: static method of `WebStorage`  
**Returns**: `Boolean` - Returns `true` if Storage available; otherwise `false`

| Param | Type | Description |
| ----- | ---- | ----------- |
| storageType | `string` | The storage type; available values "localStorage" or "sessionStorage" |

**Usage**

```js
WebStorage.isAvailable('localStorage');
```

## Instance methods

### getItem(key)

Gets a saved item from storage by its key.

**Kind**: instance method of `WebStorage`  
**Throws:** `TypeError` if `key` is not a string  
**Returns:** `[any, Error | null]` - Returns an array with two elements: the first is the value of the saved item, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `string` | - |The property name of the saved item |

**Usage**

```js
const [value, error] = myStore.getItem('somekey');
```

### setItem(key, value)

Saves an item to storage. You can store items of any of the following data types as long as data can be serialized to JSON.

- String
- Number
- Array
- Object

**Kind**: instance method of `WebStorage`  
**Throws:** `TypeError` if `key` is not a string  
**Returns:** `[boolean, Error | null]` - Returns an array with two elements: the first is `true` if the item was saved successfully, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `string` | - | The property name of the item to save |
| value | `any` | - | The item to save to the selected storage. |

**Usage**

```js
const [saved, error] = myStore.setItem('somekey', { foo: 'bar' });
```

### removeItem(key)

Removes the item for the specific key from the storage.

**Kind**: instance method of `WebStorage`  
**Throws:** `TypeError` if `key` is not a string  
**Returns:** `[boolean, Error | null]` - Returns an array with two elements: the first is `true` if the item was removed successfully, or `false` if it was not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `string` |  | The property name of the item to remove |

**Usage**

```js
const [removed, error] = myStore.removeItem('somekey');
```

### clear()

Removes all saved items from storage.

**Kind**: instance method of `WebStorage`  
**Returns:** `[boolean, Error | null]` - Returns an array with two elements: the first is `true` if all items were removed successfully, or `false` if they were not, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

**Usage**

```js
const [cleared, error] = myStore.clear();
```

### keys()

Gets the list of all keys in the storage for a specific datastore.

**Kind**: instance method of `WebStorage`  
**Returns:** `[string[], Error | null]` - Returns an array with two elements: the first is an array of keys (without the prefix) for the saved items, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

**Usage**

```js
const [keys, error] = myStore.keys();
```

### length()

Gets the number of items saved in a specific datastore.

**Kind**: instance method of `WebStorage`  
**Returns:** `[number, Error | null]` - Returns an array with two elements: the first is the number of items saved in the datastore, and the second is `null` if no error occurred, or an `Error` object if an error occurred.

**Usage**

```js
const [len, error] = myStore.length();
```

### iterate(iteratorCallback)

Iterate over all value/key pairs in datastore.

**Kind**: instance method of `WebStorage`  
**Throws:** `TypeError` if `iteratorCallback` is not a function  
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
