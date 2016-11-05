---
title: Components
---
In many situations, you want to encapsulate behaviour and markup into a single reusable *component*, which can be dropped in to Ractive applications.

First, you need to **create the component** with {{{createLink 'Ractive.extend()'}}}, which allows you to define a template, initialisation behaviour, default data, and so on. (If you're not familiar with Ractive.extend() you should read that page first.)

* [Initiliasation Options](#init)
* [Binding](#binding)
* [Events](#events)
* [The \{{>content}} Directive](#content)
* [The \{{yield}} Directive](#yield)
* [Parents and Containers](#parent)

## <a name="init"></a>Initialisation Options

Most of the normal Ractive {{{ createLink 'options' 'initialisation options' }}} also apply to components, particularly the {{{ createLink 'lifecycle events' }}}, a few of which are listed here.

### onconstruct *`Function`*

`onconstruct` fires a single time immediately after the instance is created and will be passed all the data that will initialize the particular component.
This could include setting/changing partials, adding decorators, adding other subcomponents, or anything you would use to initialise a normal Ractive instance.

### onconfig *`Function`*

`onconfig` fires a single time once all of the configuration options have been processed.

### oninit *`Function`*

`oninit` fires a single time when the component is ready to be rendered. You can use this event to set up any proxy event listeners or observers that you need on a particular instance.

### onrender *`Function`*

`onrender` fires just after the component is rendered.

### oncomplete *`Function`*

`oncomplete` fires just after the component is rendered and any transitions have completed. At this point, the component DOM is available.

### isolated *`Boolean`*

Isolated is defaulted to false. This applies to your template scope being isolated to only the data that is passed in.
For example if you wanted to access a particular variable on your parent data as if it existed on your component then setting isolated false would allow this. However if you wanted your template scoped to only data you give it so that everything was very module then set isolated to true.


Setting isolated to false

```js


var Component = Ractive.extend({
  isolated: false,
  template: '#component'

});

var ractive = new Ractive({
  el: 'body',
  template: '#template',
  data: {
    nonIsolatedSetting: 'This is a non isolated setting, get it anywhere'
  },
  components: { Component: Component }
});

```

```html 

<script id="template" type="text/ractive">
  <div>
    <Component>
  </div>
</script>

<script id="component" type="text/ractive">

  \{{nonIsolatedSetting}}

</script>

```

The result of this would be

```html
  <div>
    This is a non isolated setting, get it anywhere
  </div>
```


But if we used the same example and set isolated to true
```js

var Component = Ractive.extend({
  isolated: true,
  template: '#template'
})

```

Then the resulting output would be

```html
  <div>
  </div>
```

Very complex example for such a simple idea but this could drastically effect you.


init is called after the extended component has been initialized 

```js
var MyWidget = Ractive.extend({
  template: '<div on-click="activate">\{{message}}</div>',
  init: function () {
    this.on( 'activate', function () {
      alert( 'Activating!' );
    });
  },
  data: {
    message: 'No message specified, using the default'
  }
});
```

Then, you need to **register the component** by adding it to `Ractive.components`:

```js
Ractive.components.widget = MyWidget;

// or, if you don't want to make it globally available,
// you can use it with only a single Ractive instance
var ractive = new Ractive({
  el: 'body',
  template: mainTemplate,
  components: {
    widget: MyWidget
  }
});
```

Finally, you **use the component** by referring to it within another template:

```html
<div class='application'>
  <h1>I've got a widget</h1>
  <widget message='Click to activate!'/>
</div>
```

Using the 'widget' component like this is more or less equivalent to doing the following:

```js
new MyWidget({
  el: document.querySelector( '.application' ),
  append: true, // so the component doesn't nuke the <h1>
  data: {
    message: 'Click to activate!'
  }
});
```

## <a name="binding"></a>Binding

Instead of passing a static message ('Click to activate!') through, we could have passed a dynamic one:

```html
<widget message='\{{foo}}'/>
```

In this case, the value of `message` within the component would be bound to the value of `foo` in the parent Ractive instance. When the value of parent-`foo` changes, the value of child-`message` also changes, and vice-versa.

### Data Context
A new data context gets created for the component, so any parameters don't pollute the primary data (bound values still update):

```js
var data = {
    name: 'Colors',
    colors: ['red', 'blue', 'yellow'],
    style: 'tint'
}
Ractive.components.widget = Ractive.extend({})
var ractive = new Ractive({ 
    template: '<widget items='\{{colors}}' option1='A' option2='\{{style}}'/>',
    data: data 
})

function logData(){
    console.log('main', JSON.stringify(ractive.get()))
    console.log('widget', JSON.stringify(ractive.findComponent('widget').get()))
}

logData()
// main {"name":"Colors","colors":["red","blue","yellow"],"style":"tint"}
// widget {"items":["red","blue","yellow"],"option1":"A","option2":"tint"}

ractive.set('colors.1', 'green')

logData()
// main {"name":"Colors","colors":["red","green","yellow"],"style":"tint"}
// widget {"items":["red","green","yellow"],"option1":"A","option2":"tint"} 
```


## <a name="events"></a>Events

You can subscribe to events that emanate from a component in the normal way. For example, our widget template contains a `<div>` element with an `on-click="activate"` directive. We're listening for that event inside the MyWidget `init` method, but we can also listen for it like so:

```html
<widget on-activate="doSomething"/>
```
```js
ractive.on( 'doSomething', function () {
  alert( 'Widget activated!' );
});
```

(The same goes for any events that are fired programmatically by the component, rather than as a result of user interaction.)

### Bubbling

Events fired from within components will also bubble up the component hierarchy with their component name attached as a namespace. For instance, if a component referenced in a template as `Foo` fires an event named `myFoo`, then all of the Ractive instances in the hierarchy above the `Foo` will also have a `Foo.myFoo` event fired. This can be used to avoid having to reproxy events at each level in a deeply nested component hierarchy.

Namespaced events may be subscribed in a two ways:

1. Explicitly
```js
ractive.on('Foo.myFoo', function() {
    // ...
});
```
2. As a wildcard
```js
ractive.on('*.myFoo', function() {
    // ...
});
```

Using wildcards will subscribe to any events with the given name, regardless of their namespace. Multiple instances of the same component can be namespaced separately in the same hierarchy by adding the same component with multiple names.

```js
var component = Ractive.extend({});
Ractive.components.Foo = component;
Ractive.components.Bar = component;
```

Here, `<Foo />` and `<Bar />` will both be instances of `component`, but any events bubbled out of `<Foo />` will have `Foo.` as their namespace and events from `<Bar />` will have `Bar.` as their namespace.

#### Stop bubbling

If you don't want the event to bubble any further up the component hierarchy, simply return false from the event handler function. This will also `stopPropagation()` and `preventDefault()` on the `original` event if there is one.

Additionally, events proxied within a component will stop events from internal components from bubbling further upwards. Within components, proxy event attributes may use wildcards.

```html
<Foo on-Bar.foo="barfooed" on-Baz.*="baz-event" on-*.bippy="any-bippy">
  <Bar /><Baz /><Baz />
</Foo>
```

Here, `Bar.foo`, `Baz.`, and `*.bippy` events will not bubble beyond the `Foo` component. At this point though, `Foo` events will be bubbled for `barfooed`, `baz-event`, and `any-bippy`. To completely stop events from bubbling, you can pass an empty handler.

```html
<Foo on-*.*="">
  <Bar /><Baz /><Baz />
</Foo>
```

Here, no internal component events will bubble above `Foo`.


## <a name="content"></a>The `\{{>content}}` Directive 

Any content in the template calling the component:

```html
<list items='\{{gunas}}''>
    \{{name}} (\{{qualities}})
</list>

<list items='\{{fates}}'>
    "\{{.}}"
</list>
``` 
is exposed in the component as a partial named "content":

```html
<!-- template for "list" component -->
<ul>
    \{{#items}}
    <li>\{{>content}}</li>
    \{{/}}
</ul>
```

Partials, components, and any other valid template items can be used as well:
```html
<list items='\{{gunas}}'>
    \{{>partialA}})
</list>

<list items='\{{fates}}'>
    <widget value='\{{.}}'/> 
</list>
```

Currently, the content markup resolves in the component's context. In the second example above the `value` parameter for `<widget>` is the individual list item of `\{{fates}}`. Components inherit their parents partials, so in the first case, `partiaA` could be a partiald defined inline within the component body, added to the component's `partials` property at creation or before use, defined in the parent Ractive instance, or defined globally (`Ractive.partials`).

Partials defined inline in the component body can be used to override partials defined on the component. This can be useful for components to allow easy customization of each instance using partials:

```html
<list items='\{{gunas}}'>
    \{{#partial item}}
        * \{{name}}
    \{{/partial}}
</list>
```

If the `list` component uses a partial named `item` to display the given `items`, it will be overridden for this instance with `* \{{name}}`.


## <a name="yield"></a>The `\{{yield}}` Directive

The `\{{>content}}` directive, as a special partial, renders everthing in the context of the component. The `\{{yield}}` directive renders everything in the context of the parent, which is typically what the component user expects to happen. Any event handlers or data references will be registered on or refer the parent context instead of the component context.

Any inline templates defined in the template passed to the component, however, will be rendered in the context of the component.

```html
<Foo>
  \{{ myData }}
  <button on-click="clicked">Click</button>
</Foo>
```

```js
var Foo = Ractive.extend({
  template: '<div>\{{ yield }}</div>',
  data: { myData: 2 }
});
var ractive = new Ractive({
  components: { Foo: Foo },
  data: { myData: 1 }
});
ractive.on('clicked', function(ev) {
  console.log('clicked');
});
```

Here, `1` will be displayed next to the button, and the button, when clicked, will log a message to the console.

Inline partials may also be yielded within a component by specifying a name with `yield` e.g. `\{{yield item}}`. Currently, only partials defined inside the component body may be yielded.

```html
<Foo>
  I will be in the name-less yield.
  \{{#partial foo}}
    I will be in the foo yield.
  \{{/partial}}
</Foo>
```
```js
var Foo = Ractive.extend({
  template: '<div>Here is my content: \{{yield}}</div><div>Here is my foo: \{{yield foo}}</div>'
});
```

## <a name="parent"></a>Parents and Containers

Components that are nested within other components have access to their parents, containers, and root.

`this.root` is the base Ractive instance that has no other parents.
`this.parent` is the parent immediately above this component in the fragment hierarchy.
`this.container` is the containing Ractive instance in the case that this component was included in a `yield`.

`this.findParent(name)` will search up the hierarchy until it finds a parent component named `name`.
`this.findContainer(name)` will search up the surrogate hierarchy until if finds a container named `name`.
