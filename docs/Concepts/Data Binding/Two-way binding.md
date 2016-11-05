---
title: Two-way binding
---
By default, a Ractive instance will update its internal model based on user input, if you have `<input>`, `<textarea>` or `<select>` elements.

If that's unhelpful for your app, you can disable it by passing `twoway: false` as an {{{createLink 'options' 'initialisation option'}}}.

Two-way vinding can also be overridden on a per-element basis using the `twoway` directive e.g. `<input value="\{{foo}}" twoway="false">`. If the `twoway` option is set to false, it can be overridden on a per-element bases using `twoway` as a boolean attribute e.g. `<input value="\{{foo}}" twoway>` or `<input value="\{{foo}}" twoway="true">`.


## `<input>` elements

Two-way binding works with `<input>` elements of any type, including the new HTML5 types such as `color` or `email`. In most cases, you just add a mustache as the `value` attribute - this must be a single, standard *interpolator* mustache, like this:

```html
<input placeholder='Type your name' value='\{{user.name}}'>
```

In the example above, any changes the user makes to the input will be reflected in the `user.name` property.

### Checkboxes

Checkboxes are used to flag a property as `true` or `false`. Rather than binding the `value` attribute, we bind the `checked` attribute:

```html
<label>
	<input type='checkbox' checked='\{{on}}'>
	The lights are \{{ on ? 'on' : 'off' }}
</label>
```

(True HTML nerds will recognise that *boolean attributes* such as checked don't have a value, as such - they either exist on an element or they don't. This makes life unnecessarily difficult; Ractive treats dynamic (i.e., controlled by a mustache) boolean attributes as present if the mustache is `true`, absent if `false`.)

Checkboxes may also be bound by the `name` attribute, which will result in the value specified in the `name` attribute containing an array of selected checkbox values.

```html
\{{#colors}}
  <label>
    <input type='checkbox' name='\{{selected}}' value='\{{.}}' />\{{.}}
  </label>
\{{/}}
```

If `colors` is an array, `['Red', 'Yellow', 'Green', 'Blue']`, then checking the first box will result in `selected` becoming `['Red']`. Checking the third box will result in `selected` becoming `['Red', 'Green']`. The array may also be updated from code using `set` or any of the array modification methods available to Ractive, and the checkboxes will be updated to reflect the contents of the array in the Ractive viewmodel.

**Note** that checkboxes with both a `checked` and `name` binding will *only* bind on `checked`, not both. The `name` binding will be treated
as a normal mustache variable.

### Radios

Radio buttons can be controlled in the same way as checkboxes. However the chances are, if you're using radio buttons, you have a set of mutually exclusive options to choose between. In this case, if you set the `name` attribute on a radio input to e.g. `\{{someValue}}`, `someValue` will reflect the `value` of the currently checked option:

```html
<label><input type='radio' name='\{{color}}' value='red' checked> Red</label>
<label><input type='radio' name='\{{color}}' value='green'> Green</label>
<label><input type='radio' name='\{{color}}' value='blue'> Blue</label>

<p>The currently selected color is <span style='color: \{{color}};'>\{{color}}</span></p>
```

In the example above, the value of `color` will initially be `'red'` (because that input is checked in the template), and will update as and when the user selects another option.


## `<textarea>` elements

Textareas work exactly the same as standard text inputs - slap a dynamic `value` attribute on them, and you're done:

```html
<textarea value='\{{content}}'></textarea>
```


## `<select>` elements

Drop-down select menus are good when you have many options to choose from. They're straightforward to use in Ractive:

```html
<select value='\{{selectedCountry}}'>
	<option selected disabled>Select a country</option>
	\{{#countries}}
		<option value='\{{id}}'>\{{name}}</option>
	\{{/countries}}
</select>
```

```js
ractive = new Ractive({
	el: myContainer,
	template: myTemplate,
	data: {
		countries: [
			{ id: 'AFG', name: 'Afghanistan' },
			{ id: 'ALB', name: 'Albania' },
			{ id: 'DZA', name: 'Algeria' },
			{ id: 'ASM', name: 'American Samoa' }
			// and so on...
		]
	}
});
```

In the example above, no country will initially be selected. If the user were to select Afghanistan from the list, the value of `selectedCountry` would change to `'AFG'`.

## `contenteditable`

Ractive can two-way data bind contenteditable elements.

```js
var ractive = new Ractive({
	el: myContainer,
	template: myTemplate,
	data: {
		content: 'Edit me'
	}
});

ractive.observe('content', function(newValue, oldValue, keypath) {
	//newValue will contain the new content of the div
});
```

`myTemplate`
```html
<div contenteditable="true" value="\{{content}}"></div>
```

This will be rendered as
```html
<div contenteditable="true">Edit Me</div>
```

As the user edits the data the `content` will update, and observe will fire.

There are a few caveats that you need to know. Despite the value binding with only two curly braces `\{{content}}` (double curly braces are required for two way data binding) the returned content may or may not be a string of HTML. If a user presses enter after most browsers will insert a `<br />`. The `content` would be set to `Edit Me<br/>`. Additionally anything you set to `content` would be rendered as HTML and not escaped despite the lack of triple curly braces(`\{{{content}}}`).

```js
ractive.set('content', '<ul><li>Edit Me</li></ul>');
```
This would actually render an editable unordered list.

Be aware that not all browsers actually operate the same way when it comes to interacting with contenteditable. HTML generated by one browser may differ from another.

## Ambiguous references

A mustache used in a two-way binding context must have an *unambiguous reference*. Consider the following:

```html
\{{#foo}}
	<input value='\{{bar}}'>
\{{/foo}}
```

```js
ractive = new Ractive({
	el: myContainer,
	template: myTemplate,
	data: { foo: {} }
});
```

Ractive must decide, straight away, what {{{createLink 'keypaths' 'keypath'}}} to bind the input's `value` attribute to. It will first see if it can {{{createLink 'references' 'resolve the reference'}}} (`'bar'`) given the current context stack (which includes a single context - `'foo'`). It can't, so it is forced to make an assumption - that the `'bar'` reference should resolve to the `'bar'` keypath.

But this might not be what you want - maybe you *did* want it to resolve to `'foo.bar'`.

You have two options - either use a {{{createLink 'mustaches' 'restricted reference' 'restricted-references'}}}, i.e. `<input value='\{{.bar}}'>`, or ensure that `foo` has a `bar` property (even if the initial value is `undefined`).

## Lazy updates

Under the hood, Ractive always binds to the `change` event (and the `click` event in IE, in the case of checkboxes, due to an IE bug). By default, it will also bind to the `input` event, which means the model is updated instantly when the user enters data (the `change` event fires when a change is ['committed by the user'](https://developer.mozilla.org/en-US/docs/Web/Reference/Events/change)). In some situations, that's not what you want - if you want to only bind to `change`, pass in `lazy: true` as an {{{createLink 'options' 'initialisation option' 'lazy'}}}.

As with `twoway`, laziness may be specified on a per-element basis. Besides `true` (or simply having the attribute preset) and `false` values, the `lazy` directive may also be a number that specifies the number of milliseconds to wait after the last `input` event fires with subsequent `input` events resetting the timeout. For instance `<input value="\{{foo}}" lazy>` will trigger updates to `foo` on `change` and `<input value="\{{foo}}" lazy="1000">` will trigger updates 1 second after the last keypress.

## Observing changes

To use user input elsewhere in your app, you'll need to observe it using {{{createLink 'ractive.observe()'}}}:

```html
<input placeholder='Type your name' value='\{{user.name}}'>
```

```js
ractive = new Ractive({
	el: myContainer,
	template: myTemplate
});

ractive.observe( 'user.name', function ( newValue ) {
	app.user.name = newValue;
	triggerSomeBehaviour();
});
```
