---
title: Ractive.extend()
---
Ractive is more than a library; it is a platform. It makes it easier to create reusable, but specialised, blocks of functionality such as to-do lists, slideshows, bar charts, text editors, and so on.

Default options can also be provided using {{{ createLink 'Ractive.extend()' }}}. While the result
is a fully instantiable on its own, the main value is that they can then be used as components
within your templates:

```js
var MyRactive = Ractive.extend({
  template: 'I can be instantiated _or_ be a component!'
});

var ractive = new MyRactive({
  el: 'container'
});

var ractive2 = new Ractive({
  el: 'container2',
  template: '<widget/>',
  components: {
    widget: MyRactive
  }
});
```


Though it's technically incorrect, we'll refer to these as *subclasses* of the Ractive *base class*. In order to create them, we use `Ractive.extend()`.

Here's a simple example - we'll create a `Modal` subclass which has a default template, and which always stays centred on the page:

```css
.modal-background {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5);
  padding: 0.5em;
  text-align: center;
  -moz-box-sizing: border-box; box-sizing: border-box;
}

.modal-outer {
  position: relative;
  width: 100%;
  height: 100%;
}

.modal {
  position: relative;
  background-color: white;
  padding: 2em;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
  margin: 0 auto;
  display: inline-block;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  -moz-box-sizing: border-box; box-sizing: border-box;
}

.modal-button {
  text-align: center;
  background-color: rgb(70,70,180);
  color: white;
  padding: 0.5em 1em;
  display: inline-block;
  cursor: pointer;
}
```

```html
<div class='modal-background' on-tap='close' intro='fade' outro='fade'>
  <div class='modal-outer'>
    <div class='modal'>
      \{{>modalContent}}
    </div>
  </div>
</div>
```

```js
// Create our Modal subclass
Modal = Ractive.extend({
  // by default, the modal should sit atop the <body>...
  el: document.body,

  // ...but it should append to it rather than overwriting its contents
  append: true,

  // all Modal instances will share a template (though you can override it
  // on a per-instance basis, if you really want to)
  template: modalTemplate,

  // the init function will be called as soon as the instance has
  // finished rendering
  init: function () {
    var self = this, resizeHandler;

    // store references to the background, and to the modal itself
    // we'll assume we're in a modern browser and use querySelector
    this.outer = this.find( '.modal-outer' );
    this.modal = this.find( '.modal' );

    // if the user taps on the background, close the modal
    this.on( 'close', function ( event ) {
      if ( !this.modal.contains( event.original.target ) ) {
        this.teardown();
      }
    });

    // when the window resizes, keep the modal horizontally and vertically centred
    window.addEventListener( 'resize', resizeHandler = function () {
      self.center();
    }, false );

    // clean up after ourselves later
    this.on( 'teardown', function () {
      window.removeEventListener( 'resize', resizeHandler );
    }, false );

    // manually call this.center() the first time
    this.center();
  },

  center: function () {
    var outerHeight, modalHeight, verticalSpace;

    // horizontal centring is taken care of by CSS, but we need to
    // vertically centre
    outerHeight = this.outer.clientHeight;
    modalHeight = this.modal.clientHeight;

    verticalSpace = ( outerHeight - modalHeight ) / 2;

    this.modal.style.top = verticalSpace + 'px';
  }
});

// We can now instantiate our modal
basicModal = new Modal({
  partials: {
    modalContent: '<p>This is some important content!</p><a class="modal-button" on-tap="okay">Okay</a>'
  }
});

basicModal.on( 'okay', function () {
  this.teardown();
});
```

Subclasses can themselves be extended. Lets say we wanted to be able to create lots of modals similar to this one:

```js
BasicModal = Modal.extend({
  partials: {
    modalContent: '<p>This is some important content!</p><a class="modal-button" on-tap="okay">Okay</a>'
  },

  init: function ( options ) {
    // wherever we overwrite methods, such as `init`, we can call the
    // overwritten method as `this._super`
    this._super( options );

    this.on( 'okay', function () {
      this.teardown();
    });
  }
});

basicModal = new BasicModal();
```

The `init` method is able to call `this._super` because when Ractive detects (with regex, essentially by calling `init.toString()`) that a child method requires `this._super` it wraps it in a function that sets `this._super` to the parent method of the same name. This wrapping only happens where necessary.

`Ractive.extend()` can be used with multiple prototypes, which will be applied from left to right.
```js
var Foo = Ractive.extend({
    template: 'I am effectively overridden'
  }, {
    template: 'I win'
  });
```
