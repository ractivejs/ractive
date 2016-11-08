# Ractive.escapeKey()

Escapes the given key so that it can be concatenated with a keypath string.

**Syntax**

- `Ractive.escapeKey(key)`

**Arguments**

- `key (string)`: The key to escape.

**Returns**

- `(string)`: The escaped key.

**Examples**

```js
Ractive.escapeKey('foo.bar'); // foo\.bar
```

---

# Ractive.extend()

Creates a "subclass" of the Ractive constructor or a subclass constructor. See [`Components`]() for an in-depth discussion on the use of `Ractive.extend`.

**Syntax**

- `Ractive.extend([options[, ...optionsN]])`

**Arguments**

- `[options] (Object)`: One or more objects that represent the defaults for instances of the subclass, with the latter objects' properties taking precedence over the former. See [Initialization Options]() for a list of possible options.

**Returns**

- `(Function)`: The subclass constructor function.

**Examples**

```js
const SubClass = Ractive.extend({
    template: '<div>{{message}}</div>',
    data: {
        message: 'Hello World!'
    }
});

// <div>Hello World!</div>
const instance1 = new SubClass({
    el: '.div1'
});

// <div>Lorem Ipsum</div>
const instance2 = new SubClass({
    el: '.div2',
    data: {
        message: 'Lorem Ipsum'
    }
});
```

---

# Ractive.getCSS()

Returns the scoped CSS from Ractive subclasses defined at the time of the call.

If used without arguments, it will return the scoped CSS of all subclasses. If provided an array of scoping IDs, it will return the scoped CSS of all subclasses whose scoping ID is included in the array.

**Syntax**

- `Ractive.getCSS([key])`

**Arguments**

- `[key] (Array<string>)`: Subclass CSS scoping ID.

**Returns**

- `(string)`: The scoped CSS.

**Examples**

```js
// Assuming the generated ID for this subclass is 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.
const Subclass1 = Ractive.extend({
    ...
    css: 'div{ color: red }'
    ...
});

// Assuming the generated ID for this subclass is 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'.
const Subclass2 = Ractive.extend({
    ...
    css: 'div{ color: green }'
    ...
});

// CSS contains the scoped versions of div{ color: red } and div{ color: green }.
const css = Ractive.getCSS();

// css contains the scoped version of div{ color: red } only.
const css = Ractive.getCSS([ 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' ]);

```

---

# Ractive.getNodeInfo()

Accepts a node and returns an [`Info`]() object containing details of the Ractive instance the node is associated to.

**Syntax**

- `Ractive.getNodeInfo(node)`

**Arguments**

- `node (string|Node)`: The DOM node or a CSS selector of the DOM node for which you wish to retrieve the Ractive instance or view details.

**Returns**

- `(NodeInfo)`: An [NodeInfo]() object.

**Examples**

```js
const info = Ractive.getNodeInfo(document.getElementById('some-node'));

const info = Ractive.getNodeInfo('#some-node');
```

---

# Ractive.joinKeys()

Joins the given keys into a properly escaped keypath e.g. `

**Syntax**

- `Ractive.joinKeys(key1 [, ...keyN])`

**Arguments**

- `key (string)`: One or more strings to join.

**Returns**

- `(string)`: A properly joined and escaped keypath.

**Examples**

```js
Ractive.joinKeys( 'foo', 'bar.baz' ); // foo.bar\.baz
```

---

# Ractive.parse()

Parses the template into an abstract syntax tree that Ractive can work on.

**Syntax**

- `Ractive.parse(template[, options])`

**Arguments**

- `template (string)`: A Ractive-compliant HTML template.
- `[options] (Object)`: Parser options.
    - `[preserveWhitespace] (boolean)`: When `true`, preserves whitespace in templates. Whitespace inside the `<pre>` element is preserved regardless of the value of this option. Defaults to `false`.
    - `[sanitize] (boolean|Object)`: When `true`, strips inline event attributes and certain elements from the markup. Defaults to `false`.
        - `[elements] (Array<string>)`: An array of element names to blacklist.
        - `[eventAttributes] (boolean)`: When `true`, strips off inline event attributes.

When `sanitize` is `true`, the following elements are stripped:

- `<applet>`
- `<base>`
- `<basefont>`
- `<body>`
- `<frame>`
- `<frameset>`
- `<head>`
- `<html>`
- `<isindex>`
- `<link>`
- `<meta>`
- `<noframes>`
- `<noscript>`
- `<object>`
- `<param>`
- `<script>`
- `<style>`
- `<title>`

**Returns**

- `(Object)` - The object representation of the provided markup.

**Examples**

Assume the following markup.

```html
<div class='gallery'>
  {{#items}}
    <!-- comments get stripped out of the template -->
    <figure proxy-tap='select' intro='staggered'>
      <img class='thumbnail' src='assets/images/{{id}}.jpg'>
      <figcaption>{{( i+1 )}}: {{description}}</figcaption>
    </figure>
  {{/items}}
</div>
```

`Ractive.parse( template );` will yield the following output:

```json
[{"t":7,"e":"div","a":{"class":"gallery"},"f":[{"t":4,"r":"items","i":"i","f":[" ",{"t":7,"e":"figure","a":{"intro":"staggered"},"f":[{"t":7,"e":"img","a":{"class":"thumbnail","src":["assets/images/",{"t":2,"r":"id","p":4},".jpg"]}}," ",{"t":7,"e":"figcaption","f":[{"t":2,"x":{"r":["i"],"s":"❖0+1"},"p":4},": ",{"t":2,"r":"description","p":4}]}],"v":{"tap":"select"}}," "],"p":1}]}]
```

TODO: `Ractive.parse` has more options. Document them.

---

# Ractive.splitKeypath()

Splits the given keypath into an array of unescaped keys.

**Syntax**

- `Ractive.splitKeypath(keypath)`

**Arguments**

- `keypath (string)`: The keypath to split into keys.

**Returns**

- `(Array)`: Returns an array of unescaped keys.

**Examples**

```js
Ractive.splitKeypath( 'foo.bar\.baz' ); // [ 'foo', 'bar.baz' ]
```

---

# Ractive.unescapeKey()

Unescapes the given key e.g. `foo\.bar` => `foo.bar`.

**Syntax**

- `Ractive.unescapeKey(key)`

**Arguments**

- `key (string)`: The key to unescape.

**Returns**

- `(string)`: The unescaped key.

**Examples**

```js
Ractive.unescapeKey('foo\.bar'); // foo.bar
```
