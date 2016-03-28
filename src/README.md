# Ractive General Overview

Ractive is comprised of three major segments: the parser, the viewmodel, and the virtual DOM. The parser isn't strictly necessary at runtime, allowing it to be excluded from a build if used with pre-parsed templates. The bulk of the code for each of the parser, viewmodel, and virtual DOM are in the parser, model, and view directories respectively.

## Parser

The parser comprised of individual reader methods that parse each piece of a Ractive template, like mustaches, text, and expressions. The mustache and text readers are relatively straightforward, though a bit longer and more involved. The expression readers tend toward being short and simple, but there are many of them that get called recursively when trying to read an expression. The readers use the parser to hold current state, like position in the template string, and to provide parsing methods, like matching a string or regular expression.

Each type of mustache has its own reader that calls the appropriate expression or reference readers internally. For instance, the partial reader reads the current open mustache delimiter (defaults to `{{`) followed by a `>`. It then expects to find a relaxed reference, meaning it may contain dashes and slashes among other usually-forbidden characters. It may then optionally read a context expression or series of alias definitions

The expression readers are set arranged such that they can read valid ES expressions with the correct operator precedence by starting with ternary conditionals and trying different expression types from there - or basically a recursive descent parser. Once the expression tree has been parsed, it is flattened into an expression string and a list of references that are used within that string.

At the end of the parsing process, the AST is cleaned up and arranged into its final form that the Ractive runtime expects to find for parsed templates. There are a few processes that take place only in cleanup, such as splitting `if`, `elseif`, and `else` blocks into their appropriate standalone conditional sections.

## Viewmodel

The viewmodel wraps the given data in a tree that is used to bind the view to the data. Portions of the view register with the model using keypaths, and subsequent updates to the viewmodel trigger corresponding changes in the view. Any piece of Ractive-observable data has a corresponding member in the viewmodel, including computations, which are special cased and live in a map at the root of the instance viewmodel. Each node in the model tree contains a lazily-accessible value that may or may not be present at any given point in time, depending on the state of the underlying data. Any members of the data that a model node manages are available as child models of that node.

When a keypath is updated either view a	`set` method, a two-way binding, or externally followed by an `update`, the change propagates in both directions from that point in the model tree. Children of the model are notified and updated, and parents are also notified that a change has taken place on one of their children. Each model that is affected checks its value against what now exists in the underlying data, and if the value has actually changed, it notifies any of its dependents.

Every Ractive instance has its own root viewmodel, but components can optionally map portions of parent viewmodels into their own domain by acquiring a reference to a model node from its parent and aliasing it at its root. This allows, for instance, the `foo.bar.baz` keypath in the parent to be accessed as `bat` if the component has been given a mapping `<Component bat="{{foo.bar.baz}}" />`. Since `bat` in the component is actually the same model node as `foo.bar.baz` in the parent, any dependents that are attached to the node from the component will automatically receive change notifications alongside the dependents that are attached to the parent.

### The runloop

Changes to viewmodel are aggregated by a runloop that registers which fragments of the view are dirty as their model dependencies are updated. Once the viewmodel changes have fully propagated through the model tree, the current turn of the runloop is complete and the changes are flushed to the view. Additionally, the runloop is used to manage transitions and to fire observers that have been triggered to update during the current turn.

Each turn of the runloop also generates a Promise that resolves once all of the notifications from the turn have taken place and any transitions that started have been completed. This is the Promise that is returned from Ractive's mutation (`set`, etc) methods.

### Computations and Expressions

Computations, Expressions, and ReferenceExpressions are all models that depend on other models to acquire their value. Computations are provided through the `computed` registry of a Ractive instance. The two expression types are created dynamically based on expressions in the template. Computations and Expressions resolve to an ephemeral value that, even though it may be derived from and be the exact same reference as a model node, are not tied to an actual model node beyond the computation. ReferenceExpressions, on the other hand, resolve to exactly one model node in the tree, though it may be undefined. That characteristic of ReferenceExpressions allows them to participate in two-way binding where Computations and Expressions cannot.

## Virtual DOM

Every piece of DOM that Ractive can manage has a corresponding class in the virtual DOM to handle the DOM node, which generally end up being either Elements or Text Nodes. View items are grouped together as Fragments of view, which may then be owned by other fragments or items. At the root of every ractive instance is a Fragment instance that contains its entire virtual DOM tree. Each Ractive template construct has at least one analog in the virtual DOM. The bulk of Ractive's view functionality is implemented in the Section, Interpolator, and Element items, with there being a number of specialized element classes to handle special types of HTML element.

All virtual DOM items go through roughly the same lifecycle: creation, binding, rendering, bubbling, updating, unrendering, and unbinding. Creation is basically just the constructor call and almost always is immediately followed by binding. Binding is the point at which the item resolves and registers with its data references. Rendering is the point at which the item inserts an actual DOM node into the DOM. Bubbling and updating are the two halves of the update process, which is discussed in the next section. Unrendering is the point at which the item should no longer be present in the DOM, and it often occurs at the same point as unbinding, which is the point at which the item unregisters with the viewmodel and is effectively destroyed.

Elements are responsible for managing their decorators, transitions, attributes, events, and content fragments. Only event directives are handled by the element's event logic, as plain DOM events e.g. `onclick` are treated as attributes. Each of the fragments for which an element is responsible share its lifecycle, so they are bound, rendered, updated, unrendered, and unbound together. Transitions are the only completely different item managed by an element, as they don't have a fragment, but are instead registered with the runloop when the element is either rendered or unrendered.

### Updates

As changes propagate through the viewmodel, view items are notified of the change through their `handleChange` method. Most items just set a dirty flag and notify their parent that they will need to be updated at the completion of the runloop turn, so the root fragment of each instance affected will then register with the runloop. Once the changes are ready to be flushed to the view, each fragment registered with the runloop is called on to update, where the process happens in reverse, with each parent fragment checking to see if there is a change it needs to respond to and propagating the update downward to its children.

### Bindings

Strictly speaking, any point in the DOM at which Ractive injects data is a binding, but for the purposes of this document, binding refers to a two-way binding between a keypath and a form element.

Bindings are a special class of view node that can only be tied to certain elements and are generated by certain attributes on those elements. To be eligible for binding creation, an attribute must have a template fragment consisting of a single interpolator that contains only a reference or ReferenceExpression. If the attribute is eligible and matches an appropriate name for the element e.g. `checked` for `<input type="checkbox" />`, `value` for `<select>`, `value` or just the content of `<textarea>`.
