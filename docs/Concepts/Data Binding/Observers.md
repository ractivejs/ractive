---
title: Observers
---
## Like publish/subscribe, but different

A common pattern in modern JavaScript is to make models *observable*, using the traditional [publish/subscribe](http://addyosmani.com/blog/understanding-the-publishsubscribe-pattern-for-greater-javascript-scalability/) mechanism.

For example, you can observe changes to attributes within a Backbone Model like so:

```js
model = Backbone.Model({ myValue: 1 });

model.on( 'change:myValue', function ( model, value, options ) {
  alert( 'myValue changed to ' + value );
});

model.set( 'myValue', 2 ); // alerts 'myValue changed to 2'
```

This works because `Backbone.Model.prototype` inherits from `Backbone.Events`.

Ractive implements pub/sub with {{{createLink 'ractive.on()'}}}, {{{createLink 'ractive.off()'}}} and {{{createLink 'ractive.fire()'}}} - see {{{createLink 'Events'}}} for more info.


## Observing models with nested properties

But the normal pub/sub mechanism won't work for monitoring data changes with Ractive, because our data can contain nested properties. It's no good subscribing to a `change:foo.bar` event, if `foo.bar` can change as a result of `foo` changing.

So instead, we introduce the concept of *observers*.

An observer observes a particular {{{createLink 'keypaths' 'keypath'}}}, and is *notified* when the value of its keypath changes, whether directly or indirectly (because an *upstream* or *downstream* keypath changed). You create one with `ractive.observe()` (see {{{createLink 'ractive.observe()'}}} for full method
API).

Here's an example:

```js
ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: {
    foo: { bar: 1 }
  }
});

// The observer will be initialised with ( currentValue, undefined ) unless
// we pass a third `options` argument in which `init` is `false`. In other
// words this will alert 'foo.bar changed to 1'
observer = ractive.observe( 'foo.bar', function ( newValue, oldValue, keypath ) {
  alert( keypath + ' changed to ' + newValue );
});

ractive.set( 'foo.bar', 2 ); // alerts 'foo.bar changed to 2'
ractive.get( 'foo' ); // returns { bar: 2 }

ractive.set( 'foo', { bar: 3 }); // alerts 'foo.bar changed to 3'
ractive.get( 'foo.bar' ); // returns 3

observer.cancel();

ractive.set( 'foo.bar', 4 ); // alerts nothing; the observer was cancelled
```

Observers are most useful in the context of {{{createLink 'two‐way binding'}}}.

## Pattern Observers

It is useful to observe on specific keypaths but in the event your data contains array, or a set of dynamic data it isn't logical to bind to every potential keypath that could exist. Pattern observers use a `*` to indicate to Ractive that you would like to be notified whenever anything changes in your data at a particular depth as well as below the specified depth.

There are a few caveats when it comes to observing on array data, when observing on keypath `people.*` you are observing on the length of the array. This means that the `newValue` will be the index at which the new object was pushed. However when you use `set` to change an item at a particular index or a key that is on an object in the array then it will provide the object as the `newValue`.

```js
var ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: {
    people: [
      {name: 'Rich Harris'},
      {name: 'Marty Nelson'}
    ]
  }
});

ractive.observe('people.*', function(newValue, oldValue, keypath) {

});

var people = ractive.get('people');
people.push({name: 'Jason Brown'});
//newValue will equal 3, and the keypath will be people.length

ractive.set('people.3', {name: 'Jack Black'});
//newValue will be {name: 'Jack Black'} and the keypath will be people.3

ractive.set('people.3.isACelebrity', true);
//newValue will be {name: 'Jack Black', isACelebrity: true} and the keypath will be people.3

ractive.set('people.0.info.isCreator', true);
//newValue will be the object for index 0 and the keypath will be people.0

```

Notice that because you are observing at the array level that `newValue` will be set as the entire object. What if you were only interested in knowing when a user became a celebrity? Simply tell Ractive you only want to observe dynamically on the array but only be notified when the `isACelebrity` key changes, `people.*.isACelebrity`.

```js
ractive.observe('people.*.isACelebrity', function(newValue, oldValue, keypath) {

});

ractive.set('people.0.isACelebrity', true); //Rich Harris is a celebrity
//newValue will be `true` and the keypath will be people.0.isACelebrity

```

You are not limited to just one `*` for your pattern, you can use as many as you would like and in any particular order.

```js

ractive.observe('people.*.comments.*', function(newValue, oldValue, keypath) {

});

//even arrays of arrays

ractive.observe('people.*.*', function(newValue, oldValue, keypath) {

});

```

Furthermore it works on objects as well `config.*` will notify you when a value is changed on any key on the config object. However this differs from observing on an array in that it will provide the value set and keypath to the key that was set.

```js
var ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: {
    config: {
      allowComments: true,
      allowEdit: false
    }
  }
});

ractive.observe('config.*', function(newValue, oldValue, keypath) {

});

ractive.set('config.allowEdit', true);
//newValue will be true and the keypath will be config.allowEdit

```

In addition to `newValue`, `oldValue`, and `keypath`, any widlcards that are matched in the `keypath` will be passed to the callback. Each additional wildcard will cause an extra parameter to be passed to the callback. For instance:
```js
ractive.observe('items.*.*', function(newValue, oldValue, keypath, idx, key) {
  console.log('item', idx, key, 'is now', newValue);
});
ractive.set('items.1.foo', 'bar');
// logs 'item 1 foo is now bar'
```

Pattern observers are a simple and flexible that will allow you to observe your data any way that you want.

## Space Delimited Observers

Space delimited observers are useful when different keypaths should trigger the same function. In previous version you would have had to bind each keypath individually to the function.

This is a contrived example but for examples sake bare with us.

```js
var ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: {
    user: {username: 'browniefed'},
    config: {isAdmin: false},
    commentCount: 0
  }
});

function updateServer() {
  //Make call to server because something in user, config, comments changed
}

ractive.observe('user.username', updateServer);
ractive.observe('config.isAdmin', updateServer);
ractive.observe('commentCount', updateServer);

```

This is unecessarily verbose, now with space delimited observers this becomes a single line.

```js
ractive.observe('user.username config.isAdmin commentCount', updateServer);

```

This will work with patterns observers as well.

```js
ractive.observe('user.* config.* commentCount', updateServer);

```


## A 'gotcha' to be aware of

Observers will be notified whenever the new value is not equal to the old value - *sort of*.

What does 'not equal' mean? Well, with *primitive values* such as strings and numbers, that's easy - they're either identical (in the `===` sense) or they're not.

With objects and arrays (hereafter, just 'objects', since that's what arrays technically are), it's not so straightforward:

```js
a = { one: 1, two: 2, three: 3 };
b = { one: 1, two: 2, three: 3 };

alert( a === b ); // alerts 'false' - they look the same, but they ain't

b = a;
b.four = 4;

alert( a === b ); // alerts 'true'. Hang on, `a` didn't have a 'four' property?
alert( a.four ); // alerts '4'. Oh. Right.
```

So one the one hand, objects which look identical aren't. On the other, you can set a property of an object and have no idea whether doing so resulted in a change.

There are two possible responses to this problem. First, we could do a 'deep clone' of an object whenever we do `ractive.set(keypath, object)`, using an algorithm similar to [jQuery extend](http://api.jquery.com/jQuery.extend/#jQuery-extend-deep-target-object1-objectN). That would mean any references you held to `object` would become irrelevant. It would also mean a whole load of extra computation, and probably some very strange behaviour with cyclical data structures. No thanks.

The second is to sidestep the issue, and simply state that for the purposes of determining whether to notify observers, **no two objects are equal, even when they're identical** (unless they're both `null`, of course - since `typeof null === 'object'` due to a [bug in the language](http://www.2ality.com/2013/10/typeof-null.html)).

This is the safest, sanest behaviour, but it can lead to unexpected behaviour in one situation - accessing properties within an observer:

```js
obj = { a: { b: { c: 1 } } };

ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: { obj: obj }
});

// We observe 'obj.a.b.c' indirectly, and directly
ractive.observe({
  'obj': function ( newObj, oldObj ) {
    alert( 'Indirect observer: changed from ' + oldObj.a.b.c + ' to ' + newObj.a.b.c );
  },
  'obj.a.b.c': function ( newC, oldC ) {
    alert( 'Direct observer: changed from ' + oldC + ' to ' + newC );
  }
});

obj.a.b.c = 2;

// The next line will cause two alerts:
//   'Direct observer: changed from 1 to 2'
//   'Indirect observer: changed from 2 to 2' - because oldObj === newObj
ractive.set( 'obj', obj );
```

This is definitely an edge case, but one that it's worth being aware of.
