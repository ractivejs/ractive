---
title: Advanced Configuration
---
In addition to supplying static values for configurations options, some of the Ractive options
can be specified using a function that will resolve when the ractive instance is instantiated,
and re-evaluated upon {{{createLink 'ractive.reset()'}}}.

An option function may be supplied to either {{{createLink 'Ractive.extend()'}}} or {{{createLink 'new Ractive()'}}}.

Option functions receive the post-configured `data` option as the first argument and `this` in
the function refers to the ractive instance being instantiated.
Bear in mind that the ractive instance is in the process of being configured, so not all options
are necessarily configured yet, and functional methods like `observe` or `set` should not be called.

## Template

The template can be specified using the return value of an option function:

```js
new Ractive({
	template: function ( data ) {
		return data.foo ? '<p>hello world</p>' : '<div>yes, we have no foo</div>';
	},
	data: { foo: true }
});
```
The return value can be any of the valid template options: a preparsed template,
a string that will parsed as a template, or an string starting with `#` that refers to an element id from which
the template should be retrieved.

In general, these should be sufficient for most use cases. However, if you need to dissect templates or extract
partials dynamically, the template option function also receives a second argument
with a helper parser object `p` that offers the following methods:

> ### p.fromId( id )
> Retrieves the template from the DOM `<script>` tag specified by `id`. Leading `#` is optional. Make sure to set `type='text/ractive'` on the `<script>` tag or the browser will try and execute the contents as javascript and you'll get an exception.

> ### p.isParsed( template )
> Test whether the supplied instance has already been parsed

> ### p.parse( template [, parseOptions ] )
> Parses the template via {{{createLink 'Ractive.parse()' }}}. If no `parseOptions` specified, defaults to those
> of the current instance. Full Ractive runtime must be loaded.

During a {{{createLink 'ractive.reset()' }}} operation, an option function for a template will be re-evaluated
and _if_ the return value changes the ractive instance will be re-rendered.

## Partials

The value for a named partial can also be specified using a function:

```js
new Ractive({
	template: '<div>\{{>dynamicPartial}}</div>',
	partials: {
		dynamicPartial: function ( data ) {
			return data.condition ? '<p>hello world</p>' : '<div>yes, we have no foo</div>';
		}
	}
});
```

Partial option functions also received the helper parser `p` as the second argument. This is useful in
partials as you cannot return an element id from a partial function and must use `p.fromId` to return
the template content of an element.

Partial functions also cannot directly return the string token of a registered partial. Instead,
return the value from the ractive instance:

```js
	partials: {
		dynamicPartial: function ( data ) {
			// assuming data.partial is the string token of a registered partial:
			return this.partials[data.partial];
		}
	}
```

## Components

A component value can be specified using an option function. The return value can either be
a component or (unlike partials) the string token of a registered component:

```js
Ractive.components.view1 = Ractive.extend({...});
Ractive.components.view2 = Ractive.extend({...});

new Ractive({
	template: '<div><dynamicComponent/></div>',
	components: {
		dynamicComponent: function ( data ) {
			return data.foo ? 'view1' : 'view2';
		}
	}
});
```

## Data

The data option function can either return a value or use the prototype inheritance chain to construct the
data object. Use `this._super` to call the parent data option. Ractive will handle integrating
static data options and data option functions. If a return value is specified, further parent data options
will not be considered.

```js

var Component1 = Ractive.extend({
    data: {
	    formatTitle: function (title) {
		    return '"' + title.toUpperCase() + '"';
		}
	}
});

var Component2 = Component1.extend({
    data: function( data ) {
	    this._super( data );
	    data.scale = 5;
	}
});

var ractive = new Component2({
    data: { foo: 'bar' }
})

// r.data: { foo: "bar", formatTitle: function, scale: 5 }

```

The data object instance passed to the instantiated ractive instance will always be retained as
the `ractive.data` instance, _unless_ a return value is specified from an option function in which
 case that return value instance will be used as `ractive.data`

### Copying Parent Data

Because parent data is common to all instances, you can use an option function to return a
unique copy of the data.

```js

var Shared = Ractive.extend({
	data: {
		foo: { bar: 42 }
	}
});

var shared1 = new Shared();
var shared2 = new Shared();
shared1.set( 'foo.bar', 12 );
shared2.get( 'foo.bar' ); // returns 12


var NotShared = Ractive.extend({
	data: function () {
		return {
			foo: { bar: 42 }
		};
	}
});

var notShared1 = new NotShared();
var notShared2 = new NotShared();
notShared1.set( 'foo.bar', 12 );
notShared2.get( 'foo.bar' ); // returns 42

```

### Asynchronous Data

A data option function can be a handy way to fetch asynchronous data _and_ supply initial synchronous values:

```js
data: function () {

	$.get( 'somedata.url', function( data ) {
		this.set( '', data );
	}.bind(this) );

	return {
		foo: 'default'
	};
}
```

### Specifying a Model

Another use of the data option function is to provide a model:

```js
data: function ( data ) {
	return new Model( data );
}
```

If you use a constructor guard clause (currently popular for `new`-less use of javascript constructors),
you can directly supply the model:


```js
function Model ( data ) {
	if ( !( this instanceof Model) ) { return new Model( data ); }
	// model setup
}

var MyComponent = Ractive.extend({
    data: Model
});

var r = new MyComponent({
    data: { foo: 'bar' }
})
```
