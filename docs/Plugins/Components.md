In many situations, you want to encapsulate behaviour and markup into a single reusable *component*, which can be dropped in to Ractive applications.

# Writing components

Components are simply custom-configured "subclasses" (analogous, but technically incorrect) of Ractive. This configuration sets it apart from regular instances in that you can define different behavior based on what [initialization options]() are defined on it.

To declare components, one simply extends Ractive using [`Ractive.extend()`](). They can also be subclassed.

```js
// A regular instance of Ractive
const ractive = new Ractive({ ... });

// A subclass of Ractive
const MyComponent = Ractive.extend({ ... });

// A subclass of our subclass
const MyComponentSubclass = MyComponent.extend({ ... });
```

As with other inheritance mechanisms, overriding a method essentially replace the method. In order to call the parent of the overridden method, simply call `ractive._super()`.

```js
const MyComponentSubclass = MyComponent.exten({
  // Overrides the oninit of MyComponent
  oninit: function(...args){
    // Call MyComponent's oninit
    this._super(...args);
  }
});
```

# Registering components

Like other plugins, components can be introduced into the app in several ways.

It can be made available globally via the `Ractive.components` static property:

```js
// Available to all instances of Ractive.
Ractive.components.MyComponent = Ractive.extend({ ... });
```

It can be made available only for the component that requires it, via the `components` initialization option:

```js
// Only available for instances of AnotherComponent.
const AnotherComponent = Ractive.extend({
  components: {
    MyComponent
  }
});
```

It can even be made available only for a specific instance only, similarly, via the `components` initialization option:

```js
// Only available to this specific instance.
const ractive = new Ractive({
  components: {
    MyComponent
  }
});
```

# Using components

Components are simply subclasses of Ractive, which means the are instatiable via the `new` keyword.

```js
const ractive = new MyComponent({ ... });
```

But where components really shine is when they're used on templates. They are written like _custom elements_. Each custom element notation represents one instance of the component.

```js
const AnotherComponent = Ractive.extend({
  template: `
    <div>
      <MyComponent /> <!-- One instance of MyComponent -->
      <MyComponent /> <!-- Another instance of MyComponent -->
      <MyComponent /> <!-- Yet another instance of MyComponent -->
    </div>
  `
});
```

# Isolation

A unique behavior in Ractive is the resolver's ability to "climb" up the data context if a keypath doesn't resolve in the current data context. It takes this behavior a step further and also climbs to the parent component's data context if it does not resolve on the child data context.

In the following example, the instance of both `ChildComponent` prints "Hello World!" even when the data is set on the outer-most instance. The resolver "climbed" up and out to the outer-most instance to resolve `message`.

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    Child: {{ message }}
  `
});

Ractive.components.ParentComponent = Ractive.extend({
  template: `
    <ChildComponent />
  `
});

const ractive = new Ractive({
  el: 'body',
  template: `
    <ParentComponent />
  `
});

ractive.set('message', 'Hello World!');
```

While this is handy, sometimes you will want full component isolation. The `isolated` initialization option does just that. When set to `true`, the resolver stops resolution up to the component with `isolated:true`.

In the following example, the instance of `ChildComponent` will not print anything as it cannot find `message` on itself and it has been isolated.

```js
Ractive.components.ChildComponent = Ractive.extend({
  isolated: true,
  template: `
    Child: {{ message }}
  `
});

Ractive.components.ParentComponent = Ractive.extend({
  template: `
    <ChildComponent />
  `
});

const ractive = new Ractive({
  el: 'body',
  template: `
    <ParentComponent />
  `
});

ractive.set('message', 'Hello World!');
```

# Binding

Bindings connect a piece of data on the parent instance to the data on the child instance. Updates on one will reflect on the other. The syntax is similar to how one would write HTML element attributes.

The following example binds `text` on the instance to `MyComponent`'s `message`. Updates on the value of `text` will update `message`. Typing on the `<input>` bound to `message` will update `text`.

```js
Ractive.components.MyComponent = Ractive.extend({
  template: `
    <input type="text" value="{{ message }}">
  `
});

const ractive = new Ractive({
  el: 'body',
  template: '<MyComponent message="{{ text }} />'
});

ractive.set('text', 'Hello World!');
```

## Data context

Each component instance comes with its own data context, so any parameters don't pollute the primary data. Bindings will still update across both contexts.

```js
Ractive.components.MyComponent = Ractive.extend({});

const ractive = new Ractive({
  // Bind colors to shades. Widget will have option1, exists only in Widget.
  template: `
    <MyComponent shades='{{colors}}' option1='A' />
  `,
  data: {
    colors: ['red', 'blue', 'yellow'],
    name: 'Colors'
  }
});

const widget = ractive.findComponent('MyComponent')

ractive.get(); // {"colors":["red","blue","yellow"], "name":"Colors"}
widget.get();  // {"shades":["red","blue","yellow"], "option1":"A"}

ractive.set('colors.1', 'green')

ractive.get(); // {"colors":["red","green","yellow"], "name":"Colors"}
widget.get();  // {"shades":["red","green","yellow"], "option1":"A"}
```

# Events

Components can fire custom events using [`ractive.fire()`](). Enclosing components can listen for events using the `on-*` event notation. There are two ways to handle component events.

The first is using the method call syntax. It is similar to inline JavaScript.

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    <div></div>
  `,
  oncomplete: function(){
    this.fire('boringeventname');
  }
});

Ractive.components.ParentComponent = Ractive.extend({
  template: `
    <ChildComponent on-boringeventname="@this.greetz()" />
  `,
  greetz: function(){
    console.log('Hello World');
  }
});
```

The other is using the proxy event syntax. It's called "proxy" in the sense that the component event is assigned another name, the name which the enclosing element actually listens to.

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    <div></div>
  `,
  oncomplete: function(){
    this.fire('boringeventname');
  }
});

Ractive.components.ParentComponent = Ractive.extend({
  template: `
    <ChildComponent on-boringeventname="greetz" />
  `,
  oninit: function(){
    this.on('greetz', function(){
      console.log('Hello World')
    });
  }
});
```

## Bubbling

Events fired from within components will also "bubble" up the component hierarchy with their component name attached as a namespace. This can be used to avoid having to re-fire events at each level in a deeply nested component hierarchy.

In the following example, a `ChildComponent` instance is under a `ParentComponent` instance whilch is also under a Ractive instance. The event from the `ChildComponent` instance can be be listened to from the outer Ractive instance.

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    <div></div>
  `,
  oncomplete: function(){
    this.fire('childevent');
  }
});

Ractive.components.ParentComponent = Ractive.extend({
  template: `
    <ChildComponent />
  `
});

const ractive = new Ractive({
  el: 'body',
  template: `
    <ParentComponent />
  `
});

ractive.on('ChildComponent.childevent', function(){
  console.log('Hello World!');
});
```

To listen to the same event name regardless of the component that's firing the event, an `*` can be used as the namespace.

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    <div></div>
  `,
  oncomplete: function(){
    this.fire('sameevent');
  }
});

Ractive.components.ParentComponent = Ractive.extend({
  template: `
    <ChildComponent />
  `,
  oncomplete: function(){
    this.fire('sameevent');
  }
});

const ractive = new Ractive({
  el: 'body',
  template: `
    <ParentComponent />
  `
});

ractive.on('*.sameevent', function(){
  console.log('This will fire two times');
});
```

The namespace is not bound to the component definition but rather to the name of the component assigned during registration.

In the following example, `ChildComponent` is registered onto the `ParentComponent` as `ChildComponent1` and `ChildComponent2`. Even with the same definition, there will be two namespaces, one for `ChildComponent1` and `ChildComponent2`.

```js
const ChildComponent = Ractive.extend({
  template: `
    <div></div>
  `,
  oncomplete: function(){
    this.fire('sameevent');
  }
});

Ractive.components.ParentComponent = Ractive.extend({
  template: `
    <ChildComponent1 />
    <ChildComponent2 />
  `,
  components: {
    ChildComponent1: ChildComponent,
    ChildComponent2: ChildComponent
  }
});

const ractive = new Ractive({
  el: 'body',
  template: `
    <ParentComponent />
  `
});

ractive.on('ChildComponent1.sameevent', function(){
  console.log('Same component definition, instance with name 1.');
});

ractive.on('ChildComponent2.sameevent', function(){
  console.log('Same component definition, instance with name 2.');
});
```

## Stopping propagation

In order to stop bubbling, simply return `false` from an event handler. Should the event come from a DOM event, it will call `stopPropagation()` and `preventDefault()` on the DOM event as well.

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    <div></div>
  `,
  oncomplete: function(){
    this.fire('childevent');
  }
});

Ractive.components.ParentComponent = Ractive.extend({
  template: `
    <ChildComponent />
  `,
  oninit: function(){
    this.on('ChildComponent.childevent', function(){
      return false;
    });
  }
});

const ractive = new Ractive({
  el: 'body',
  template: `
    <ParentComponent />
  `
});

ractive.on('ChildComponent.childevent', function(){
  console.log('This will not fire');
});
```

Events that have been handled proxy event will also prevent the bubbling of the original event. The proxy event, if one is assigned, will bubble in its place.

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    <div></div>
  `,
  oncomplete: function() {
    this.fire('childevent1');
    this.fire('childevent2');
  }
});

Ractive.components.ParentComponent = Ractive.extend({
  template: `
    <ChildComponent on-childevent1="" on-childevent2="childevent2proxy" />
  `,
  oninit: function() {
    this.on('childevent2proxy', function() {
      console.log('childevent2 handled and will no longer bubble.');
      console.log('childevent2proxy will take its place.');
    });
  }
});

const ractive = new Ractive({
  el: 'body',
  template: `
    <ParentComponent />
  `
});

ractive.on('ChildComponent.childevent1', function() {
  console.log('childevent1 stopped');
});

ractive.on('ChildComponent.childevent2', function() {
  console.log('childevent2 stopped');
});

ractive.on('ParentComponent.childevent2proxy', function() {
  console.log('childevent2proxy fired');
});
```

# Transclusion

The inner HTML of a component (the content between the opening and closing tags) is exposed to the component template by two special mustaches: `{{> content }}` and `{{ yield }}`. They're similar in a sense that they render the inner HTML wherever the mustaches are positioned. However, that's where the similarities end.

## `{{>content}}`

`{{>content}}` renders the inner HTML in the context of the component. Partials, components, and any other valid template items can be used as inner HTML. `{{>content}}` can be thought of as a special partial.

In the following example, the result will print "Lorem Ipsum" because the inner HTML's context is the component, whose `message` is "Lorem Ipsum".

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    <div class="child-component">{{>content}}</div>
  `
});

const ractive = new Ractive({
  el: 'body',
  data: {
    message: 'Hello World!'
  },
  template: `
    <div class="ractive">
      <ChildComponent message="Lorem Ipsum">
        <div class="inner-content">{{ message }}</div>
      </ChildComponent>
    </div>
  `
});
```

Partials defined in the inner HTML can be used to override partials defined on the component. This can be useful for components to allow easy customization of each instance using partials.

In the following example, `{{>messageWrapper}}` renders `{{message}}` inside `<em>` instead of the default `<strong>`.

```js
Ractive.components.ChildComponent = Ractive.extend({
  partials: {
    messageWrapper: '<strong>{{message}}</strong>'
  },
  template: `
    <div class="child-component">{{>content}}</div>
  `
});

const ractive = new Ractive({
  el: 'body',
  data: {
    message: 'Hello World!'
  },
  template: `
    <div class="ractive">
      <ChildComponent message="Lorem Ipsum">
        {{#partial messageWrapper}}<em>{{message}}</em>{{/}}
        <div class="inner-content">
        	{{> messageWrapper }}
        </div>
      </ChildComponent>
    </div>
  `
});
```

## `{{yield}}`

`{{yield}}` renders the inner HTML in the context of the parent component. Partials, components, and any other valid template items can be used as inner HTML. A common use case of `{{yield}}` is to provide wrapper markup transparently.

In the following example, the result will print "Hello World!" because the inner HTML's context is the parent component's, whose `message` is "Hello World!".

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    <div class="child-component">{{ yield }}</div>
  `
});

const ractive = new Ractive({
  el: 'body',
  data: {
    message: 'Hello World!'
  },
  template: `
    <div class="ractive">
      <ChildComponent message="Lorem Ipsum">
        <div class="inner-content">{{ message }}</div>
      </ChildComponent>
    </div>
  `
});
```

Yields can also be customized using named yields. Instead of the component's inner HTML, a named yield will look for a partial of the same name defined in the component inner HTML and use it for rendering.

In the following example, the component renders the yield content 3 times. However, the last two yields will look for `italicYield` and `boldYield` partials to render. What's rendered is three "Hello World!"s in regular, italic and bold.

```js
Ractive.components.ChildComponent = Ractive.extend({
  template: `
    <div class="child-component">
      {{ yield }}
      {{ yield italicYield }}
      {{ yield boldYield }}
    </div>
  `
});

const ractive = new Ractive({
  el: 'body',
  data: {
    message: 'Hello World!'
  },
  template: `
    <div class="ractive">
      <ChildComponent message="Lorem Ipsum">
        {{#partial italicYield }}<em>{{message}}</em>{{/}}
        {{#partial boldYield }}<strong>{{message}}</strong>{{/}}
        {{message}}
      </ChildComponent>
    </div>
  `
});
```
