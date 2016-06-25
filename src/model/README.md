# Ractive Model Overview

All of the data managed by Ractive is represented by its model hierarchy.

## Model

Almost every type of Model is a subclass of `Model`, so it seems a good place to start. Each model typically has a parent model, a key that is used to access its value from its parent, and a value. Most models also have children of some sort, which are tracked by key such that `{ foo: { bar: 'baz' } }` would have a model with a `childByKey['foo']`, which would also have a model at `childByKey['bar']`. The value of each of the models listed there would be the object containing `foo: { bar: `baz` }`, its `foo` child would be the object `bar: 'baz'`, and its `bar` child would be the string `'baz'`. Where children of a model are other models, dependents (`deps`) of a model may be anything that wants to be notified of changes, and each model will typically have a number of dependents, too.

Each model has a unique keypath that is assembled by taking its key and each of its parents keys up to the root and joining them with a `.`.

Models are also inherently lazy, meaning their value is not necessarily available when the are created. A value is retrieved from a model using its `get` method which may have the side effect of computing the value. Once a value has been computed, it is generally cached until a change happens that would cause the cache to be invalidated. In most models, there isn't really an opportunity for that change outside of normal change propagation.

### Change propagation

When a change is supplied to a model, its `set` method is called, which usually delegates to `applyValue`. `applyValue` checks to see that the value has actually changed in some way (hint: setting to the same object or array is considered a change because something may have changed further in), and if it has, it will start change notification for all of the model's children and dependents. If the model has resolvers registered with it trying to get an unresolved value, then this is where the unresolved value will be resolved and the resolver satisfied and cleared. Next, any children will be notified that their parent has had a value change and that they may need to update accordingly, which may trigger further cascades of resolution and change notification. Next, any dependents of the model will be notified that the model has had a value change as their `handleChange` methods are called. Finally, upstream models (parents) are notified that a change has taken place somewhere among its children.

The child notification of the propagation is handled by the model's `mark` method. `mark` also checks to see that the value has actually changed, and if it has, will notify its children and dependents that it has had a value change. This is also the method called when the user signals that they have changed some data externally by calling `ractive.update()`.

### Shuffling

There is a special form of change wherein an array is modified without being swapped out, which is triggered by array methods like `splice`, `push`, and `pop`. When an array modification happens, change propagation takes a special path through the model that allows more precise DOM manipulation rather than throwing all of the DOM out and replacing it with a new result. This is achieved by having the special array method handlers compute which indexes are actually changed and having the array model's deps that can actally handle a shuffle ignore any untouched indices.

The instance method `merge` does something similar, but instead of modifying the underlying array, it compares the members of the new supplied array against the model array to compute the index changes. It the swaps in the new array and triggers a shuffle based on the computed index changes.

### Adaptation

Between the change check and the change propagation during `applyValue`, there is a step that handles part of adaptation so that external objects with special behaviors, like backbone models, can be used as data sources. An adaptors takes the special object, wraps it up, and returns the wrapper that also has a value that represents the object for consumption by Ractive. Most adaptors also have methods to update values in their source data as well, and those methods are called when an update is applied to an adapted model.

## RootModel

Every tree needs a root, and `RootModel` serves that purpose here. Each Ractive instance gets its own `RootModel` that is stored at its `viewmodel` property. This special model is also the storage point for computations and mappings.

### Computations

A computation is exactly what is sounds like: a getter and optional setter function that are used to provide read and optional write access to some non-fixed piece of data. Each computation is stored in the root model `computations` hash by its keypath. Computations can be created in two places:

1. Explicitly when a `computed` map is passed to a Ractive instantiation or when an entry is later added to a instance's computed map. These may be read/write and have a keypath that mirrors their name.
2. Implicitly when an expression is used in a template. These are read-only and have a keypath that is an expanded representation of their expression.

A computation is also a form of model, so anything that depends on it will subscribe to it as if it were a regular model. Change propagation happens in the same way as a regular model as well.

Since computations may depend on other bits of data controlled by Ractive, while they are being retrieved, any references to other models will cause the extra references to be `capture`d. When the computation is complete, the computation will register with each of its captured dependencies so that it will be notified when it needs to invalidate and notify its dependents of the change.

### Mappings

When a Ractive instance has children, typically components, it may supply a handles to its own data to them in the form of mappings. The child instance stores a reference to the parent model at its mapped name and uses it when its dependents request access to keypaths that start with the mapped name. This allows child instances, which may be isolated, to stay in sync with portions of their parents data easily, because the parent still controls the data (single source of truth) and there is no syncing involved. So if a parent has a component `<Component foo="{{bar.baz.bat.bippy}}" />`, then the component instance will get a mapping `foo` that references the parent model at `bar.baz.bat.bippy`.

## Other models

There are a few other types of `Model` in the code, such as the `RactiveModel`, which represents a Ractive instance, and the `GlobalModel`, which represents the global object of the current environment a.k.a. `window` for browsers and `global` for Node.js.

### KeyModel

The last major model remaining is the `KeyModel`. Instances of this represent indices of arrays and keys of objects during iteration. The key flavor never is immutable, becuase the keys of  objects never change (they may be removed, but that doesn't change the key itself). The index flavor __does__ change, but only when the array represented by its parent model is shuffled.
