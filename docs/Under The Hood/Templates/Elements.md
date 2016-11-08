---
title: Elements
---

Just about any useful template will contain at least one HTML element, and Ractive has a few directives and other constructs built into its element representation to make life easier. Some of these constructs have their own sections in the docs, such as {{{ createLink 'Events overview' 'Events' }}}, {{{ createLink 'Transitions' }}}, {{{ createLink 'Two-way binding' 'Bindings' }}}, {{{ createLink 'Decorators' }}}, and {{{ createLink 'Components' }}}.

## Conditional attributes

You can wrap one or more attributes inside an element tag in a conditional section, and Ractive will add and remove those attributes as the conditional section is rendered and unrendered. For instance:

```html
<ul>
\{{#each list as item}}
	<li \{{#if ~/selectedItems.indexOf(item) !== -1}}class="selected"\{{/if}}>
		\{{item.name}}
	</li>
\{{/each}}
</ul>
```

In this example, if the current `item` in the `list` iteration is also in the `selectedItems` array, then a class attribute will be added to the rendered li and set to `"selected"`.

Any number of attributes can be used in a section, and other {{{ createLink 'Mustaches' 'Mustache' }}} constructs can be used to supply attributes.

## Class and style attributes

Ractive has special handlers for style and class attributes that only add and remove values for classes or style properties that are in the template. This allows external code to modify the element without Ractive overriding the change on its next update.

There are also two special classes of attributes for handling a single class or style property at a time.

### `style-*` attributes

To facilitate quick updates to a single style property of an element, Ractive supports using `style-property-name="value"` or `style-propertyName="value"` attributes. The value may be any text including any mustaches, and when the value is updated, the appropriate style property on the element will be updated with the new value. Any hyphens after the first will be removed and the subsequent letter capitalized so both `style-text-align` and `style-textAlign` will target the `textAlign` property of the element's style.

`style-` attributes are processed as text rather than expressions, so you can use mustaches to set values e.g. `<div style-left="\{{x}}px" style-top="\{{y}}em">...</div>`. Any mustaches can be used in the value, including interpolators, sections, and partials.

### `class-*` attributes

To facilitate easily adding and removing a single class on an element, Ractive supports using `class-class-name` and `class-className` attributes. Unlike style attributes, no changes are made to the hyphenation of the attribute name, so `class-class-name` and `class-className` will target `class-name` and `className`, respectively. The truthiness of the value assigned to a `class-` attribute determines whether or not Ractive will add the class to the element. If the value is truthy, the class will be added. If the value becomes falsey, then the class will be removed. No other classes on the element will be affected by changes to a `class-` attribute.

`class-` attributes, like `style-` attributes, not processed as expressions, so in order to supply the conditional to determine whether or not the class is set, you must use an interpolator e.g. `<div class-foo="\{{someBoolean}}" class-bar="\{{num + 33 > 42}}">...</div>`.
