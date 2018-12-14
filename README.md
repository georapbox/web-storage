<!-- [![npm version](https://img.shields.io/npm/v/@georapbox/web-storage.svg)](https://www.npmjs.com/package/@georapbox/web-storage) -->
[![Build Status](https://travis-ci.org/georapbox/web-storage.svg?branch=master)](https://travis-ci.org/georapbox/web-storage)
[![Codecov](https://img.shields.io/codecov/c/github/georapbox/web-storage/master.svg)](https://codecov.io/gh/georapbox/web-storage)
[![Dependencies](https://david-dm.org/georapbox/web-storage.svg)](https://david-dm.org/georapbox/web-storage)
[![devDependency Status](https://david-dm.org/georapbox/web-storage/dev-status.svg)](https://david-dm.org/georapbox/web-storage#info=devDependencies)
<!-- [![npm license](https://img.shields.io/npm/l/@georapbox/web-storage.svg)](https://www.npmjs.com/package/@georapbox/web-storage) -->

# WebStorage

WebStorage is a JavaScript library that improves the way you work with `localStorage` or `sessionStorage` by using a simple, `localStorage`-like API. It allows developers to store many types of data instead of just strings.

The purpose of this library is to allow the user to manipulate data to `localStorage` or `sessionStorage` accordingly using a namespace (default is "web-storage") as a prefix for each item's key. This is by design in order to avoid potential conflicts with other key/value pairs that are probably already saved to storage. For example, if the database name we provided is `myApp`, calling `clear()` will remove only the items with key prefix `myApp`. The same principle applies to all available API methods of the library.


## Create new instance

### new WebStorage([options])

Creates a new instance of the WebStorage. The following options can be set:

|Option|Type|Default|Description|
|------|----|-------|-----------|
|**driver**|`Object`|`localStorage`|The preferred driver to use. Use one between `localStorage` and `sessionStorage`.|
|**name**|`String`|`"web-storage"`|The name of the database. This is used as prefix for all keys stored in the offline storage.|
|**keySeparator**|`String`|`"/"`|String that separates database name and key.|

**Throws:** `TypeError` if `options.name` is not a string or empty string  
**Throws:** `TypeError` if `options.keySeparator` is not a string or empty string

## Public methods

### getItem(key [, onCompletedCallback])

Gets a saved item from storage by its key.

**Returns:** `*` - Returns the retrieved value if found or `null` if value not found or operation has failed due to error

|Param|Type|Default|Description|
|-----|----|-------|-----------|
|key|`String`||The property name of the saved item|
|[onCompletedCallback]|`Function`|`() => {}`|Callback function to be executed after operation completed|


### setItem(key, value [, onCompletedCallback])

Saves an item to storage. You can store items of any of the following data types as long as data can be serialized to JSON.

- String
- Number
- Array
- Object

**Returns:** `undefined`

|Param|Type|Default|Description|
|-----|----|-------|-----------|
|key|`String`||The property name of the item to save|
|value|`*`||The item to save to the selected storage.|
|[onCompletedCallback]|`Function`|`() => {}`|Callback function to be executed after operation completed|


### removeItem(key [, onCompletedCallback])

Removes the item for the specific key from the storage.

**Returns:** `undefined`

|Param|Type|Default|Description|
|-----|----|-------|-----------|
|key|`String`||The property name of the item to remove|
|[onCompletedCallback]|`Function`|`() => {}`|Callback function to be executed after operation completed|


### clear([onCompletedCallback])

Removes all saved items from storage.

**Returns:** `undefined`

|Param|Type|Default|Description|
|-----|----|-------|-----------|
|[onCompletedCallback]|`Function`|`() => {}`|Callback function to be executed after operation completed|


### keys([onCompletedCallback])

Gets the list of all keys in the storage for a specific database.

**Returns:** `Array|undefined` - Returns an array of all the keys that belong to a specific database. If any error occurs, returns `undefined`.

|Param|Type|Default|Description|
|-----|----|-------|-----------|
|[onCompletedCallback]|`Function`|`() => {}`|Callback function to be executed after operation completed|


### length([onCompletedCallback])

Gets the number of items saved in a specific database.

**Returns:** `Number|undefined` - Returns the number of items for a specific database. If any error occurs, returns `undefined`.

|Param|Type|Default|Description|
|-----|----|-------|-----------|
|[onCompletedCallback]|`Function`|`() => {}`|Callback function to be executed after operation completed|


### iterate(iteratorCallback [, onCompletedCallback])

Iterate over all value/key pairs in datastore.

**Throws:** `TypeError` if `iteratorCallback` is not a function  
**Returns:** `undefined`

|Param|Type|Default|Description|
|-----|----|-------|-----------|
|iteratorCallback|`Function`||A callabck function to be executed for each iteration|
|[onCompletedCallback]|`Function`|`() => {}`|Callback function to be executed after operation completed|

`iteratorCallback` is called once for each pair, with the following arguments:

|Param|Type|Description|
|-----|----|-----------|
|key|`String`|The key of the saved item.|
|value|`*`|The value of the saved item.|


## Development

### Build for development

```bash
$ npm run dev
```

### Build for production

```bash
$ npm run build
```

### Test

```bash
$ npm test
```


## Changelog

For API updates and breaking changes, check the [CHANGELOG](https://github.com/georapbox/web-storage/blob/master/CHANGELOG.md).


## License

[The MIT License (MIT)](https://georapbox.mit-license.org/@2018)
