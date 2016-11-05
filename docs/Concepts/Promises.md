---
title: Promises
---

Several methods in Ractive - those which trigger changes to the view, which may or may not involve {{{createLink 'transitions'}}} - return a 'promise'. Those methods are:

* {{{createLink 'ractive.add()'}}}
* {{{createLink 'ractive.animate()'}}}
* {{{createLink 'ractive.merge()'}}}
* {{{createLink 'ractive.pop()'}}}
* {{{createLink 'ractive.push()'}}}
* {{{createLink 'ractive.reset()'}}}
* {{{createLink 'ractive.set()'}}}
* {{{createLink 'ractive.shift()'}}}
* {{{createLink 'ractive.splice()'}}}
* {{{createLink 'ractive.subtract()'}}}
* {{{createLink 'ractive.teardown()'}}}
* {{{createLink 'ractive.toggle()'}}}
* {{{createLink 'ractive.unshift()'}}}
* {{{createLink 'ractive.update()'}}}

The promise will fulfil *once there are no longer any active transitions resulting from the operation*.

Ractive implements the [Promises/A+ spec](http://promises-aplus.github.io/promises-spec/) and exposes it as `Ractive.Promise`.


### What is a promise?

Promises are a way to deal with asynchronous operations - that is, operations that don't complete immediately. Async operations are common in JavaScript, and that includes Ractive. The way to interact with a promise is with its `then()` method:

```js
ractive.set( 'foo', 'bar' ).then( function () {
	// any transitions resulting from the set() operation have now completed
	alert( 'transitions complete!' );
});

// Even if there are no transitions, the promise will ALWAYS
// be fulfilled asynchronously - so this message will be
// alerted first in all cases
alert( 'synchronous alert' );
```


## What's wrong with callbacks?

Nothing! Callbacks are a perfectly good way of handling asynchrony. But promises have a number of advantages:

### You can attach multiple fulfilment handlers

```js
var promise = ractive.set( 'foo', 'bar' );

// doSomething and doSomethingElse will execute once transitions are
// complete, in the order they are given here
promise.then( doSomething );
promise.then( doSomethingElse );

// Note that if doSomething is asynchronous and returns a promise of
// its own, you can chain operations efficiently:
promise.then( doSomething ).then( doSomethingElse );
```

### Interoperability

There are many different promise implementations (see below) but only one specification - [Promises/A+](http://promises-aplus.github.io/promises-spec/). Because of that, you can mix and match promises from different sources:

```js
Promise.all([
  ajax.get( 'list.json' ),       // loads our app data
  ractive.set( 'loading', true ) // triggers loading animation
]).then( function ( results ) {
  var ajaxData = results[0];
  ractive.set({
    loading: false,
    list: ajaxData
  });
});
```

### You always know what you're getting

It's often not obvious whether a callback will fire synchronously or asychronously. With promises, you don't have that problem. In practice, that often makes your code much easier to understand


## Are these ES6 Promises?

You may have heard that promises are going to be part of ES6 (the next version of JavaScript). In fact, recent versions of some browsers (e.g. Chrome and Firefox) already support the `Promise` object natively.

Where possible, Ractive will use native ES6 promises. It will fall back to a polyfill that's functionally identical to the ES6 promise, except that `Promise.race` and `Promise.cast` are not currently implemented.


## Can I use them in my own code?

Yes! Whether it's using native promises or the polyfill, Ractive will expose the constructor as `Ractive.Promise`, which saves you worrying about bringing your own polyfill. Here's how you use them:

```js
var Promise = Ractive.Promise;

var p = new Promise( function ( fulfil, reject ) {
  doSomethingAsync( function ( error, result ) {
    if ( error ) {
      return reject( error );
    }
    
    fulfil( result );
  });
});
```


