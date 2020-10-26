[![npm version](https://img.shields.io/npm/v/@georapbox/web-storage.svg)](https://www.npmjs.com/package/@georapbox/web-storage)
[![Build Status](https://travis-ci.com/georapbox/web-storage.svg?branch=master)](https://travis-ci.com/georapbox/web-storage)
[![Dependencies](https://david-dm.org/georapbox/web-storage.svg)](https://david-dm.org/georapbox/web-storage)
[![devDependency Status](https://david-dm.org/georapbox/web-storage/dev-status.svg)](https://david-dm.org/georapbox/web-storage?type=dev)
[![npm license](https://img.shields.io/npm/l/@georapbox/web-storage.svg)](https://www.npmjs.com/package/@georapbox/web-storage)

# WebStorage

WebStorage is a JavaScript library that improves the way you work with `localStorage` or `sessionStorage` by using a simple, `localStorage`-like API. It allows developers to store many types of data instead of just strings.

The purpose of this library is to allow the user to manipulate data to `localStorage` or `sessionStorage` accordingly using a namespace (default is `'web-storages/'`) as a prefix for each item's key. This is by design in order to avoid potential conflicts with other key/value pairs that are probably already saved to storage. For example, if the key prefix we provided is `'my-app/'`, calling `clear()` will remove only the items with key prefix `'my-app/'`. The same principle applies to all available API methods of the library.

## Install

```sh
$ npm install --save @georapbox/web-storage
```

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
| storageType | `String` | The storage type; available values "localStorage" or "sessionStorage" |

**Usage**

```js
WebStorage.isAvailable('localStorage');
```

## Instance methods

### getItem(key [, onErrorCallback])

Gets a saved item from storage by its key.

**Kind**: instance method of `WebStorage`  
**Throws:** `TypeError` if `key` is not a string  
**Returns:** `*` - Returns the retrieved value if found or `null` if value not found or operation has failed due to error

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `String` |  |The property name of the saved item |
| [onErrorCallback] | `Function` | `() => {}` | Callback function to be executed if there were any errors |

**Usage**

```js
myStore.getItem('somekey', error => {
  // This code runs if there were any errors
  console.error(error);
});
```

### setItem(key, value [, onErrorCallback])

Saves an item to storage. You can store items of any of the following data types as long as data can be serialized to JSON.

- String
- Number
- Array
- Object

**Kind**: instance method of `WebStorage`  
**Throws:** `TypeError` if `key` is not a string  
**Returns:** `undefined`

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `String` |  | The property name of the item to save |
| value | `*` |  | The item to save to the selected storage. |
| [onErrorCallback] | `Function` | `() => {}` | Callback function to be executed if there were any errors |

**Usage**

```js
myStore.setItem('somekey', { foo: 'bar' }, error => {
  // This code runs if there were any errors
  console.error(error);
});
```

### removeItem(key [, onErrorCallback])

Removes the item for the specific key from the storage.

**Kind**: instance method of `WebStorage`  
**Throws:** `TypeError` if `key` is not a string  
**Returns:** `undefined`

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| key | `String` |  | The property name of the item to remove |
| [onErrorCallback] | `Function` | `() => {}` | Callback function to be executed if there were any errors |

**Usage**

```js
myStore.removeItem('somekey', error => {
  // This code runs if there were any errors
  console.error(error);
});
```

### clear([onErrorCallback])

Removes all saved items from storage.

**Kind**: instance method of `WebStorage`  
**Returns:** `undefined`

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| [onErrorCallback] | `Function` | `() => {}` | Callback function to be executed if there were any errors |

**Usage**

```js
myStore.clear(error => {
  // This code runs if there were any errors
  console.error(error);
});
```

### keys([onErrorCallback])

Gets the list of all keys in the storage for a specific datastore.

**Kind**: instance method of `WebStorage`  
**Returns:** `Array|undefined` - Returns an array of all the keys that belong to a specific datastore. If any error occurs, returns `undefined`.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| [onErrorCallback] | `Function` | `() => {}` | Callback function to be executed if there were any errors |

**Usage**

```js
myStore.keys(error => {
  // This code runs if there were any errors
  console.error(error);
});
```

### length([onErrorCallback])

Gets the number of items saved in a specific datastore.

**Kind**: instance method of `WebStorage`  
**Returns:** `Number|undefined` - Returns the number of items for a specific datastore. If any error occurs, returns `undefined`.

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| [onErrorCallback] | `Function` | `() => {}` | Callback function to be executed if there were any errors |

**Usage**

```js
myStore.length(error => {
  // This code runs if there were any errors
  console.error(error);
});
```

### iterate(iteratorCallback [, onErrorCallback])

Iterate over all value/key pairs in datastore.

**Kind**: instance method of `WebStorage`  
**Throws:** `TypeError` if `iteratorCallback` is not a function  
**Returns:** `undefined`

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| iteratorCallback | `Function` |  | A callabck function to be executed for each iteration |
| [onErrorCallback] | `Function` | `() => {}` | Callback function to be executed if there were any errors |

`iteratorCallback` is called once for each pair, with the following arguments:

| Param | Type | Description |
| ----- | ---- | ----------- |
| value | `*` | The value of the saved item. |
| key | `String` | The key of the saved item. |

**Usage**

```js
myStore.iterate((value, key) => {
  // Resulting key/value pair; this callback will be executed for every item in the datastore.
  console.log(value, key);
}, error => {
  // This code runs if there were any errors
  console.error(error);
});
```

## Full usage example

```js
//
// NOTE: The example below assumes that we begin with empty localStorage.
//

// Create a new instance of WebStorage using localStorage for driver (default) and 'my-store/' for prefixing keys
const webStorage = WebStorage.createInstance({
  keyPrefix: 'my-store/'
});

const onError = error => console.error(error);

webStorage.setItem('user1', { id: 1, name: 'John Doe' }, onError);

webStorage.setItem('user2', { id: 2, name: 'Tim Smith' }, onError);

localStorage.setItem('user3', JSON.stringify({ id: 3, name: 'Alice Cooper' }));

webStorage.getItem('user1'); // -> { id: 1, name: 'John Doe' }

webStorage.getItem('user2'); // -> { id: 2, name: 'Tim Smith' }

webStorage.getItem('user3'); // -> null

webStorage.keys();  // -> ['user1', 'user2']

webStorage.length(); // -> 2

localStorage.length(); // -> 3

webStorage.iterate((value, key) => {
  console.log(value, '-', key);
  // -> { id: 1, name: 'John Doe' } - 'user1'
  // -> { id: 2, name: 'Tim Smith' } - 'user2'
});

webStorage.removeItem('user1');

webStorage.getItem('user1'); // -> null

webStorage.clear();

webStorage.keys(); // -> []

webStorage.length(); // -> 0

localStorage.length(); // -> 1
```

## For development

### Build for development

```sh
$ npm run dev
```

Builds the library for development and watches for any changes.

### Build for production

```sh
$ npm run build
```

Builds the library for production; creates library bundles (`UMD`, `ESM`, `CommonJS`) under the `dist/` directory.

### Test

```sh
$ npm test
```

## Changelog

For API updates and breaking changes, check the [CHANGELOG](https://github.com/georapbox/web-storage/blob/master/CHANGELOG.md).

## License

[The MIT License (MIT)](https://georapbox.mit-license.org/@2018)
