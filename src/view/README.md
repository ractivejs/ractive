# Ractive View Overview

Ractive views are structured virtual DOM trees that are assembled from template AST and manage DOM nodes on the page when they are rendered. Virtual DOM items are grouped together in `Fragment`s, which contain them, and they may also own `Fragment`s that contain other items. Each item may contain a reference to a DOM node when rendered, though every item doesn not have a DOM analog.

## States

Items generally follow a fixed lifecycle.

1. Construction - the item is created and knows about its parent and the template chunk from which it was created. Its template may also indicate what its children should look like if it has them.
2. `bind` - the item looks up any references is may have and registers with the model(s) that they represent. At this point, the item may create child items and bind them as well.
3. `render` - the item may create an actual DOM node and tell its children to create their DOM nodes as necessary. The resulting nodes will be inserted into the document.
4. `unrender` - thie item is no longer needed and will be removed from the document immediately or in the near future.
5. `unbind` - this typically goes along with `unrender` and tells the models on which this item depends that they should no longer send change notifications to it.

There is a sixth floating step `rebind` that happens any time one dependency models shuffles (and in certain other very special circumstances) that causes the items to re-resolve their models and re-register if necessary.

## Virtual DOM Items

### Text

Text is the simplest item. It simply holds a string that it turns into a `TextNode` when rendered.

### Interpolator

This is the next simplest item. It resolves a model for its reference or expression and renders the value of the model as a text node if needed. Interpolators don't necessarily render directly, as they may be used for values by other items, such as attributes, mappings, and bindings.

### Element

An `Element` represents a DOM element. It also contains a number of other items in the form of `Attribute`s, `Decorator`s, `Transition`s, `EventDirective`s, and its children in a `Fragment`.

#### Attributes

There are actually several different items that are treated as attributes for `Element`s, event though only two of them actually may render into the DOM.

* `Attribute`s - maybe obvious, they these represent a DOM attribute on their parent element. There are a number of different handlers for updating attributes depending on the element and attribute name. The `updateDelegate` for a particular attribute can be found in [getUpdateDelegate.js](items/element/attribute/getUpdateDelegate.js).
* `ConditionalAttribute`s - render as a string and are parsed into actual DOM attributes using a `div` or an `svg` depending on their parent element.
* `Mapping`s - when rendered add a mapping to their component, and when unrendered, remove it. These aren't attached to `Element`s, but instead, are attached to `Component`s (see below).
* `EventDirective`s - when rendered attach an event listener to their parent, and when unrenedered, remove it. Event parameters are kept in sync with their bindings and are evaluated when the event fires.
* `BindingDirective`s - when rendered and unrendered update their parent element's bindings, if they exist.
* `Decorator`s - when rendered call the named decorator with their parent element, and when unrenedered, remove it. `Decorator`s also have an update cycle related to their parameters.
* `Transition`s - are a sort of weird case. When rendered, they attach a transition handler to their element, and when the element renders or unrenders, if an appropriate transition handler is registered, will trigger the transition. Transition parameters are also kept in sync with their bindings.

#### Bindings

Certain attributes may also trigger a binding to be created on their parent element. For instance, if two-way binding is enabled on the parent element, and the parent element is an `input`, a `value` attribute with a single `Interpolator` as its content will cause a two-way binding to be created between the value of the `input` and the model of the `Interpolator`. This binding will handle updating the model when the input `value` has changed. There are a few other types of bindings for managing check values, content editables, name-bound lists of checkboxes, and other miscellaneous special values.

A `lazy` binding directive will cause any associated two-way bindings to fire either after a timeout or on blur, depending on the value of the `lazy` directive.

### Section

`Section`s come in many flavors, depending on the chunk of template from which they are created. A section may provide context, be conditional (positive or negative), or be iterative. Generic sections (`{{#something}}...{{/}}` in template) will adjust their type, to a certain extent, based on the value of their model. A generic section will always provide context in the form of their model. An `if`-style conditional section, including `elseif`, `else`, and `unless` do not provide context. An `each` section will always provide context in the form of the current iteration. A `with` section will always provide context as its model, but it will only render if its model is considered truthy by Ractive, which is pretty much the same as JS truthy except `{}` and `[]` are falsey. A generic section will be context/conditional if it is anything other than an array, which will make it iterative.

Sections that provide context do so by binding their `Fragment`s with their model so that the reference resolution process can find the appropriate contexts when resolving.

#### Context/Conditional

Context and conditional sections will render and unrender their child fragment as their model changes truthiness. Conditional sections always stand alone, even it they have `elseif` or `else` branches nested within them, because those branches are turned into independent sections during parsing.

#### Iterative

If section is designated iterative (`{{#each ...}}`) or is a general section with an array value resolution, the section will create a special form of fragment for each index or key in the value. The special form `RepeatedFragment` handles mapping of indices, keys, and references to those to a corresponding model. Iterative sections also have special handling for shuffles so that DOM is not wholesale destroyed and recreated when the array shuffles.

Iterative sections may supply an alias for their context, so that referencing the iterated value is a little bit easier. See `Aliases` below for more info, as this is just a slightly specialized form of that.

Iterative sections may also supply key and/or index aliases so that their keys and/or indices may be referenced by a name from within their child fragments.

### Alias

Alias sections simply resolve their models and act as a lookup endpoint for reference resolution. Aliasing happens entirely in the view.

### Component

A component is a sort-of special form of `Element` that, instead of creating a DOM element, creates a new Ractive instance. The child instance will be rendered and unrendered in place of the component placeholder in the DOM.

Any plain `Attribute`s with a single `Interpolator` as content in a component's template are turned into `Mapping`s.

## Resolution

The resolution process for references requires a keypath and a `Fragment` as a starting point.

1. If the reference is a special reference (`@index`, `@this`, etc), the appropriate model is looked up and returned.
2. If the reference is relative (starts with `~/`, `.`, or `../`) the appropriate base model is retrieved and the rest of the keypath is joined onto it and the resulting model is returned.
3. If the reference is non-relative and the base of the keypath is a member of the current context, then the context is joined to the keypath and the resulting model is returned.
4. The reference is ambiguous, so the following loop until resolution or no fragments are left, starting with the given fragment:
  1. If the fragment is an iteration, check to see if there is an index or key alias that matches the root of the reference, and if so, return it.
  2. If the fragment has aliases, check to see if there is one that matches the root of the reference, and if so, return it.
  3. If the fragment has context:
    1. If the fragment is the root of an instance, note it
    2. If the context has a child matching the root of the reference:
      * If we crossed a component boundary, create an implicit mapping the to the newly discovered model in the current component.
      * Return it
  4. If the fragment belongs to a component, use the component's parent fragment and loop.
  5. Use the fragment's parent and loop.

The resolution process is no longer happens strictly the vDOM, as the result of `Ractive.getNodeInfo` also uses the target `Element`'s fragment to resolve relative references. Event objects are also extended with methods from the same helper.

## Updates

The `runloop` controls when the DOM is actually updated and when transitions start in `batch`es. It also handles resolving promises when transitions have completed and the DOM is completely up to date.

As changes propagate through the viewmodel, view items are notified of the change through their `handleChange` method. Most items just set a dirty flag and notify their parent, via their `bubble` method, that they will need to be updated at the completion of the runloop turn. The root fragment of each instance affected will then register with the runloop. Once the changes are ready to be flushed to the view, each fragment registered with the runloop is called on to update, where the process happens in reverse, with each parent fragment checking to see if there is a change it needs to respond to and propagating the update downward to its children.
