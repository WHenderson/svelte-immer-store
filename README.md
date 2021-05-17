# svelte-immer-store

Svelte compatible store using immutable immer objects 

See:
* [Svelte](https://svelte.dev/)
* [Svelte Store Documentation](https://svelte.dev/docs#svelte_store)
* [ImmerJs](https://immerjs.github.io/immer/)

[![trunk](https://github.com/WHenderson/svelte-immer-store/actions/workflows/trunk.yml/badge.svg)](https://github.com/WHenderson/svelte-immer-store/actions/workflows/trunk.yml)

## Installation

> npm install svelte-immer-store

OR

> pnpm install svelte-immer-store

OR

> yarn install svelte-immer-store


## Features

* Provides automatic immutable state management
* Immutable state allows the usage of [`<svelte:options immutable={true}/>`](https://svelte.dev/docs#svelte_options) (see [REPL](https://svelte.dev/repl/72d9a5cc222f4dde98e5cc7e5b48d118?version=3.38.2))
* Allows for simple change history tracking (undo/redo) (see [REPL](https://svelte.dev/repl/36bc342889c34e70857b012f58caaa67?version=3.38.2))
* Automatic and type-safe selection of object/array sub tree stores
* Absolute and relative path access to state items

## Usage

### `immerStore`

Syntax:
```ts
store = immerStore(value: any);
store = immerStore(value: any, start: (set: (value: any) => void) => () => void);
store = immerStore(value: any, start: (set: (value: any) => void) => () => void, record: (change: { undo?: () => void; redo?: () => void; }) => void);
```

Function that creates a store containing immutable state. 
The resulting store implements the [Writable](https://svelte.dev/docs#writable) contract as well as several additional properties.
Specifically, the store contains `set`, `update` and `select` methods as well as a `path` array.

`set` is a method that takes one argument which is the value to be set. 
The store value gets set to the value of the argument if the store value is not already equal to it.

`update` is a method that takes one argument which is a callback. 
The callback takes the existing store value as its argument and returns the new value to be set to the store.

`select` is a method that takes a property, absolute path, relative path or selector.
The result is a new store which is linked to the specified subtree of the original store.
This store has all the same methods as it's parent store, but with the addition of a `delete` method which can be used to remove the specified subtree from the original store. 

`path` is an array of `string | number | symbol` objects specifying the absolute path of the store/sub-store

If a function is passed as the second argument, it will be called when the number of subscribers goes from zero to one (but not from one to two, etc). 
That function will be passed a `set` function which changes the value of the store. 
It must return a `stop` function that is called when the subscriber count goes from one to zero.

### History
```js
const history = new History();
```

The history class provides a way to track change history and includes the following members:

* `index$` is a readable store containing the current index into the change history.
* `count$` is a readable store containing the current number of changes in the change history.
* `canUndo$` is a readable store containing a boolean indicating if an undo operation can currently be performed.
* `canRedo$` is a readable store containing a boolean indicating if a redo operation can currently be performed.
* `enqueue` is a function which can be passed to an immerStore as the third argument allowing easy tracking of change history.

`index`, `count`, `canUndo`, `canRedo` are also provided as properties which resolve to the values contained in the above stores (uses [`get`](https://svelte.dev/docs#get) internally)

## Examples

### Basic usage
```js
import { immerStore } from 'svelte-immer-store';

const count = immerStore(0);

count.subscribe(value => {
    console.log(value);
}); // logs '0'

count.set(1); // logs '1'

count.update(n => n + 1); // logs '2'
```

### Making use of immutability
see [REPL](https://svelte.dev/repl/72d9a5cc222f4dde98e5cc7e5b48d118?version=3.38.2)

### Recording Change History
see also [REPL](https://svelte.dev/repl/36bc342889c34e70857b012f58caaa67?version=3.38.2)

```js
import { immerStore, History } from 'svelte-immer-stor';
import {noop} from "svelte/internal";

const history = new History();
const count = immerStore(0, noop, history.enqueue);

count.subscribe(value => {
    console.log(value);
}); // logs '0'

count.set(1); // logs '1'

count.update(n => n + 1); // logs '2'

history.undo(); // logs '1'

history.undo(); // logs '0'

history.redo(); // logs '1'
```

### Selecting store sub tree
```js
import { immerStore, History } from 'svelte-immer-store';

const root = immerStore({count: 1, object: {value: 2}});

const count = root.select(root => root.count);
const object = root.select(root => root.object);

// each of these is equivalent
//const value = object.select(['value'], 0); // relative path
//const value = object.select(['object', 'value']); // absolute path
//const value = object.select('value'); // property
const value = object.select(object => object.value); // selector
//const value = root.select(root => root.object.value); // selector

object.subscribe(object => {
    console.log(object);
}); // logs '{ value: 2 }'

count.set(2); // does not log anything

value.set(3); // logs '{ value: 3 }'
```
