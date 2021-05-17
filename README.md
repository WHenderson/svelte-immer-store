# svelte-immer-store

Svelte compatible store using immutable immer objects 

* [Svelte](https://svelte.dev/)
* [Store](https://svelte.dev/docs#svelte_store)
* [Immer](https://immerjs.github.io/immer/)

[![trunk](https://github.com/WHenderson/svelte-immer-store/actions/workflows/trunk.yml/badge.svg)](https://github.com/WHenderson/svelte-immer-store/actions/workflows/trunk.yml)

:warning: This package release is a WIP. Not ready for use yet! 

## Installation

> npm install svelte-immer-store

OR

> pnpm install svelte-immer-store

OR

> yarn install svelte-immer-store


## Features

* Provides automatic immutable state management
* Immutable state allows the usage of [`<svelte:options immutable={true}/>`](https://svelte.dev/docs#svelte_options)
* Allows for simple history tracking (undo/redo)
* Automatic and type-safe selection of object/array sub tree stores
* Absolute and relative path access to state items
 

## Usage

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

If a function is passed as the second argument, it will be called when the number of subscribers goes from zero to one (but not from one to two, etc). 
That function will be passed a `set` function which changes the value of the store. 
It must return a `stop` function that is called when the subscriber count goes from one to zero.

### Basic usage
```js
import { immerStore } from 'svelte-immer-store';

...

const count = immerStore(0);

count.subscribe(value => {
    console.log(value);
}); // logs '0'

count.set(1); // logs '1'

count.update(n => n + 1); // logs '2'
```

### Making usage of immutibality
