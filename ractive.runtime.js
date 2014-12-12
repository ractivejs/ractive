/*
	ractive.runtime.js v0.6.1
	2014-12-12 - commit 8c0ccc80 

	http://ractivejs.org
	http://twitter.com/RactiveJS

	Released under the MIT License.
*/

(function (global, factory) {

	'use strict';

	if (typeof define === 'function' && define.amd) {
		// export as AMD
		define([], factory);
	} else if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
		// node/browserify
		module.exports = factory();
	} else {
		// browser global
		global.Ractive = factory();
	}

}(typeof window !== 'undefined' ? window : this, function () {

	'use strict';

  var defaults__defaultOptions = {
    // render placement:
    el: void 0,
    append: false,

    // template:
    template: { v: 2, t: [] },

    // parse:
    preserveWhitespace: false,
    sanitize: false,
    stripComments: true,

    // data & binding:
    data: {},
    computed: {},
    magic: false,
    modifyArrays: true,
    adapt: [],
    isolated: false,
    parameters: true,
    twoway: true,
    lazy: false,

    // transitions:
    noIntro: false,
    transitionsEnabled: true,
    complete: void 0,

    // css:
    noCssTransform: false,

    // debug:
    debug: false
  };

  var defaults__default = defaults__defaultOptions;
  //# sourceMappingURL=01-_6to5-options.js.map

  // These are a subset of the easing equations found at
  // https://raw.github.com/danro/easing-js - license info
  // follows:

  // --------------------------------------------------
  // easing.js v0.5.4
  // Generic set of easing functions with AMD support
  // https://github.com/danro/easing-js
  // This code may be freely distributed under the MIT license
  // http://danro.mit-license.org/
  // --------------------------------------------------
  // All functions adapted from Thomas Fuchs & Jeremy Kahn
  // Easing Equations (c) 2003 Robert Penner, BSD license
  // https://raw.github.com/danro/easing-js/master/LICENSE
  // --------------------------------------------------

  // In that library, the functions named easeIn, easeOut, and
  // easeInOut below are named easeInCubic, easeOutCubic, and
  // (you guessed it) easeInOutCubic.
  //
  // You can add additional easing functions to this list, and they
  // will be globally available.


  var easing__default = {
    linear: function (pos) {
      return pos;
    },
    easeIn: function (pos) {
      return Math.pow(pos, 3);
    },
    easeOut: function (pos) {
      return (Math.pow((pos - 1), 3) + 1);
    },
    easeInOut: function (pos) {
      if ((pos /= 0.5) < 1) {
        return (0.5 * Math.pow(pos, 3));
      }
      return (0.5 * (Math.pow((pos - 2), 3) + 2));
    }
  };
  //# sourceMappingURL=01-_6to5-easing.js.map

  /*global console */
  var environment__svg, environment__isClient, environment__hasConsole;

  if (typeof document === "undefined") {
    environment__svg = false;
  } else {
    environment__svg = document && document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
  }

  environment__isClient = (typeof document === "object");

  environment__hasConsole = (typeof console !== "undefined" && typeof console.warn === "function" && typeof console.warn.apply === "function");

  var namespaces__default = {
    html: "http://www.w3.org/1999/xhtml",
    mathml: "http://www.w3.org/1998/Math/MathML",
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };
  //# sourceMappingURL=01-_6to5-namespaces.js.map

	var vendors__default = ["o", "ms", "moz", "webkit"];
	//# sourceMappingURL=01-_6to5-vendors.js.map

  var dom__createElement, dom__matches, dom__div, dom__methodNames, dom__unprefixed, dom__prefixed, dom__i, dom__j, dom__makeFunction;

  // Test for SVG support
  if (!environment__svg) {
    dom__createElement = function (type, ns) {
      if (ns && ns !== namespaces__default.html) {
        throw "This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you're trying to render SVG in an older browser. See http://docs.ractivejs.org/latest/svg-and-older-browsers for more information";
      }

      return document.createElement(type);
    };
  } else {
    dom__createElement = function (type, ns) {
      if (!ns || ns === namespaces__default.html) {
        return document.createElement(type);
      }

      return document.createElementNS(ns, type);
    };
  }

  function dom__getElement(input) {
    var output;

    if (!input || typeof input === "boolean") {
      return;
    }

    if (typeof window === "undefined" || !document || !input) {
      return null;
    }

    // We already have a DOM node - no work to do. (Duck typing alert!)
    if (input.nodeType) {
      return input;
    }

    // Get node from string
    if (typeof input === "string") {
      // try ID first
      output = document.getElementById(input);

      // then as selector, if possible
      if (!output && document.querySelector) {
        output = document.querySelector(input);
      }

      // did it work?
      if (output && output.nodeType) {
        return output;
      }
    }

    // If we've been given a collection (jQuery, Zepto etc), extract the first item
    if (input[0] && input[0].nodeType) {
      return input[0];
    }

    return null;
  }

  if (!environment__isClient) {
    dom__matches = null;
  } else {
    dom__div = dom__createElement("div");
    dom__methodNames = ["matches", "matchesSelector"];

    dom__makeFunction = function (methodName) {
      return function (node, selector) {
        return node[methodName](selector);
      };
    };

    dom__i = dom__methodNames.length;

    while (dom__i-- && !dom__matches) {
      dom__unprefixed = dom__methodNames[dom__i];

      if (dom__div[dom__unprefixed]) {
        dom__matches = dom__makeFunction(dom__unprefixed);
      } else {
        dom__j = vendors__default.length;
        while (dom__j--) {
          dom__prefixed = vendors__default[dom__i] + dom__unprefixed.substr(0, 1).toUpperCase() + dom__unprefixed.substring(1);

          if (dom__div[dom__prefixed]) {
            dom__matches = dom__makeFunction(dom__prefixed);
            break;
          }
        }
      }
    }

    // IE8...
    if (!dom__matches) {
      dom__matches = function (node, selector) {
        var nodes, parentNode, i;

        parentNode = node.parentNode;

        if (!parentNode) {
          // empty dummy <div>
          dom__div.innerHTML = "";

          parentNode = dom__div;
          node = node.cloneNode();

          dom__div.appendChild(node);
        }

        nodes = parentNode.querySelectorAll(selector);

        i = nodes.length;
        while (i--) {
          if (nodes[i] === node) {
            return true;
          }
        }

        return false;
      };
    }
  }

  function dom__detachNode(node) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }

    return node;
  }

  var object___slice = Array.prototype.slice;
  var object__create, object__defineProperty, object__defineProperties;

  try {
    Object.defineProperty({}, "test", { value: 0 });

    if (environment__isClient) {
      Object.defineProperty(document.createElement("div"), "test", { value: 0 });
    }

    object__defineProperty = Object.defineProperty;
  } catch (err) {
    // Object.defineProperty doesn't exist, or we're in IE8 where you can
    // only use it with DOM objects (what were you smoking, MSFT?)
    object__defineProperty = function (obj, prop, desc) {
      obj[prop] = desc.value;
    };
  }

  try {
    try {
      Object.defineProperties({}, { test: { value: 0 } });
    } catch (err) {
      // TODO how do we account for this? noMagic = true;
      throw err;
    }

    if (environment__isClient) {
      Object.defineProperties(dom__createElement("div"), { test: { value: 0 } });
    }

    object__defineProperties = Object.defineProperties;
  } catch (err) {
    object__defineProperties = function (obj, props) {
      var prop;

      for (prop in props) {
        if (props.hasOwnProperty(prop)) {
          object__defineProperty(obj, prop, props[prop]);
        }
      }
    };
  }

  try {
    Object.create(null);

    object__create = Object.create;
  } catch (err) {
    // sigh
    object__create = (function () {
      var F = function () {};

      return function (proto, props) {
        var obj;

        if (proto === null) {
          return {};
        }

        F.prototype = proto;
        obj = new F();

        if (props) {
          Object.defineProperties(obj, props);
        }

        return obj;
      };
    }());
  }

  function object__extend(target) {
    var sources = object___slice.call(arguments, 1);

    var prop, source;

    while (source = sources.shift()) {
      for (prop in source) {
        if (source.hasOwnProperty(prop)) {
          target[prop] = source[prop];
        }
      }
    }

    return target;
  }

  function object__fillGaps(target) {
    var sources = object___slice.call(arguments, 1);

    sources.forEach(function (s) {
      for (var key in s) {
        if (s.hasOwnProperty(key) && !(key in target)) {
          target[key] = s[key];
        }
      }
    });

    return target;
  }

  var object__hasOwn = Object.prototype.hasOwnProperty;
  //# sourceMappingURL=01-_6to5-object.js.map

  var is__toString = Object.prototype.toString, is__arrayLikePattern = /^\[object (?:Array|FileList)\]$/;

  // thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
  function is__isArray(thing) {
    return is__toString.call(thing) === "[object Array]";
  }

  function is__isArrayLike(obj) {
    return is__arrayLikePattern.test(is__toString.call(obj));
  }

  function is__isEmptyObject(obj) {
    // if it's not an object, it's not an empty object
    if (!is__isObject(obj)) {
      return false;
    }

    for (var k in obj) {
      if (obj.hasOwnProperty(k)) return false;
    }

    return true;
  }

  function is__isEqual(a, b) {
    if (a === null && b === null) {
      return true;
    }

    if (typeof a === "object" || typeof b === "object") {
      return false;
    }

    return a === b;
  }

  function is__isNumber(thing) {
    return (typeof thing === "number" || (typeof thing === "object" && is__toString.call(thing) === "[object Number]"));
  }

  // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
  function is__isNumeric(thing) {
    return !isNaN(parseFloat(thing)) && isFinite(thing);
  }

  function is__isObject(thing) {
    return (thing && is__toString.call(thing) === "[object Object]");
  }
  //# sourceMappingURL=01-_6to5-is.js.map

  /* global console */
  var warn__warn, warn__warned = {};

  if (environment__hasConsole) {
    warn__warn = function (message, allowDuplicates) {
      if (!allowDuplicates) {
        if (warn__warned[message]) {
          return;
        }

        warn__warned[message] = true;
      }

      console.warn("%cRactive.js: %c" + message, "color: rgb(114, 157, 52);", "color: rgb(85, 85, 85);");
    };
  } else {
    warn__warn = function () {};
  }

  var warn__default = warn__warn;
  //# sourceMappingURL=01-_6to5-warn.js.map

  var transformCss__selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g, transformCss__commentsPattern = /\/\*.*?\*\//g, transformCss__selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>\~:]))+)((?::[^\s\+\>\~\(]+(?:\([^\)]+\))?)?\s*[\s\+\>\~]?)\s*/g, transformCss__mediaQueryPattern = /^@media/, transformCss__dataRvcGuidPattern = /\[data-ractive-css="[a-z0-9-]+"]/g;

  function transformCss__transformCss(css, id) {
    var transformed, dataAttr, addGuid;

    dataAttr = "[data-ractive-css=\"" + id + "\"]";

    addGuid = function (selector) {
      var selectorUnits, match, unit, base, prepended, appended, i, transformed = [];

      selectorUnits = [];

      while (match = transformCss__selectorUnitPattern.exec(selector)) {
        selectorUnits.push({
          str: match[0],
          base: match[1],
          modifiers: match[2]
        });
      }

      // For each simple selector within the selector, we need to create a version
      // that a) combines with the id, and b) is inside the id
      base = selectorUnits.map(transformCss__extractString);

      i = selectorUnits.length;
      while (i--) {
        appended = base.slice();

        // Pseudo-selectors should go after the attribute selector
        unit = selectorUnits[i];
        appended[i] = unit.base + dataAttr + unit.modifiers || "";

        prepended = base.slice();
        prepended[i] = dataAttr + " " + prepended[i];

        transformed.push(appended.join(" "), prepended.join(" "));
      }

      return transformed.join(", ");
    };

    if (transformCss__dataRvcGuidPattern.test(css)) {
      transformed = css.replace(transformCss__dataRvcGuidPattern, dataAttr);
    } else {
      transformed = css.replace(transformCss__commentsPattern, "").replace(transformCss__selectorsPattern, function (match, $1) {
        var selectors, transformed;

        // don't transform media queries!
        if (transformCss__mediaQueryPattern.test($1)) return match;

        selectors = $1.split(",").map(transformCss__trim);
        transformed = selectors.map(addGuid).join(", ") + " ";

        return match.replace($1, transformed);
      });
    }

    return transformed;
  };
  var transformCss__default = transformCss__transformCss;

  function transformCss__trim(str) {
    if (str.trim) {
      return str.trim();
    }

    return str.replace(/^\s+/, "").replace(/\s+$/, "");
  }

  function transformCss__extractString(unit) {
    return unit.str;
  }
  //# sourceMappingURL=01-_6to5-transform.js.map

  var css__cssConfig = {
    name: "css",
    extend: css__extend,
    init: function () {}
  };

  function css__extend(Parent, proto, options) {
    var guid = proto.constructor._guid, css;

    if (css = css__getCss(options.css, options, guid) || css__getCss(Parent.css, Parent, guid)) {
      proto.constructor.css = css;
    }
  }

  function css__getCss(css, target, guid) {
    if (!css) {
      return;
    }

    return target.noCssTransform ? css : transformCss__default(css, guid);
  }

  var css__default = css__cssConfig;
  //# sourceMappingURL=01-_6to5-css.js.map

  var wrap__default = function (method, superMethod, force) {
    if (force || wrap__needsSuper(method, superMethod)) {
      return function () {
        var hasSuper = ("_super" in this), _super = this._super, result;

        this._super = superMethod;

        result = method.apply(this, arguments);

        if (hasSuper) {
          this._super = _super;
        }

        return result;
      };
    } else {
      return method;
    }
  };

  function wrap__needsSuper(method, superMethod) {
    return typeof superMethod === "function" && /_super/.test(method);
  }
  //# sourceMappingURL=01-_6to5-wrapMethod.js.map

  var data__dataConfig = {
    name: "data",
    extend: data__extend,
    init: data__init,
    reset: data__reset
  };

  var data__default = data__dataConfig;

  function data__combine(Parent, target, options) {
    var value = options.data || {}, parentValue = data__getAddedKeys(Parent.prototype.data);

    if (typeof value !== "object" && typeof value !== "function") {
      throw new TypeError("data option must be an object or a function, \"" + value + "\" is not valid");
    }

    return data__dispatch(parentValue, value);
  }


  function data__extend(Parent, proto, options) {
    proto.data = data__combine(Parent, proto, options);
  }

  function data__init(Parent, ractive, options) {
    var value = options.data, result = data__combine(Parent, ractive, options);

    if (typeof result === "function") {
      result = result.call(ractive, value) || value;
    }

    return ractive.data = result || {};
  }

  function data__reset(ractive) {
    var result = this.init(ractive.constructor, ractive, ractive);

    if (result) {
      ractive.data = result;
      return true;
    }
  }

  function data__getAddedKeys(parent) {
    // only for functions that had keys added
    if (typeof parent !== "function" || !Object.keys(parent).length) {
      return parent;
    }

    // copy the added keys to temp 'object', otherwise
    // parent would be interpreted as 'function' by dispatch
    var temp = {};
    data__copy(parent, temp);

    // roll in added keys
    return data__dispatch(parent, temp);
  }

  function data__dispatch(parent, child) {
    if (typeof child === "function") {
      return data__extendFn(child, parent);
    } else if (typeof parent === "function") {
      return data__fromFn(child, parent);
    } else {
      return data__fromProperties(child, parent);
    }
  }

  function data__copy(from, to, fillOnly) {
    for (var key in from) {
      if (!(to._mappings && to._mappings[key] && to._mappings[key].updatable) && fillOnly && key in to) {
        continue;
      }

      to[key] = from[key];
    }
  }

  function data__fromProperties(child, parent) {
    child = child || {};

    if (!parent) {
      return child;
    }

    data__copy(parent, child, true);

    return child;
  }


  function data__fromFn(child, parentFn) {
    return function (data) {
      var keys;

      if (child) {
        // Track the keys that our on the child,
        // but not on the data. We'll need to apply these
        // after the parent function returns.
        keys = [];

        for (var key in child) {
          if (!data || !(key in data)) {
            keys.push(key);
          }
        }
      }

      // call the parent fn, use data if no return value
      data = parentFn.call(this, data) || data;

      // Copy child keys back onto data. The child keys
      // should take precedence over whatever the
      // parent did with the data.
      if (keys && keys.length) {
        data = data || {};

        keys.forEach(function (key) {
          data[key] = child[key];
        });
      }

      return data;
    };
  }

  function data__extendFn(childFn, parent) {
    var parentFn;

    if (typeof parent !== "function") {
      // copy props to data
      parentFn = function (data) {
        data__fromProperties(data, parent);
      };
    } else {
      parentFn = function (data) {
        // give parent function it's own this._super context,
        // otherwise this._super is from child and
        // causes infinite loop
        parent = wrap__default(parent, function () {}, true);

        return parent.call(this, data) || data;
      };
    }

    return wrap__default(childFn, parentFn);
  }
  //# sourceMappingURL=01-_6to5-data.js.map

  var errors__default = {
    missingParser: "Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser",

    mergeComparisonFail: "Merge operation: comparison failed. Falling back to identity checking",

    noComponentEventArguments: "Components currently only support simple events - you cannot include arguments. Sorry!",

    noTemplateForPartial: "Could not find template for partial \"{name}\"",

    noNestedPartials: "Partials ({{>{name}}}) cannot contain nested inline partials",

    evaluationError: "Error evaluating \"{uniqueString}\": {err}",

    badArguments: "Bad arguments \"{arguments}\". I'm not allowed to argue unless you've paid.",

    failedComputation: "Failed to compute \"{key}\": {err}",

    missingPlugin: "Missing \"{name}\" {plugin} plugin. You may need to download a {plugin} via http://docs.ractivejs.org/latest/plugins#{plugin}s",

    badRadioInputBinding: "A radio input can have two-way binding on its name attribute, or its checked attribute - not both",

    noRegistryFunctionReturn: "A function was specified for \"{name}\" {registry}, but no {registry} was returned",

    defaultElSpecified: "The <{name}/> component has a default `el` property; it has been disregarded",

    noElementProxyEventWildcards: "Only component proxy-events may contain \"*\" wildcards, <{element} on-{event}/> is not valid.",

    methodDeprecated: "The method \"{deprecated}\" has been deprecated in favor of \"{replacement}\" and will likely be removed in a future release. See http://docs.ractivejs.org/latest/migrating for more information.",

    usePromise: "{method} now returns a Promise, use {method}(...).then(callback) instead.",

    noTwowayExpressions: "Two-way binding does not work with expressions. Encountered ( {expression} ) on element {element}.",

    computedCannotMapTo: "Computed property \"{key}\" cannot be mapped to \"{other}\" because {reason}.",

    notUsed: "prevents forgetting trailing \",\" in cut and paste of previous line :)"
  };
  //# sourceMappingURL=01-_6to5-errors.js.map

  function optionGroup__createOptionGroup(keys, config) {
    var group = keys.map(config);

    keys.forEach(function (key, i) {
      group[key] = group[i];
    });

    return group;
  };
  var optionGroup__default = optionGroup__createOptionGroup;
  //# sourceMappingURL=01-_6to5-optionGroup.js.map

  var parseOptions__keys, parseOptions__parseOptions;

  parseOptions__keys = ["preserveWhitespace", "sanitize", "stripComments", "delimiters", "tripleDelimiters", "interpolate"];

  parseOptions__parseOptions = optionGroup__default(parseOptions__keys, function (key) {
    return key;
  });

  var parseOptions__default = parseOptions__parseOptions;
  //# sourceMappingURL=01-_6to5-parseOptions.js.map

  var parser__parser = {
    parse: parser__doParse,
    fromId: parser__fromId,
    isHashedId: parser__isHashedId,
    isParsed: parser__isParsed,
    getParseOptions: parser__getParseOptions,
    createHelper: parser__createHelper
  };

  function parser__createHelper(parseOptions) {
    var helper = object__create(parser__parser);
    helper.parse = function (template, options) {
      return parser__doParse(template, options || parseOptions);
    };
    return helper;
  }

  function parser__doParse(template, parseOptions) {
    if (!parse__default) {
      throw new Error(errors__default.missingParser);
    }

    return parse__default(template, parseOptions || this.options);
  }

  function parser__fromId(id, options) {
    var template;

    if (!environment__isClient) {
      if (options && options.noThrow) {
        return;
      }
      throw new Error("Cannot retrieve template #" + id + " as Ractive is not running in a browser.");
    }

    if (parser__isHashedId(id)) {
      id = id.substring(1);
    }

    if (!(template = document.getElementById(id))) {
      if (options && options.noThrow) {
        return;
      }
      throw new Error("Could not find template element with id #" + id);
    }

    if (template.tagName.toUpperCase() !== "SCRIPT") {
      if (options && options.noThrow) {
        return;
      }
      throw new Error("Template element with id #" + id + ", must be a <script> element");
    }



    return template.innerHTML;
  }

  function parser__isHashedId(id) {
    return (id && id.charAt(0) === "#"); // TODO what about `id[0]`, does that work everywhere?
  }

  function parser__isParsed(template) {
    return !(typeof template === "string");
  }

  function parser__getParseOptions(ractive) {
    // Could be Ractive or a Component
    if (ractive.defaults) {
      ractive = ractive.defaults;
    }

    return parseOptions__default.reduce(function (val, key) {
      val[key] = ractive[key];
      return val;
    }, { ractive: ractive });
  }

  var parser__default = parser__parser;
  //# sourceMappingURL=01-_6to5-parser.js.map

  var template__templateConfig = {
    name: "template",

    extend: function template__extend(Parent, proto, options) {
      var template;

      // only assign if exists
      if ("template" in options) {
        template = options.template;

        if (typeof template === "function") {
          proto.template = template;
        } else {
          proto.template = template__parseIfString(template, proto);
        }
      }
    },

    init: function template__init(Parent, ractive, options) {
      var template, fn;

      // TODO because of prototypal inheritance, we might just be able to use
      // ractive.template, and not bother passing through the Parent object.
      // At present that breaks the test mocks' expectations
      template = "template" in options ? options.template : Parent.prototype.template;

      if (typeof template === "function") {
        fn = template;
        template = template__getDynamicTemplate(ractive, fn);

        ractive._config.template = {
          fn: fn,
          result: template
        };
      }

      template = template__parseIfString(template, ractive);

      // TODO the naming of this is confusing - ractive.template refers to [...],
      // but Component.prototype.template refers to {v:1,t:[],p:[]}...
      // it's unnecessary, because the developer never needs to access
      // ractive.template
      ractive.template = template.t;

      if (template.p) {
        template__extendPartials(ractive.partials, template.p);
      }
    },

    reset: function (ractive) {
      var result = template__resetValue(ractive), parsed;

      if (result) {
        parsed = template__parseIfString(result, ractive);

        ractive.template = parsed.t;
        template__extendPartials(ractive.partials, parsed.p, true);

        return true;
      }
    }
  };

  function template__resetValue(ractive) {
    var initial = ractive._config.template, result;

    // If this isn't a dynamic template, there's nothing to do
    if (!initial || !initial.fn) {
      return;
    }

    result = template__getDynamicTemplate(ractive, initial.fn);

    // TODO deep equality check to prevent unnecessary re-rendering
    // in the case of already-parsed templates
    if (result !== initial.result) {
      initial.result = result;
      result = template__parseIfString(result, ractive);
      return result;
    }
  }

  function template__getDynamicTemplate(ractive, fn) {
    var helper = parser__default.createHelper(parser__default.getParseOptions(ractive));
    return fn.call(ractive, ractive.data, helper);
  }

  function template__parseIfString(template, ractive) {
    if (typeof template === "string") {
      // ID of an element containing the template?
      if (template[0] === "#") {
        template = parser__default.fromId(template);
      }

      template = parse__default(template, parser__default.getParseOptions(ractive));
    }

    // Check we're using the correct version
    else if (template.v !== 2) {
      throw new Error("Mismatched template version! Please ensure you are using the latest version of Ractive.js in your build process as well as in your app");
    }

    return template;
  }

  function template__extendPartials(existingPartials, newPartials, overwrite) {
    if (!newPartials) return;

    // TODO there's an ambiguity here - we need to overwrite in the `reset()`
    // case, but not initially...

    for (var key in newPartials) {
      if (overwrite || !existingPartials.hasOwnProperty(key)) {
        existingPartials[key] = newPartials[key];
      }
    }
  }

  var template__default = template__templateConfig;
  //# sourceMappingURL=01-_6to5-template.js.map

  function Registry__Registry(name, useDefaults) {
    this.name = name;
    this.useDefaults = useDefaults;
  }

  Registry__Registry.prototype = {
    constructor: Registry__Registry,

    extend: function (Parent, proto, options) {
      this.configure(this.useDefaults ? Parent.defaults : Parent, this.useDefaults ? proto : proto.constructor, options);
    },

    init: function (Parent, ractive, options) {
      this.configure(this.useDefaults ? Parent.defaults : Parent, ractive, options);
    },

    configure: function (Parent, target, options) {
      var name = this.name, option = options[name], registry;

      registry = object__create(Parent[name]);

      for (var key in option) {
        registry[key] = option[key];
      }

      target[name] = registry;
    },

    reset: function (ractive) {
      var registry = ractive[this.name];
      var changed = false;
      Object.keys(registry).forEach(function (key) {
        var item = registry[key];
        if (item._fn) {
          if (item._fn.isOwner) {
            registry[key] = item._fn;
          } else {
            delete registry[key];
          }
          changed = true;
        }
      });
      return changed;
    },

    findOwner: function (ractive, key) {
      return ractive[this.name].hasOwnProperty(key) ? ractive : this.findConstructor(ractive.constructor, key);
    },

    findConstructor: function (constructor, key) {
      if (!constructor) {
        return;
      }
      return constructor[this.name].hasOwnProperty(key) ? constructor : this.findConstructor(constructor._Parent, key);
    },

    find: function (ractive, key) {
      var _this = this;
      return Registry__recurseFind(ractive, {
        test: function (r) {
          return key in r[_this.name];
        },
        getValue: function (r) {
          return r[_this.name][key];
        }
      });
    },

    findInstance: function (ractive, key) {
      var _this2 = this;
      return Registry__recurseFind(ractive, {
        test: function (r) {
          return key in r[_this2.name];
        },
        getValue: function (r) {
          return r;
        }
      });
    }
  };

  function Registry__recurseFind(ractive, finder) {
    var parent;

    if (finder.test(ractive)) {
      return finder.getValue(ractive);
    }

    if (!ractive.isolated && (parent = ractive.parent)) {
      return Registry__recurseFind(parent, finder);
    }
  }

  var Registry__default = Registry__Registry;
  //# sourceMappingURL=01-_6to5-Registry.js.map

  var registries__keys = ["adaptors", "components", "computed", "decorators", "easing", "events", "interpolators", "partials", "transitions"], registries__registries = optionGroup__default(registries__keys, function (key) {
    return new Registry__default(key, key === "computed");
  });

  var registries__default = registries__registries;
  //# sourceMappingURL=01-_6to5-registries.js.map

	var noop__default = function () {};
	//# sourceMappingURL=01-_6to5-noop.js.map

  function wrapPrototype__wrap(parent, name, method) {
    if (!(/_super/.test(method))) {
      return method;
    }

    var wrapper = function wrapSuper() {
      var superMethod = wrapPrototype__getSuperMethod(wrapper._parent, name), hasSuper = ("_super" in this), oldSuper = this._super, result;

      this._super = superMethod;

      result = method.apply(this, arguments);

      if (hasSuper) {
        this._super = oldSuper;
      } else {
        delete this._super;
      }

      return result;
    };

    wrapper._parent = parent;
    wrapper._method = method;

    return wrapper;
  };
  var wrapPrototype__default = wrapPrototype__wrap;

  function wrapPrototype__getSuperMethod(parent, name) {
    var method;

    if (name in parent) {
      (function () {
        var value = parent[name];

        if (typeof value === "function") {
          method = value;
        } else {
          method = function returnValue() {
            return value;
          };
        }
      })();
    } else {
      method = noop__default;
    }

    return method;
  }
  //# sourceMappingURL=01-_6to5-wrapPrototypeMethod.js.map

  function deprecate__deprecate(options, deprecated, correct) {
    if (deprecated in options) {
      if (!(correct in options)) {
        warn__default(deprecate__getMessage(deprecated, correct));

        options[correct] = options[deprecated];
      } else {
        throw new Error(deprecate__getMessage(deprecated, correct, true));
      }
    }
  }

  function deprecate__getMessage(deprecated, correct, isError) {
    return "options." + deprecated + " has been deprecated in favour of options." + correct + "." + (isError ? " You cannot specify both options, please use options." + correct + "." : "");
  }


  function deprecate__deprecateEventDefinitions(options) {
    deprecate__deprecate(options, "eventDefinitions", "events");
  }

  function deprecate__deprecateAdaptors(options) {
    // Using extend with Component instead of options,
    // like Human.extend( Spider ) means adaptors as a registry
    // gets copied to options. So we have to check if actually an array
    if (is__isArray(options.adaptors)) {
      deprecate__deprecate(options, "adaptors", "adapt");
    }
  }

  function deprecate__deprecateOptions(options) {
    deprecate__deprecate(options, "beforeInit", "onconstruct");
    deprecate__deprecate(options, "init", "onrender");
    deprecate__deprecate(options, "complete", "oncomplete");
    deprecate__deprecateEventDefinitions(options);
    deprecate__deprecateAdaptors(options);
  };
  var deprecate__default = deprecate__deprecateOptions;
  //# sourceMappingURL=01-_6to5-deprecate.js.map

  var config__custom, config__options, config__config, config__blacklisted;

  config__custom = {
    data: data__default,
    template: template__default,
    css: css__default
  };

  config__options = Object.keys(defaults__default).filter(function (key) {
    return !registries__default[key] && !config__custom[key] && !parseOptions__default[key];
  });

  // this defines the order:
  config__config = [].concat(config__custom.data, parseOptions__default, config__options, registries__default, config__custom.template, config__custom.css);

  for (var config__key in config__custom) {
    config__config[config__key] = config__custom[config__key];
  }

  // for iteration
  config__config.keys = Object.keys(defaults__default).concat(registries__default.map(function (r) {
    return r.name;
  })).concat(["css"]);

  // blacklisted key's that we don't double extend
  config__blacklisted = config__config.keys.reduce(function (list, key) {
    return (list[key] = true, list);
  }, {});

  config__config.parseOptions = parseOptions__default;
  config__config.registries = registries__default;

  function config__customConfig(method, key, Parent, instance, options) {
    config__custom[key][method](Parent, instance, options);
  }

  config__config.extend = function (Parent, proto, options) {
    config__configure("extend", Parent, proto, options);
  };

  config__config.init = function (Parent, ractive, options) {
    config__configure("init", Parent, ractive, options);
  };

  function config__isStandardDefaultKey(key) {
    return (key in defaults__default && !(key in config__config.parseOptions) && !(key in config__custom));
  }

  function config__configure(method, Parent, instance, options) {
    deprecate__default(options);

    config__customConfig(method, "data", Parent, instance, options);

    config__config.parseOptions.forEach(function (key) {
      if (key in options) {
        instance[key] = options[key];
      }
    });

    for (var key in options) {
      if (config__isStandardDefaultKey(key)) {
        var value = options[key];
        instance[key] = (typeof value === "function") ? wrapPrototype__default(Parent.prototype, key, value) : value;
      }
    }

    config__config.registries.forEach(function (registry) {
      registry[method](Parent, instance, options);
    });

    config__customConfig(method, "template", Parent, instance, options);
    config__customConfig(method, "css", Parent, instance, options);

    config__extendOtherMethods(Parent.prototype, instance, options);
  }

  function config__extendOtherMethods(parent, instance, options) {
    for (var key in options) {
      if (!(key in config__blacklisted) && options.hasOwnProperty(key)) {
        var member = options[key];

        // if this is a method that overwrites a method, wrap it:
        if (typeof member === "function") {
          member = wrapPrototype__default(parent, key, member);
        }

        instance[key] = member;
      }
    }
  }

  config__config.reset = function (ractive) {
    return config__config.filter(function (c) {
      return c.reset && c.reset(ractive);
    }).map(function (c) {
      return c.name;
    });
  };

  config__config.getConstructTarget = function (ractive, options) {
    if (options.onconstruct) {
      // pretend this object literal is the ractive instance
      return {
        onconstruct: wrapPrototype__default(ractive, "onconstruct", options.onconstruct).bind(ractive),
        fire: ractive.fire.bind(ractive)
      };
    } else {
      return ractive;
    }
  };

  var config__default = config__config;
  //# sourceMappingURL=01-_6to5-config.js.map

  var interpolate__interpolate = function (from, to, ractive, type) {
    if (from === to) {
      return interpolate__snap(to);
    }

    if (type) {
      var interpol = config__default.registries.interpolators.find(ractive, type);
      if (interpol) {
        return interpol(from, to) || interpolate__snap(to);
      }

      warn__default("Missing \"" + type + "\" interpolator. You may need to download a plugin from [TODO]");
    }

    return interpolators__default.number(from, to) || interpolators__default.array(from, to) || interpolators__default.object(from, to) || interpolate__snap(to);
  };

  var interpolate__default = interpolate__interpolate;

  function interpolate__snap(to) {
    return function () {
      return to;
    };
  }
  //# sourceMappingURL=01-_6to5-interpolate.js.map

  var interpolators__interpolators = {
    number: function (from, to) {
      var delta;

      if (!is__isNumeric(from) || !is__isNumeric(to)) {
        return null;
      }

      from = +from;
      to = +to;

      delta = to - from;

      if (!delta) {
        return function () {
          return from;
        };
      }

      return function (t) {
        return from + (t * delta);
      };
    },

    array: function (from, to) {
      var intermediate, interpolators, len, i;

      if (!is__isArray(from) || !is__isArray(to)) {
        return null;
      }

      intermediate = [];
      interpolators = [];

      i = len = Math.min(from.length, to.length);
      while (i--) {
        interpolators[i] = interpolate__default(from[i], to[i]);
      }

      // surplus values - don't interpolate, but don't exclude them either
      for (i = len; i < from.length; i += 1) {
        intermediate[i] = from[i];
      }

      for (i = len; i < to.length; i += 1) {
        intermediate[i] = to[i];
      }

      return function (t) {
        var i = len;

        while (i--) {
          intermediate[i] = interpolators[i](t);
        }

        return intermediate;
      };
    },

    object: function (from, to) {
      var properties, len, interpolators, intermediate, prop;

      if (!is__isObject(from) || !is__isObject(to)) {
        return null;
      }

      properties = [];
      intermediate = {};
      interpolators = {};

      for (prop in from) {
        if (object__hasOwn.call(from, prop)) {
          if (object__hasOwn.call(to, prop)) {
            properties.push(prop);
            interpolators[prop] = interpolate__default(from[prop], to[prop]);
          } else {
            intermediate[prop] = from[prop];
          }
        }
      }

      for (prop in to) {
        if (object__hasOwn.call(to, prop) && !object__hasOwn.call(from, prop)) {
          intermediate[prop] = to[prop];
        }
      }

      len = properties.length;

      return function (t) {
        var i = len, prop;

        while (i--) {
          prop = properties[i];

          intermediate[prop] = interpolators[prop](t);
        }

        return intermediate;
      };
    }
  };

  var interpolators__default = interpolators__interpolators;
  //# sourceMappingURL=01-_6to5-interpolators.js.map

  /* global console */
  var log__log = {
    warn: function (options, passthru) {
      if (!options.debug && !passthru) {
        return;
      }
      this.warnAlways(options);
    },
    warnAlways: function (options) {
      this.logger(log__getMessage(options), options.allowDuplicates);
    },
    error: function (options) {
      this.errorOnly(options);

      if (!options.debug) {
        this.warn(options, true);
      }
    },
    errorOnly: function (options) {
      if (options.debug) {
        this.critical(options);
      }
    },
    critical: function (options) {
      var err = options.err || new Error(log__getMessage(options));
      this.thrower(err);
    },
    logger: warn__default,
    thrower: function (err) {
      throw err;
    },
    consoleError: function (options) {
      if (environment__hasConsole) {
        console.error(options.err);
      } else {
        this.thrower(options.err);
      }
    }
  };

  function log__getMessage(options) {
    var message = errors__default[options.message] || options.message || "";
    return log__interpolate(message, options.args);
  }

  // simple interpolation. probably quicker (and better) out there,
  // but log is not in golden path of execution, only exceptions
  function log__interpolate(message, args) {
    return message.replace(/{([^{}]*)}/g, function (a, b) {
      return args[b];
    });
  }

  var log__default = log__log;
  //# sourceMappingURL=01-_6to5-log.js.map

  var Hook__deprecations = {
    construct: {
      deprecated: "beforeInit",
      replacement: "onconstruct"
    },
    render: {
      deprecated: "init",
      message: "The \"init\" method has been deprecated " + "and will likely be removed in a future release. " + "You can either use the \"oninit\" method which will fire " + "only once prior to, and regardless of, any eventual ractive " + "instance being rendered, or if you need to access the " + "rendered DOM, use \"onrender\" instead. " + "See http://docs.ractivejs.org/latest/migrating for more information."
    },
    complete: {
      deprecated: "complete",
      replacement: "oncomplete"
    }
  };

  function Hook__Hook(event) {
    this.event = event;
    this.method = "on" + event;
    this.deprecate = Hook__deprecations[event];
  }

  Hook__Hook.prototype.fire = function (ractive, arg) {
    function call(method) {
      if (ractive[method]) {
        arg ? ractive[method](arg) : ractive[method]();
        return true;
      }
    }

    call(this.method);

    if (!ractive[this.method] && this.deprecate && call(this.deprecate.deprecated)) {
      log__default.warnAlways({
        debug: ractive.debug,
        message: this.deprecate.message || "methodDeprecated",
        args: this.deprecate
      });
    }

    arg ? ractive.fire(this.event, arg) : ractive.fire(this.event);
  };

  var Hook__default = Hook__Hook;
  //# sourceMappingURL=01-_6to5-Hook.js.map

  function array__arrayContains(array, value) {
    for (var i = 0, c = array.length; i < c; i++) {
      if (array[i] == value) {
        return true;
      }
    }

    return false;
  }

  function array__arrayContentsMatch(a, b) {
    var i;

    if (!is__isArray(a) || !is__isArray(b)) {
      return false;
    }

    if (a.length !== b.length) {
      return false;
    }

    i = a.length;
    while (i--) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  function array__removeFromArray(array, member) {
    var index = array.indexOf(member);

    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  function array__toArray(arrayLike) {
    var array = [], i = arrayLike.length;
    while (i--) {
      array[i] = arrayLike[i];
    }

    return array;
  }
  //# sourceMappingURL=01-_6to5-array.js.map

  var Promise___Promise, Promise__PENDING = {}, Promise__FULFILLED = {}, Promise__REJECTED = {};

  if (typeof Promise === "function") {
    // use native Promise
    Promise___Promise = Promise;
  } else {
    Promise___Promise = function (callback) {
      var fulfilledHandlers = [], rejectedHandlers = [], state = Promise__PENDING, result, dispatchHandlers, makeResolver, fulfil, reject, promise;

      makeResolver = function (newState) {
        return function (value) {
          if (state !== Promise__PENDING) {
            return;
          }

          result = value;
          state = newState;

          dispatchHandlers = Promise__makeDispatcher((state === Promise__FULFILLED ? fulfilledHandlers : rejectedHandlers), result);

          // dispatch onFulfilled and onRejected handlers asynchronously
          Promise__wait(dispatchHandlers);
        };
      };

      fulfil = makeResolver(Promise__FULFILLED);
      reject = makeResolver(Promise__REJECTED);

      try {
        callback(fulfil, reject);
      } catch (err) {
        reject(err);
      }

      promise = {
        // `then()` returns a Promise - 2.2.7
        then: function (onFulfilled, onRejected) {
          var promise2 = new Promise___Promise(function (fulfil, reject) {
            var processResolutionHandler = function (handler, handlers, forward) {
              // 2.2.1.1
              if (typeof handler === "function") {
                handlers.push(function (p1result) {
                  var x;

                  try {
                    x = handler(p1result);
                    Promise__resolve(promise2, x, fulfil, reject);
                  } catch (err) {
                    reject(err);
                  }
                });
              } else {
                // Forward the result of promise1 to promise2, if resolution handlers
                // are not given
                handlers.push(forward);
              }
            };

            // 2.2
            processResolutionHandler(onFulfilled, fulfilledHandlers, fulfil);
            processResolutionHandler(onRejected, rejectedHandlers, reject);

            if (state !== Promise__PENDING) {
              // If the promise has resolved already, dispatch the appropriate handlers asynchronously
              Promise__wait(dispatchHandlers);
            }
          });

          return promise2;
        }
      };

      promise["catch"] = function (onRejected) {
        return this.then(null, onRejected);
      };

      return promise;
    };

    Promise___Promise.all = function (promises) {
      return new Promise___Promise(function (fulfil, reject) {
        var result = [], pending, i, processPromise;

        if (!promises.length) {
          fulfil(result);
          return;
        }

        processPromise = function (i) {
          promises[i].then(function (value) {
            result[i] = value;

            if (! --pending) {
              fulfil(result);
            }
          }, reject);
        };

        pending = i = promises.length;
        while (i--) {
          processPromise(i);
        }
      });
    };

    Promise___Promise.resolve = function (value) {
      return new Promise___Promise(function (fulfil) {
        fulfil(value);
      });
    };

    Promise___Promise.reject = function (reason) {
      return new Promise___Promise(function (fulfil, reject) {
        reject(reason);
      });
    };
  }

  var Promise__default = Promise___Promise;

  // TODO use MutationObservers or something to simulate setImmediate
  function Promise__wait(callback) {
    setTimeout(callback, 0);
  }

  function Promise__makeDispatcher(handlers, result) {
    return function () {
      var handler;

      while (handler = handlers.shift()) {
        handler(result);
      }
    };
  }

  function Promise__resolve(promise, x, fulfil, reject) {
    // Promise Resolution Procedure
    var then;

    // 2.3.1
    if (x === promise) {
      throw new TypeError("A promise's fulfillment handler cannot return the same promise");
    }

    // 2.3.2
    if (x instanceof Promise___Promise) {
      x.then(fulfil, reject);
    }

    // 2.3.3
    else if (x && (typeof x === "object" || typeof x === "function")) {
      try {
        then = x.then; // 2.3.3.1
      } catch (e) {
        reject(e); // 2.3.3.2
        return;
      }

      // 2.3.3.3
      if (typeof then === "function") {
        var called, resolvePromise, rejectPromise;

        resolvePromise = function (y) {
          if (called) {
            return;
          }
          called = true;
          Promise__resolve(promise, y, fulfil, reject);
        };

        rejectPromise = function (r) {
          if (called) {
            return;
          }
          called = true;
          reject(r);
        };

        try {
          then.call(x, resolvePromise, rejectPromise);
        } catch (e) {
          if (!called) {
            // 2.3.3.3.4.1
            reject(e); // 2.3.3.3.4.2
            called = true;
            return;
          }
        }
      } else {
        fulfil(x);
      }
    } else {
      fulfil(x);
    }
  }
  //# sourceMappingURL=01-_6to5-Promise.js.map

  var keypaths__refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

  function keypaths__assignNewKeypath(target, property, oldKeypath, newKeypath) {
    var existingKeypath = target[property];

    if (!existingKeypath || keypaths__equalsOrStartsWith(existingKeypath, newKeypath) || !keypaths__equalsOrStartsWith(existingKeypath, oldKeypath)) {
      return;
    }

    target[property] = keypaths__getNewKeypath(existingKeypath, oldKeypath, newKeypath);
    return true;
  }

  function keypaths__decodeKeypath(keypath) {
    var value = keypath.slice(2);

    if (keypath[1] === "i") {
      return is__isNumeric(value) ? +value : value;
    } else {
      return value;
    }
  }

  function keypaths__equalsOrStartsWith(target, keypath) {
    return target === keypath || keypaths__startsWithKeypath(target, keypath);
  }

  function keypaths__getMatchingKeypaths(ractive, pattern) {
    var keys, key, matchingKeypaths;

    keys = pattern.split(".");
    matchingKeypaths = [""];

    while (key = keys.shift()) {
      if (key === "*") {
        // expand to find all valid child keypaths
        matchingKeypaths = matchingKeypaths.reduce(expand, []);
      } else {
        if (matchingKeypaths[0] === "") {
          // first key
          matchingKeypaths[0] = key;
        } else {
          matchingKeypaths = matchingKeypaths.map(keypaths__concatenate(key));
        }
      }
    }

    return matchingKeypaths;

    function expand(matchingKeypaths, keypath) {
      var value, key, childKeypath;

      value = (ractive.viewmodel.wrapped[keypath] ? ractive.viewmodel.wrapped[keypath].get() : ractive.get(keypath));

      for (key in value) {
        if (value.hasOwnProperty(key) && (key !== "_ractive" || !is__isArray(value))) {
          // for benefit of IE8
          childKeypath = keypath ? keypath + "." + key : key;
          matchingKeypaths.push(childKeypath);
        }
      }

      return matchingKeypaths;
    }
  }

  function keypaths__concatenate(key) {
    return function (keypath) {
      return keypath ? keypath + "." + key : key;
    };
  }

  function keypaths__getNewKeypath(targetKeypath, oldKeypath, newKeypath) {
    // exact match
    if (targetKeypath === oldKeypath) {
      return newKeypath !== undefined ? newKeypath : null;
    }

    // partial match based on leading keypath segments
    if (keypaths__startsWithKeypath(targetKeypath, oldKeypath)) {
      return newKeypath === null ? newKeypath : targetKeypath.replace(oldKeypath + ".", newKeypath + ".");
    }
  }

  function keypaths__normalise(ref) {
    return ref ? ref.replace(keypaths__refPattern, ".$1") : "";
  }

  function keypaths__startsWithKeypath(target, keypath) {
    return target && keypath && target.substr(0, keypath.length + 1) === keypath + ".";
  }
  //# sourceMappingURL=01-_6to5-keypaths.js.map

  var getInnerContext__default = function (fragment) {
    do {
      if (fragment.context !== undefined) {
        return fragment.context;
      }
    } while (fragment = fragment.parent);

    return "";
  };
  //# sourceMappingURL=01-_6to5-getInnerContext.js.map

  function resolveRef__resolveRef(ractive, ref, fragment) {
    ref = keypaths__normalise(ref);

    // If a reference begins '~/', it's a top-level reference
    if (ref.substr(0, 2) === "~/") {
      ref = ref.substring(2);
      resolveRef__createMappingIfNecessary(ractive, resolveRef__getKey(ref), fragment);
      return ref;
    }

    // If a reference begins with '.', it's either a restricted reference or
    // an ancestor reference...
    if (ref[0] === ".") {
      ref = resolveRef__resolveAncestorRef(getInnerContext__default(fragment), ref);

      if (ref) {
        resolveRef__createMappingIfNecessary(ractive, resolveRef__getKey(ref), fragment);
      }

      return ref;
    }

    // ...otherwise we need to figure out the keypath based on context
    return resolveRef__resolveAmbiguousReference(ractive, ref, fragment);
  };
  var resolveRef__default = resolveRef__resolveRef;

  function resolveRef__resolveAncestorRef(baseContext, ref) {
    var contextKeys;

    // {{.}} means 'current context'
    if (ref === ".") return baseContext;

    contextKeys = baseContext ? baseContext.split(".") : [];

    // ancestor references (starting "../") go up the tree
    if (ref.substr(0, 3) === "../") {
      while (ref.substr(0, 3) === "../") {
        if (!contextKeys.length) {
          throw new Error("Could not resolve reference - too many \"../\" prefixes");
        }

        contextKeys.pop();
        ref = ref.substring(3);
      }

      contextKeys.push(ref);
      return contextKeys.join(".");
    }

    // not an ancestor reference - must be a restricted reference (prepended with "." or "./")
    if (!baseContext) {
      return ref.replace(/^\.\/?/, "");
    }

    return baseContext + ref.replace(/^\.\//, ".");
  }

  function resolveRef__resolveAmbiguousReference(ractive, ref, fragment, isParentLookup) {
    var context, key, parentValue, hasContextChain, parentKeypath;

    key = resolveRef__getKey(ref);

    while (fragment) {
      context = fragment.context;
      fragment = fragment.parent;

      if (!context) {
        continue;
      }

      hasContextChain = true;
      parentValue = ractive.viewmodel.get(context);

      if (parentValue && (typeof parentValue === "object" || typeof parentValue === "function") && key in parentValue) {
        return context + "." + ref;
      }
    }

    // Root/computed/mapped property?
    if (resolveRef__isRootProperty(ractive, key)) {
      return ref;
    }

    // If this is an inline component, and it's not isolated, we
    // can try going up the scope chain
    if (ractive.parent && !ractive.isolated) {
      hasContextChain = true;
      fragment = ractive.component.parentFragment;

      if (parentKeypath = resolveRef__resolveAmbiguousReference(ractive.parent, key, fragment, true)) {
        // We need to create an inter-component binding
        ractive.viewmodel.map(key, {
          origin: ractive.parent.viewmodel,
          keypath: parentKeypath
        });

        return ref;
      }
    }

    // If there's no context chain, and the instance is either a) isolated or
    // b) an orphan, then we know that the keypath is identical to the reference
    if (!isParentLookup && !hasContextChain) {
      // the data object needs to have a property by this name,
      // to prevent future failed lookups
      ractive.viewmodel.set(ref, undefined);
      return ref;
    }
  }

  function resolveRef__createMappingIfNecessary(ractive, key) {
    var parentKeypath;

    if (!ractive.parent || ractive.isolated || resolveRef__isRootProperty(ractive, key)) {
      return;
    }

    if (parentKeypath = resolveRef__resolveAmbiguousReference(ractive.parent, key, ractive.component.parentFragment, true)) {
      ractive.viewmodel.map(key, {
        origin: ractive.parent.viewmodel,
        keypath: parentKeypath
      });
    }
  }

  function resolveRef__isRootProperty(ractive, key) {
    return key in ractive.data || key in ractive.viewmodel.computations || key in ractive.viewmodel.mappings;
  }

  function resolveRef__getKey(ref) {
    var index = ref.indexOf(".");
    return ~index ? ref.slice(0, index) : ref;
  }
  //# sourceMappingURL=01-_6to5-resolveRef.js.map

  function methodCallers__teardown(x) {
    x.teardown();
  }
  function methodCallers__unbind(x) {
    x.unbind();
  }
  function methodCallers__unrender(x) {
    x.unrender();
  }
  //# sourceMappingURL=01-_6to5-methodCallers.js.map

  var TransitionManager__TransitionManager = function (callback, parent) {
    this.callback = callback;
    this.parent = parent;

    this.intros = [];
    this.outros = [];

    this.children = [];
    this.totalChildren = this.outroChildren = 0;

    this.detachQueue = [];
    this.decoratorQueue = [];
    this.outrosComplete = false;

    if (parent) {
      parent.addChild(this);
    }
  };

  TransitionManager__TransitionManager.prototype = {
    addChild: function (child) {
      this.children.push(child);

      this.totalChildren += 1;
      this.outroChildren += 1;
    },

    decrementOutros: function () {
      this.outroChildren -= 1;
      TransitionManager__check(this);
    },

    decrementTotal: function () {
      this.totalChildren -= 1;
      TransitionManager__check(this);
    },

    add: function (transition) {
      var list = transition.isIntro ? this.intros : this.outros;
      list.push(transition);
    },

    addDecorator: function (decorator) {
      this.decoratorQueue.push(decorator);
    },

    remove: function (transition) {
      var list = transition.isIntro ? this.intros : this.outros;
      array__removeFromArray(list, transition);
      TransitionManager__check(this);
    },

    init: function () {
      this.ready = true;
      TransitionManager__check(this);
    },

    detachNodes: function () {
      this.decoratorQueue.forEach(methodCallers__teardown);
      this.detachQueue.forEach(TransitionManager__detach);
      this.children.forEach(TransitionManager__detachNodes);
    }
  };

  function TransitionManager__detach(element) {
    element.detach();
  }

  function TransitionManager__detachNodes(tm) {
    tm.detachNodes();
  }

  function TransitionManager__check(tm) {
    if (!tm.ready || tm.outros.length || tm.outroChildren) return;

    // If all outros are complete, and we haven't already done this,
    // we notify the parent if there is one, otherwise
    // start detaching nodes
    if (!tm.outrosComplete) {
      if (tm.parent) {
        tm.parent.decrementOutros(tm);
      } else {
        tm.detachNodes();
      }

      tm.outrosComplete = true;
    }

    // Once everything is done, we can notify parent transition
    // manager and call the callback
    if (!tm.intros.length && !tm.totalChildren) {
      if (typeof tm.callback === "function") {
        tm.callback();
      }

      if (tm.parent) {
        tm.parent.decrementTotal();
      }
    }
  }

  var TransitionManager__default = TransitionManager__TransitionManager;
  //# sourceMappingURL=01-_6to5-TransitionManager.js.map

  var runloop__batch, runloop__runloop, runloop__unresolved = [], runloop__changeHook = new Hook__default("change");

  runloop__runloop = {
    start: function (instance, returnPromise) {
      var promise, fulfilPromise;

      if (returnPromise) {
        promise = new Promise__default(function (f) {
          return (fulfilPromise = f);
        });
      }

      runloop__batch = {
        previousBatch: runloop__batch,
        transitionManager: new TransitionManager__default(fulfilPromise, runloop__batch && runloop__batch.transitionManager),
        views: [],
        tasks: [],
        viewmodels: [],
        instance: instance
      };

      if (instance) {
        runloop__batch.viewmodels.push(instance.viewmodel);
      }

      return promise;
    },

    end: function () {
      runloop__flushChanges();

      runloop__batch.transitionManager.init();
      if (!runloop__batch.previousBatch && !!runloop__batch.instance) runloop__batch.instance.viewmodel.changes = [];
      runloop__batch = runloop__batch.previousBatch;
    },

    addViewmodel: function (viewmodel) {
      if (runloop__batch) {
        if (runloop__batch.viewmodels.indexOf(viewmodel) === -1) {
          runloop__batch.viewmodels.push(viewmodel);
          return true;
        } else {
          return false;
        }
      } else {
        viewmodel.applyChanges();
        return false;
      }
    },

    registerTransition: function (transition) {
      transition._manager = runloop__batch.transitionManager;
      runloop__batch.transitionManager.add(transition);
    },

    registerDecorator: function (decorator) {
      runloop__batch.transitionManager.addDecorator(decorator);
    },

    addView: function (view) {
      runloop__batch.views.push(view);
    },

    addUnresolved: function (thing) {
      runloop__unresolved.push(thing);
    },

    removeUnresolved: function (thing) {
      array__removeFromArray(runloop__unresolved, thing);
    },

    // synchronise node detachments with transition ends
    detachWhenReady: function (thing) {
      runloop__batch.transitionManager.detachQueue.push(thing);
    },

    scheduleTask: function (task, postRender) {
      var _batch;

      if (!runloop__batch) {
        task();
      } else {
        _batch = runloop__batch;
        while (postRender && _batch.previousBatch) {
          // this can't happen until the DOM has been fully updated
          // otherwise in some situations (with components inside elements)
          // transitions and decorators will initialise prematurely
          _batch = _batch.previousBatch;
        }

        _batch.tasks.push(task);
      }
    }
  };

  var runloop__default = runloop__runloop;

  function runloop__flushChanges() {
    var i, thing, changeHash;

    while (runloop__batch.viewmodels.length) {
      thing = runloop__batch.viewmodels.pop();
      changeHash = thing.applyChanges();

      if (changeHash) {
        runloop__changeHook.fire(thing.ractive, changeHash);
      }
    }

    runloop__attemptKeypathResolution();

    // Now that changes have been fully propagated, we can update the DOM
    // and complete other tasks
    for (i = 0; i < runloop__batch.views.length; i += 1) {
      runloop__batch.views[i].update();
    }
    runloop__batch.views.length = 0;

    for (i = 0; i < runloop__batch.tasks.length; i += 1) {
      runloop__batch.tasks[i]();
    }
    runloop__batch.tasks.length = 0;

    // If updating the view caused some model blowback - e.g. a triple
    // containing <option> elements caused the binding on the <select>
    // to update - then we start over
    if (runloop__batch.viewmodels.length) return runloop__flushChanges();
  }

  function runloop__attemptKeypathResolution() {
    var i, item, keypath, resolved;

    i = runloop__unresolved.length;

    // see if we can resolve any unresolved references
    while (i--) {
      item = runloop__unresolved[i];

      if (item.keypath) {
        // it resolved some other way. TODO how? two-way binding? Seems
        // weird that we'd still end up here
        runloop__unresolved.splice(i, 1);
      }

      if (keypath = resolveRef__default(item.root, item.ref, item.parentFragment)) {
        (resolved || (resolved = [])).push({
          item: item,
          keypath: keypath
        });

        runloop__unresolved.splice(i, 1);
      }
    }

    if (resolved) {
      resolved.forEach(runloop__resolve);
    }
  }

  function runloop__resolve(resolved) {
    resolved.item.resolve(resolved.keypath);
  }
  //# sourceMappingURL=01-_6to5-runloop.js.map

  var createBranch__numeric = /^\s*[0-9]+\s*$/;

  var createBranch__default = function (key) {
    return createBranch__numeric.test(key) ? [] : {};
  };
  //# sourceMappingURL=01-_6to5-createBranch.js.map

  var magicAdaptor__magicAdaptor, magicAdaptor__MagicWrapper;

  try {
    Object.defineProperty({}, "test", { value: 0 });

    magicAdaptor__magicAdaptor = {
      filter: function (object, keypath, ractive) {
        var keys, key, parentKeypath, parentWrapper, parentValue;

        if (!keypath) {
          return false;
        }

        keys = keypath.split(".");
        key = keys.pop();
        parentKeypath = keys.join(".");

        // If the parent value is a wrapper, other than a magic wrapper,
        // we shouldn't wrap this property
        if ((parentWrapper = ractive.viewmodel.wrapped[parentKeypath]) && !parentWrapper.magic) {
          return false;
        }

        parentValue = ractive.get(parentKeypath);

        // if parentValue is an array that doesn't include this member,
        // we should return false otherwise lengths will get messed up
        if (is__isArray(parentValue) && /^[0-9]+$/.test(key)) {
          return false;
        }

        return (parentValue && (typeof parentValue === "object" || typeof parentValue === "function"));
      },
      wrap: function (ractive, property, keypath) {
        return new magicAdaptor__MagicWrapper(ractive, property, keypath);
      }
    };

    magicAdaptor__MagicWrapper = function (ractive, value, keypath) {
      var keys, objKeypath, template, siblings;

      this.magic = true;

      this.ractive = ractive;
      this.keypath = keypath;
      this.value = value;

      keys = keypath.split(".");

      this.prop = keys.pop();

      objKeypath = keys.join(".");
      this.obj = objKeypath ? ractive.get(objKeypath) : ractive.data;

      template = this.originalDescriptor = Object.getOwnPropertyDescriptor(this.obj, this.prop);

      // Has this property already been wrapped?
      if (template && template.set && (siblings = template.set._ractiveWrappers)) {
        // Yes. Register this wrapper to this property, if it hasn't been already
        if (siblings.indexOf(this) === -1) {
          siblings.push(this);
        }

        return; // already wrapped
      }

      // No, it hasn't been wrapped
      magicAdaptor__createAccessors(this, value, template);
    };

    magicAdaptor__MagicWrapper.prototype = {
      get: function () {
        return this.value;
      },
      reset: function (value) {
        if (this.updating) {
          return;
        }

        this.updating = true;
        this.obj[this.prop] = value; // trigger set() accessor
        runloop__default.addViewmodel(this.ractive.viewmodel);
        this.ractive.viewmodel.mark(this.keypath, { dontTeardownWrapper: true });
        this.updating = false;
        return true;
      },
      set: function (key, value) {
        if (this.updating) {
          return;
        }

        if (!this.obj[this.prop]) {
          this.updating = true;
          this.obj[this.prop] = createBranch__default(key);
          this.updating = false;
        }

        this.obj[this.prop][key] = value;
      },
      teardown: function () {
        var template, set, value, wrappers, index;

        // If this method was called because the cache was being cleared as a
        // result of a set()/update() call made by this wrapper, we return false
        // so that it doesn't get torn down
        if (this.updating) {
          return false;
        }

        template = Object.getOwnPropertyDescriptor(this.obj, this.prop);
        set = template && template.set;

        if (!set) {
          // most likely, this was an array member that was spliced out
          return;
        }

        wrappers = set._ractiveWrappers;

        index = wrappers.indexOf(this);
        if (index !== -1) {
          wrappers.splice(index, 1);
        }

        // Last one out, turn off the lights
        if (!wrappers.length) {
          value = this.obj[this.prop];

          Object.defineProperty(this.obj, this.prop, this.originalDescriptor || {
            writable: true,
            enumerable: true,
            configurable: true
          });

          this.obj[this.prop] = value;
        }
      }
    };
  } catch (err) {
    magicAdaptor__magicAdaptor = false; // no magic in this browser
  }

  var magicAdaptor__default = magicAdaptor__magicAdaptor;

  function magicAdaptor__createAccessors(originalWrapper, value, template) {
    var object, property, oldGet, oldSet, get, set;

    object = originalWrapper.obj;
    property = originalWrapper.prop;

    // Is this template configurable?
    if (template && !template.configurable) {
      // Special case - array length
      if (property === "length") {
        return;
      }

      throw new Error("Cannot use magic mode with property \"" + property + "\" - object is not configurable");
    }


    // Time to wrap this property
    if (template) {
      oldGet = template.get;
      oldSet = template.set;
    }

    get = oldGet || function () {
      return value;
    };

    set = function (v) {
      if (oldSet) {
        oldSet(v);
      }

      value = oldGet ? oldGet() : v;
      set._ractiveWrappers.forEach(updateWrapper);
    };

    function updateWrapper(wrapper) {
      var keypath, ractive;

      wrapper.value = value;

      if (wrapper.updating) {
        return;
      }

      ractive = wrapper.ractive;
      keypath = wrapper.keypath;

      wrapper.updating = true;
      runloop__default.start(ractive);

      ractive.viewmodel.mark(keypath);

      runloop__default.end();
      wrapper.updating = false;
    }

    // Create an array of wrappers, in case other keypaths/ractives depend on this property.
    // Handily, we can store them as a property of the set function. Yay JavaScript.
    set._ractiveWrappers = [originalWrapper];
    Object.defineProperty(object, property, { get: get, set: set, enumerable: true, configurable: true });
  }
  //# sourceMappingURL=01-_6to5-magicAdaptor.js.map

	var magic__default = !!magicAdaptor__default;
	//# sourceMappingURL=01-_6to5-magic.js.map

  function add__add(root, keypath, d) {
    var value;

    if (typeof keypath !== "string" || !is__isNumeric(d)) {
      throw new Error("Bad arguments");
    }

    value = +root.get(keypath) || 0;

    if (!is__isNumeric(value)) {
      throw new Error("Cannot add to a non-numeric value");
    }

    return root.set(keypath, value + d);
  };
  var add__default = add__add;
  //# sourceMappingURL=01-_6to5-add.js.map

  function prototype_add__Ractive$add(keypath, d) {
    return add__default(this, keypath, (d === undefined ? 1 : +d));
  };
  var prototype_add__default = prototype_add__Ractive$add;
  //# sourceMappingURL=01-_6to5-add.js.map

  var rAF__requestAnimationFrame;

  // If window doesn't exist, we don't need requestAnimationFrame
  if (typeof window === "undefined") {
    rAF__requestAnimationFrame = null;
  } else {
    // https://gist.github.com/paulirish/1579671
    (function (vendors, lastTime, window) {
      var x, setTimeout;

      if (window.requestAnimationFrame) {
        return;
      }

      for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
      }

      if (!window.requestAnimationFrame) {
        setTimeout = window.setTimeout;

        window.requestAnimationFrame = function (callback) {
          var currTime, timeToCall, id;

          currTime = Date.now();
          timeToCall = Math.max(0, 16 - (currTime - lastTime));
          id = setTimeout(function () {
            callback(currTime + timeToCall);
          }, timeToCall);

          lastTime = currTime + timeToCall;
          return id;
        };
      }
    }(vendors__default, 0, window));

    rAF__requestAnimationFrame = window.requestAnimationFrame;
  }

  var rAF__default = rAF__requestAnimationFrame;
  //# sourceMappingURL=01-_6to5-requestAnimationFrame.js.map

  var getTime__getTime;

  if (typeof window !== "undefined" && window.performance && typeof window.performance.now === "function") {
    getTime__getTime = function () {
      return window.performance.now();
    };
  } else {
    getTime__getTime = function () {
      return Date.now();
    };
  }

  var getTime__default = getTime__getTime;
  //# sourceMappingURL=01-_6to5-getTime.js.map

  var animations__queue = [];

  var animations__animations = {
    tick: function () {
      var i, animation, now;

      now = getTime__default();

      runloop__default.start();

      for (i = 0; i < animations__queue.length; i += 1) {
        animation = animations__queue[i];

        if (!animation.tick(now)) {
          // animation is complete, remove it from the stack, and decrement i so we don't miss one
          animations__queue.splice(i--, 1);
        }
      }

      runloop__default.end();

      if (animations__queue.length) {
        rAF__default(animations__animations.tick);
      } else {
        animations__animations.running = false;
      }
    },

    add: function (animation) {
      animations__queue.push(animation);

      if (!animations__animations.running) {
        animations__animations.running = true;
        rAF__default(animations__animations.tick);
      }
    },

    // TODO optimise this
    abort: function (keypath, root) {
      var i = animations__queue.length, animation;

      while (i--) {
        animation = animations__queue[i];

        if (animation.root === root && animation.keypath === keypath) {
          animation.stop();
        }
      }
    }
  };

  var animations__default = animations__animations;
  //# sourceMappingURL=01-_6to5-animations.js.map

  var Animation__Animation = function (options) {
    var key;

    this.startTime = Date.now();

    // from and to
    for (key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }

    this.interpolator = interpolate__default(this.from, this.to, this.root, this.interpolator);
    this.running = true;

    this.tick();
  };

  Animation__Animation.prototype = {
    tick: function () {
      var elapsed, t, value, timeNow, index, keypath;

      keypath = this.keypath;

      if (this.running) {
        timeNow = Date.now();
        elapsed = timeNow - this.startTime;

        if (elapsed >= this.duration) {
          if (keypath !== null) {
            runloop__default.start(this.root);
            this.root.viewmodel.set(keypath, this.to);
            runloop__default.end();
          }

          if (this.step) {
            this.step(1, this.to);
          }

          this.complete(this.to);

          index = this.root._animations.indexOf(this);

          // TODO investigate why this happens
          if (index === -1) {
            warn__default("Animation was not found");
          }

          this.root._animations.splice(index, 1);

          this.running = false;
          return false; // remove from the stack
        }

        t = this.easing ? this.easing(elapsed / this.duration) : (elapsed / this.duration);

        if (keypath !== null) {
          value = this.interpolator(t);
          runloop__default.start(this.root);
          this.root.viewmodel.set(keypath, value);
          runloop__default.end();
        }

        if (this.step) {
          this.step(t, value);
        }

        return true; // keep in the stack
      }

      return false; // remove from the stack
    },

    stop: function () {
      var index;

      this.running = false;

      index = this.root._animations.indexOf(this);

      // TODO investigate why this happens
      if (index === -1) {
        warn__default("Animation was not found");
      }

      this.root._animations.splice(index, 1);
    }
  };

  var Animation__default = Animation__Animation;
  //# sourceMappingURL=01-_6to5-Animation.js.map

  var animate__noop = function () {}, animate__noAnimation = {
    stop: animate__noop
  };

  function animate__Ractive$animate(keypath, to, options) {
    var _this = this;


    var promise, fulfilPromise, k, animation, animations, easing, duration, step, complete, makeValueCollector, currentValues, collectValue, dummy, dummyOptions;

    promise = new Promise__default(function (fulfil) {
      fulfilPromise = fulfil;
    });

    // animate multiple keypaths
    if (typeof keypath === "object") {
      options = to || {};
      easing = options.easing;
      duration = options.duration;

      animations = [];

      // we don't want to pass the `step` and `complete` handlers, as they will
      // run for each animation! So instead we'll store the handlers and create
      // our own...
      step = options.step;
      complete = options.complete;

      if (step || complete) {
        currentValues = {};

        options.step = null;
        options.complete = null;

        makeValueCollector = function (keypath) {
          return function (t, value) {
            currentValues[keypath] = value;
          };
        };
      }


      for (k in keypath) {
        if (keypath.hasOwnProperty(k)) {
          if (step || complete) {
            collectValue = makeValueCollector(k);
            options = {
              easing: easing,
              duration: duration
            };

            if (step) {
              options.step = collectValue;
            }
          }

          options.complete = complete ? collectValue : animate__noop;
          animations.push(animate__animate(this, k, keypath[k], options));
        }
      }

      // Create a dummy animation, to facilitate step/complete
      // callbacks, and Promise fulfilment
      dummyOptions = {
        easing: easing,
        duration: duration
      };

      if (step) {
        dummyOptions.step = function (t) {
          step(t, currentValues);
        };
      }

      if (complete) {
        promise.then(function (t) {
          complete(t, currentValues);
        }).then(null, function (err) {
          log__default.consoleError({
            debug: _this.debug,
            err: err
          });
        });
      }

      dummyOptions.complete = fulfilPromise;

      dummy = animate__animate(this, null, null, dummyOptions);
      animations.push(dummy);

      promise.stop = function () {
        var animation;

        while (animation = animations.pop()) {
          animation.stop();
        }

        if (dummy) {
          dummy.stop();
        }
      };

      return promise;
    }

    // animate a single keypath
    options = options || {};

    if (options.complete) {
      promise.then(options.complete).then(null, function (err) {
        log__default.consoleError({
          debug: _this.debug,
          err: err
        });
      });
    }

    options.complete = fulfilPromise;
    animation = animate__animate(this, keypath, to, options);

    promise.stop = function () {
      animation.stop();
    };
    return promise;
  };
  var animate__default = animate__Ractive$animate;

  function animate__animate(root, keypath, to, options) {
    var easing, duration, animation, from;

    if (keypath) {
      keypath = keypaths__normalise(keypath);
    }

    if (keypath !== null) {
      from = root.viewmodel.get(keypath);
    }

    // cancel any existing animation
    // TODO what about upstream/downstream keypaths?
    animations__default.abort(keypath, root);

    // don't bother animating values that stay the same
    if (is__isEqual(from, to)) {
      if (options.complete) {
        options.complete(options.to);
      }

      return animate__noAnimation;
    }

    // easing function
    if (options.easing) {
      if (typeof options.easing === "function") {
        easing = options.easing;
      } else {
        easing = root.easing[options.easing];
      }

      if (typeof easing !== "function") {
        easing = null;
      }
    }

    // duration
    duration = (options.duration === undefined ? 400 : options.duration);

    // TODO store keys, use an internal set method
    animation = new Animation__default({
      keypath: keypath,
      from: from,
      to: to,
      root: root,
      duration: duration,
      easing: easing,
      interpolator: options.interpolator,

      // TODO wrap callbacks if necessary, to use instance as context
      step: options.step,
      complete: options.complete
    });

    animations__default.add(animation);
    root._animations.push(animation);

    return animation;
  }
  //# sourceMappingURL=01-_6to5-animate.js.map

  var prototype_detach__detachHook = new Hook__default("detach");

  function prototype_detach__Ractive$detach() {
    if (this.detached) {
      return this.detached;
    }

    if (this.el) {
      array__removeFromArray(this.el.__ractive_instances__, this);
    }
    this.detached = this.fragment.detach();
    prototype_detach__detachHook.fire(this);
    return this.detached;
  };
  var prototype_detach__default = prototype_detach__Ractive$detach;
  //# sourceMappingURL=01-_6to5-detach.js.map

  function prototype_find__Ractive$find(selector) {
    if (!this.el) {
      return null;
    }

    return this.fragment.find(selector);
  };
  var prototype_find__default = prototype_find__Ractive$find;
  //# sourceMappingURL=01-_6to5-find.js.map

  var test__default = function (item, noDirty) {
    var itemMatches;

    if (this._isComponentQuery) {
      itemMatches = !this.selector || item.name === this.selector;
    } else {
      itemMatches = item.node ? dom__matches(item.node, this.selector) : null;
    }

    if (itemMatches) {
      this.push(item.node || item.instance);

      if (!noDirty) {
        this._makeDirty();
      }

      return true;
    }
  };
  //# sourceMappingURL=01-_6to5-test.js.map

  var cancel__default = function () {
    var liveQueries, selector, index;

    liveQueries = this._root[this._isComponentQuery ? "liveComponentQueries" : "liveQueries"];
    selector = this.selector;

    index = liveQueries.indexOf(selector);

    if (index !== -1) {
      liveQueries.splice(index, 1);
      liveQueries[selector] = null;
    }
  };
  //# sourceMappingURL=01-_6to5-cancel.js.map

  var sortByItemPosition__default = function (a, b) {
    var ancestryA, ancestryB, oldestA, oldestB, mutualAncestor, indexA, indexB, fragments, fragmentA, fragmentB;

    ancestryA = sortByItemPosition__getAncestry(a.component || a._ractive.proxy);
    ancestryB = sortByItemPosition__getAncestry(b.component || b._ractive.proxy);

    oldestA = ancestryA[ancestryA.length - 1];
    oldestB = ancestryB[ancestryB.length - 1];

    // remove items from the end of both ancestries as long as they are identical
    // - the final one removed is the closest mutual ancestor
    while (oldestA && (oldestA === oldestB)) {
      ancestryA.pop();
      ancestryB.pop();

      mutualAncestor = oldestA;

      oldestA = ancestryA[ancestryA.length - 1];
      oldestB = ancestryB[ancestryB.length - 1];
    }

    // now that we have the mutual ancestor, we can find which is earliest
    oldestA = oldestA.component || oldestA;
    oldestB = oldestB.component || oldestB;

    fragmentA = oldestA.parentFragment;
    fragmentB = oldestB.parentFragment;

    // if both items share a parent fragment, our job is easy
    if (fragmentA === fragmentB) {
      indexA = fragmentA.items.indexOf(oldestA);
      indexB = fragmentB.items.indexOf(oldestB);

      // if it's the same index, it means one contains the other,
      // so we see which has the longest ancestry
      return (indexA - indexB) || ancestryA.length - ancestryB.length;
    }

    // if mutual ancestor is a section, we first test to see which section
    // fragment comes first
    if (fragments = mutualAncestor.fragments) {
      indexA = fragments.indexOf(fragmentA);
      indexB = fragments.indexOf(fragmentB);

      return (indexA - indexB) || ancestryA.length - ancestryB.length;
    }

    throw new Error("An unexpected condition was met while comparing the position of two components. Please file an issue at https://github.com/RactiveJS/Ractive/issues - thanks!");
  };

  function sortByItemPosition__getParent(item) {
    var parentFragment;

    if (parentFragment = item.parentFragment) {
      return parentFragment.owner;
    }

    if (item.component && (parentFragment = item.component.parentFragment)) {
      return parentFragment.owner;
    }
  }

  function sortByItemPosition__getAncestry(item) {
    var ancestry, ancestor;

    ancestry = [item];

    ancestor = sortByItemPosition__getParent(item);

    while (ancestor) {
      ancestry.push(ancestor);
      ancestor = sortByItemPosition__getParent(ancestor);
    }

    return ancestry;
  }
  //# sourceMappingURL=01-_6to5-sortByItemPosition.js.map

  var sortByDocumentPosition__default = function (node, otherNode) {
    var bitmask;

    if (node.compareDocumentPosition) {
      bitmask = node.compareDocumentPosition(otherNode);
      return (bitmask & 2) ? 1 : -1;
    }

    // In old IE, we can piggy back on the mechanism for
    // comparing component positions
    return sortByItemPosition__default(node, otherNode);
  };
  //# sourceMappingURL=01-_6to5-sortByDocumentPosition.js.map

  var sort__default = function () {
    this.sort(this._isComponentQuery ? sortByItemPosition__default : sortByDocumentPosition__default);
    this._dirty = false;
  };
  //# sourceMappingURL=01-_6to5-sort.js.map

  var dirty__default = function () {
    var _this = this;
    if (!this._dirty) {
      this._dirty = true;

      // Once the DOM has been updated, ensure the query
      // is correctly ordered
      runloop__default.scheduleTask(function () {
        _this._sort();
      });
    }
  };
  //# sourceMappingURL=01-_6to5-dirty.js.map

  var remove__default = function (nodeOrComponent) {
    var index = this.indexOf(this._isComponentQuery ? nodeOrComponent.instance : nodeOrComponent);

    if (index !== -1) {
      this.splice(index, 1);
    }
  };
  //# sourceMappingURL=01-_6to5-remove.js.map

  function makeQuery__makeQuery(ractive, selector, live, isComponentQuery) {
    var query = [];

    object__defineProperties(query, {
      selector: { value: selector },
      live: { value: live },

      _isComponentQuery: { value: isComponentQuery },
      _test: { value: test__default }
    });

    if (!live) {
      return query;
    }

    object__defineProperties(query, {
      cancel: { value: cancel__default },

      _root: { value: ractive },
      _sort: { value: sort__default },
      _makeDirty: { value: dirty__default },
      _remove: { value: remove__default },

      _dirty: { value: false, writable: true }
    });

    return query;
  };
  var makeQuery__default = makeQuery__makeQuery;
  //# sourceMappingURL=01-_6to5-_makeQuery.js.map

  function prototype_findAll__Ractive$findAll(selector, options) {
    var liveQueries, query;

    if (!this.el) {
      return [];
    }

    options = options || {};
    liveQueries = this._liveQueries;

    // Shortcut: if we're maintaining a live query with this
    // selector, we don't need to traverse the parallel DOM
    if (query = liveQueries[selector]) {
      // Either return the exact same query, or (if not live) a snapshot
      return (options && options.live) ? query : query.slice();
    }

    query = makeQuery__default(this, selector, !!options.live, false);

    // Add this to the list of live queries Ractive needs to maintain,
    // if applicable
    if (query.live) {
      liveQueries.push(selector);
      liveQueries["_" + selector] = query;
    }

    this.fragment.findAll(selector, query);
    return query;
  };
  var prototype_findAll__default = prototype_findAll__Ractive$findAll;
  //# sourceMappingURL=01-_6to5-findAll.js.map

  function prototype_findAllComponents__Ractive$findAllComponents(selector, options) {
    var liveQueries, query;

    options = options || {};
    liveQueries = this._liveComponentQueries;

    // Shortcut: if we're maintaining a live query with this
    // selector, we don't need to traverse the parallel DOM
    if (query = liveQueries[selector]) {
      // Either return the exact same query, or (if not live) a snapshot
      return (options && options.live) ? query : query.slice();
    }

    query = makeQuery__default(this, selector, !!options.live, true);

    // Add this to the list of live queries Ractive needs to maintain,
    // if applicable
    if (query.live) {
      liveQueries.push(selector);
      liveQueries["_" + selector] = query;
    }

    this.fragment.findAllComponents(selector, query);
    return query;
  };
  var prototype_findAllComponents__default = prototype_findAllComponents__Ractive$findAllComponents;
  //# sourceMappingURL=01-_6to5-findAllComponents.js.map

  function prototype_findComponent__Ractive$findComponent(selector) {
    return this.fragment.findComponent(selector);
  };
  var prototype_findComponent__default = prototype_findComponent__Ractive$findComponent;
  //# sourceMappingURL=01-_6to5-findComponent.js.map

  function findContainer__Ractive$findContainer(selector) {
    if (this.container) {
      if (this.container.component && this.container.component.name === selector) {
        return this.container;
      } else {
        return this.container.findContainer(selector);
      }
    }

    return null;
  };
  var findContainer__default = findContainer__Ractive$findContainer;
  //# sourceMappingURL=01-_6to5-findContainer.js.map

  function findParent__Ractive$findParent(selector) {
    if (this.parent) {
      if (this.parent.component && this.parent.component.name === selector) {
        return this.parent;
      } else {
        return this.parent.findParent(selector);
      }
    }

    return null;
  };
  var findParent__default = findParent__Ractive$findParent;
  //# sourceMappingURL=01-_6to5-findParent.js.map

  var eventStack__eventStack = {
    enqueue: function (ractive, event) {
      if (ractive.event) {
        ractive._eventQueue = ractive._eventQueue || [];
        ractive._eventQueue.push(ractive.event);
      }
      ractive.event = event;
    },
    dequeue: function (ractive) {
      if (ractive._eventQueue && ractive._eventQueue.length) {
        ractive.event = ractive._eventQueue.pop();
      } else {
        delete ractive.event;
      }
    }
  };

  var eventStack__default = eventStack__eventStack;
  //# sourceMappingURL=01-_6to5-eventStack.js.map

  var getPotentialWildcardMatches__starMaps = {};

  // This function takes a keypath such as 'foo.bar.baz', and returns
  // all the variants of that keypath that include a wildcard in place
  // of a key, such as 'foo.bar.*', 'foo.*.baz', 'foo.*.*' and so on.
  // These are then checked against the dependants map (ractive.viewmodel.depsMap)
  // to see if any pattern observers are downstream of one or more of
  // these wildcard keypaths (e.g. 'foo.bar.*.status')
  function getPotentialWildcardMatches__getPotentialWildcardMatches(keypath) {
    var keys, starMap, mapper, i, result, wildcardKeypath;

    keys = keypath.split(".");
    if (!(starMap = getPotentialWildcardMatches__starMaps[keys.length])) {
      starMap = getPotentialWildcardMatches__getStarMap(keys.length);
    }

    result = [];

    mapper = function (star, i) {
      return star ? "*" : keys[i];
    };

    i = starMap.length;
    while (i--) {
      wildcardKeypath = starMap[i].map(mapper).join(".");

      if (!result.hasOwnProperty(wildcardKeypath)) {
        result.push(wildcardKeypath);
        result[wildcardKeypath] = true;
      }
    }

    return result;
  };
  var getPotentialWildcardMatches__default = getPotentialWildcardMatches__getPotentialWildcardMatches;

  // This function returns all the possible true/false combinations for
  // a given number - e.g. for two, the possible combinations are
  // [ true, true ], [ true, false ], [ false, true ], [ false, false ].
  // It does so by getting all the binary values between 0 and e.g. 11
  function getPotentialWildcardMatches__getStarMap(num) {
    var ones = "", max, binary, starMap, mapper, i;

    if (!getPotentialWildcardMatches__starMaps[num]) {
      starMap = [];

      while (ones.length < num) {
        ones += 1;
      }

      max = parseInt(ones, 2);

      mapper = function (digit) {
        return digit === "1";
      };

      for (i = 0; i <= max; i += 1) {
        binary = i.toString(2);
        while (binary.length < num) {
          binary = "0" + binary;
        }

        starMap[i] = Array.prototype.map.call(binary, mapper);
      }

      getPotentialWildcardMatches__starMaps[num] = starMap;
    }

    return getPotentialWildcardMatches__starMaps[num];
  }
  //# sourceMappingURL=01-_6to5-getPotentialWildcardMatches.js.map

  function fireEvent__fireEvent(ractive, eventName, options) {
    if (options === undefined) options = {};
    if (!eventName) {
      return;
    }

    if (!options.event) {
      options.event = {
        name: eventName,
        context: ractive.data,
        keypath: "",
        // until event not included as argument default
        _noArg: true
      };
    } else {
      options.event.name = eventName;
    }

    var eventNames = getPotentialWildcardMatches__default(eventName);
    fireEvent__fireEventAs(ractive, eventNames, options.event, options.args, true);
  };
  var fireEvent__default = fireEvent__fireEvent;

  function fireEvent__fireEventAs(ractive, eventNames, event, args, initialFire) {
    if (initialFire === undefined) initialFire = false;


    var subscribers, i, bubble = true;

    eventStack__default.enqueue(ractive, event);

    for (i = eventNames.length; i >= 0; i--) {
      subscribers = ractive._subs[eventNames[i]];

      if (subscribers) {
        bubble = fireEvent__notifySubscribers(ractive, subscribers, event, args) && bubble;
      }
    }

    eventStack__default.dequeue(ractive);

    if (ractive.parent && bubble) {
      if (initialFire && ractive.component) {
        var fullName = ractive.component.name + "." + eventNames[eventNames.length - 1];
        eventNames = getPotentialWildcardMatches__default(fullName);

        if (event) {
          event.component = ractive;
        }
      }

      fireEvent__fireEventAs(ractive.parent, eventNames, event, args);
    }
  }

  function fireEvent__notifySubscribers(ractive, subscribers, event, args) {
    var originalEvent = null, stopEvent = false;

    if (event && !event._noArg) {
      args = [event].concat(args);
    }

    // subscribers can be modified inflight, e.g. "once" functionality
    // so we need to copy to make sure everyone gets called
    subscribers = subscribers.slice();

    for (var i = 0, len = subscribers.length; i < len; i += 1) {
      if (subscribers[i].apply(ractive, args) === false) {
        stopEvent = true;
      }
    }

    if (event && !event._noArg && stopEvent && (originalEvent = event.original)) {
      originalEvent.preventDefault && originalEvent.preventDefault();
      originalEvent.stopPropagation && originalEvent.stopPropagation();
    }

    return !stopEvent;
  }
  //# sourceMappingURL=01-_6to5-fireEvent.js.map

  function prototype_fire__Ractive$fire(eventName) {
    var options = {
      args: Array.prototype.slice.call(arguments, 1)
    };

    fireEvent__default(this, eventName, options);
  };
  var prototype_fire__default = prototype_fire__Ractive$fire;
  //# sourceMappingURL=01-_6to5-fire.js.map

  var prototype_get__options = {
    capture: true, // top-level calls should be intercepted
    noUnwrap: true // wrapped values should NOT be unwrapped
  };

  function prototype_get__Ractive$get(keypath) {
    var value;

    keypath = keypaths__normalise(keypath);
    value = this.viewmodel.get(keypath, prototype_get__options);

    // Create inter-component binding, if necessary
    if (value === undefined && this.parent && !this.isolated) {
      if (resolveRef__default(this, keypath, this.fragment)) {
        // creates binding as side-effect, if appropriate
        value = this.viewmodel.get(keypath);
      }
    }

    return value;
  };
  var prototype_get__default = prototype_get__Ractive$get;
  //# sourceMappingURL=01-_6to5-get.js.map

  var insert__insertHook = new Hook__default("insert");

  function insert__Ractive$insert(target, anchor) {
    if (!this.fragment.rendered) {
      // TODO create, and link to, documentation explaining this
      throw new Error("The API has changed - you must call `ractive.render(target[, anchor])` to render your Ractive instance. Once rendered you can use `ractive.insert()`.");
    }

    target = dom__getElement(target);
    anchor = dom__getElement(anchor) || null;

    if (!target) {
      throw new Error("You must specify a valid target to insert into");
    }

    target.insertBefore(this.detach(), anchor);
    this.el = target;

    (target.__ractive_instances__ || (target.__ractive_instances__ = [])).push(this);
    this.detached = null;

    insert__fireInsertHook(this);
  };
  var insert__default = insert__Ractive$insert;

  function insert__fireInsertHook(ractive) {
    insert__insertHook.fire(ractive);

    ractive.findAllComponents("*").forEach(function (child) {
      insert__fireInsertHook(child.instance);
    });
  }
  //# sourceMappingURL=01-_6to5-insert.js.map

  function prototype_merge__Ractive$merge(keypath, array, options) {
    var _this = this;


    var currentArray, promise;

    keypath = keypaths__normalise(keypath);
    currentArray = this.viewmodel.get(keypath);

    // If either the existing value or the new value isn't an
    // array, just do a regular set
    if (!is__isArray(currentArray) || !is__isArray(array)) {
      return this.set(keypath, array, options && options.complete);
    }

    // Manage transitions
    promise = runloop__default.start(this, true);
    this.viewmodel.merge(keypath, currentArray, array, options);
    runloop__default.end();

    // attach callback as fulfilment handler, if specified
    if (options && options.complete) {
      log__default.warn({
        debug: this.debug,
        message: "usePromise",
        args: {
          method: "ractive.merge"
        }
      });

      promise.then(options.complete).then(null, function (err) {
        log__default.consoleError({
          debug: _this.debug,
          err: err
        });
      });
    }

    return promise;
  };
  var prototype_merge__default = prototype_merge__Ractive$merge;
  //# sourceMappingURL=01-_6to5-merge.js.map

  var Observer__Observer = function (ractive, keypath, callback, options) {
    this.root = ractive;
    this.keypath = keypath;
    this.callback = callback;
    this.defer = options.defer;

    // default to root as context, but allow it to be overridden
    this.context = (options && options.context ? options.context : ractive);
  };

  Observer__Observer.prototype = {
    init: function (immediate) {
      this.value = this.root.get(this.keypath);

      if (immediate !== false) {
        this.update();
      } else {
        this.oldValue = this.value;
      }
    },

    setValue: function (value) {
      var _this = this;
      if (!is__isEqual(value, this.value)) {
        this.value = value;

        if (this.defer && this.ready) {
          runloop__default.scheduleTask(function () {
            return _this.update();
          });
        } else {
          this.update();
        }
      }
    },

    update: function () {
      // Prevent infinite loops
      if (this.updating) {
        return;
      }

      this.updating = true;

      this.callback.call(this.context, this.value, this.oldValue, this.keypath);
      this.oldValue = this.value;

      this.updating = false;
    }
  };

  var Observer__default = Observer__Observer;
  //# sourceMappingURL=01-_6to5-Observer.js.map

  function getPattern__getPattern(ractive, pattern) {
    var matchingKeypaths, values;

    matchingKeypaths = keypaths__getMatchingKeypaths(ractive, pattern);

    values = {};
    matchingKeypaths.forEach(function (keypath) {
      values[keypath] = ractive.get(keypath);
    });

    return values;
  };
  var getPattern__default = getPattern__getPattern;
  //# sourceMappingURL=01-_6to5-getPattern.js.map

  var PatternObserver__PatternObserver, PatternObserver__wildcard = /\*/, PatternObserver__slice = Array.prototype.slice;

  PatternObserver__PatternObserver = function (ractive, keypath, callback, options) {
    this.root = ractive;

    this.callback = callback;
    this.defer = options.defer;

    this.keypath = keypath;
    this.regex = new RegExp("^" + keypath.replace(/\./g, "\\.").replace(/\*/g, "([^\\.]+)") + "$");
    this.values = {};

    if (this.defer) {
      this.proxies = [];
    }

    // default to root as context, but allow it to be overridden
    this.context = (options && options.context ? options.context : ractive);
  };

  PatternObserver__PatternObserver.prototype = {
    init: function (immediate) {
      var values, keypath;

      values = getPattern__default(this.root, this.keypath);

      if (immediate !== false) {
        for (keypath in values) {
          if (values.hasOwnProperty(keypath)) {
            this.update(keypath);
          }
        }
      } else {
        this.values = values;
      }
    },

    update: function (keypath) {
      var _this = this;
      var values;

      if (PatternObserver__wildcard.test(keypath)) {
        values = getPattern__default(this.root, keypath);

        for (keypath in values) {
          if (values.hasOwnProperty(keypath)) {
            this.update(keypath);
          }
        }

        return;
      }

      // special case - array mutation should not trigger `array.*`
      // pattern observer with `array.length`
      if (this.root.viewmodel.implicitChanges[keypath]) {
        return;
      }

      if (this.defer && this.ready) {
        runloop__default.scheduleTask(function () {
          return _this.getProxy(keypath).update();
        });
        return;
      }

      this.reallyUpdate(keypath);
    },

    reallyUpdate: function (keypath) {
      var value, keys, args;

      value = this.root.viewmodel.get(keypath);

      // Prevent infinite loops
      if (this.updating) {
        this.values[keypath] = value;
        return;
      }

      this.updating = true;

      if (!is__isEqual(value, this.values[keypath]) || !this.ready) {
        keys = PatternObserver__slice.call(this.regex.exec(keypath), 1);
        args = [value, this.values[keypath], keypath].concat(keys);

        this.values[keypath] = value;
        this.callback.apply(this.context, args);
      }

      this.updating = false;
    },

    getProxy: function (keypath) {
      var _this2 = this;
      if (!this.proxies[keypath]) {
        this.proxies[keypath] = {
          update: function () {
            return _this2.reallyUpdate(keypath);
          }
        };
      }

      return this.proxies[keypath];
    }
  };

  var PatternObserver__default = PatternObserver__PatternObserver;
  //# sourceMappingURL=01-_6to5-PatternObserver.js.map

  var getObserverFacade__wildcard = /\*/, getObserverFacade__emptyObject = {};

  function getObserverFacade__getObserverFacade(ractive, keypath, callback, options) {
    var observer, isPatternObserver, cancelled;

    keypath = keypaths__normalise(keypath);
    options = options || getObserverFacade__emptyObject;

    // pattern observers are treated differently
    if (getObserverFacade__wildcard.test(keypath)) {
      observer = new PatternObserver__default(ractive, keypath, callback, options);
      ractive.viewmodel.patternObservers.push(observer);
      isPatternObserver = true;
    } else {
      observer = new Observer__default(ractive, keypath, callback, options);
    }

    observer.init(options.init);
    ractive.viewmodel.register(keypath, observer, isPatternObserver ? "patternObservers" : "observers");

    // This flag allows observers to initialise even with undefined values
    observer.ready = true;

    return {
      cancel: function () {
        var index;

        if (cancelled) {
          return;
        }

        if (isPatternObserver) {
          index = ractive.viewmodel.patternObservers.indexOf(observer);

          ractive.viewmodel.patternObservers.splice(index, 1);
          ractive.viewmodel.unregister(keypath, observer, "patternObservers");
        } else {
          ractive.viewmodel.unregister(keypath, observer, "observers");
        }
        cancelled = true;
      }
    };
  };
  var getObserverFacade__default = getObserverFacade__getObserverFacade;
  //# sourceMappingURL=01-_6to5-getObserverFacade.js.map

  function observe__Ractive$observe(keypath, callback, options) {
    var observers, map, keypaths, i;

    // Allow a map of keypaths to handlers
    if (is__isObject(keypath)) {
      options = callback;
      map = keypath;

      observers = [];

      for (keypath in map) {
        if (map.hasOwnProperty(keypath)) {
          callback = map[keypath];
          observers.push(this.observe(keypath, callback, options));
        }
      }

      return {
        cancel: function () {
          while (observers.length) {
            observers.pop().cancel();
          }
        }
      };
    }

    // Allow `ractive.observe( callback )` - i.e. observe entire model
    if (typeof keypath === "function") {
      options = callback;
      callback = keypath;
      keypath = "";

      return getObserverFacade__default(this, keypath, callback, options);
    }

    keypaths = keypath.split(" ");

    // Single keypath
    if (keypaths.length === 1) {
      return getObserverFacade__default(this, keypath, callback, options);
    }

    // Multiple space-separated keypaths
    observers = [];

    i = keypaths.length;
    while (i--) {
      keypath = keypaths[i];

      if (keypath) {
        observers.push(getObserverFacade__default(this, keypath, callback, options));
      }
    }

    return {
      cancel: function () {
        while (observers.length) {
          observers.pop().cancel();
        }
      }
    };
  };
  var observe__default = observe__Ractive$observe;
  //# sourceMappingURL=01-_6to5-observe.js.map

  function observeOnce__Ractive$observeOnce(property, callback, options) {
    var observer = this.observe(property, function () {
      callback.apply(this, arguments);
      observer.cancel();
    }, { init: false, defer: options && options.defer });

    return observer;
  };
  var observeOnce__default = observeOnce__Ractive$observeOnce;
  //# sourceMappingURL=01-_6to5-observeOnce.js.map

  var trim__default = function (str) {
    return str.trim();
  };
  //# sourceMappingURL=01-_6to5-trim.js.map

  var notEmptyString__default = function (str) {
    return str !== "";
  };
  //# sourceMappingURL=01-_6to5-notEmptyString.js.map

  function off__Ractive$off(eventName, callback) {
    var _this = this;
    var eventNames;

    // if no arguments specified, remove all callbacks
    if (!eventName) {
      // TODO use this code instead, once the following issue has been resolved
      // in PhantomJS (tests are unpassable otherwise!)
      // https://github.com/ariya/phantomjs/issues/11856
      // defineProperty( this, '_subs', { value: create( null ), configurable: true });
      for (eventName in this._subs) {
        delete this._subs[eventName];
      }
    } else {
      // Handle multiple space-separated event names
      eventNames = eventName.split(" ").map(trim__default).filter(notEmptyString__default);

      eventNames.forEach(function (eventName) {
        var subscribers, index;

        // If we have subscribers for this event...
        if (subscribers = _this._subs[eventName]) {
          // ...if a callback was specified, only remove that
          if (callback) {
            index = subscribers.indexOf(callback);
            if (index !== -1) {
              subscribers.splice(index, 1);
            }
          }

          // ...otherwise remove all callbacks
          else {
            _this._subs[eventName] = [];
          }
        }
      });
    }

    return this;
  };
  var off__default = off__Ractive$off;
  //# sourceMappingURL=01-_6to5-off.js.map

  function on__Ractive$on(eventName, callback) {
    var _this = this;
    var listeners, n, eventNames;

    // allow mutliple listeners to be bound in one go
    if (typeof eventName === "object") {
      listeners = [];

      for (n in eventName) {
        if (eventName.hasOwnProperty(n)) {
          listeners.push(this.on(n, eventName[n]));
        }
      }

      return {
        cancel: function () {
          var listener;

          while (listener = listeners.pop()) {
            listener.cancel();
          }
        }
      };
    }

    // Handle multiple space-separated event names
    eventNames = eventName.split(" ").map(trim__default).filter(notEmptyString__default);

    eventNames.forEach(function (eventName) {
      (_this._subs[eventName] || (_this._subs[eventName] = [])).push(callback);
    });

    return {
      cancel: function () {
        return _this.off(eventName, callback);
      }
    };
  };
  var on__default = on__Ractive$on;
  //# sourceMappingURL=01-_6to5-on.js.map

  function once__Ractive$once(eventName, handler) {
    var listener = this.on(eventName, function () {
      handler.apply(this, arguments);
      listener.cancel();
    });

    // so we can still do listener.cancel() manually
    return listener;
  };
  var once__default = once__Ractive$once;
  //# sourceMappingURL=01-_6to5-once.js.map

  // This function takes an array, the name of a mutator method, and the
  // arguments to call that mutator method with, and returns an array that
  // maps the old indices to their new indices.

  // So if you had something like this...
  //
  //     array = [ 'a', 'b', 'c', 'd' ];
  //     array.push( 'e' );
  //
  // ...you'd get `[ 0, 1, 2, 3 ]` - in other words, none of the old indices
  // have changed. If you then did this...
  //
  //     array.unshift( 'z' );
  //
  // ...the indices would be `[ 1, 2, 3, 4, 5 ]` - every item has been moved
  // one higher to make room for the 'z'. If you removed an item, the new index
  // would be -1...
  //
  //     array.splice( 2, 2 );
  //
  // ...this would result in [ 0, 1, -1, -1, 2, 3 ].
  //
  // This information is used to enable fast, non-destructive shuffling of list
  // sections when you do e.g. `ractive.splice( 'items', 2, 2 );

  function getNewIndices__getNewIndices(array, methodName, args) {
    var spliceArguments, len, newIndices = [], removeStart, removeEnd, balance, i;

    spliceArguments = getNewIndices__getSpliceEquivalent(array, methodName, args);

    if (!spliceArguments) {
      return null; // TODO support reverse and sort?
    }

    len = array.length;
    balance = (spliceArguments.length - 2) - spliceArguments[1];

    removeStart = Math.min(len, spliceArguments[0]);
    removeEnd = removeStart + spliceArguments[1];

    for (i = 0; i < removeStart; i += 1) {
      newIndices.push(i);
    }

    for (; i < removeEnd; i += 1) {
      newIndices.push(-1);
    }

    for (; i < len; i += 1) {
      newIndices.push(i + balance);
    }

    return newIndices;
  };
  var getNewIndices__default = getNewIndices__getNewIndices;


  // The pop, push, shift an unshift methods can all be represented
  // as an equivalent splice
  function getNewIndices__getSpliceEquivalent(array, methodName, args) {
    switch (methodName) {
      case "splice":
        if (args[0] !== undefined && args[0] < 0) {
          args[0] = array.length + Math.max(args[0], -array.length);
        }

        while (args.length < 2) {
          args.push(0);
        }

        // ensure we only remove elements that exist
        args[1] = Math.min(args[1], array.length - args[0]);

        return args;

      case "sort":
      case "reverse":
        return null;

      case "pop":
        if (array.length) {
          return [array.length - 1, 1];
        }
        return null;

      case "push":
        return [array.length, 0].concat(args);

      case "shift":
        return [0, 1];

      case "unshift":
        return [0, 0].concat(args);
    }
  }
  //# sourceMappingURL=01-_6to5-getNewIndices.js.map

  var makeArrayMethod___slice = Array.prototype.slice;
  var makeArrayMethod__arrayProto = Array.prototype;

  var makeArrayMethod__default = function (methodName) {
    return function (keypath) {
      var args = makeArrayMethod___slice.call(arguments, 1);

      var array, newIndices = [], len, promise, result;

      array = this.get(keypath);
      len = array.length;

      if (!is__isArray(array)) {
        throw new Error("Called ractive." + methodName + "('" + keypath + "'), but '" + keypath + "' does not refer to an array");
      }

      newIndices = getNewIndices__default(array, methodName, args);

      result = makeArrayMethod__arrayProto[methodName].apply(array, args);
      promise = runloop__default.start(this, true).then(function () {
        return result;
      });

      if (!!newIndices) {
        this.viewmodel.smartUpdate(keypath, array, newIndices);
      } else {
        this.viewmodel.mark(keypath);
      }

      runloop__default.end();

      return promise;
    };
  };
  //# sourceMappingURL=01-_6to5-makeArrayMethod.js.map

	var pop__default = makeArrayMethod__default("pop");
	//# sourceMappingURL=01-_6to5-pop.js.map

	var push__default = makeArrayMethod__default("push");
	//# sourceMappingURL=01-_6to5-push.js.map

  var global_css__css, global_css__update, global_css__styleElement, global_css__head, global_css__styleSheet, global_css__inDom, global_css__prefix = "/* Ractive.js component styles */\n", global_css__componentsInPage = {}, global_css__styles = [];

  if (!environment__isClient) {
    global_css__css = null;
  } else {
    global_css__styleElement = document.createElement("style");
    global_css__styleElement.type = "text/css";

    global_css__head = document.getElementsByTagName("head")[0];

    global_css__inDom = false;

    // Internet Exploder won't let you use styleSheet.innerHTML - we have to
    // use styleSheet.cssText instead
    global_css__styleSheet = global_css__styleElement.styleSheet;

    global_css__update = function () {
      var css;

      if (global_css__styles.length) {
        css = global_css__prefix + global_css__styles.join(" ");

        if (global_css__styleSheet) {
          global_css__styleSheet.cssText = css;
        } else {
          global_css__styleElement.innerHTML = css;
        }

        if (!global_css__inDom) {
          global_css__head.appendChild(global_css__styleElement);
          global_css__inDom = true;
        }
      } else if (global_css__inDom) {
        global_css__head.removeChild(global_css__styleElement);
        global_css__inDom = false;
      }
    };

    global_css__css = {
      add: function (Component) {
        if (!Component.css) {
          return;
        }

        if (!global_css__componentsInPage[Component._guid]) {
          // we create this counter so that we can in/decrement it as
          // instances are added and removed. When all components are
          // removed, the style is too
          global_css__componentsInPage[Component._guid] = 0;
          global_css__styles.push(Component.css);

          global_css__update(); // TODO can we only do this once for each runloop turn, but still ensure CSS is updated before onrender() methods are called?
        }

        global_css__componentsInPage[Component._guid] += 1;
      },

      remove: function (Component) {
        if (!Component.css) {
          return;
        }

        global_css__componentsInPage[Component._guid] -= 1;

        if (!global_css__componentsInPage[Component._guid]) {
          array__removeFromArray(global_css__styles, Component.css);
          runloop__default.scheduleTask(global_css__update);
        }
      }
    };
  }

  var global_css__default = global_css__css;
  //# sourceMappingURL=01-_6to5-css.js.map

  var prototype_render__renderHook = new Hook__default("render"), prototype_render__completeHook = new Hook__default("complete");

  function prototype_render__Ractive$render(target, anchor) {
    var _this = this;
    var promise, instances, transitionsEnabled;

    // if `noIntro` is `true`, temporarily disable transitions
    transitionsEnabled = this.transitionsEnabled;
    if (this.noIntro) {
      this.transitionsEnabled = false;
    }

    promise = runloop__default.start(this, true);
    runloop__default.scheduleTask(function () {
      return prototype_render__renderHook.fire(_this);
    }, true);

    if (this.fragment.rendered) {
      throw new Error("You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first");
    }

    target = dom__getElement(target) || this.el;
    anchor = dom__getElement(anchor) || this.anchor;

    this.el = target;
    this.anchor = anchor;

    if (!this.append && target) {
      // Teardown any existing instances *before* trying to set up the new one -
      // avoids certain weird bugs
      var others = target.__ractive_instances__;
      if (others && others.length) {
        prototype_render__removeOtherInstances(others);
      }

      // make sure we are the only occupants
      target.innerHTML = ""; // TODO is this quicker than removeChild? Initial research inconclusive
    }

    // Add CSS, if applicable
    if (this.constructor.css) {
      global_css__default.add(this.constructor);
    }

    if (target) {
      if (!(instances = target.__ractive_instances__)) {
        target.__ractive_instances__ = [this];
      } else {
        instances.push(this);
      }

      if (anchor) {
        target.insertBefore(this.fragment.render(), anchor);
      } else {
        target.appendChild(this.fragment.render());
      }
    }

    runloop__default.end();

    this.transitionsEnabled = transitionsEnabled;

    // It is now more problematic to know if the complete hook
    // would fire. Method checking is straight-forward, but would
    // also require preflighting event subscriptions. Which seems
    // like more work then just letting the promise happen.
    // But perhaps I'm wrong about that...
    promise.then(function () {
      return prototype_render__completeHook.fire(_this);
    }).then(null, function (err) {
      log__default.consoleError({
        debug: _this.debug,
        err: err
      });
    });

    return promise;
  };
  var prototype_render__default = prototype_render__Ractive$render;

  function prototype_render__removeOtherInstances(others) {
    try {
      others.splice(0, others.length).forEach(function (r) {
        return r.teardown();
      });
    } catch (err) {}
  }
  //# sourceMappingURL=01-_6to5-render.js.map

  function prototype_bubble__Fragment$bubble() {
    this.dirtyValue = this.dirtyArgs = true;

    if (this.bound && typeof this.owner.bubble === "function") {
      this.owner.bubble();
    }
  };
  var prototype_bubble__default = prototype_bubble__Fragment$bubble;
  //# sourceMappingURL=01-_6to5-bubble.js.map

  function Fragment_prototype_detach__Fragment$detach() {
    var docFrag;

    if (this.items.length === 1) {
      return this.items[0].detach();
    }

    docFrag = document.createDocumentFragment();

    this.items.forEach(function (item) {
      var node = item.detach();

      // TODO The if {...} wasn't previously required - it is now, because we're
      // forcibly detaching everything to reorder sections after an update. That's
      // a non-ideal brute force approach, implemented to get all the tests to pass
      // - as soon as it's replaced with something more elegant, this should
      // revert to `docFrag.appendChild( item.detach() )`
      if (node) {
        docFrag.appendChild(node);
      }
    });

    return docFrag;
  };
  var Fragment_prototype_detach__default = Fragment_prototype_detach__Fragment$detach;
  //# sourceMappingURL=01-_6to5-detach.js.map

  function Fragment_prototype_find__Fragment$find(selector) {
    var i, len, item, queryResult;

    if (this.items) {
      len = this.items.length;
      for (i = 0; i < len; i += 1) {
        item = this.items[i];

        if (item.find && (queryResult = item.find(selector))) {
          return queryResult;
        }
      }

      return null;
    }
  };
  var Fragment_prototype_find__default = Fragment_prototype_find__Fragment$find;
  //# sourceMappingURL=01-_6to5-find.js.map

  function Fragment_prototype_findAll__Fragment$findAll(selector, query) {
    var i, len, item;

    if (this.items) {
      len = this.items.length;
      for (i = 0; i < len; i += 1) {
        item = this.items[i];

        if (item.findAll) {
          item.findAll(selector, query);
        }
      }
    }

    return query;
  };
  var Fragment_prototype_findAll__default = Fragment_prototype_findAll__Fragment$findAll;
  //# sourceMappingURL=01-_6to5-findAll.js.map

  function Fragment_prototype_findAllComponents__Fragment$findAllComponents(selector, query) {
    var i, len, item;

    if (this.items) {
      len = this.items.length;
      for (i = 0; i < len; i += 1) {
        item = this.items[i];

        if (item.findAllComponents) {
          item.findAllComponents(selector, query);
        }
      }
    }

    return query;
  };
  var Fragment_prototype_findAllComponents__default = Fragment_prototype_findAllComponents__Fragment$findAllComponents;
  //# sourceMappingURL=01-_6to5-findAllComponents.js.map

  function Fragment_prototype_findComponent__Fragment$findComponent(selector) {
    var len, i, item, queryResult;

    if (this.items) {
      len = this.items.length;
      for (i = 0; i < len; i += 1) {
        item = this.items[i];

        if (item.findComponent && (queryResult = item.findComponent(selector))) {
          return queryResult;
        }
      }

      return null;
    }
  };
  var Fragment_prototype_findComponent__default = Fragment_prototype_findComponent__Fragment$findComponent;
  //# sourceMappingURL=01-_6to5-findComponent.js.map

  function prototype_findNextNode__Fragment$findNextNode(item) {
    var index = item.index, node;

    if (this.items[index + 1]) {
      node = this.items[index + 1].firstNode();
    }

    // if this is the root fragment, and there are no more items,
    // it means we're at the end...
    else if (this.owner === this.root) {
      if (!this.owner.component) {
        // TODO but something else could have been appended to
        // this.root.el, no?
        node = null;
      }

      // ...unless this is a component
      else {
        node = this.owner.component.findNextNode();
      }
    } else {
      node = this.owner.findNextNode(this);
    }

    return node;
  };
  var prototype_findNextNode__default = prototype_findNextNode__Fragment$findNextNode;
  //# sourceMappingURL=01-_6to5-findNextNode.js.map

  function prototype_firstNode__Fragment$firstNode() {
    if (this.items && this.items[0]) {
      return this.items[0].firstNode();
    }

    return null;
  };
  var prototype_firstNode__default = prototype_firstNode__Fragment$firstNode;
  //# sourceMappingURL=01-_6to5-firstNode.js.map

  function getNode__Fragment$getNode() {
    var fragment = this;

    do {
      if (fragment.pElement) {
        return fragment.pElement.node;
      }
    } while (fragment = fragment.parent);

    return this.root.detached || this.root.el;
  };
  var getNode__default = getNode__Fragment$getNode;
  //# sourceMappingURL=01-_6to5-getNode.js.map

	var types__TEXT = 1;
	var types__INTERPOLATOR = 2;
	var types__TRIPLE = 3;
	var types__SECTION = 4;
	var types__INVERTED = 5;
	var types__CLOSING = 6;
	var types__ELEMENT = 7;
	var types__PARTIAL = 8;
	var types__COMMENT = 9;
	var types__DELIMCHANGE = 10;
	var types__MUSTACHE = 11;
	var types__TAG = 12;
	var types__ATTRIBUTE = 13;
	var types__CLOSING_TAG = 14;
	var types__COMPONENT = 15;
	var types__YIELDER = 16;
	var types__INLINE_PARTIAL = 17;
	var types__DOCTYPE = 18;

	var types__NUMBER_LITERAL = 20;
	var types__STRING_LITERAL = 21;
	var types__ARRAY_LITERAL = 22;
	var types__OBJECT_LITERAL = 23;
	var types__BOOLEAN_LITERAL = 24;

	var types__GLOBAL = 26;
	var types__KEY_VALUE_PAIR = 27;


	var types__REFERENCE = 30;
	var types__REFINEMENT = 31;
	var types__MEMBER = 32;
	var types__PREFIX_OPERATOR = 33;
	var types__BRACKETED = 34;
	var types__CONDITIONAL = 35;
	var types__INFIX_OPERATOR = 36;

	var types__INVOCATION = 40;

	var types__SECTION_IF = 50;
	var types__SECTION_UNLESS = 51;
	var types__SECTION_EACH = 52;
	var types__SECTION_WITH = 53;
	var types__SECTION_IF_WITH = 54;
	var types__SECTION_PARTIAL = 55;
	//# sourceMappingURL=01-_6to5-types.js.map

	var shared_errors__expectedExpression = "Expected a JavaScript expression";
	var shared_errors__expectedParen = "Expected closing paren";
	//# sourceMappingURL=01-_6to5-errors.js.map

  var getNumberLiteral__numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;

  var getNumberLiteral__default = function (parser) {
    var result;

    if (result = parser.matchPattern(getNumberLiteral__numberPattern)) {
      return {
        t: types__NUMBER_LITERAL,
        v: result
      };
    }

    return null;
  };
  //# sourceMappingURL=01-_6to5-numberLiteral.js.map

  var getBooleanLiteral__default = function (parser) {
    var remaining = parser.remaining();

    if (remaining.substr(0, 4) === "true") {
      parser.pos += 4;
      return {
        t: types__BOOLEAN_LITERAL,
        v: "true"
      };
    }

    if (remaining.substr(0, 5) === "false") {
      parser.pos += 5;
      return {
        t: types__BOOLEAN_LITERAL,
        v: "false"
      };
    }

    return null;
  };
  //# sourceMappingURL=01-_6to5-booleanLiteral.js.map

  var makeQuotedStringMatcher__stringMiddlePattern, makeQuotedStringMatcher__escapeSequencePattern, makeQuotedStringMatcher__lineContinuationPattern;

  // Match one or more characters until: ", ', \, or EOL/EOF.
  // EOL/EOF is written as (?!.) (meaning there's no non-newline char next).
  makeQuotedStringMatcher__stringMiddlePattern = /^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/;

  // Match one escape sequence, including the backslash.
  makeQuotedStringMatcher__escapeSequencePattern = /^\\(?:['"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/;

  // Match one ES5 line continuation (backslash + line terminator).
  makeQuotedStringMatcher__lineContinuationPattern = /^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/;

  // Helper for defining getDoubleQuotedString and getSingleQuotedString.
  var makeQuotedStringMatcher__default = function (okQuote) {
    return function (parser) {
      var start, literal, done, next;

      start = parser.pos;
      literal = "\"";
      done = false;

      while (!done) {
        next = (parser.matchPattern(makeQuotedStringMatcher__stringMiddlePattern) || parser.matchPattern(makeQuotedStringMatcher__escapeSequencePattern) || parser.matchString(okQuote));
        if (next) {
          if (next === "\"") {
            literal += "\\\"";
          } else if (next === "\\'") {
            literal += "'";
          } else {
            literal += next;
          }
        } else {
          next = parser.matchPattern(makeQuotedStringMatcher__lineContinuationPattern);
          if (next) {
            // convert \(newline-like) into a \u escape, which is allowed in JSON
            literal += "\\u" + ("000" + next.charCodeAt(1).toString(16)).slice(-4);
          } else {
            done = true;
          }
        }
      }

      literal += "\"";

      // use JSON.parse to interpret escapes
      return JSON.parse(literal);
    };
  };
  //# sourceMappingURL=01-_6to5-makeQuotedStringMatcher.js.map

  var getStringLiteral__getSingleQuotedString = makeQuotedStringMatcher__default("\"");
  var getStringLiteral__getDoubleQuotedString = makeQuotedStringMatcher__default("'");

  var getStringLiteral__default = function (parser) {
    var start, string;

    start = parser.pos;

    if (parser.matchString("\"")) {
      string = getStringLiteral__getDoubleQuotedString(parser);

      if (!parser.matchString("\"")) {
        parser.pos = start;
        return null;
      }

      return {
        t: types__STRING_LITERAL,
        v: string
      };
    }

    if (parser.matchString("'")) {
      string = getStringLiteral__getSingleQuotedString(parser);

      if (!parser.matchString("'")) {
        parser.pos = start;
        return null;
      }

      return {
        t: types__STRING_LITERAL,
        v: string
      };
    }

    return null;
  };
  //# sourceMappingURL=01-_6to5-_stringLiteral.js.map

	var patterns__name = /^[a-zA-Z_$][a-zA-Z_$0-9]*/;
	var patterns__relaxedName = /^[a-zA-Z_$][-a-zA-Z_$0-9]*/;
	//# sourceMappingURL=01-_6to5-patterns.js.map

  var getKey__identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

  // http://mathiasbynens.be/notes/javascript-properties
  // can be any name, string literal, or number literal
  var getKey__default = function (parser) {
    var token;

    if (token = getStringLiteral__default(parser)) {
      return getKey__identifier.test(token.v) ? token.v : "\"" + token.v.replace(/"/g, "\\\"") + "\"";
    }

    if (token = getNumberLiteral__default(parser)) {
      return token.v;
    }

    if (token = parser.matchPattern(patterns__name)) {
      return token;
    }
  };
  //# sourceMappingURL=01-_6to5-key.js.map

  var getKeyValuePair__default = function (parser) {
    var start, key, value;

    start = parser.pos;

    // allow whitespace between '{' and key
    parser.allowWhitespace();

    key = getKey__default(parser);
    if (key === null) {
      parser.pos = start;
      return null;
    }

    // allow whitespace between key and ':'
    parser.allowWhitespace();

    // next character must be ':'
    if (!parser.matchString(":")) {
      parser.pos = start;
      return null;
    }

    // allow whitespace between ':' and value
    parser.allowWhitespace();

    // next expression must be a, well... expression
    value = parser.readExpression();
    if (value === null) {
      parser.pos = start;
      return null;
    }

    return {
      t: types__KEY_VALUE_PAIR,
      k: key,
      v: value
    };
  };
  //# sourceMappingURL=01-_6to5-keyValuePair.js.map

  function getKeyValuePairs__getKeyValuePairs(parser) {
    var start, pairs, pair, keyValuePairs;

    start = parser.pos;

    pair = getKeyValuePair__default(parser);
    if (pair === null) {
      return null;
    }

    pairs = [pair];

    if (parser.matchString(",")) {
      keyValuePairs = getKeyValuePairs__getKeyValuePairs(parser);

      if (!keyValuePairs) {
        parser.pos = start;
        return null;
      }

      return pairs.concat(keyValuePairs);
    }

    return pairs;
  };
  var getKeyValuePairs__default = getKeyValuePairs__getKeyValuePairs;
  //# sourceMappingURL=01-_6to5-keyValuePairs.js.map

  var getObjectLiteral__default = function (parser) {
    var start, keyValuePairs;

    start = parser.pos;

    // allow whitespace
    parser.allowWhitespace();

    if (!parser.matchString("{")) {
      parser.pos = start;
      return null;
    }

    keyValuePairs = getKeyValuePairs__default(parser);

    // allow whitespace between final value and '}'
    parser.allowWhitespace();

    if (!parser.matchString("}")) {
      parser.pos = start;
      return null;
    }

    return {
      t: types__OBJECT_LITERAL,
      m: keyValuePairs
    };
  };
  //# sourceMappingURL=01-_6to5-_objectLiteral.js.map

  function getExpressionList__getExpressionList(parser) {
    var start, expressions, expr, next;

    start = parser.pos;

    parser.allowWhitespace();

    expr = parser.readExpression();

    if (expr === null) {
      return null;
    }

    expressions = [expr];

    // allow whitespace between expression and ','
    parser.allowWhitespace();

    if (parser.matchString(",")) {
      next = getExpressionList__getExpressionList(parser);
      if (next === null) {
        parser.error(shared_errors__expectedExpression);
      }

      next.forEach(append);
    }

    function append(expression) {
      expressions.push(expression);
    }

    return expressions;
  };
  var getExpressionList__default = getExpressionList__getExpressionList;
  //# sourceMappingURL=01-_6to5-expressionList.js.map

  var getArrayLiteral__default = function (parser) {
    var start, expressionList;

    start = parser.pos;

    // allow whitespace before '['
    parser.allowWhitespace();

    if (!parser.matchString("[")) {
      parser.pos = start;
      return null;
    }

    expressionList = getExpressionList__default(parser);

    if (!parser.matchString("]")) {
      parser.pos = start;
      return null;
    }

    return {
      t: types__ARRAY_LITERAL,
      m: expressionList
    };
  };
  //# sourceMappingURL=01-_6to5-arrayLiteral.js.map

  var getLiteral__default = function (parser) {
    var literal = getNumberLiteral__default(parser) || getBooleanLiteral__default(parser) || getStringLiteral__default(parser) || getObjectLiteral__default(parser) || getArrayLiteral__default(parser);

    return literal;
  };
  //# sourceMappingURL=01-_6to5-_literal.js.map

  var getReference__dotRefinementPattern, getReference__arrayMemberPattern, getReference__getArrayRefinement, getReference__globals, getReference__keywords;
  getReference__dotRefinementPattern = /^\.[a-zA-Z_$0-9]+/;

  getReference__getArrayRefinement = function (parser) {
    var num = parser.matchPattern(getReference__arrayMemberPattern);

    if (num) {
      return "." + num;
    }

    return null;
  };

  getReference__arrayMemberPattern = /^\[(0|[1-9][0-9]*)\]/;

  // if a reference is a browser global, we don't deference it later, so it needs special treatment
  getReference__globals = /^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)$/;

  // keywords are not valid references, with the exception of `this`
  getReference__keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;

  var getReference__default = function (parser) {
    var startPos, ancestor, name, dot, combo, refinement, lastDotIndex, pattern;

    startPos = parser.pos;

    // we might have a root-level reference
    if (parser.matchString("~/")) {
      ancestor = "~/";
    } else {
      // we might have ancestor refs...
      ancestor = "";
      while (parser.matchString("../")) {
        ancestor += "../";
      }
    }

    if (!ancestor) {
      // we might have an implicit iterator or a restricted reference
      dot = parser.matchString("./") || parser.matchString(".") || "";
    }

    pattern = parser.relaxedNames ? patterns__relaxedName : patterns__name;
    name = parser.matchPattern(/^@(?:keypath|index|key)/) || parser.matchPattern(pattern) || "";

    // bug out if it's a keyword (exception for ancestor/restricted refs - see https://github.com/ractivejs/ractive/issues/1497)
    if (!parser.relaxedNames && !dot && !ancestor && getReference__keywords.test(name)) {
      parser.pos = startPos;
      return null;
    }

    // if this is a browser global, stop here
    if (!ancestor && !dot && !parser.relaxedNames && getReference__globals.test(name)) {
      return {
        t: types__GLOBAL,
        v: name
      };
    }

    combo = (ancestor || dot) + name;

    if (!combo) {
      return null;
    }

    while (refinement = parser.matchPattern(getReference__dotRefinementPattern) || getReference__getArrayRefinement(parser)) {
      combo += refinement;
    }

    if (parser.matchString("(")) {
      // if this is a method invocation (as opposed to a function) we need
      // to strip the method name from the reference combo, else the context
      // will be wrong
      lastDotIndex = combo.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        combo = combo.substr(0, lastDotIndex);
        parser.pos = startPos + combo.length;
      } else {
        parser.pos -= 1;
      }
    }

    return {
      t: types__REFERENCE,
      n: combo.replace(/^this\./, "./").replace(/^this$/, ".")
    };
  };
  //# sourceMappingURL=01-_6to5-reference.js.map

  var getBracketedExpression__default = function (parser) {
    var start, expr;

    start = parser.pos;

    if (!parser.matchString("(")) {
      return null;
    }

    parser.allowWhitespace();

    expr = parser.readExpression();
    if (!expr) {
      parser.error(shared_errors__expectedExpression);
    }

    parser.allowWhitespace();

    if (!parser.matchString(")")) {
      parser.error(shared_errors__expectedParen);
    }

    return {
      t: types__BRACKETED,
      x: expr
    };
  };
  //# sourceMappingURL=01-_6to5-bracketedExpression.js.map

  var getPrimary__default = function (parser) {
    return getLiteral__default(parser) || getReference__default(parser) || getBracketedExpression__default(parser);
  };
  //# sourceMappingURL=01-_6to5-_primary.js.map

  function getRefinement__getRefinement(parser) {
    var start, name, expr;

    start = parser.pos;

    parser.allowWhitespace();

    // "." name
    if (parser.matchString(".")) {
      parser.allowWhitespace();

      if (name = parser.matchPattern(patterns__name)) {
        return {
          t: types__REFINEMENT,
          n: name
        };
      }

      parser.error("Expected a property name");
    }

    // "[" expression "]"
    if (parser.matchString("[")) {
      parser.allowWhitespace();

      expr = parser.readExpression();
      if (!expr) {
        parser.error(shared_errors__expectedExpression);
      }

      parser.allowWhitespace();

      if (!parser.matchString("]")) {
        parser.error("Expected ']'");
      }

      return {
        t: types__REFINEMENT,
        x: expr
      };
    }

    return null;
  };
  var getRefinement__default = getRefinement__getRefinement;
  //# sourceMappingURL=01-_6to5-refinement.js.map

  var getMemberOrInvocation__default = function (parser) {
    var current, expression, refinement, expressionList;

    expression = getPrimary__default(parser);

    if (!expression) {
      return null;
    }

    while (expression) {
      current = parser.pos;

      if (refinement = getRefinement__default(parser)) {
        expression = {
          t: types__MEMBER,
          x: expression,
          r: refinement
        };
      } else if (parser.matchString("(")) {
        parser.allowWhitespace();
        expressionList = getExpressionList__default(parser);

        parser.allowWhitespace();

        if (!parser.matchString(")")) {
          parser.error(shared_errors__expectedParen);
        }

        expression = {
          t: types__INVOCATION,
          x: expression
        };

        if (expressionList) {
          expression.o = expressionList;
        }
      } else {
        break;
      }
    }

    return expression;
  };
  //# sourceMappingURL=01-_6to5-memberOrInvocation.js.map

  var getTypeof__getTypeof, getTypeof__makePrefixSequenceMatcher;

  getTypeof__makePrefixSequenceMatcher = function (symbol, fallthrough) {
    return function (parser) {
      var expression;

      if (expression = fallthrough(parser)) {
        return expression;
      }

      if (!parser.matchString(symbol)) {
        return null;
      }

      parser.allowWhitespace();

      expression = parser.readExpression();
      if (!expression) {
        parser.error(shared_errors__expectedExpression);
      }

      return {
        s: symbol,
        o: expression,
        t: types__PREFIX_OPERATOR
      };
    };
  };

  // create all prefix sequence matchers, return getTypeof
  (function () {
    var i, len, matcher, prefixOperators, fallthrough;

    prefixOperators = "! ~ + - typeof".split(" ");

    fallthrough = getMemberOrInvocation__default;
    for (i = 0, len = prefixOperators.length; i < len; i += 1) {
      matcher = getTypeof__makePrefixSequenceMatcher(prefixOperators[i], fallthrough);
      fallthrough = matcher;
    }

    // typeof operator is higher precedence than multiplication, so provides the
    // fallthrough for the multiplication sequence matcher we're about to create
    // (we're skipping void and delete)
    getTypeof__getTypeof = fallthrough;
  }());

  var getTypeof__default = getTypeof__getTypeof;
  //# sourceMappingURL=01-_6to5-typeof.js.map

  var getLogicalOr__getLogicalOr, getLogicalOr__makeInfixSequenceMatcher;

  getLogicalOr__makeInfixSequenceMatcher = function (symbol, fallthrough) {
    return function (parser) {
      var start, left, right;

      left = fallthrough(parser);
      if (!left) {
        return null;
      }

      // Loop to handle left-recursion in a case like `a * b * c` and produce
      // left association, i.e. `(a * b) * c`.  The matcher can't call itself
      // to parse `left` because that would be infinite regress.
      while (true) {
        start = parser.pos;

        parser.allowWhitespace();

        if (!parser.matchString(symbol)) {
          parser.pos = start;
          return left;
        }

        // special case - in operator must not be followed by [a-zA-Z_$0-9]
        if (symbol === "in" && /[a-zA-Z_$0-9]/.test(parser.remaining().charAt(0))) {
          parser.pos = start;
          return left;
        }

        parser.allowWhitespace();

        // right operand must also consist of only higher-precedence operators
        right = fallthrough(parser);
        if (!right) {
          parser.pos = start;
          return left;
        }

        left = {
          t: types__INFIX_OPERATOR,
          s: symbol,
          o: [left, right]
        };

        // Loop back around.  If we don't see another occurrence of the symbol,
        // we'll return left.
      }
    };
  };

  // create all infix sequence matchers, and return getLogicalOr
  (function () {
    var i, len, matcher, infixOperators, fallthrough;

    // All the infix operators on order of precedence (source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Operator_Precedence)
    // Each sequence matcher will initially fall through to its higher precedence
    // neighbour, and only attempt to match if one of the higher precedence operators
    // (or, ultimately, a literal, reference, or bracketed expression) already matched
    infixOperators = "* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||".split(" ");

    // A typeof operator is higher precedence than multiplication
    fallthrough = getTypeof__default;
    for (i = 0, len = infixOperators.length; i < len; i += 1) {
      matcher = getLogicalOr__makeInfixSequenceMatcher(infixOperators[i], fallthrough);
      fallthrough = matcher;
    }

    // Logical OR is the fallthrough for the conditional matcher
    getLogicalOr__getLogicalOr = fallthrough;
  }());

  var getLogicalOr__default = getLogicalOr__getLogicalOr;
  //# sourceMappingURL=01-_6to5-logicalOr.js.map

  var getConditional__default = function (parser) {
    var start, expression, ifTrue, ifFalse;

    expression = getLogicalOr__default(parser);
    if (!expression) {
      return null;
    }

    start = parser.pos;

    parser.allowWhitespace();

    if (!parser.matchString("?")) {
      parser.pos = start;
      return expression;
    }

    parser.allowWhitespace();

    ifTrue = parser.readExpression();
    if (!ifTrue) {
      parser.error(shared_errors__expectedExpression);
    }

    parser.allowWhitespace();

    if (!parser.matchString(":")) {
      parser.error("Expected \":\"");
    }

    parser.allowWhitespace();

    ifFalse = parser.readExpression();
    if (!ifFalse) {
      parser.error(shared_errors__expectedExpression);
    }

    return {
      t: types__CONDITIONAL,
      o: [expression, ifTrue, ifFalse]
    };
  };
  //# sourceMappingURL=01-_6to5-conditional.js.map

  var flattenExpression__default = function (expression) {
    var refs = [], flattened;

    flattenExpression__extractRefs(expression, refs);

    flattened = {
      r: refs,
      s: flattenExpression__stringify(this, expression, refs)
    };

    return flattened;
  };

  function flattenExpression__quoteStringLiteral(str) {
    return JSON.stringify(String(str));
  }

  // TODO maybe refactor this?
  function flattenExpression__extractRefs(node, refs) {
    var i, list;

    if (node.t === types__REFERENCE) {
      if (refs.indexOf(node.n) === -1) {
        refs.unshift(node.n);
      }
    }

    list = node.o || node.m;
    if (list) {
      if (is__isObject(list)) {
        flattenExpression__extractRefs(list, refs);
      } else {
        i = list.length;
        while (i--) {
          flattenExpression__extractRefs(list[i], refs);
        }
      }
    }

    if (node.x) {
      flattenExpression__extractRefs(node.x, refs);
    }

    if (node.r) {
      flattenExpression__extractRefs(node.r, refs);
    }

    if (node.v) {
      flattenExpression__extractRefs(node.v, refs);
    }
  }

  function flattenExpression__stringify(parser, node, refs) {
    var stringifyAll = function (item) {
      return flattenExpression__stringify(parser, item, refs);
    };

    switch (node.t) {
      case types__BOOLEAN_LITERAL:
      case types__GLOBAL:
      case types__NUMBER_LITERAL:
        return node.v;

      case types__STRING_LITERAL:
        return flattenExpression__quoteStringLiteral(node.v);

      case types__ARRAY_LITERAL:
        return "[" + (node.m ? node.m.map(stringifyAll).join(",") : "") + "]";

      case types__OBJECT_LITERAL:
        return "{" + (node.m ? node.m.map(stringifyAll).join(",") : "") + "}";

      case types__KEY_VALUE_PAIR:
        return node.k + ":" + flattenExpression__stringify(parser, node.v, refs);

      case types__PREFIX_OPERATOR:
        return (node.s === "typeof" ? "typeof " : node.s) + flattenExpression__stringify(parser, node.o, refs);

      case types__INFIX_OPERATOR:
        return flattenExpression__stringify(parser, node.o[0], refs) + (node.s.substr(0, 2) === "in" ? " " + node.s + " " : node.s) + flattenExpression__stringify(parser, node.o[1], refs);

      case types__INVOCATION:
        return flattenExpression__stringify(parser, node.x, refs) + "(" + (node.o ? node.o.map(stringifyAll).join(",") : "") + ")";

      case types__BRACKETED:
        return "(" + flattenExpression__stringify(parser, node.x, refs) + ")";

      case types__MEMBER:
        return flattenExpression__stringify(parser, node.x, refs) + flattenExpression__stringify(parser, node.r, refs);

      case types__REFINEMENT:
        return (node.n ? "." + node.n : "[" + flattenExpression__stringify(parser, node.x, refs) + "]");

      case types__CONDITIONAL:
        return flattenExpression__stringify(parser, node.o[0], refs) + "?" + flattenExpression__stringify(parser, node.o[1], refs) + ":" + flattenExpression__stringify(parser, node.o[2], refs);

      case types__REFERENCE:
        return "_" + refs.indexOf(node.n);

      default:
        parser.error("Expected legal JavaScript");
    }
  }
  //# sourceMappingURL=01-_6to5-flattenExpression.js.map

  var Parser__Parser, Parser__ParseError, Parser__leadingWhitespace = /^\s+/;

  Parser__ParseError = function (message) {
    this.name = "ParseError";
    this.message = message;
    try {
      throw new Error(message);
    } catch (e) {
      this.stack = e.stack;
    }
  };

  Parser__ParseError.prototype = Error.prototype;

  Parser__Parser = function (str, options) {
    var items, item, lineStart = 0;

    this.str = str;
    this.options = options || {};
    this.pos = 0;

    this.lines = this.str.split("\n");
    this.lineEnds = this.lines.map(function (line) {
      var lineEnd = lineStart + line.length + 1; // +1 for the newline

      lineStart = lineEnd;
      return lineEnd;
    }, 0);

    // Custom init logic
    if (this.init) this.init(str, options);

    items = [];

    while ((this.pos < this.str.length) && (item = this.read())) {
      items.push(item);
    }

    this.leftover = this.remaining();
    this.result = this.postProcess ? this.postProcess(items, options) : items;
  };

  Parser__Parser.prototype = {
    read: function (converters) {
      var pos, i, len, item;

      if (!converters) converters = this.converters;

      pos = this.pos;

      len = converters.length;
      for (i = 0; i < len; i += 1) {
        this.pos = pos; // reset for each attempt

        if (item = converters[i](this)) {
          return item;
        }
      }

      return null;
    },

    readExpression: function () {
      // The conditional operator is the lowest precedence operator (except yield,
      // assignment operators, and commas, none of which are supported), so we
      // start there. If it doesn't match, it 'falls through' to progressively
      // higher precedence operators, until it eventually matches (or fails to
      // match) a 'primary' - a literal or a reference. This way, the abstract syntax
      // tree has everything in its proper place, i.e. 2 + 3 * 4 === 14, not 20.
      return getConditional__default(this);
    },

    flattenExpression: flattenExpression__default,

    getLinePos: function (char) {
      var lineNum = 0, lineStart = 0, columnNum;

      while (char >= this.lineEnds[lineNum]) {
        lineStart = this.lineEnds[lineNum];
        lineNum += 1;
      }

      columnNum = char - lineStart;
      return [lineNum + 1, columnNum + 1, char]; // line/col should be one-based, not zero-based!
    },

    error: function (message) {
      var pos, lineNum, columnNum, line, annotation, error;

      pos = this.getLinePos(this.pos);
      lineNum = pos[0];
      columnNum = pos[1];

      line = this.lines[pos[0] - 1];
      annotation = line + "\n" + new Array(pos[1]).join(" ") + "^----";

      error = new Parser__ParseError(message + " at line " + lineNum + " character " + columnNum + ":\n" + annotation);

      error.line = pos[0];
      error.character = pos[1];
      error.shortMessage = message;

      throw error;
    },

    matchString: function (string) {
      if (this.str.substr(this.pos, string.length) === string) {
        this.pos += string.length;
        return string;
      }
    },

    matchPattern: function (pattern) {
      var match;

      if (match = pattern.exec(this.remaining())) {
        this.pos += match[0].length;
        return match[1] || match[0];
      }
    },

    allowWhitespace: function () {
      this.matchPattern(Parser__leadingWhitespace);
    },

    remaining: function () {
      return this.str.substring(this.pos);
    },

    nextChar: function () {
      return this.str.charAt(this.pos);
    }
  };

  Parser__Parser.extend = function (proto) {
    var Parent = this, Child, key;

    Child = function (str, options) {
      Parser__Parser.call(this, str, options);
    };

    Child.prototype = object__create(Parent.prototype);

    for (key in proto) {
      if (object__hasOwn.call(proto, key)) {
        Child.prototype[key] = proto[key];
      }
    }

    Child.extend = Parser__Parser.extend;
    return Child;
  };

  var Parser__default = Parser__Parser;
  //# sourceMappingURL=01-_6to5-_Parser.js.map

  var parseJSON__JsonParser, parseJSON__specials, parseJSON__specialsPattern, parseJSON__numberPattern, parseJSON__placeholderPattern, parseJSON__placeholderAtStartPattern, parseJSON__onlyWhitespace;

  parseJSON__specials = {
    true: true,
    false: false,
    undefined: undefined,
    null: null
  };

  parseJSON__specialsPattern = new RegExp("^(?:" + Object.keys(parseJSON__specials).join("|") + ")");
  parseJSON__numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
  parseJSON__placeholderPattern = /\$\{([^\}]+)\}/g;
  parseJSON__placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
  parseJSON__onlyWhitespace = /^\s*$/;

  parseJSON__JsonParser = Parser__default.extend({
    init: function (str, options) {
      this.values = options.values;
      this.allowWhitespace();
    },

    postProcess: function (result) {
      if (result.length !== 1 || !parseJSON__onlyWhitespace.test(this.leftover)) {
        return null;
      }

      return { value: result[0].v };
    },

    converters: [function parseJSON__getPlaceholder(parser) {
      var placeholder;

      if (!parser.values) {
        return null;
      }

      placeholder = parser.matchPattern(parseJSON__placeholderAtStartPattern);

      if (placeholder && (parser.values.hasOwnProperty(placeholder))) {
        return { v: parser.values[placeholder] };
      }
    }, function parseJSON__getSpecial(parser) {
      var special;

      if (special = parser.matchPattern(parseJSON__specialsPattern)) {
        return { v: parseJSON__specials[special] };
      }
    }, function parseJSON__getNumber(parser) {
      var number;

      if (number = parser.matchPattern(parseJSON__numberPattern)) {
        return { v: +number };
      }
    }, function parseJSON__getString(parser) {
      var stringLiteral = getStringLiteral__default(parser), values;

      if (stringLiteral && (values = parser.values)) {
        return {
          v: stringLiteral.v.replace(parseJSON__placeholderPattern, function (match, $1) {
            return ($1 in values ? values[$1] : $1);
          })
        };
      }

      return stringLiteral;
    }, function parseJSON__getObject(parser) {
      var result, pair;

      if (!parser.matchString("{")) {
        return null;
      }

      result = {};

      parser.allowWhitespace();

      if (parser.matchString("}")) {
        return { v: result };
      }

      while (pair = parseJSON__getKeyValuePair(parser)) {
        result[pair.key] = pair.value;

        parser.allowWhitespace();

        if (parser.matchString("}")) {
          return { v: result };
        }

        if (!parser.matchString(",")) {
          return null;
        }
      }

      return null;
    }, function parseJSON__getArray(parser) {
      var result, valueToken;

      if (!parser.matchString("[")) {
        return null;
      }

      result = [];

      parser.allowWhitespace();

      if (parser.matchString("]")) {
        return { v: result };
      }

      while (valueToken = parser.read()) {
        result.push(valueToken.v);

        parser.allowWhitespace();

        if (parser.matchString("]")) {
          return { v: result };
        }

        if (!parser.matchString(",")) {
          return null;
        }

        parser.allowWhitespace();
      }

      return null;
    }]
  });

  function parseJSON__getKeyValuePair(parser) {
    var key, valueToken, pair;

    parser.allowWhitespace();

    key = getKey__default(parser);

    if (!key) {
      return null;
    }

    pair = { key: key };

    parser.allowWhitespace();
    if (!parser.matchString(":")) {
      return null;
    }
    parser.allowWhitespace();

    valueToken = parser.read();
    if (!valueToken) {
      return null;
    }

    pair.value = valueToken.v;

    return pair;
  }

  var parseJSON__default = function (str, values) {
    var parser = new parseJSON__JsonParser(str, {
      values: values
    });

    return parser.result;
  };
  //# sourceMappingURL=01-_6to5-parseJSON.js.map

  var prototype_getValue__empty = {};

  function prototype_getValue__Fragment$getValue(options) {
    var _this = this;
    if (options === undefined) options = prototype_getValue__empty;
    return (function () {
      var asArgs, values, source, parsed, cachedResult, dirtyFlag, result;

      asArgs = options.args;

      cachedResult = asArgs ? "argsList" : "value";
      dirtyFlag = asArgs ? "dirtyArgs" : "dirtyValue";

      if (_this[dirtyFlag]) {
        source = prototype_getValue__processItems(_this.items, values = {}, _this.root._guid);
        parsed = parseJSON__default(asArgs ? "[" + source + "]" : source, values);

        if (!parsed) {
          result = asArgs ? [_this.toString()] : _this.toString();
        } else {
          result = parsed.value;
        }

        _this[cachedResult] = result;
        _this[dirtyFlag] = false;
      }

      return _this[cachedResult];
    })();
  };
  var prototype_getValue__default = prototype_getValue__Fragment$getValue;

  function prototype_getValue__processItems(items, values, guid, counter) {
    counter = counter || 0;

    return items.map(function (item) {
      var placeholderId, wrapped, value;

      if (item.text) {
        return item.text;
      }

      if (item.fragments) {
        return item.fragments.map(function (fragment) {
          return prototype_getValue__processItems(fragment.items, values, guid, counter);
        }).join("");
      }

      placeholderId = guid + "-" + counter++;

      if (wrapped = item.root.viewmodel.wrapped[item.keypath]) {
        value = wrapped.value;
      } else {
        value = item.getValue();
      }

      values[placeholderId] = value;

      return "${" + placeholderId + "}";
    }).join("");
  }
  //# sourceMappingURL=01-_6to5-getValue.js.map

  var html__booleanAttributes, html__voidElementNames, html__htmlEntities, html__controlCharacters, html__entityPattern, html__lessThan, html__greaterThan, html__amp;

  // https://github.com/kangax/html-minifier/issues/63#issuecomment-37763316
  html__booleanAttributes = /^(allowFullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultChecked|defaultMuted|defaultSelected|defer|disabled|draggable|enabled|formNoValidate|hidden|indeterminate|inert|isMap|itemScope|loop|multiple|muted|noHref|noResize|noShade|noValidate|noWrap|open|pauseOnExit|readOnly|required|reversed|scoped|seamless|selected|sortable|translate|trueSpeed|typeMustMatch|visible)$/i;
  html__voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;

  html__htmlEntities = { quot: 34, amp: 38, apos: 39, lt: 60, gt: 62, nbsp: 160, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, sect: 167, uml: 168, copy: 169, ordf: 170, laquo: 171, not: 172, shy: 173, reg: 174, macr: 175, deg: 176, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, OElig: 338, oelig: 339, Scaron: 352, scaron: 353, Yuml: 376, fnof: 402, circ: 710, tilde: 732, Alpha: 913, Beta: 914, Gamma: 915, Delta: 916, Epsilon: 917, Zeta: 918, Eta: 919, Theta: 920, Iota: 921, Kappa: 922, Lambda: 923, Mu: 924, Nu: 925, Xi: 926, Omicron: 927, Pi: 928, Rho: 929, Sigma: 931, Tau: 932, Upsilon: 933, Phi: 934, Chi: 935, Psi: 936, Omega: 937, alpha: 945, beta: 946, gamma: 947, delta: 948, epsilon: 949, zeta: 950, eta: 951, theta: 952, iota: 953, kappa: 954, lambda: 955, mu: 956, nu: 957, xi: 958, omicron: 959, pi: 960, rho: 961, sigmaf: 962, sigma: 963, tau: 964, upsilon: 965, phi: 966, chi: 967, psi: 968, omega: 969, thetasym: 977, upsih: 978, piv: 982, ensp: 8194, emsp: 8195, thinsp: 8201, zwnj: 8204, zwj: 8205, lrm: 8206, rlm: 8207, ndash: 8211, mdash: 8212, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, bull: 8226, hellip: 8230, permil: 8240, prime: 8242, Prime: 8243, lsaquo: 8249, rsaquo: 8250, oline: 8254, frasl: 8260, euro: 8364, image: 8465, weierp: 8472, real: 8476, trade: 8482, alefsym: 8501, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596, crarr: 8629, lArr: 8656, uArr: 8657, rArr: 8658, dArr: 8659, hArr: 8660, forall: 8704, part: 8706, exist: 8707, empty: 8709, nabla: 8711, isin: 8712, notin: 8713, ni: 8715, prod: 8719, sum: 8721, minus: 8722, lowast: 8727, radic: 8730, prop: 8733, infin: 8734, ang: 8736, and: 8743, or: 8744, cap: 8745, cup: 8746, int: 8747, there4: 8756, sim: 8764, cong: 8773, asymp: 8776, ne: 8800, equiv: 8801, le: 8804, ge: 8805, sub: 8834, sup: 8835, nsub: 8836, sube: 8838, supe: 8839, oplus: 8853, otimes: 8855, perp: 8869, sdot: 8901, lceil: 8968, rceil: 8969, lfloor: 8970, rfloor: 8971, lang: 9001, rang: 9002, loz: 9674, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830 };
  html__controlCharacters = [8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144, 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376];
  html__entityPattern = new RegExp("&(#?(?:x[\\w\\d]+|\\d+|" + Object.keys(html__htmlEntities).join("|") + "));?", "g");

  function html__decodeCharacterReferences(html) {
    return html.replace(html__entityPattern, function (match, entity) {
      var code;

      // Handle named entities
      if (entity[0] !== "#") {
        code = html__htmlEntities[entity];
      } else if (entity[1] === "x") {
        code = parseInt(entity.substring(2), 16);
      } else {
        code = parseInt(entity.substring(1), 10);
      }

      if (!code) {
        return match;
      }

      return String.fromCharCode(html__validateCode(code));
    });
  }

  // some code points are verboten. If we were inserting HTML, the browser would replace the illegal
  // code points with alternatives in some cases - since we're bypassing that mechanism, we need
  // to replace them ourselves
  //
  // Source: http://en.wikipedia.org/wiki/Character_encodings_in_HTML#Illegal_characters
  function html__validateCode(code) {
    if (!code) {
      return 65533;
    }

    // line feed becomes generic whitespace
    if (code === 10) {
      return 32;
    }

    // ASCII range. (Why someone would use HTML entities for ASCII characters I don't know, but...)
    if (code < 128) {
      return code;
    }

    // code points 128-159 are dealt with leniently by browsers, but they're incorrect. We need
    // to correct the mistake or we'll end up with missing € signs and so on
    if (code <= 159) {
      return html__controlCharacters[code - 128];
    }

    // basic multilingual plane
    if (code < 55296) {
      return code;
    }

    // UTF-16 surrogate halves
    if (code <= 57343) {
      return 65533;
    }

    // rest of the basic multilingual plane
    if (code <= 65535) {
      return code;
    }

    return 65533;
  }

  html__lessThan = /</g;
  html__greaterThan = />/g;
  html__amp = /&/g;

  function html__escapeHtml(str) {
    return str.replace(html__amp, "&amp;").replace(html__lessThan, "&lt;").replace(html__greaterThan, "&gt;");
  }

  var detach__default = function () {
    return dom__detachNode(this.node);
  };
  //# sourceMappingURL=01-_6to5-detach.js.map

  var Text__Text = function (options) {
    this.type = types__TEXT;
    this.text = options.template;
  };

  Text__Text.prototype = {
    detach: detach__default,

    firstNode: function () {
      return this.node;
    },

    render: function () {
      if (!this.node) {
        this.node = document.createTextNode(this.text);
      }

      return this.node;
    },

    toString: function (escape) {
      return escape ? html__escapeHtml(this.text) : this.text;
    },

    unrender: function (shouldDestroy) {
      if (shouldDestroy) {
        return this.detach();
      }
    }
  };

  var Text__default = Text__Text;
  //# sourceMappingURL=01-_6to5-Text.js.map

  function unbind__unbind() {
    if (this.registered) {
      // this was registered as a dependant
      this.root.viewmodel.unregister(this.keypath, this);
    }

    if (this.resolver) {
      this.resolver.unbind();
    }
  };
  var unbind__default = unbind__unbind;
  //# sourceMappingURL=01-_6to5-unbind.js.map

  function getValue__Mustache$getValue() {
    return this.value;
  };
  var getValue__default = getValue__Mustache$getValue;
  //# sourceMappingURL=01-_6to5-getValue.js.map

  var ReferenceResolver__ReferenceResolver = function (owner, ref, callback) {
    var keypath;

    this.ref = ref;
    this.resolved = false;

    this.root = owner.root;
    this.parentFragment = owner.parentFragment;
    this.callback = callback;

    keypath = resolveRef__default(owner.root, ref, owner.parentFragment);
    if (keypath !== undefined) {
      this.resolve(keypath);
    } else {
      runloop__default.addUnresolved(this);
    }
  };

  ReferenceResolver__ReferenceResolver.prototype = {
    resolve: function (keypath) {
      this.resolved = true;

      this.keypath = keypath;
      this.callback(keypath);
    },

    forceResolution: function () {
      this.resolve(this.ref);
    },

    rebind: function (oldKeypath, newKeypath) {
      var keypath;

      if (this.keypath !== undefined) {
        keypath = keypaths__getNewKeypath(this.keypath, oldKeypath, newKeypath);
        // was a new keypath created?
        if (keypath !== undefined) {
          // resolve it
          this.resolve(keypath);
        }
      }
    },

    unbind: function () {
      if (!this.resolved) {
        runloop__default.removeUnresolved(this);
      }
    }
  };


  var ReferenceResolver__default = ReferenceResolver__ReferenceResolver;
  //# sourceMappingURL=01-_6to5-ReferenceResolver.js.map

  var SpecialResolver__SpecialResolver = function (owner, ref, callback) {
    this.parentFragment = owner.parentFragment;
    this.ref = ref;
    this.callback = callback;

    this.rebind();
  };

  var SpecialResolver__props = {
    "@keypath": { prefix: "c", prop: ["context"] },
    "@index": { prefix: "i", prop: ["index"] },
    "@key": { prefix: "k", prop: ["key", "index"] }
  };

  function SpecialResolver__getProp(target, prop) {
    var value;
    for (var i = 0; i < prop.prop.length; i++) {
      if ((value = target[prop.prop[i]]) !== undefined) {
        return value;
      }
    }
  }

  SpecialResolver__SpecialResolver.prototype = {
    rebind: function () {
      var ref = this.ref, fragment = this.parentFragment, prop = SpecialResolver__props[ref], value;

      if (!prop) {
        throw new Error("Unknown special reference \"" + ref + "\" - valid references are @index, @key and @keypath");
      }

      // have we already found the nearest parent?
      if (this.cached) {
        return this.callback("@" + prop.prefix + SpecialResolver__getProp(this.cached, prop));
      }

      // special case for indices, which may cross component boundaries
      if (prop.prop.indexOf("index") !== -1 || prop.prop.indexOf("key") !== -1) {
        while (fragment) {
          if (fragment.owner.currentSubtype === types__SECTION_EACH && (value = SpecialResolver__getProp(fragment, prop)) !== undefined) {
            this.cached = fragment;

            fragment.registerIndexRef(this);

            return this.callback("@" + prop.prefix + value);
          }

          // watch for component boundaries
          if (!fragment.parent && fragment.owner && fragment.owner.component && fragment.owner.component.parentFragment && !fragment.owner.component.instance.isolated) {
            fragment = fragment.owner.component.parentFragment;
          } else {
            fragment = fragment.parent;
          }
        }
      } else {
        while (fragment) {
          if ((value = SpecialResolver__getProp(fragment, prop)) !== undefined) {
            return this.callback("@" + prop.prefix + value);
          }

          fragment = fragment.parent;
        }
      }
    },

    unbind: function () {
      if (this.cached) {
        this.cached.unregisterIndexRef(this);
      }
    }
  };

  var SpecialResolver__default = SpecialResolver__SpecialResolver;
  //# sourceMappingURL=01-_6to5-SpecialResolver.js.map

  var IndexResolver__IndexResolver = function (owner, ref, callback) {
    this.parentFragment = owner.parentFragment;
    this.ref = ref;
    this.callback = callback;

    ref.ref.fragment.registerIndexRef(this);

    this.rebind();
  };

  IndexResolver__IndexResolver.prototype = {
    rebind: function () {
      var index, ref = this.ref.ref;

      if (ref.ref.t === "k") {
        index = "k" + ref.fragment.key;
      } else {
        index = "i" + ref.fragment.index;
      }

      if (index !== undefined) {
        this.callback("@" + index);
      }
    },

    unbind: function () {
      this.ref.ref.fragment.unregisterIndexRef(this);
    }
  };

  var IndexResolver__default = IndexResolver__IndexResolver;
  //# sourceMappingURL=01-_6to5-IndexResolver.js.map

  var findIndexRefs__default = findIndexRefs__findIndexRefs;

  function findIndexRefs__findIndexRefs(fragment, refName) {
    var result = {}, refs, fragRefs, ref, i, owner, hit = false;

    if (!refName) {
      result.refs = refs = {};
    }

    while (fragment) {
      if ((owner = fragment.owner) && (fragRefs = owner.indexRefs)) {
        // we're looking for a particular ref, and it's here
        if (refName && (ref = owner.getIndexRef(refName))) {
          result.ref = {
            fragment: fragment,
            ref: ref
          };
          return result;
        }

        // we're collecting refs up-tree
        else if (!refName) {
          for (i in fragRefs) {
            ref = fragRefs[i];

            // don't overwrite existing refs - they should shadow parents
            if (!refs[ref.n]) {
              hit = true;
              refs[ref.n] = {
                fragment: fragment,
                ref: ref
              };
            }
          }
        }
      }

      // watch for component boundaries
      if (!fragment.parent && fragment.owner && fragment.owner.component && fragment.owner.component.parentFragment && !fragment.owner.component.instance.isolated) {
        result.componentBoundary = true;
        fragment = fragment.owner.component.parentFragment;
      } else {
        fragment = fragment.parent;
      }
    }

    if (!hit) {
      return undefined;
    } else {
      return result;
    }
  }

  findIndexRefs__findIndexRefs.resolve = function findIndexRefs__resolve(indices) {
    var refs = {}, k, ref;

    for (k in indices.refs) {
      ref = indices.refs[k];
      refs[ref.ref.n] = ref.ref.t === "k" ? ref.fragment.key : ref.fragment.index;
    }

    return refs;
  };
  //# sourceMappingURL=01-_6to5-findIndexRefs.js.map

  function createReferenceResolver__createReferenceResolver(owner, ref, callback) {
    var indexRef;

    if (ref.charAt(0) === "@") {
      return new SpecialResolver__default(owner, ref, callback);
    }

    if (indexRef = findIndexRefs__default(owner.parentFragment, ref)) {
      return new IndexResolver__default(owner, indexRef, callback);
    }

    return new ReferenceResolver__default(owner, ref, callback);
  };
  var createReferenceResolver__default = createReferenceResolver__createReferenceResolver;
  //# sourceMappingURL=01-_6to5-createReferenceResolver.js.map

  var getFunctionFromString__cache = {};

  function getFunctionFromString__getFunctionFromString(str, i) {
    var fn, args;

    if (getFunctionFromString__cache[str]) {
      return getFunctionFromString__cache[str];
    }

    args = [];
    while (i--) {
      args[i] = "_" + i;
    }

    fn = new Function(args.join(","), "return(" + str + ")");

    getFunctionFromString__cache[str] = fn;
    return fn;
  };
  var getFunctionFromString__default = getFunctionFromString__getFunctionFromString;
  //# sourceMappingURL=01-_6to5-getFunctionFromString.js.map

  var ExpressionResolver__ExpressionResolver, ExpressionResolver__bind = Function.prototype.bind;

  ExpressionResolver__ExpressionResolver = function (owner, parentFragment, expression, callback) {
    var _this = this;


    var ractive;

    ractive = owner.root;

    this.root = ractive;
    this.parentFragment = parentFragment;
    this.callback = callback;
    this.owner = owner;
    this.str = expression.s;
    this.keypaths = [];

    // Create resolvers for each reference
    this.pending = expression.r.length;
    this.refResolvers = expression.r.map(function (ref, i) {
      return createReferenceResolver__default(_this, ref, function (keypath) {
        _this.resolve(i, keypath);
      });
    });

    this.ready = true;
    this.bubble();
  };

  ExpressionResolver__ExpressionResolver.prototype = {
    bubble: function () {
      if (!this.ready) {
        return;
      }

      this.uniqueString = ExpressionResolver__getUniqueString(this.str, this.keypaths);
      this.keypath = ExpressionResolver__getKeypath(this.uniqueString);

      this.createEvaluator();
      this.callback(this.keypath);
    },

    unbind: function () {
      var resolver;

      while (resolver = this.refResolvers.pop()) {
        resolver.unbind();
      }
    },

    resolve: function (index, keypath) {
      this.keypaths[index] = keypath;
      this.bubble();
    },

    createEvaluator: function () {
      var _this2 = this;
      var computation, valueGetters, signature, keypath, fn;

      computation = this.root.viewmodel.computations[this.keypath];

      // only if it doesn't exist yet!
      if (!computation) {
        fn = getFunctionFromString__default(this.str, this.refResolvers.length);

        valueGetters = this.keypaths.map(function (keypath) {
          var value;

          if (keypath === "undefined") {
            return function () {
              return undefined;
            };
          }

          // 'special' keypaths encode a value
          if (keypath[0] === "@") {
            value = keypaths__decodeKeypath(keypath);
            return function () {
              return value;
            };
          }

          return function () {
            var value = _this2.root.viewmodel.get(keypath, { noUnwrap: true });
            if (typeof value === "function") {
              value = ExpressionResolver__wrapFunction(value, _this2.root);
            }
            return value;
          };
        });

        signature = {
          deps: this.keypaths.filter(ExpressionResolver__isValidDependency),
          get: function () {
            var args = valueGetters.map(ExpressionResolver__call);
            return fn.apply(null, args);
          }
        };

        computation = this.root.viewmodel.compute(this.keypath, signature);
      } else {
        this.root.viewmodel.mark(this.keypath);
      }
    },

    rebind: function (oldKeypath, newKeypath) {
      // TODO only bubble once, no matter how many references are affected by the rebind
      this.refResolvers.forEach(function (r) {
        return r.rebind(oldKeypath, newKeypath);
      });
    }
  };

  var ExpressionResolver__default = ExpressionResolver__ExpressionResolver;

  function ExpressionResolver__call(value) {
    return value.call();
  }

  function ExpressionResolver__getUniqueString(str, keypaths) {
    // get string that is unique to this expression
    return str.replace(/_([0-9]+)/g, function (match, $1) {
      var keypath, value;

      keypath = keypaths[$1];

      if (keypath === undefined) {
        return "undefined";
      }

      if (keypath[0] === "@") {
        value = keypath.slice(1);
        return is__isNumeric(value) ? value : "\"" + value + "\"";
      }

      return keypath;
    });
  }

  function ExpressionResolver__getKeypath(uniqueString) {
    // Sanitize by removing any periods or square brackets. Otherwise
    // we can't split the keypath into keys!
    // Remove asterisks too, since they mess with pattern observers
    return "${" + uniqueString.replace(/[\.\[\]]/g, "-").replace(/\*/, "#MUL#") + "}";
  }

  function ExpressionResolver__isValidDependency(keypath) {
    return keypath !== undefined && keypath[0] !== "@";
  }

  function ExpressionResolver__wrapFunction(fn, ractive) {
    var wrapped, prop, key;

    if (fn.__ractive_nowrap) {
      return fn;
    }

    prop = "__ractive_" + ractive._guid;
    wrapped = fn[prop];

    if (wrapped) {
      return wrapped;
    } else if (/this/.test(fn.toString())) {
      object__defineProperty(fn, prop, {
        value: ExpressionResolver__bind.call(fn, ractive),
        configurable: true
      });

      // Add properties/methods to wrapped function
      for (key in fn) {
        if (fn.hasOwnProperty(key)) {
          fn[prop][key] = fn[key];
        }
      }

      ractive._boundFunctions.push({
        fn: fn,
        prop: prop
      });

      return fn[prop];
    }

    object__defineProperty(fn, "__ractive_nowrap", {
      value: fn
    });

    return fn.__ractive_nowrap;
  }
  //# sourceMappingURL=01-_6to5-ExpressionResolver.js.map

  var MemberResolver__MemberResolver = function (template, resolver, parentFragment) {
    var _this = this;
    var keypath;

    this.resolver = resolver;
    this.root = resolver.root;
    this.parentFragment = parentFragment;
    this.viewmodel = resolver.root.viewmodel;

    if (typeof template === "string") {
      this.value = template;
    }

    // Simple reference?
    else if (template.t === types__REFERENCE) {
      this.refResolver = createReferenceResolver__default(this, template.n, function (keypath) {
        _this.resolve(keypath);
      });
    }

    // Otherwise we have an expression in its own right
    else {
      new ExpressionResolver__default(resolver, parentFragment, template, function (keypath) {
        _this.resolve(keypath);
      });
    }
  };

  MemberResolver__MemberResolver.prototype = {
    resolve: function (keypath) {
      if (this.keypath) {
        this.viewmodel.unregister(this.keypath, this);
      }

      this.keypath = keypath;
      this.value = this.viewmodel.get(keypath);

      this.bind();

      this.resolver.bubble();
    },

    bind: function () {
      this.viewmodel.register(this.keypath, this);
    },

    rebind: function (oldKeypath, newKeypath) {
      if (this.refResolver) {
        this.refResolver.rebind(oldKeypath, newKeypath);
      }
    },

    setValue: function (value) {
      this.value = value;
      this.resolver.bubble();
    },

    unbind: function () {
      if (this.keypath) {
        this.viewmodel.unregister(this.keypath, this);
      }

      if (this.refResolver) {
        this.refResolver.unbind();
      }
    },

    forceResolution: function () {
      if (this.refResolver) {
        this.refResolver.forceResolution();
      }
    }
  };

  var MemberResolver__default = MemberResolver__MemberResolver;
  //# sourceMappingURL=01-_6to5-MemberResolver.js.map

  var ReferenceExpressionResolver__ReferenceExpressionResolver = function (mustache, template, callback) {
    var _this = this;
    var ractive, ref, keypath, parentFragment;

    this.parentFragment = parentFragment = mustache.parentFragment;
    this.root = ractive = mustache.root;
    this.mustache = mustache;

    this.ref = ref = template.r;
    this.callback = callback;

    this.unresolved = [];

    // Find base keypath
    if (keypath = resolveRef__default(ractive, ref, parentFragment)) {
      this.base = keypath;
    } else {
      this.baseResolver = new ReferenceResolver__default(this, ref, function (keypath) {
        _this.base = keypath;
        _this.baseResolver = null;
        _this.bubble();
      });
    }

    // Find values for members, or mark them as unresolved
    this.members = template.m.map(function (template) {
      return new MemberResolver__default(template, _this, parentFragment);
    });

    this.ready = true;
    this.bubble(); // trigger initial resolution if possible
  };

  ReferenceExpressionResolver__ReferenceExpressionResolver.prototype = {
    getKeypath: function () {
      var values = this.members.map(ReferenceExpressionResolver__getValue);

      if (!values.every(ReferenceExpressionResolver__isDefined) || this.baseResolver) {
        return null;
      }

      return this.base + "." + values.join(".");
    },

    bubble: function () {
      if (!this.ready || this.baseResolver) {
        return;
      }

      this.callback(this.getKeypath());
    },

    unbind: function () {
      this.members.forEach(methodCallers__unbind);
    },

    rebind: function (oldKeypath, newKeypath) {
      var changed;

      this.members.forEach(function (members) {
        if (members.rebind(oldKeypath, newKeypath)) {
          changed = true;
        }
      });

      if (changed) {
        this.bubble();
      }
    },

    forceResolution: function () {
      if (this.baseResolver) {
        this.base = this.ref;

        this.baseResolver.unbind();
        this.baseResolver = null;
      }

      this.members.forEach(function (m) {
        return m.forceResolution();
      });
      this.bubble();
    }
  };

  function ReferenceExpressionResolver__getValue(member) {
    return member.value;
  }

  function ReferenceExpressionResolver__isDefined(value) {
    return value != undefined;
  }

  var ReferenceExpressionResolver__default = ReferenceExpressionResolver__ReferenceExpressionResolver;
  //# sourceMappingURL=01-_6to5-ReferenceExpressionResolver.js.map

  function init__Mustache$init(mustache, options) {
    var ref, parentFragment, template;

    parentFragment = options.parentFragment;
    template = options.template;

    mustache.root = parentFragment.root;
    mustache.parentFragment = parentFragment;
    mustache.pElement = parentFragment.pElement;

    mustache.template = options.template;
    mustache.index = options.index || 0;
    mustache.key = options.key;
    mustache.isStatic = options.template.s;

    mustache.type = options.template.t;

    mustache.registered = false;

    // if this is a simple mustache, with a reference, we just need to resolve
    // the reference to a keypath
    if (ref = template.r) {
      mustache.resolver = createReferenceResolver__default(mustache, ref, resolve);
    }

    // if it's an expression, we have a bit more work to do
    if (options.template.x) {
      mustache.resolver = new ExpressionResolver__default(mustache, parentFragment, options.template.x, resolveAndRebindChildren);
    }

    if (options.template.rx) {
      mustache.resolver = new ReferenceExpressionResolver__default(mustache, options.template.rx, resolveAndRebindChildren);
    }

    // Special case - inverted sections
    if (mustache.template.n === types__SECTION_UNLESS && !mustache.hasOwnProperty("value")) {
      mustache.setValue(undefined);
    }

    function resolve(keypath) {
      mustache.resolve(keypath);
    }

    function resolveAndRebindChildren(newKeypath) {
      var oldKeypath = mustache.keypath;

      if (newKeypath !== oldKeypath) {
        mustache.resolve(newKeypath);

        if (oldKeypath !== undefined) {
          mustache.fragments && mustache.fragments.forEach(function (f) {
            f.rebind(oldKeypath, newKeypath);
          });
        }
      }
    }
  };
  var init__default = init__Mustache$init;
  //# sourceMappingURL=01-_6to5-initialise.js.map

  function resolve__Mustache$resolve(keypath) {
    var wasResolved, value, twowayBinding;

    // 'Special' keypaths, e.g. @foo or @7, encode a value
    if (keypath && keypath[0] === "@") {
      this.keypath = keypath;
      this.setValue(keypaths__decodeKeypath(keypath));
      return;
    }

    // If we resolved previously, we need to unregister
    if (this.registered) {
      // undefined or null
      this.root.viewmodel.unregister(this.keypath, this);
      this.registered = false;

      wasResolved = true;
    }

    this.keypath = keypath;

    // If the new keypath exists, we need to register
    // with the viewmodel
    if (keypath != undefined) {
      // undefined or null
      value = this.root.viewmodel.get(keypath);
      this.root.viewmodel.register(keypath, this);

      this.registered = true;
    }

    // Either way we need to queue up a render (`value`
    // will be `undefined` if there's no keypath)
    this.setValue(value);

    // Two-way bindings need to point to their new target keypath
    if (wasResolved && (twowayBinding = this.twowayBinding)) {
      twowayBinding.rebound();
    }
  };
  var resolve__default = resolve__Mustache$resolve;
  //# sourceMappingURL=01-_6to5-resolve.js.map

  function rebind__Mustache$rebind(oldKeypath, newKeypath) {
    // Children first
    if (this.fragments) {
      this.fragments.forEach(function (f) {
        return f.rebind(oldKeypath, newKeypath);
      });
    }

    // Expression mustache?
    if (this.resolver) {
      this.resolver.rebind(oldKeypath, newKeypath);
    }
  };
  var rebind__default = rebind__Mustache$rebind;
  //# sourceMappingURL=01-_6to5-rebind.js.map

  var Mustache__default = {
    getValue: getValue__default,
    init: init__default,
    resolve: resolve__default,
    rebind: rebind__default
  };
  //# sourceMappingURL=01-_6to5-_Mustache.js.map

  var Interpolator__Interpolator = function (options) {
    this.type = types__INTERPOLATOR;
    Mustache__default.init(this, options);
  };

  Interpolator__Interpolator.prototype = {
    update: function () {
      this.node.data = (this.value == undefined ? "" : this.value);
    },
    resolve: Mustache__default.resolve,
    rebind: Mustache__default.rebind,
    detach: detach__default,

    unbind: unbind__default,

    render: function () {
      if (!this.node) {
        this.node = document.createTextNode(this.value != undefined ? this.value : "");
      }

      return this.node;
    },

    unrender: function (shouldDestroy) {
      if (shouldDestroy) {
        dom__detachNode(this.node);
      }
    },

    getValue: Mustache__default.getValue,

    // TEMP
    setValue: function (value) {
      var wrapper;

      // TODO is there a better way to approach this?
      if (wrapper = this.root.viewmodel.wrapped[this.keypath]) {
        value = wrapper.get();
      }

      if (!is__isEqual(value, this.value)) {
        this.value = value;
        this.parentFragment.bubble();

        if (this.node) {
          runloop__default.addView(this);
        }
      }
    },

    firstNode: function () {
      return this.node;
    },

    toString: function (escape) {
      var string = (this.value != undefined ? "" + this.value : "");
      return escape ? html__escapeHtml(string) : string;
    }
  };

  var Interpolator__default = Interpolator__Interpolator;
  //# sourceMappingURL=01-_6to5-Interpolator.js.map

  function bubble__Section$bubble() {
    this.parentFragment.bubble();
  };
  var bubble__default = bubble__Section$bubble;
  //# sourceMappingURL=01-_6to5-bubble.js.map

  function Section_prototype_detach__Section$detach() {
    var docFrag;

    if (this.fragments.length === 1) {
      return this.fragments[0].detach();
    }

    docFrag = document.createDocumentFragment();

    this.fragments.forEach(function (item) {
      docFrag.appendChild(item.detach());
    });

    return docFrag;
  };
  var Section_prototype_detach__default = Section_prototype_detach__Section$detach;
  //# sourceMappingURL=01-_6to5-detach.js.map

  function find__Section$find(selector) {
    var i, len, queryResult;

    len = this.fragments.length;
    for (i = 0; i < len; i += 1) {
      if (queryResult = this.fragments[i].find(selector)) {
        return queryResult;
      }
    }

    return null;
  };
  var find__default = find__Section$find;
  //# sourceMappingURL=01-_6to5-find.js.map

  function findAll__Section$findAll(selector, query) {
    var i, len;

    len = this.fragments.length;
    for (i = 0; i < len; i += 1) {
      this.fragments[i].findAll(selector, query);
    }
  };
  var findAll__default = findAll__Section$findAll;
  //# sourceMappingURL=01-_6to5-findAll.js.map

  function findAllComponents__Section$findAllComponents(selector, query) {
    var i, len;

    len = this.fragments.length;
    for (i = 0; i < len; i += 1) {
      this.fragments[i].findAllComponents(selector, query);
    }
  };
  var findAllComponents__default = findAllComponents__Section$findAllComponents;
  //# sourceMappingURL=01-_6to5-findAllComponents.js.map

  function findComponent__Section$findComponent(selector) {
    var i, len, queryResult;

    len = this.fragments.length;
    for (i = 0; i < len; i += 1) {
      if (queryResult = this.fragments[i].findComponent(selector)) {
        return queryResult;
      }
    }

    return null;
  };
  var findComponent__default = findComponent__Section$findComponent;
  //# sourceMappingURL=01-_6to5-findComponent.js.map

  function findNextNode__Section$findNextNode(fragment) {
    if (this.fragments[fragment.index + 1]) {
      return this.fragments[fragment.index + 1].firstNode();
    }

    return this.parentFragment.findNextNode(this);
  };
  var findNextNode__default = findNextNode__Section$findNextNode;
  //# sourceMappingURL=01-_6to5-findNextNode.js.map

  function firstNode__Section$firstNode() {
    var len, i, node;

    if (len = this.fragments.length) {
      for (i = 0; i < len; i += 1) {
        if (node = this.fragments[i].firstNode()) {
          return node;
        }
      }
    }

    return this.parentFragment.findNextNode(this);
  };
  var firstNode__default = firstNode__Section$firstNode;
  //# sourceMappingURL=01-_6to5-firstNode.js.map

  function shuffle__Section$shuffle(newIndices) {
    var _this = this;
    var parentFragment, firstChange, i, newLength, reboundFragments, fragmentOptions, fragment;

    // short circuit any double-updates, and ensure that this isn't applied to
    // non-list sections
    if (this.shuffling || this.unbound || (this.currentSubtype !== types__SECTION_EACH)) {
      return;
    }

    this.shuffling = true;
    runloop__default.scheduleTask(function () {
      return _this.shuffling = false;
    });

    parentFragment = this.parentFragment;

    reboundFragments = [];

    // TODO: need to update this
    // first, rebind existing fragments
    newIndices.forEach(function (newIndex, oldIndex) {
      var fragment, by, oldKeypath, newKeypath, deps;

      if (newIndex === oldIndex) {
        reboundFragments[newIndex] = _this.fragments[oldIndex];
        return;
      }

      fragment = _this.fragments[oldIndex];

      if (firstChange === undefined) {
        firstChange = oldIndex;
      }

      // does this fragment need to be torn down?
      if (newIndex === -1) {
        _this.fragmentsToUnrender.push(fragment);
        fragment.unbind();
        return;
      }

      // Otherwise, it needs to be rebound to a new index
      by = newIndex - oldIndex;
      oldKeypath = _this.keypath + "." + oldIndex;
      newKeypath = _this.keypath + "." + newIndex;

      fragment.index = newIndex;

      // notify any registered index refs directly
      if (deps = fragment.registeredIndexRefs) {
        deps.forEach(shuffle__blindRebind);
      }

      fragment.rebind(oldKeypath, newKeypath);
      reboundFragments[newIndex] = fragment;
    });

    newLength = this.root.get(this.keypath).length;

    // If nothing changed with the existing fragments, then we start adding
    // new fragments at the end...
    if (firstChange === undefined) {
      // ...unless there are no new fragments to add
      if (this.length === newLength) {
        return;
      }

      firstChange = this.length;
    }

    this.length = this.fragments.length = newLength;

    if (this.rendered) {
      runloop__default.addView(this);
    }

    // Prepare new fragment options
    fragmentOptions = {
      template: this.template.f,
      root: this.root,
      owner: this
    };

    // Add as many new fragments as we need to, or add back existing
    // (detached) fragments
    for (i = firstChange; i < newLength; i += 1) {
      fragment = reboundFragments[i];

      if (!fragment) {
        this.fragmentsToCreate.push(i);
      }

      this.fragments[i] = fragment;
    }
  };
  var shuffle__default = shuffle__Section$shuffle;

  function shuffle__blindRebind(dep) {
    // the keypath doesn't actually matter here as it won't have changed
    dep.rebind("", "");
  }
  //# sourceMappingURL=01-_6to5-shuffle.js.map

  var prototype_rebind__default = function (oldKeypath, newKeypath) {
    Mustache__default.rebind.call(this, oldKeypath, newKeypath);
  };
  //# sourceMappingURL=01-_6to5-rebind.js.map

  function render__Section$render() {
    var _this = this;
    this.docFrag = document.createDocumentFragment();

    this.fragments.forEach(function (f) {
      return _this.docFrag.appendChild(f.render());
    });

    this.renderedFragments = this.fragments.slice();
    this.fragmentsToRender = [];

    this.rendered = true;
    return this.docFrag;
  };
  var render__default = render__Section$render;
  //# sourceMappingURL=01-_6to5-render.js.map

  function setValue__Section$setValue(value) {
    var _this = this;
    var wrapper, fragmentOptions;

    if (this.updating) {
      // If a child of this section causes a re-evaluation - for example, an
      // expression refers to a function that mutates the array that this
      // section depends on - we'll end up with a double rendering bug (see
      // https://github.com/ractivejs/ractive/issues/748). This prevents it.
      return;
    }

    this.updating = true;

    // with sections, we need to get the fake value if we have a wrapped object
    if (wrapper = this.root.viewmodel.wrapped[this.keypath]) {
      value = wrapper.get();
    }

    // If any fragments are awaiting creation after a splice,
    // this is the place to do it
    if (this.fragmentsToCreate.length) {
      fragmentOptions = {
        template: this.template.f,
        root: this.root,
        pElement: this.pElement,
        owner: this
      };

      this.fragmentsToCreate.forEach(function (index) {
        var fragment;

        fragmentOptions.context = setValue__getContext(_this.keypath, index);
        fragmentOptions.index = index;

        fragment = new Fragment__default(fragmentOptions);
        _this.fragmentsToRender.push(_this.fragments[index] = fragment);
      });

      this.fragmentsToCreate.length = 0;
    } else if (setValue__reevaluateSection(this, value)) {
      this.bubble();

      if (this.rendered) {
        runloop__default.addView(this);
      }
    }

    this.value = value;
    this.updating = false;
  };
  var setValue__default = setValue__Section$setValue;

  function setValue__changeCurrentSubtype(section, value, obj) {
    if (value === types__SECTION_EACH) {
      // make sure ref type is up to date for key or value indices
      if (section.indexRefs && section.indexRefs[0]) {
        var ref = section.indexRefs[0];

        // when switching flavors, make sure the section gets updated
        if ((obj && ref.t === "i") || (!obj && ref.t === "k")) {
          // if switching from object to list, unbind all of the old fragments
          if (!obj) {
            section.length = 0;
            section.fragmentsToUnrender = section.fragments.slice(0);
            section.fragmentsToUnrender.forEach(function (f) {
              return f.unbind();
            });
          }
        }

        ref.t = obj ? "k" : "i";
      }
    }

    section.currentSubtype = value;
  }

  function setValue__reevaluateSection(section, value) {
    var fragmentOptions = {
      template: section.template.f,
      root: section.root,
      pElement: section.parentFragment.pElement,
      owner: section
    };

    // If we already know the section type, great
    // TODO can this be optimised? i.e. pick an reevaluateSection function during init
    // and avoid doing this each time?
    if (section.subtype) {
      switch (section.subtype) {
        case types__SECTION_IF:
          return setValue__reevaluateConditionalSection(section, value, false, fragmentOptions);

        case types__SECTION_UNLESS:
          return setValue__reevaluateConditionalSection(section, value, true, fragmentOptions);

        case types__SECTION_WITH:
          return setValue__reevaluateContextSection(section, fragmentOptions);

        case types__SECTION_IF_WITH:
          return setValue__reevaluateConditionalContextSection(section, value, fragmentOptions);

        case types__SECTION_EACH:
          if (is__isObject(value)) {
            setValue__changeCurrentSubtype(section, section.subtype, true);
            return setValue__reevaluateListObjectSection(section, value, fragmentOptions);
          }

          // Fallthrough - if it's a conditional or an array we need to continue
      }
    }

    // Otherwise we need to work out what sort of section we're dealing with
    section.ordered = !!is__isArrayLike(value);

    // Ordered list section
    if (section.ordered) {
      setValue__changeCurrentSubtype(section, types__SECTION_EACH, false);
      return setValue__reevaluateListSection(section, value, fragmentOptions);
    }

    // Unordered list, or context
    if (is__isObject(value) || typeof value === "function") {
      // Index reference indicates section should be treated as a list
      if (section.template.i) {
        setValue__changeCurrentSubtype(section, types__SECTION_EACH, true);
        return setValue__reevaluateListObjectSection(section, value, fragmentOptions);
      }

      // Otherwise, object provides context for contents
      setValue__changeCurrentSubtype(section, types__SECTION_WITH, false);
      return setValue__reevaluateContextSection(section, fragmentOptions);
    }

    // Conditional section
    setValue__changeCurrentSubtype(section, types__SECTION_IF, false);
    return setValue__reevaluateConditionalSection(section, value, false, fragmentOptions);
  }

  function setValue__reevaluateListSection(section, value, fragmentOptions) {
    var i, length, fragment;

    length = value.length;

    if (length === section.length) {
      // Nothing to do
      return false;
    }

    // if the array is shorter than it was previously, remove items
    if (length < section.length) {
      section.fragmentsToUnrender = section.fragments.splice(length, section.length - length);
      section.fragmentsToUnrender.forEach(methodCallers__unbind);
    }

    // otherwise...
    else {
      if (length > section.length) {
        // add any new ones
        for (i = section.length; i < length; i += 1) {
          // append list item to context stack
          fragmentOptions.context = setValue__getContext(section.keypath, i);
          fragmentOptions.index = i;

          fragment = new Fragment__default(fragmentOptions);
          section.fragmentsToRender.push(section.fragments[i] = fragment);
        }
      }
    }

    section.length = length;
    return true;
  }

  function setValue__reevaluateListObjectSection(section, value, fragmentOptions) {
    var id, i, hasKey, fragment, changed, deps;

    hasKey = section.hasKey || (section.hasKey = {});

    // remove any fragments that should no longer exist
    i = section.fragments.length;
    while (i--) {
      fragment = section.fragments[i];

      if (!(fragment.key in value)) {
        changed = true;

        fragment.unbind();
        section.fragmentsToUnrender.push(fragment);
        section.fragments.splice(i, 1);

        hasKey[fragment.key] = false;
      }
    }

    // notify any dependents about changed indices
    i = section.fragments.length;
    while (i--) {
      fragment = section.fragments[i];

      if (fragment.index !== i) {
        fragment.index = i;
        if (deps = fragment.registeredIndexRefs) {
          deps.forEach(setValue__blindRebind);
        }
      }
    }

    // add any that haven't been created yet
    i = section.fragments.length;
    for (id in value) {
      if (!hasKey[id]) {
        changed = true;

        fragmentOptions.context = setValue__getContext(section.keypath, id);
        fragmentOptions.key = id;
        fragmentOptions.index = i++;

        fragment = new Fragment__default(fragmentOptions);

        section.fragmentsToRender.push(fragment);
        section.fragments.push(fragment);
        hasKey[id] = true;
      }
    }

    section.length = section.fragments.length;
    return changed;
  }

  function setValue__reevaluateConditionalContextSection(section, value, fragmentOptions) {
    if (value) {
      return setValue__reevaluateContextSection(section, fragmentOptions);
    } else {
      return setValue__removeSectionFragments(section);
    }
  }

  function setValue__reevaluateContextSection(section, fragmentOptions) {
    var fragment;

    // ...then if it isn't rendered, render it, adding section.keypath to the context stack
    // (if it is already rendered, then any children dependent on the context stack
    // will update themselves without any prompting)
    if (!section.length) {
      // append this section to the context stack
      fragmentOptions.context = section.keypath;
      fragmentOptions.index = 0;

      fragment = new Fragment__default(fragmentOptions);

      section.fragmentsToRender.push(section.fragments[0] = fragment);
      section.length = 1;

      return true;
    }
  }

  function setValue__reevaluateConditionalSection(section, value, inverted, fragmentOptions) {
    var doRender, emptyArray, emptyObject, fragment, name;

    emptyArray = (is__isArrayLike(value) && value.length === 0);
    emptyObject = false;
    if (!is__isArrayLike(value) && is__isObject(value)) {
      emptyObject = true;
      for (name in value) {
        emptyObject = false;
        break;
      }
    }

    if (inverted) {
      doRender = emptyArray || emptyObject || !value;
    } else {
      doRender = value && !emptyArray && !emptyObject;
    }

    if (doRender) {
      if (!section.length) {
        // no change to context stack
        fragmentOptions.index = 0;

        fragment = new Fragment__default(fragmentOptions);
        section.fragmentsToRender.push(section.fragments[0] = fragment);
        section.length = 1;

        return true;
      }

      if (section.length > 1) {
        section.fragmentsToUnrender = section.fragments.splice(1);
        section.fragmentsToUnrender.forEach(methodCallers__unbind);

        return true;
      }
    } else {
      return setValue__removeSectionFragments(section);
    }
  }

  function setValue__removeSectionFragments(section) {
    if (section.length) {
      section.fragmentsToUnrender = section.fragments.splice(0, section.fragments.length).filter(setValue__isRendered);
      section.fragmentsToUnrender.forEach(methodCallers__unbind);
      section.length = section.fragmentsToRender.length = 0;
      return true;
    }
  }

  function setValue__isRendered(fragment) {
    return fragment.rendered;
  }

  function setValue__getContext(base, index) {
    return (base ? base + "." : "") + index;
  }

  function setValue__blindRebind(dep) {
    // the keypath doesn't actually matter here as it won't have changed
    dep.rebind("", "");
  }
  //# sourceMappingURL=01-_6to5-setValue.js.map

  function prototype_toString__Section$toString(escape) {
    var str, i, len;

    str = "";

    i = 0;
    len = this.length;

    for (i = 0; i < len; i += 1) {
      str += this.fragments[i].toString(escape);
    }

    return str;
  };
  var prototype_toString__default = prototype_toString__Section$toString;
  //# sourceMappingURL=01-_6to5-toString.js.map

  function prototype_unbind__Section$unbind() {
    var _this = this;
    this.fragments.forEach(methodCallers__unbind);
    this.fragmentsToRender.forEach(function (f) {
      return array__removeFromArray(_this.fragments, f);
    });
    this.fragmentsToRender = [];
    unbind__default.call(this);

    this.length = 0;
    this.unbound = true;
  };
  var prototype_unbind__default = prototype_unbind__Section$unbind;
  //# sourceMappingURL=01-_6to5-unbind.js.map

  function unrender__Section$unrender(shouldDestroy) {
    this.fragments.forEach(shouldDestroy ? unrender__unrenderAndDestroy : unrender__unrender);
    this.renderedFragments = [];
    this.rendered = false;
  };
  var unrender__default = unrender__Section$unrender;

  function unrender__unrenderAndDestroy(fragment) {
    fragment.unrender(true);
  }

  function unrender__unrender(fragment) {
    fragment.unrender(false);
  }
  //# sourceMappingURL=01-_6to5-unrender.js.map

  function update__Section$update() {
    var fragment, renderIndex, renderedFragments, anchor, target, i, len;

    // `this.renderedFragments` is in the order of the previous render.
    // If fragments have shuffled about, this allows us to quickly
    // reinsert them in the correct place
    renderedFragments = this.renderedFragments;

    // Remove fragments that have been marked for destruction
    while (fragment = this.fragmentsToUnrender.pop()) {
      fragment.unrender(true);
      renderedFragments.splice(renderedFragments.indexOf(fragment), 1);
    }

    // Render new fragments (but don't insert them yet)
    while (fragment = this.fragmentsToRender.shift()) {
      fragment.render();
    }

    if (this.rendered) {
      target = this.parentFragment.getNode();
    }

    len = this.fragments.length;
    for (i = 0; i < len; i += 1) {
      fragment = this.fragments[i];
      renderIndex = renderedFragments.indexOf(fragment, i); // search from current index - it's guaranteed to be the same or higher

      if (renderIndex === i) {
        // already in the right place. insert accumulated nodes (if any) and carry on
        if (this.docFrag.childNodes.length) {
          anchor = fragment.firstNode();
          target.insertBefore(this.docFrag, anchor);
        }

        continue;
      }

      this.docFrag.appendChild(fragment.detach());

      // update renderedFragments
      if (renderIndex !== -1) {
        renderedFragments.splice(renderIndex, 1);
      }
      renderedFragments.splice(i, 0, fragment);
    }

    if (this.rendered && this.docFrag.childNodes.length) {
      anchor = this.parentFragment.findNextNode(this);
      target.insertBefore(this.docFrag, anchor);
    }

    // Save the rendering order for next time
    this.renderedFragments = this.fragments.slice();
  };
  var update__default = update__Section$update;
  //# sourceMappingURL=01-_6to5-update.js.map

  var Section__Section = function (options) {
    this.type = types__SECTION;
    this.subtype = this.currentSubtype = options.template.n;
    this.inverted = this.subtype === types__SECTION_UNLESS;


    this.pElement = options.pElement;

    this.fragments = [];
    this.fragmentsToCreate = [];
    this.fragmentsToRender = [];
    this.fragmentsToUnrender = [];

    if (options.template.i) {
      this.indexRefs = options.template.i.split(",").map(function (k, i) {
        return { n: k, t: i === 0 ? "k" : "i" };
      });
    }

    this.renderedFragments = [];

    this.length = 0; // number of times this section is rendered

    Mustache__default.init(this, options);
  };

  Section__Section.prototype = {
    bubble: bubble__default,
    detach: Section_prototype_detach__default,
    find: find__default,
    findAll: findAll__default,
    findAllComponents: findAllComponents__default,
    findComponent: findComponent__default,
    findNextNode: findNextNode__default,
    firstNode: firstNode__default,
    getIndexRef: function (name) {
      if (this.indexRefs) {
        var i = this.indexRefs.length;
        while (i--) {
          var ref = this.indexRefs[i];
          if (ref.n === name) {
            return ref;
          }
        }
      }
    },
    getValue: Mustache__default.getValue,
    shuffle: shuffle__default,
    rebind: prototype_rebind__default,
    render: render__default,
    resolve: Mustache__default.resolve,
    setValue: setValue__default,
    toString: prototype_toString__default,
    unbind: prototype_unbind__default,
    unrender: unrender__default,
    update: update__default
  };

  var Section__default = Section__Section;
  //# sourceMappingURL=01-_6to5-_Section.js.map

  function Triple_prototype_detach__Triple$detach() {
    var len, i;

    if (this.docFrag) {
      len = this.nodes.length;
      for (i = 0; i < len; i += 1) {
        this.docFrag.appendChild(this.nodes[i]);
      }

      return this.docFrag;
    }
  };
  var Triple_prototype_detach__default = Triple_prototype_detach__Triple$detach;
  //# sourceMappingURL=01-_6to5-detach.js.map

  function Triple_prototype_find__Triple$find(selector) {
    var i, len, node, queryResult;

    len = this.nodes.length;
    for (i = 0; i < len; i += 1) {
      node = this.nodes[i];

      if (node.nodeType !== 1) {
        continue;
      }

      if (dom__matches(node, selector)) {
        return node;
      }

      if (queryResult = node.querySelector(selector)) {
        return queryResult;
      }
    }

    return null;
  };
  var Triple_prototype_find__default = Triple_prototype_find__Triple$find;
  //# sourceMappingURL=01-_6to5-find.js.map

  function Triple_prototype_findAll__Triple$findAll(selector, queryResult) {
    var i, len, node, queryAllResult, numNodes, j;

    len = this.nodes.length;
    for (i = 0; i < len; i += 1) {
      node = this.nodes[i];

      if (node.nodeType !== 1) {
        continue;
      }

      if (dom__matches(node, selector)) {
        queryResult.push(node);
      }

      if (queryAllResult = node.querySelectorAll(selector)) {
        numNodes = queryAllResult.length;
        for (j = 0; j < numNodes; j += 1) {
          queryResult.push(queryAllResult[j]);
        }
      }
    }
  };
  var Triple_prototype_findAll__default = Triple_prototype_findAll__Triple$findAll;
  //# sourceMappingURL=01-_6to5-findAll.js.map

  function Triple_prototype_firstNode__Triple$firstNode() {
    if (this.rendered && this.nodes[0]) {
      return this.nodes[0];
    }

    return this.parentFragment.findNextNode(this);
  };
  var Triple_prototype_firstNode__default = Triple_prototype_firstNode__Triple$firstNode;
  //# sourceMappingURL=01-_6to5-firstNode.js.map

  var insertHtml__elementCache = {}, insertHtml__ieBug, insertHtml__ieBlacklist;

  try {
    dom__createElement("table").innerHTML = "foo";
  } catch (err) {
    insertHtml__ieBug = true;

    insertHtml__ieBlacklist = {
      TABLE: ["<table class=\"x\">", "</table>"],
      THEAD: ["<table><thead class=\"x\">", "</thead></table>"],
      TBODY: ["<table><tbody class=\"x\">", "</tbody></table>"],
      TR: ["<table><tr class=\"x\">", "</tr></table>"],
      SELECT: ["<select class=\"x\">", "</select>"]
    };
  }

  var insertHtml__default = function (html, node, docFrag) {
    var container, nodes = [], wrapper, selectedOption, child, i;

    // render 0 and false
    if (html != null && html !== "") {
      if (insertHtml__ieBug && (wrapper = insertHtml__ieBlacklist[node.tagName])) {
        container = insertHtml__element("DIV");
        container.innerHTML = wrapper[0] + html + wrapper[1];
        container = container.querySelector(".x");

        if (container.tagName === "SELECT") {
          selectedOption = container.options[container.selectedIndex];
        }
      } else if (node.namespaceURI === namespaces__default.svg) {
        container = insertHtml__element("DIV");
        container.innerHTML = "<svg class=\"x\">" + html + "</svg>";
        container = container.querySelector(".x");
      } else {
        container = insertHtml__element(node.tagName);
        container.innerHTML = html;

        if (container.tagName === "SELECT") {
          selectedOption = container.options[container.selectedIndex];
        }
      }

      while (child = container.firstChild) {
        nodes.push(child);
        docFrag.appendChild(child);
      }

      // This is really annoying. Extracting <option> nodes from the
      // temporary container <select> causes the remaining ones to
      // become selected. So now we have to deselect them. IE8, you
      // amaze me. You really do
      // ...and now Chrome too
      if (node.tagName === "SELECT") {
        i = nodes.length;
        while (i--) {
          if (nodes[i] !== selectedOption) {
            nodes[i].selected = false;
          }
        }
      }
    }

    return nodes;
  };

  function insertHtml__element(tagName) {
    return insertHtml__elementCache[tagName] || (insertHtml__elementCache[tagName] = dom__createElement(tagName));
  }
  //# sourceMappingURL=01-_6to5-insertHtml.js.map

  function updateSelect__updateSelect(parentElement) {
    var selectedOptions, option, value;

    if (!parentElement || parentElement.name !== "select" || !parentElement.binding) {
      return;
    }

    selectedOptions = array__toArray(parentElement.node.options).filter(updateSelect__isSelected);

    // If one of them had a `selected` attribute, we need to sync
    // the model to the view
    if (parentElement.getAttribute("multiple")) {
      value = selectedOptions.map(function (o) {
        return o.value;
      });
    } else if (option = selectedOptions[0]) {
      value = option.value;
    }

    if (value !== undefined) {
      parentElement.binding.setValue(value);
    }

    parentElement.bubble();
  };
  var updateSelect__default = updateSelect__updateSelect;

  function updateSelect__isSelected(option) {
    return option.selected;
  }
  //# sourceMappingURL=01-_6to5-updateSelect.js.map

  function Triple_prototype_render__Triple$render() {
    if (this.rendered) {
      throw new Error("Attempted to render an item that was already rendered");
    }

    this.docFrag = document.createDocumentFragment();
    this.nodes = insertHtml__default(this.value, this.parentFragment.getNode(), this.docFrag);

    // Special case - we're inserting the contents of a <select>
    updateSelect__default(this.pElement);

    this.rendered = true;
    return this.docFrag;
  };
  var Triple_prototype_render__default = Triple_prototype_render__Triple$render;
  //# sourceMappingURL=01-_6to5-render.js.map

  function prototype_setValue__Triple$setValue(value) {
    var wrapper;

    // TODO is there a better way to approach this?
    if (wrapper = this.root.viewmodel.wrapped[this.keypath]) {
      value = wrapper.get();
    }

    if (value !== this.value) {
      this.value = value;
      this.parentFragment.bubble();

      if (this.rendered) {
        runloop__default.addView(this);
      }
    }
  };
  var prototype_setValue__default = prototype_setValue__Triple$setValue;
  //# sourceMappingURL=01-_6to5-setValue.js.map

  function Triple_prototype_toString__Triple$toString() {
    return (this.value != undefined ? html__decodeCharacterReferences("" + this.value) : "");
  };
  var Triple_prototype_toString__default = Triple_prototype_toString__Triple$toString;
  //# sourceMappingURL=01-_6to5-toString.js.map

  function prototype_unrender__Triple$unrender(shouldDestroy) {
    if (this.rendered && shouldDestroy) {
      this.nodes.forEach(dom__detachNode);
      this.rendered = false;
    }

    // TODO update live queries
  };
  var prototype_unrender__default = prototype_unrender__Triple$unrender;
  //# sourceMappingURL=01-_6to5-unrender.js.map

  function prototype_update__Triple$update() {
    var node, parentNode;

    if (!this.rendered) {
      return;
    }

    // Remove existing nodes
    while (this.nodes && this.nodes.length) {
      node = this.nodes.pop();
      node.parentNode.removeChild(node);
    }

    // Insert new nodes
    parentNode = this.parentFragment.getNode();

    this.nodes = insertHtml__default(this.value, parentNode, this.docFrag);
    parentNode.insertBefore(this.docFrag, this.parentFragment.findNextNode(this));

    // Special case - we're inserting the contents of a <select>
    updateSelect__default(this.pElement);
  };
  var prototype_update__default = prototype_update__Triple$update;
  //# sourceMappingURL=01-_6to5-update.js.map

  var Triple__Triple = function (options) {
    this.type = types__TRIPLE;
    Mustache__default.init(this, options);
  };

  Triple__Triple.prototype = {
    detach: Triple_prototype_detach__default,
    find: Triple_prototype_find__default,
    findAll: Triple_prototype_findAll__default,
    firstNode: Triple_prototype_firstNode__default,
    getValue: Mustache__default.getValue,
    rebind: Mustache__default.rebind,
    render: Triple_prototype_render__default,
    resolve: Mustache__default.resolve,
    setValue: prototype_setValue__default,
    toString: Triple_prototype_toString__default,
    unbind: unbind__default,
    unrender: prototype_unrender__default,
    update: prototype_update__default
  };

  var Triple__default = Triple__Triple;
  //# sourceMappingURL=01-_6to5-_Triple.js.map

  var Element_prototype_bubble__default = function () {
    this.parentFragment.bubble();
  };
  //# sourceMappingURL=01-_6to5-bubble.js.map

  function Element_prototype_detach__Element$detach() {
    var node = this.node, parentNode;

    if (node) {
      // need to check for parent node - DOM may have been altered
      // by something other than Ractive! e.g. jQuery UI...
      if (parentNode = node.parentNode) {
        parentNode.removeChild(node);
      }

      return node;
    }
  };
  var Element_prototype_detach__default = Element_prototype_detach__Element$detach;
  //# sourceMappingURL=01-_6to5-detach.js.map

  var Element_prototype_find__default = function (selector) {
    if (!this.node) {
      // this element hasn't been rendered yet
      return null;
    }

    if (dom__matches(this.node, selector)) {
      return this.node;
    }

    if (this.fragment && this.fragment.find) {
      return this.fragment.find(selector);
    }
  };
  //# sourceMappingURL=01-_6to5-find.js.map

  var Element_prototype_findAll__default = function (selector, query) {
    // Add this node to the query, if applicable, and register the
    // query on this element
    if (query._test(this, true) && query.live) {
      (this.liveQueries || (this.liveQueries = [])).push(query);
    }

    if (this.fragment) {
      this.fragment.findAll(selector, query);
    }
  };
  //# sourceMappingURL=01-_6to5-findAll.js.map

  var Element_prototype_findAllComponents__default = function (selector, query) {
    if (this.fragment) {
      this.fragment.findAllComponents(selector, query);
    }
  };
  //# sourceMappingURL=01-_6to5-findAllComponents.js.map

  var Element_prototype_findComponent__default = function (selector) {
    if (this.fragment) {
      return this.fragment.findComponent(selector);
    }
  };
  //# sourceMappingURL=01-_6to5-findComponent.js.map

  function Element_prototype_findNextNode__Element$findNextNode() {
    return null;
  };
  var Element_prototype_findNextNode__default = Element_prototype_findNextNode__Element$findNextNode;
  //# sourceMappingURL=01-_6to5-findNextNode.js.map

  function Element_prototype_firstNode__Element$firstNode() {
    return this.node;
  };
  var Element_prototype_firstNode__default = Element_prototype_firstNode__Element$firstNode;
  //# sourceMappingURL=01-_6to5-firstNode.js.map

  function getAttribute__Element$getAttribute(name) {
    if (!this.attributes || !this.attributes[name]) {
      return;
    }

    return this.attributes[name].value;
  };
  var getAttribute__default = getAttribute__Element$getAttribute;
  //# sourceMappingURL=01-_6to5-getAttribute.js.map

  var processBindingAttributes__truthy = /^true|on|yes|1$/i;
  var processBindingAttributes__isNumeric = /^[0-9]+$/;

  var processBindingAttributes__default = function (element, attributes) {
    var val;

    // attributes that are present but don't have a value (=)
    // will be set to the number 0, which we condider to be true
    // the string '0', however is false

    val = attributes.twoway;
    if (val !== undefined) {
      element.twoway = val === 0 || processBindingAttributes__truthy.test(val);
      delete attributes.twoway;
    }

    val = attributes.lazy;
    if (val !== undefined) {
      // check for timeout value
      if (val !== 0 && processBindingAttributes__isNumeric.test(val)) {
        element.lazy = parseInt(val);
      } else {
        element.lazy = val === 0 || processBindingAttributes__truthy.test(val);
      }
      delete attributes.lazy;
    }
  };
  //# sourceMappingURL=01-_6to5-processBindingAttributes.js.map

  function Attribute_prototype_bubble__Attribute$bubble() {
    var value = this.fragment.getValue();

    // TODO this can register the attribute multiple times (see render test
    // 'Attribute with nested mustaches')
    if (!is__isEqual(value, this.value)) {
      // Need to clear old id from ractive.nodes
      if (this.name === "id" && this.value) {
        delete this.root.nodes[this.value];
      }

      this.value = value;

      if (this.name === "value" && this.node) {
        // We need to store the value on the DOM like this so we
        // can retrieve it later without it being coerced to a string
        this.node._ractive.value = value;
      }

      if (this.rendered) {
        runloop__default.addView(this);
      }
    }
  };
  var Attribute_prototype_bubble__default = Attribute_prototype_bubble__Attribute$bubble;
  //# sourceMappingURL=01-_6to5-bubble.js.map

  var enforceCase__svgCamelCaseElements, enforceCase__svgCamelCaseAttributes, enforceCase__createMap, enforceCase__map;
  enforceCase__svgCamelCaseElements = "altGlyph altGlyphDef altGlyphItem animateColor animateMotion animateTransform clipPath feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence foreignObject glyphRef linearGradient radialGradient textPath vkern".split(" ");
  enforceCase__svgCamelCaseAttributes = "attributeName attributeType baseFrequency baseProfile calcMode clipPathUnits contentScriptType contentStyleType diffuseConstant edgeMode externalResourcesRequired filterRes filterUnits glyphRef gradientTransform gradientUnits kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions requiredFeatures specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles surfaceScale systemLanguage tableValues targetX targetY textLength viewBox viewTarget xChannelSelector yChannelSelector zoomAndPan".split(" ");

  enforceCase__createMap = function (items) {
    var map = {}, i = items.length;
    while (i--) {
      map[items[i].toLowerCase()] = items[i];
    }
    return map;
  };

  enforceCase__map = enforceCase__createMap(enforceCase__svgCamelCaseElements.concat(enforceCase__svgCamelCaseAttributes));

  var enforceCase__default = function (elementName) {
    var lowerCaseElementName = elementName.toLowerCase();
    return enforceCase__map[lowerCaseElementName] || lowerCaseElementName;
  };
  //# sourceMappingURL=01-_6to5-enforceCase.js.map

  var determineNameAndNamespace__default = function (attribute, name) {
    var colonIndex, namespacePrefix;

    // are we dealing with a namespaced attribute, e.g. xlink:href?
    colonIndex = name.indexOf(":");
    if (colonIndex !== -1) {
      // looks like we are, yes...
      namespacePrefix = name.substr(0, colonIndex);

      // ...unless it's a namespace *declaration*, which we ignore (on the assumption
      // that only valid namespaces will be used)
      if (namespacePrefix !== "xmlns") {
        name = name.substring(colonIndex + 1);

        attribute.name = enforceCase__default(name);
        attribute.namespace = namespaces__default[namespacePrefix.toLowerCase()];
        attribute.namespacePrefix = namespacePrefix;

        if (!attribute.namespace) {
          throw "Unknown namespace (\"" + namespacePrefix + "\")";
        }

        return;
      }
    }

    // SVG attribute names are case sensitive
    attribute.name = (attribute.element.namespace !== namespaces__default.html ? enforceCase__default(name) : name);
  };
  //# sourceMappingURL=01-_6to5-determineNameAndNamespace.js.map

  function getInterpolator__getInterpolator(attribute) {
    var items = attribute.fragment.items;

    if (items.length !== 1) {
      return;
    }

    if (items[0].type === types__INTERPOLATOR) {
      return items[0];
    }
  };
  var getInterpolator__default = getInterpolator__getInterpolator;
  //# sourceMappingURL=01-_6to5-getInterpolator.js.map

  var determinePropertyName__propertyNames = {
    "accept-charset": "acceptCharset",
    accesskey: "accessKey",
    bgcolor: "bgColor",
    "class": "className",
    codebase: "codeBase",
    colspan: "colSpan",
    contenteditable: "contentEditable",
    datetime: "dateTime",
    dirname: "dirName",
    "for": "htmlFor",
    "http-equiv": "httpEquiv",
    ismap: "isMap",
    maxlength: "maxLength",
    novalidate: "noValidate",
    pubdate: "pubDate",
    readonly: "readOnly",
    rowspan: "rowSpan",
    tabindex: "tabIndex",
    usemap: "useMap"
  };

  var determinePropertyName__default = function (attribute, options) {
    var propertyName;

    if (attribute.pNode && !attribute.namespace && (!options.pNode.namespaceURI || options.pNode.namespaceURI === namespaces__default.html)) {
      propertyName = determinePropertyName__propertyNames[attribute.name] || attribute.name;

      if (options.pNode[propertyName] !== undefined) {
        attribute.propertyName = propertyName;
      }

      // is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
      // node.selected = true rather than node.setAttribute( 'selected', '' )
      if (html__booleanAttributes.test(propertyName) || propertyName === "value") {
        attribute.useProperty = true;
      }
    }
  };
  //# sourceMappingURL=01-_6to5-determinePropertyName.js.map

  function prototype_init__Attribute$init(options) {
    this.type = types__ATTRIBUTE;
    this.element = options.element;
    this.root = options.root;

    determineNameAndNamespace__default(this, options.name);

    // if it's an empty attribute, or just a straight key-value pair, with no
    // mustache shenanigans, set the attribute accordingly and go home
    if (!options.value || typeof options.value === "string") {
      this.value = html__booleanAttributes.test(this.name) ? true : options.value || "";

      return;
    }

    // otherwise we need to do some work

    // share parentFragment with parent element
    this.parentFragment = this.element.parentFragment;

    this.fragment = new Fragment__default({
      template: options.value,
      root: this.root,
      owner: this
    });

    this.value = this.fragment.getValue();


    // Store a reference to this attribute's interpolator, if its fragment
    // takes the form `{{foo}}`. This is necessary for two-way binding and
    // for correctly rendering HTML later
    this.interpolator = getInterpolator__default(this);
    this.isBindable = !!this.interpolator && !this.interpolator.isStatic;

    // can we establish this attribute's property name equivalent?
    determinePropertyName__default(this, options);

    // mark as ready
    this.ready = true;
  };
  var prototype_init__default = prototype_init__Attribute$init;
  //# sourceMappingURL=01-_6to5-init.js.map

  function Attribute_prototype_rebind__Attribute$rebind(oldKeypath, newKeypath) {
    if (this.fragment) {
      this.fragment.rebind(oldKeypath, newKeypath);
    }
  };
  var Attribute_prototype_rebind__default = Attribute_prototype_rebind__Attribute$rebind;
  //# sourceMappingURL=01-_6to5-rebind.js.map

  var Attribute_prototype_render__propertyNames = {
    "accept-charset": "acceptCharset",
    accesskey: "accessKey",
    bgcolor: "bgColor",
    "class": "className",
    codebase: "codeBase",
    colspan: "colSpan",
    contenteditable: "contentEditable",
    datetime: "dateTime",
    dirname: "dirName",
    "for": "htmlFor",
    "http-equiv": "httpEquiv",
    ismap: "isMap",
    maxlength: "maxLength",
    novalidate: "noValidate",
    pubdate: "pubDate",
    readonly: "readOnly",
    rowspan: "rowSpan",
    tabindex: "tabIndex",
    usemap: "useMap"
  };

  function Attribute_prototype_render__Attribute$render(node) {
    var propertyName;

    this.node = node;

    // should we use direct property access, or setAttribute?
    if (!node.namespaceURI || node.namespaceURI === namespaces__default.html) {
      propertyName = Attribute_prototype_render__propertyNames[this.name] || this.name;

      if (node[propertyName] !== undefined) {
        this.propertyName = propertyName;
      }

      // is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
      // node.selected = true rather than node.setAttribute( 'selected', '' )
      if (html__booleanAttributes.test(propertyName) || propertyName === "value") {
        this.useProperty = true;
      }

      if (propertyName === "value") {
        this.useProperty = true;
        node._ractive.value = this.value;
      }
    }

    this.rendered = true;
    this.update();
  };
  var Attribute_prototype_render__default = Attribute_prototype_render__Attribute$render;
  //# sourceMappingURL=01-_6to5-render.js.map

  function Attribute_prototype_toString__Attribute$toString() {
    var _ref = this;
    var name = _ref.name;
    var namespacePrefix = _ref.namespacePrefix;
    var value = _ref.value;
    var interpolator = _ref.interpolator;
    var fragment = _ref.fragment;


    // Special case - select and textarea values (should not be stringified)
    if (name === "value" && (this.element.name === "select" || this.element.name === "textarea")) {
      return;
    }

    // Special case - content editable
    if (name === "value" && this.element.getAttribute("contenteditable") !== undefined) {
      return;
    }

    // Special case - radio names
    if (name === "name" && this.element.name === "input" && interpolator) {
      return "name={{" + (interpolator.keypath || interpolator.ref) + "}}";
    }

    // Boolean attributes
    if (html__booleanAttributes.test(name)) {
      return value ? name : "";
    }

    if (fragment) {
      value = fragment.toString();
    }

    if (namespacePrefix) {
      name = namespacePrefix + ":" + name;
    }

    return value ? name + "=\"" + Attribute_prototype_toString__escape(value) + "\"" : name;
  };
  var Attribute_prototype_toString__default = Attribute_prototype_toString__Attribute$toString;

  function Attribute_prototype_toString__escape(value) {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  //# sourceMappingURL=01-_6to5-toString.js.map

  function Attribute_prototype_unbind__Attribute$unbind() {
    // ignore non-dynamic attributes
    if (this.fragment) {
      this.fragment.unbind();
    }

    if (this.name === "id") {
      delete this.root.nodes[this.value];
    }
  };
  var Attribute_prototype_unbind__default = Attribute_prototype_unbind__Attribute$unbind;
  //# sourceMappingURL=01-_6to5-unbind.js.map

  function updateSelectValue__Attribute$updateSelect() {
    var value = this.value, options, option, optionValue, i;

    if (!this.locked) {
      this.node._ractive.value = value;

      options = this.node.options;
      i = options.length;

      while (i--) {
        option = options[i];
        optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive

        if (optionValue == value) {
          // double equals as we may be comparing numbers with strings
          option.selected = true;
          break;
        }
      }
    }

    // if we're still here, it means the new value didn't match any of the options...
    // TODO figure out what to do in this situation
  };
  var updateSelectValue__default = updateSelectValue__Attribute$updateSelect;
  //# sourceMappingURL=01-_6to5-updateSelectValue.js.map

  function updateMultipleSelectValue__Attribute$updateMultipleSelect() {
    var value = this.value, options, i, option, optionValue;

    if (!is__isArray(value)) {
      value = [value];
    }

    options = this.node.options;
    i = options.length;

    while (i--) {
      option = options[i];
      optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive
      option.selected = array__arrayContains(value, optionValue);
    }
  };
  var updateMultipleSelectValue__default = updateMultipleSelectValue__Attribute$updateMultipleSelect;
  //# sourceMappingURL=01-_6to5-updateMultipleSelectValue.js.map

  function updateRadioName__Attribute$updateRadioName() {
    var _ref = this;
    var node = _ref.node;
    var value = _ref.value;
    node.checked = (value == node._ractive.value);
  };
  var updateRadioName__default = updateRadioName__Attribute$updateRadioName;
  //# sourceMappingURL=01-_6to5-updateRadioName.js.map

  function updateRadioValue__Attribute$updateRadioValue() {
    var wasChecked, node = this.node, binding, bindings, i;

    wasChecked = node.checked;

    node.value = this.element.getAttribute("value");
    node.checked = this.element.getAttribute("value") === this.element.getAttribute("name");

    // This is a special case - if the input was checked, and the value
    // changed so that it's no longer checked, the twoway binding is
    // most likely out of date. To fix it we have to jump through some
    // hoops... this is a little kludgy but it works
    if (wasChecked && !node.checked && this.element.binding) {
      bindings = this.element.binding.siblings;

      if (i = bindings.length) {
        while (i--) {
          binding = bindings[i];

          if (!binding.element.node) {
            // this is the initial render, siblings are still rendering!
            // we'll come back later...
            return;
          }

          if (binding.element.node.checked) {
            runloop__default.addViewmodel(binding.root.viewmodel);
            return binding.handleChange();
          }
        }

        this.root.viewmodel.set(binding.keypath, undefined);
      }
    }
  };
  var updateRadioValue__default = updateRadioValue__Attribute$updateRadioValue;
  //# sourceMappingURL=01-_6to5-updateRadioValue.js.map

  function updateCheckboxName__Attribute$updateCheckboxName() {
    var _ref = this;
    var element = _ref.element;
    var node = _ref.node;
    var value = _ref.value;
    var valueAttribute;
    var i;


    valueAttribute = element.getAttribute("value");

    if (!is__isArray(value)) {
      node.checked = (value == valueAttribute);
    } else {
      i = value.length;
      while (i--) {
        if (valueAttribute == value[i]) {
          node.checked = true;
          return;
        }
      }
      node.checked = false;
    }
  };
  var updateCheckboxName__default = updateCheckboxName__Attribute$updateCheckboxName;
  //# sourceMappingURL=01-_6to5-updateCheckboxName.js.map

  function updateClassName__Attribute$updateClassName() {
    var node, value;

    node = this.node;
    value = this.value;

    if (value === undefined) {
      value = "";
    }

    node.className = value;
  };
  var updateClassName__default = updateClassName__Attribute$updateClassName;
  //# sourceMappingURL=01-_6to5-updateClassName.js.map

  function updateIdAttribute__Attribute$updateIdAttribute() {
    var _ref = this;
    var node = _ref.node;
    var value = _ref.value;


    this.root.nodes[value] = node;
    node.id = value;
  };
  var updateIdAttribute__default = updateIdAttribute__Attribute$updateIdAttribute;
  //# sourceMappingURL=01-_6to5-updateIdAttribute.js.map

  function updateIEStyleAttribute__Attribute$updateIEStyleAttribute() {
    var node, value;

    node = this.node;
    value = this.value;

    if (value === undefined) {
      value = "";
    }

    node.style.setAttribute("cssText", value);
  };
  var updateIEStyleAttribute__default = updateIEStyleAttribute__Attribute$updateIEStyleAttribute;
  //# sourceMappingURL=01-_6to5-updateIEStyleAttribute.js.map

  function updateContentEditableValue__Attribute$updateContentEditableValue() {
    var value = this.value;

    if (value === undefined) {
      value = "";
    }

    if (!this.locked) {
      this.node.innerHTML = value;
    }
  };
  var updateContentEditableValue__default = updateContentEditableValue__Attribute$updateContentEditableValue;
  //# sourceMappingURL=01-_6to5-updateContentEditableValue.js.map

  function updateValue__Attribute$updateValue() {
    var _ref = this;
    var node = _ref.node;
    var value = _ref.value;


    // store actual value, so it doesn't get coerced to a string
    node._ractive.value = value;

    // with two-way binding, only update if the change wasn't initiated by the user
    // otherwise the cursor will often be sent to the wrong place
    if (!this.locked) {
      node.value = (value == undefined ? "" : value);
    }
  };
  var updateValue__default = updateValue__Attribute$updateValue;
  //# sourceMappingURL=01-_6to5-updateValue.js.map

  function updateBoolean__Attribute$updateBooleanAttribute() {
    // with two-way binding, only update if the change wasn't initiated by the user
    // otherwise the cursor will often be sent to the wrong place
    if (!this.locked) {
      this.node[this.propertyName] = this.value;
    }
  };
  var updateBoolean__default = updateBoolean__Attribute$updateBooleanAttribute;
  //# sourceMappingURL=01-_6to5-updateBoolean.js.map

  function updateEverythingElse__Attribute$updateEverythingElse() {
    var _ref = this;
    var node = _ref.node;
    var namespace = _ref.namespace;
    var name = _ref.name;
    var value = _ref.value;
    var fragment = _ref.fragment;


    if (namespace) {
      node.setAttributeNS(namespace, name, (fragment || value).toString());
    } else if (!html__booleanAttributes.test(name)) {
      node.setAttribute(name, (fragment || value).toString());
    }

    // Boolean attributes - truthy becomes '', falsy means 'remove attribute'
    else {
      if (value) {
        node.setAttribute(name, "");
      } else {
        node.removeAttribute(name);
      }
    }
  };
  var updateEverythingElse__default = updateEverythingElse__Attribute$updateEverythingElse;
  //# sourceMappingURL=01-_6to5-updateEverythingElse.js.map

  function Attribute_prototype_update__Attribute$update() {
    var _ref = this;
    var name = _ref.name;
    var element = _ref.element;
    var node = _ref.node;
    var type;
    var updateMethod;


    if (name === "id") {
      updateMethod = updateIdAttribute__default;
    } else if (name === "value") {
      // special case - selects
      if (element.name === "select" && name === "value") {
        updateMethod = element.getAttribute("multiple") ? updateMultipleSelectValue__default : updateSelectValue__default;
      } else if (element.name === "textarea") {
        updateMethod = updateValue__default;
      }

      // special case - contenteditable
      else if (element.getAttribute("contenteditable") != null) {
        updateMethod = updateContentEditableValue__default;
      }

      // special case - <input>
      else if (element.name === "input") {
        type = element.getAttribute("type");

        // type='file' value='{{fileList}}'>
        if (type === "file") {
          updateMethod = noop__default; // read-only
        }

        // type='radio' name='{{twoway}}'
        else if (type === "radio" && element.binding && element.binding.name === "name") {
          updateMethod = updateRadioValue__default;
        } else {
          updateMethod = updateValue__default;
        }
      }
    }

    // special case - <input type='radio' name='{{twoway}}' value='foo'>
    else if (this.twoway && name === "name") {
      if (node.type === "radio") {
        updateMethod = updateRadioName__default;
      } else if (node.type === "checkbox") {
        updateMethod = updateCheckboxName__default;
      }
    }

    // special case - style attributes in Internet Exploder
    else if (name === "style" && node.style.setAttribute) {
      updateMethod = updateIEStyleAttribute__default;
    }

    // special case - class names. IE fucks things up, again
    else if (name === "class" && (!node.namespaceURI || node.namespaceURI === namespaces__default.html)) {
      updateMethod = updateClassName__default;
    } else if (this.useProperty) {
      updateMethod = updateBoolean__default;
    }

    if (!updateMethod) {
      updateMethod = updateEverythingElse__default;
    }

    this.update = updateMethod;
    this.update();
  };
  var Attribute_prototype_update__default = Attribute_prototype_update__Attribute$update;
  //# sourceMappingURL=01-_6to5-update.js.map

  var Attribute__Attribute = function (options) {
    this.init(options);
  };

  Attribute__Attribute.prototype = {
    bubble: Attribute_prototype_bubble__default,
    init: prototype_init__default,
    rebind: Attribute_prototype_rebind__default,
    render: Attribute_prototype_render__default,
    toString: Attribute_prototype_toString__default,
    unbind: Attribute_prototype_unbind__default,
    update: Attribute_prototype_update__default
  };

  var Attribute__default = Attribute__Attribute;
  //# sourceMappingURL=01-_6to5-_Attribute.js.map

  var createAttributes__default = function (element, attributes) {
    var name, attribute, result = [];

    for (name in attributes) {
      if (attributes.hasOwnProperty(name)) {
        attribute = new Attribute__default({
          element: element,
          name: name,
          value: attributes[name],
          root: element.root
        });

        result.push(result[name] = attribute);
      }
    }

    return result;
  };
  //# sourceMappingURL=01-_6to5-createAttributes.js.map

  var ConditionalAttribute__div;

  if (typeof document !== "undefined") {
    ConditionalAttribute__div = dom__createElement("div");
  }

  var ConditionalAttribute__ConditionalAttribute = function (element, template) {
    this.element = element;
    this.root = element.root;
    this.parentFragment = element.parentFragment;

    this.attributes = [];

    this.fragment = new Fragment__default({
      root: element.root,
      owner: this,
      template: [template]
    });
  };

  ConditionalAttribute__ConditionalAttribute.prototype = {
    bubble: function () {
      if (this.node) {
        this.update();
      }

      this.element.bubble();
    },

    rebind: function (oldKeypath, newKeypath) {
      this.fragment.rebind(oldKeypath, newKeypath);
    },

    render: function (node) {
      this.node = node;
      this.isSvg = node.namespaceURI === namespaces__default.svg;

      this.update();
    },

    unbind: function () {
      this.fragment.unbind();
    },

    update: function () {
      var _this = this;
      var str, attrs;

      str = this.fragment.toString();
      attrs = ConditionalAttribute__parseAttributes(str, this.isSvg);

      // any attributes that previously existed but no longer do
      // must be removed
      this.attributes.filter(function (a) {
        return ConditionalAttribute__notIn(attrs, a);
      }).forEach(function (a) {
        _this.node.removeAttribute(a.name);
      });

      attrs.forEach(function (a) {
        _this.node.setAttribute(a.name, a.value);
      });

      this.attributes = attrs;
    },

    toString: function () {
      return this.fragment.toString();
    }
  };

  var ConditionalAttribute__default = ConditionalAttribute__ConditionalAttribute;


  function ConditionalAttribute__parseAttributes(str, isSvg) {
    var tag = isSvg ? "svg" : "div";
    ConditionalAttribute__div.innerHTML = "<" + tag + " " + str + "></" + tag + ">";

    return array__toArray(ConditionalAttribute__div.childNodes[0].attributes);
  }

  function ConditionalAttribute__notIn(haystack, needle) {
    var i = haystack.length;

    while (i--) {
      if (haystack[i].name === needle.name) {
        return false;
      }
    }

    return true;
  }
  //# sourceMappingURL=01-_6to5-_ConditionalAttribute.js.map

  var createConditionalAttributes__default = function (element, attributes) {
    if (!attributes) {
      return [];
    }

    return attributes.map(function (a) {
      return new ConditionalAttribute__default(element, a);
    });
  };
  //# sourceMappingURL=01-_6to5-createConditionalAttributes.js.map

  var Binding__Binding = function (element) {
    var interpolator, keypath, value, parentForm;

    this.element = element;
    this.root = element.root;
    this.attribute = element.attributes[this.name || "value"];

    interpolator = this.attribute.interpolator;
    interpolator.twowayBinding = this;

    if (keypath = interpolator.keypath) {
      if (keypath[keypath.length - 1] === "}") {
        log__default.error({
          debug: this.root.debug,
          message: "noTwowayExpressions",
          args: {
            // won't fix brackets [foo] changed to -foo-
            expression: keypath.slice(2, -1).replace("-", "."),
            element: element.tagName
          }
        });

        return false;
      }
    } else {
      // A mustache may be *ambiguous*. Let's say we were given
      // `value="{{bar}}"`. If the context was `foo`, and `foo.bar`
      // *wasn't* `undefined`, the keypath would be `foo.bar`.
      // Then, any user input would result in `foo.bar` being updated.
      //
      // If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
      // left with an unresolved partial keypath - so we are forced to make an
      // assumption. That assumption is that the input in question should
      // be forced to resolve to `bar`, and any user input would affect `bar`
      // and not `foo.bar`.
      //
      // Did that make any sense? No? Oh. Sorry. Well the moral of the story is
      // be explicit when using two-way data-binding about what keypath you're
      // updating. Using it in lists is probably a recipe for confusion...
      interpolator.resolver.forceResolution();
      keypath = interpolator.keypath;
    }

    this.keypath = keypath;

    // initialise value, if it's undefined
    value = this.root.viewmodel.get(keypath);

    if (value === undefined && this.getInitialValue) {
      value = this.getInitialValue();

      if (value !== undefined) {
        this.root.viewmodel.set(keypath, value);
      }
    }

    if (parentForm = Binding__findParentForm(element)) {
      this.resetValue = value;
      parentForm.formBindings.push(this);
    }
  };

  Binding__Binding.prototype = {
    handleChange: function () {
      var _this = this;
      runloop__default.start(this.root);
      this.attribute.locked = true;
      this.root.viewmodel.set(this.keypath, this.getValue());
      runloop__default.scheduleTask(function () {
        return _this.attribute.locked = false;
      });
      runloop__default.end();
    },

    rebound: function () {
      var bindings, oldKeypath, newKeypath;

      oldKeypath = this.keypath;
      newKeypath = this.attribute.interpolator.keypath;

      // The attribute this binding is linked to has already done the work
      if (oldKeypath === newKeypath) {
        return;
      }

      array__removeFromArray(this.root._twowayBindings[oldKeypath], this);

      this.keypath = newKeypath;

      bindings = this.root._twowayBindings[newKeypath] || (this.root._twowayBindings[newKeypath] = []);
      bindings.push(this);
    },

    unbind: function () {}
  };

  Binding__Binding.extend = function (properties) {
    var Parent = this, SpecialisedBinding;

    SpecialisedBinding = function (element) {
      Binding__Binding.call(this, element);

      if (this.init) {
        this.init();
      }
    };

    SpecialisedBinding.prototype = object__create(Parent.prototype);
    object__extend(SpecialisedBinding.prototype, properties);

    SpecialisedBinding.extend = Binding__Binding.extend;

    return SpecialisedBinding;
  };

  var Binding__default = Binding__Binding;

  function Binding__findParentForm(element) {
    while (element = element.parent) {
      if (element.name === "form") {
        return element;
      }
    }
  }
  //# sourceMappingURL=01-_6to5-Binding.js.map

  // This is the handler for DOM events that would lead to a change in the model
  // (i.e. change, sometimes, input, and occasionally click and keyup)
  function handleDomEvent__handleChange() {
    this._ractive.binding.handleChange();
  };
  var handleDomEvent__default = handleDomEvent__handleChange;
  //# sourceMappingURL=01-_6to5-handleDomEvent.js.map

  var ContentEditableBinding__ContentEditableBinding = Binding__default.extend({
    getInitialValue: function () {
      return this.element.fragment ? this.element.fragment.toString() : "";
    },

    render: function () {
      var node = this.element.node;

      node.addEventListener("change", handleDomEvent__default, false);

      if (!this.root.lazy) {
        node.addEventListener("input", handleDomEvent__default, false);

        if (node.attachEvent) {
          node.addEventListener("keyup", handleDomEvent__default, false);
        }
      }
    },

    unrender: function () {
      var node = this.element.node;

      node.removeEventListener("change", handleDomEvent__default, false);
      node.removeEventListener("input", handleDomEvent__default, false);
      node.removeEventListener("keyup", handleDomEvent__default, false);
    },

    getValue: function () {
      return this.element.node.innerHTML;
    }
  });

  var ContentEditableBinding__default = ContentEditableBinding__ContentEditableBinding;
  //# sourceMappingURL=01-_6to5-ContentEditableBinding.js.map

  var getSiblings__sets = {};

  function getSiblings__getSiblings(id, group, keypath) {
    var hash = id + group + keypath;
    return getSiblings__sets[hash] || (getSiblings__sets[hash] = []);
  };
  var getSiblings__default = getSiblings__getSiblings;
  //# sourceMappingURL=01-_6to5-getSiblings.js.map

  var RadioBinding__RadioBinding = Binding__default.extend({
    name: "checked",

    init: function () {
      this.siblings = getSiblings__default(this.root._guid, "radio", this.element.getAttribute("name"));
      this.siblings.push(this);
    },

    render: function () {
      var node = this.element.node;

      node.addEventListener("change", handleDomEvent__default, false);

      if (node.attachEvent) {
        node.addEventListener("click", handleDomEvent__default, false);
      }
    },

    unrender: function () {
      var node = this.element.node;

      node.removeEventListener("change", handleDomEvent__default, false);
      node.removeEventListener("click", handleDomEvent__default, false);
    },

    handleChange: function () {
      runloop__default.start(this.root);

      this.siblings.forEach(function (binding) {
        binding.root.viewmodel.set(binding.keypath, binding.getValue());
      });

      runloop__default.end();
    },

    getValue: function () {
      return this.element.node.checked;
    },

    unbind: function () {
      array__removeFromArray(this.siblings, this);
    }
  });

  var RadioBinding__default = RadioBinding__RadioBinding;
  //# sourceMappingURL=01-_6to5-RadioBinding.js.map

  var RadioNameBinding__RadioNameBinding = Binding__default.extend({
    name: "name",

    init: function () {
      this.siblings = getSiblings__default(this.root._guid, "radioname", this.keypath);
      this.siblings.push(this);

      this.radioName = true; // so that ractive.updateModel() knows what to do with this
      this.attribute.twoway = true; // we set this property so that the attribute gets the correct update method
    },

    getInitialValue: function () {
      if (this.element.getAttribute("checked")) {
        return this.element.getAttribute("value");
      }
    },

    render: function () {
      var node = this.element.node;

      node.name = "{{" + this.keypath + "}}";
      node.checked = this.root.viewmodel.get(this.keypath) == this.element.getAttribute("value");

      node.addEventListener("change", handleDomEvent__default, false);

      if (node.attachEvent) {
        node.addEventListener("click", handleDomEvent__default, false);
      }
    },

    unrender: function () {
      var node = this.element.node;

      node.removeEventListener("change", handleDomEvent__default, false);
      node.removeEventListener("click", handleDomEvent__default, false);
    },

    getValue: function () {
      var node = this.element.node;
      return node._ractive ? node._ractive.value : node.value;
    },

    handleChange: function () {
      // If this <input> is the one that's checked, then the value of its
      // `name` keypath gets set to its value
      if (this.element.node.checked) {
        Binding__default.prototype.handleChange.call(this);
      }
    },

    rebound: function (oldKeypath, newKeypath) {
      var node;

      Binding__default.prototype.rebound.call(this, oldKeypath, newKeypath);

      if (node = this.element.node) {
        node.name = "{{" + this.keypath + "}}";
      }
    },

    unbind: function () {
      array__removeFromArray(this.siblings, this);
    }
  });

  var RadioNameBinding__default = RadioNameBinding__RadioNameBinding;
  //# sourceMappingURL=01-_6to5-RadioNameBinding.js.map

  var CheckboxNameBinding__CheckboxNameBinding = Binding__default.extend({
    name: "name",

    getInitialValue: function () {
      // This only gets called once per group (of inputs that
      // share a name), because it only gets called if there
      // isn't an initial value. By the same token, we can make
      // a note of that fact that there was no initial value,
      // and populate it using any `checked` attributes that
      // exist (which users should avoid, but which we should
      // support anyway to avoid breaking expectations)
      this.noInitialValue = true;
      return [];
    },

    init: function () {
      var existingValue, bindingValue;

      this.checkboxName = true; // so that ractive.updateModel() knows what to do with this
      this.attribute.twoway = true; // we set this property so that the attribute gets the correct update method

      // Each input has a reference to an array containing it and its
      // siblings, as two-way binding depends on being able to ascertain
      // the status of all inputs within the group
      this.siblings = getSiblings__default(this.root._guid, "checkboxes", this.keypath);
      this.siblings.push(this);

      if (this.noInitialValue) {
        this.siblings.noInitialValue = true;
      }

      // If no initial value was set, and this input is checked, we
      // update the model
      if (this.siblings.noInitialValue && this.element.getAttribute("checked")) {
        existingValue = this.root.viewmodel.get(this.keypath);
        bindingValue = this.element.getAttribute("value");

        existingValue.push(bindingValue);
      }
    },

    unbind: function () {
      array__removeFromArray(this.siblings, this);
    },

    render: function () {
      var node = this.element.node, existingValue, bindingValue;

      existingValue = this.root.viewmodel.get(this.keypath);
      bindingValue = this.element.getAttribute("value");

      if (is__isArray(existingValue)) {
        this.isChecked = array__arrayContains(existingValue, bindingValue);
      } else {
        this.isChecked = existingValue == bindingValue;
      }

      node.name = "{{" + this.keypath + "}}";
      node.checked = this.isChecked;

      node.addEventListener("change", handleDomEvent__default, false);

      // in case of IE emergency, bind to click event as well
      if (node.attachEvent) {
        node.addEventListener("click", handleDomEvent__default, false);
      }
    },

    unrender: function () {
      var node = this.element.node;

      node.removeEventListener("change", handleDomEvent__default, false);
      node.removeEventListener("click", handleDomEvent__default, false);
    },

    changed: function () {
      var wasChecked = !!this.isChecked;
      this.isChecked = this.element.node.checked;
      return this.isChecked === wasChecked;
    },

    handleChange: function () {
      this.isChecked = this.element.node.checked;
      Binding__default.prototype.handleChange.call(this);
    },

    getValue: function () {
      return this.siblings.filter(CheckboxNameBinding__isChecked).map(CheckboxNameBinding__getValue);
    }
  });

  function CheckboxNameBinding__isChecked(binding) {
    return binding.isChecked;
  }

  function CheckboxNameBinding__getValue(binding) {
    return binding.element.getAttribute("value");
  }

  var CheckboxNameBinding__default = CheckboxNameBinding__CheckboxNameBinding;
  //# sourceMappingURL=01-_6to5-CheckboxNameBinding.js.map

  var CheckboxBinding__CheckboxBinding = Binding__default.extend({
    name: "checked",

    render: function () {
      var node = this.element.node;

      node.addEventListener("change", handleDomEvent__default, false);

      if (node.attachEvent) {
        node.addEventListener("click", handleDomEvent__default, false);
      }
    },

    unrender: function () {
      var node = this.element.node;

      node.removeEventListener("change", handleDomEvent__default, false);
      node.removeEventListener("click", handleDomEvent__default, false);
    },

    getValue: function () {
      return this.element.node.checked;
    }
  });

  var CheckboxBinding__default = CheckboxBinding__CheckboxBinding;
  //# sourceMappingURL=01-_6to5-CheckboxBinding.js.map

  var SelectBinding__SelectBinding = Binding__default.extend({
    getInitialValue: function () {
      var options = this.element.options, len, i, value, optionWasSelected;

      if (this.element.getAttribute("value") !== undefined) {
        return;
      }

      i = len = options.length;

      if (!len) {
        return;
      }

      // take the final selected option...
      while (i--) {
        if (options[i].getAttribute("selected")) {
          value = options[i].getAttribute("value");
          optionWasSelected = true;
          break;
        }
      }

      // or the first non-disabled option, if none are selected
      if (!optionWasSelected) {
        while (++i < len) {
          if (!options[i].getAttribute("disabled")) {
            value = options[i].getAttribute("value");
            break;
          }
        }
      }

      // This is an optimisation (aka hack) that allows us to forgo some
      // other more expensive work
      if (value !== undefined) {
        this.element.attributes.value.value = value;
      }

      return value;
    },

    render: function () {
      this.element.node.addEventListener("change", handleDomEvent__default, false);
    },

    unrender: function () {
      this.element.node.removeEventListener("change", handleDomEvent__default, false);
    },

    // TODO this method is an anomaly... is it necessary?
    setValue: function (value) {
      this.root.viewmodel.set(this.keypath, value);
    },

    getValue: function () {
      var options, i, len, option, optionValue;

      options = this.element.node.options;
      len = options.length;

      for (i = 0; i < len; i += 1) {
        option = options[i];

        if (options[i].selected) {
          optionValue = option._ractive ? option._ractive.value : option.value;
          return optionValue;
        }
      }
    },

    forceUpdate: function () {
      var _this = this;
      var value = this.getValue();

      if (value !== undefined) {
        this.attribute.locked = true;
        runloop__default.scheduleTask(function () {
          return _this.attribute.locked = false;
        });
        this.root.viewmodel.set(this.keypath, value);
      }
    }
  });

  var SelectBinding__default = SelectBinding__SelectBinding;
  //# sourceMappingURL=01-_6to5-SelectBinding.js.map

  var MultipleSelectBinding__MultipleSelectBinding = SelectBinding__default.extend({
    getInitialValue: function () {
      return this.element.options.filter(function (option) {
        return option.getAttribute("selected");
      }).map(function (option) {
        return option.getAttribute("value");
      });
    },

    render: function () {
      var valueFromModel;

      this.element.node.addEventListener("change", handleDomEvent__default, false);

      valueFromModel = this.root.viewmodel.get(this.keypath);

      if (valueFromModel === undefined) {
        // get value from DOM, if possible
        this.handleChange();
      }
    },

    unrender: function () {
      this.element.node.removeEventListener("change", handleDomEvent__default, false);
    },

    setValue: function () {
      throw new Error("TODO not implemented yet");
    },

    getValue: function () {
      var selectedValues, options, i, len, option, optionValue;

      selectedValues = [];
      options = this.element.node.options;
      len = options.length;

      for (i = 0; i < len; i += 1) {
        option = options[i];

        if (option.selected) {
          optionValue = option._ractive ? option._ractive.value : option.value;
          selectedValues.push(optionValue);
        }
      }

      return selectedValues;
    },

    handleChange: function () {
      var attribute, previousValue, value;

      attribute = this.attribute;
      previousValue = attribute.value;

      value = this.getValue();

      if (previousValue === undefined || !array__arrayContentsMatch(value, previousValue)) {
        SelectBinding__default.prototype.handleChange.call(this);
      }

      return this;
    },

    forceUpdate: function () {
      var _this = this;
      var value = this.getValue();

      if (value !== undefined) {
        this.attribute.locked = true;
        runloop__default.scheduleTask(function () {
          return _this.attribute.locked = false;
        });
        this.root.viewmodel.set(this.keypath, value);
      }
    },

    updateModel: function () {
      if (this.attribute.value === undefined || !this.attribute.value.length) {
        this.root.viewmodel.set(this.keypath, this.initialValue);
      }
    }
  });

  var MultipleSelectBinding__default = MultipleSelectBinding__MultipleSelectBinding;
  //# sourceMappingURL=01-_6to5-MultipleSelectBinding.js.map

  var FileListBinding__FileListBinding = Binding__default.extend({
    render: function () {
      this.element.node.addEventListener("change", handleDomEvent__default, false);
    },

    unrender: function () {
      this.element.node.removeEventListener("change", handleDomEvent__default, false);
    },

    getValue: function () {
      return this.element.node.files;
    }
  });

  var FileListBinding__default = FileListBinding__FileListBinding;
  //# sourceMappingURL=01-_6to5-FileListBinding.js.map

  var GenericBinding__GenericBinding;

  GenericBinding__GenericBinding = Binding__default.extend({
    getInitialValue: function () {
      return "";
    },

    getValue: function () {
      return this.element.node.value;
    },

    render: function () {
      var node = this.element.node, lazy, timeout = false;
      this.rendered = true;

      // any lazy setting for this element overrides the root
      // if the value is a number, it's a timeout
      lazy = this.root.lazy;
      if (this.element.lazy === true) {
        lazy = true;
      } else if (this.element.lazy === false) {
        lazy = false;
      } else if (is__isNumber(this.element.lazy)) {
        lazy = false;
        timeout = this.element.lazy;
      }

      node.addEventListener("change", handleDomEvent__default, false);

      if (!lazy) {
        node.addEventListener("input", timeout ? GenericBinding__handleDelay : handleDomEvent__default, false);

        if (node.attachEvent) {
          node.addEventListener("keyup", timeout ? GenericBinding__handleDelay : handleDomEvent__default, false);
        }
      }

      node.addEventListener("blur", GenericBinding__handleBlur, false);
    },

    unrender: function () {
      var node = this.element.node;
      this.rendered = false;

      node.removeEventListener("change", handleDomEvent__default, false);
      node.removeEventListener("input", handleDomEvent__default, false);
      node.removeEventListener("keyup", handleDomEvent__default, false);
      node.removeEventListener("blur", GenericBinding__handleBlur, false);
    }
  });

  var GenericBinding__default = GenericBinding__GenericBinding;


  function GenericBinding__handleBlur() {
    var value;

    handleDomEvent__default.call(this);

    value = this._ractive.root.viewmodel.get(this._ractive.binding.keypath);
    this.value = value == undefined ? "" : value;
  }

  function GenericBinding__handleDelay() {
    var binding = this._ractive.binding, el = this;

    if (!!binding._timeout) clearTimeout(binding._timeout);

    binding._timeout = setTimeout(function () {
      if (binding.rendered) handleDomEvent__default.call(el);
      binding._timeout = undefined;
    }, binding.element.lazy);
  }
  //# sourceMappingURL=01-_6to5-GenericBinding.js.map

  var NumericBinding__default = GenericBinding__default.extend({
    getInitialValue: function () {
      return undefined;
    },

    getValue: function () {
      var value = parseFloat(this.element.node.value);
      return isNaN(value) ? undefined : value;
    }
  });
  //# sourceMappingURL=01-_6to5-NumericBinding.js.map

  function createTwowayBinding__createTwowayBinding(element) {
    var attributes = element.attributes, type, Binding, bindName, bindChecked;

    // if this is a late binding, and there's already one, it
    // needs to be torn down
    if (element.binding) {
      element.binding.teardown();
      element.binding = null;
    }

    // contenteditable
    if (
    // if the contenteditable attribute is true or is bindable and may thus become true
    (element.getAttribute("contenteditable") || (!!attributes.contenteditable && createTwowayBinding__isBindable(attributes.contenteditable)))
    // and this element also has a value attribute to bind
     && createTwowayBinding__isBindable(attributes.value)) {
      Binding = ContentEditableBinding__default;
    }

    // <input>
    else if (element.name === "input") {
      type = element.getAttribute("type");

      if (type === "radio" || type === "checkbox") {
        bindName = createTwowayBinding__isBindable(attributes.name);
        bindChecked = createTwowayBinding__isBindable(attributes.checked);

        // we can either bind the name attribute, or the checked attribute - not both
        if (bindName && bindChecked) {
          log__default.error({ message: "badRadioInputBinding" });
        }

        if (bindName) {
          Binding = (type === "radio" ? RadioNameBinding__default : CheckboxNameBinding__default);
        } else if (bindChecked) {
          Binding = (type === "radio" ? RadioBinding__default : CheckboxBinding__default);
        }
      } else if (type === "file" && createTwowayBinding__isBindable(attributes.value)) {
        Binding = FileListBinding__default;
      } else if (createTwowayBinding__isBindable(attributes.value)) {
        Binding = (type === "number" || type === "range") ? NumericBinding__default : GenericBinding__default;
      }
    }

    // <select>
    else if (element.name === "select" && createTwowayBinding__isBindable(attributes.value)) {
      Binding = (element.getAttribute("multiple") ? MultipleSelectBinding__default : SelectBinding__default);
    }

    // <textarea>
    else if (element.name === "textarea" && createTwowayBinding__isBindable(attributes.value)) {
      Binding = GenericBinding__default;
    }

    if (Binding) {
      return new Binding(element);
    }
  };
  var createTwowayBinding__default = createTwowayBinding__createTwowayBinding;

  function createTwowayBinding__isBindable(attribute) {
    return attribute && attribute.isBindable;
  }
  //# sourceMappingURL=01-_6to5-createTwowayBinding.js.map

  function EventHandler_prototype_bubble__EventHandler$bubble() {
    var hasAction = this.getAction();

    if (hasAction && !this.hasListener) {
      this.listen();
    } else if (!hasAction && this.hasListener) {
      this.unrender();
    }
  };
  var EventHandler_prototype_bubble__default = EventHandler_prototype_bubble__EventHandler$bubble;
  //# sourceMappingURL=01-_6to5-bubble.js.map

  function fire__EventHandler$fire(event) {
    fireEvent__default(this.root, this.getAction(), { event: event });
  };
  var fire__default = fire__EventHandler$fire;
  //# sourceMappingURL=01-_6to5-fire.js.map

  function getAction__EventHandler$getAction() {
    return this.action.toString().trim();
  };
  var getAction__default = getAction__EventHandler$getAction;
  //# sourceMappingURL=01-_6to5-getAction.js.map

  var EventHandler_prototype_init__getValueOptions = { args: true }, EventHandler_prototype_init__eventPattern = /^event(?:\.(.+))?/;

  function EventHandler_prototype_init__EventHandler$init(element, name, template) {
    var _this = this;
    var action, refs, ractive, i;

    this.element = element;
    this.root = element.root;
    this.parentFragment = element.parentFragment;
    this.name = name;

    if (name.indexOf("*") !== -1) {
      log__default.error({
        debug: this.root.debug,
        message: "noElementProxyEventWildcards",
        args: {
          element: element.tagName,
          event: name
        }
      });

      this.invalid = true;
    }

    if (template.m) {
      refs = template.a.r;

      // This is a method call
      this.method = template.m;
      this.keypaths = [];
      this.fn = getFunctionFromString__default(template.a.s, refs.length);

      this.parentFragment = element.parentFragment;
      ractive = this.root;

      // Create resolvers for each reference
      this.refResolvers = [];
      refs.forEach(function (ref, i) {
        var match;

        // special case - the `event` object
        if (match = EventHandler_prototype_init__eventPattern.exec(ref)) {
          _this.keypaths[i] = {
            eventObject: true,
            refinements: match[1] ? match[1].split(".") : []
          };
        } else {
          _this.refResolvers.push(createReferenceResolver__default(_this, ref, function (keypath) {
            return _this.resolve(i, keypath);
          }));
        }
      });

      this.fire = EventHandler_prototype_init__fireMethodCall;
    } else {
      // Get action ('foo' in 'on-click='foo')
      action = template.n || template;
      if (typeof action !== "string") {
        action = new Fragment__default({
          template: action,
          root: this.root,
          owner: this
        });
      }

      this.action = action;

      // Get parameters
      if (template.d) {
        this.dynamicParams = new Fragment__default({
          template: template.d,
          root: this.root,
          owner: this.element
        });

        this.fire = EventHandler_prototype_init__fireEventWithDynamicParams;
      } else if (template.a) {
        this.params = template.a;
        this.fire = EventHandler_prototype_init__fireEventWithParams;
      }
    }
  };
  var EventHandler_prototype_init__default = EventHandler_prototype_init__EventHandler$init;


  function EventHandler_prototype_init__fireMethodCall(event) {
    var ractive, values, args;

    ractive = this.root;

    if (typeof ractive[this.method] !== "function") {
      throw new Error("Attempted to call a non-existent method (\"" + this.method + "\")");
    }

    values = this.keypaths.map(function (keypath) {
      var value, len, i;

      if (keypath === undefined) {
        // not yet resolved
        return undefined;
      }

      // TODO the refinements stuff would be better handled at parse time
      if (keypath.eventObject) {
        value = event;

        if (len = keypath.refinements.length) {
          for (i = 0; i < len; i += 1) {
            value = value[keypath.refinements[i]];
          }
        }
      } else {
        value = ractive.viewmodel.get(keypath);
      }

      return value;
    });

    eventStack__default.enqueue(ractive, event);

    args = this.fn.apply(null, values);
    ractive[this.method].apply(ractive, args);

    eventStack__default.dequeue(ractive);
  }

  function EventHandler_prototype_init__fireEventWithParams(event) {
    fireEvent__default(this.root, this.getAction(), { event: event, args: this.params });
  }

  function EventHandler_prototype_init__fireEventWithDynamicParams(event) {
    var args = this.dynamicParams.getValue(EventHandler_prototype_init__getValueOptions);

    // need to strip [] from ends if a string!
    if (typeof args === "string") {
      args = args.substr(1, args.length - 2);
    }

    fireEvent__default(this.root, this.getAction(), { event: event, args: args });
  }
  //# sourceMappingURL=01-_6to5-init.js.map

  function genericHandler__genericHandler(event) {
    var storage, handler, indices, index = {};

    storage = this._ractive;
    handler = storage.events[event.type];

    if (indices = findIndexRefs__default(handler.element.parentFragment)) {
      index = findIndexRefs__default.resolve(indices);
    }

    handler.fire({
      node: this,
      original: event,
      index: index,
      keypath: storage.keypath,
      context: storage.root.get(storage.keypath)
    });
  };
  var genericHandler__default = genericHandler__genericHandler;
  //# sourceMappingURL=01-_6to5-genericHandler.js.map

  var listen__customHandlers = {}, listen__touchEvents = {
    touchstart: true,
    touchmove: true,
    touchend: true,
    touchcancel: true,
    //not w3c, but supported in some browsers
    touchleave: true
  };

  function listen__EventHandler$listen() {
    var definition, name = this.name;

    if (this.invalid) {
      return;
    }

    if (definition = config__default.registries.events.find(this.root, name)) {
      this.custom = definition(this.node, listen__getCustomHandler(name));
    } else {
      // Looks like we're dealing with a standard DOM event... but let's check
      if (!("on" + name in this.node) && !(window && "on" + name in window)) {
        // okay to use touch events if this browser doesn't support them
        if (!listen__touchEvents[name]) {
          log__default.error({
            debug: this.root.debug,
            message: "missingPlugin",
            args: {
              plugin: "event",
              name: name
            }
          });
        }

        return;
      }

      this.node.addEventListener(name, genericHandler__default, false);
    }

    this.hasListener = true;
  };
  var listen__default = listen__EventHandler$listen;

  function listen__getCustomHandler(name) {
    if (!listen__customHandlers[name]) {
      listen__customHandlers[name] = function (event) {
        var storage = event.node._ractive;

        event.index = storage.index;
        event.keypath = storage.keypath;
        event.context = storage.root.get(storage.keypath);

        storage.events[name].fire(event);
      };
    }

    return listen__customHandlers[name];
  }
  //# sourceMappingURL=01-_6to5-listen.js.map

  function EventHandler_prototype_rebind__EventHandler$rebind(oldKeypath, newKeypath) {
    var fragment;
    if (this.method) {
      fragment = this.element.parentFragment;
      this.refResolvers.forEach(rebind);

      return;
    }

    if (typeof this.action !== "string") {
      rebind(this.action);
    }

    if (this.dynamicParams) {
      rebind(this.dynamicParams);
    }

    function rebind(thing) {
      thing && thing.rebind(oldKeypath, newKeypath);
    }
  };
  var EventHandler_prototype_rebind__default = EventHandler_prototype_rebind__EventHandler$rebind;
  //# sourceMappingURL=01-_6to5-rebind.js.map

  function EventHandler_prototype_render__EventHandler$render() {
    this.node = this.element.node;
    // store this on the node itself, so it can be retrieved by a
    // universal handler
    this.node._ractive.events[this.name] = this;

    if (this.method || this.getAction()) {
      this.listen();
    }
  };
  var EventHandler_prototype_render__default = EventHandler_prototype_render__EventHandler$render;
  //# sourceMappingURL=01-_6to5-render.js.map

  function prototype_resolve__EventHandler$resolve(index, keypath) {
    this.keypaths[index] = keypath;
  };
  var prototype_resolve__default = prototype_resolve__EventHandler$resolve;
  //# sourceMappingURL=01-_6to5-resolve.js.map

  function EventHandler_prototype_unbind__EventHandler$unbind() {
    if (this.method) {
      this.refResolvers.forEach(methodCallers__unbind);
      return;
    }

    // Tear down dynamic name
    if (typeof this.action !== "string") {
      this.action.unbind();
    }

    // Tear down dynamic parameters
    if (this.dynamicParams) {
      this.dynamicParams.unbind();
    }
  };
  var EventHandler_prototype_unbind__default = EventHandler_prototype_unbind__EventHandler$unbind;
  //# sourceMappingURL=01-_6to5-unbind.js.map

  function EventHandler_prototype_unrender__EventHandler$unrender() {
    if (this.custom) {
      this.custom.teardown();
    } else {
      this.node.removeEventListener(this.name, genericHandler__default, false);
    }

    this.hasListener = false;
  };
  var EventHandler_prototype_unrender__default = EventHandler_prototype_unrender__EventHandler$unrender;
  //# sourceMappingURL=01-_6to5-unrender.js.map

  var EventHandler__EventHandler = function (element, name, template) {
    this.init(element, name, template);
  };

  EventHandler__EventHandler.prototype = {
    bubble: EventHandler_prototype_bubble__default,
    fire: fire__default,
    getAction: getAction__default,
    init: EventHandler_prototype_init__default,
    listen: listen__default,
    rebind: EventHandler_prototype_rebind__default,
    render: EventHandler_prototype_render__default,
    resolve: prototype_resolve__default,
    unbind: EventHandler_prototype_unbind__default,
    unrender: EventHandler_prototype_unrender__default
  };

  var EventHandler__default = EventHandler__EventHandler;
  //# sourceMappingURL=01-_6to5-_EventHandler.js.map

  var createEventHandlers__default = function (element, template) {
    var i, name, names, handler, result = [];

    for (name in template) {
      if (template.hasOwnProperty(name)) {
        names = name.split("-");
        i = names.length;

        while (i--) {
          handler = new EventHandler__default(element, names[i], template[name]);
          result.push(handler);
        }
      }
    }

    return result;
  };
  //# sourceMappingURL=01-_6to5-createEventHandlers.js.map

  var Decorator__getValueOptions, Decorator__Decorator;

  Decorator__getValueOptions = { args: true };

  Decorator__Decorator = function (element, template) {
    var self = this, ractive, name, fragment;

    this.element = element;
    this.root = ractive = element.root;

    name = template.n || template;

    if (typeof name !== "string") {
      fragment = new Fragment__default({
        template: name,
        root: ractive,
        owner: element
      });

      name = fragment.toString();
      fragment.unbind();

      if (name === "") {
        // empty string okay, just no decorator
        return;
      }
    }

    if (template.a) {
      this.params = template.a;
    } else if (template.d) {
      this.fragment = new Fragment__default({
        template: template.d,
        root: ractive,
        owner: element
      });

      this.params = this.fragment.getValue(Decorator__getValueOptions);

      this.fragment.bubble = function () {
        this.dirtyArgs = this.dirtyValue = true;
        self.params = this.getValue(Decorator__getValueOptions);

        if (self.ready) {
          self.update();
        }
      };
    }

    this.fn = config__default.registries.decorators.find(ractive, name);

    if (!this.fn) {
      log__default.error({
        debug: ractive.debug,
        message: "missingPlugin",
        args: {
          plugin: "decorator",
          name: name
        }
      });
    }
  };

  Decorator__Decorator.prototype = {
    init: function () {
      var node, result, args;

      node = this.element.node;

      if (this.params) {
        args = [node].concat(this.params);
        result = this.fn.apply(this.root, args);
      } else {
        result = this.fn.call(this.root, node);
      }

      if (!result || !result.teardown) {
        throw new Error("Decorator definition must return an object with a teardown method");
      }

      // TODO does this make sense?
      this.actual = result;
      this.ready = true;
    },

    update: function () {
      if (this.actual.update) {
        this.actual.update.apply(this.root, this.params);
      } else {
        this.actual.teardown(true);
        this.init();
      }
    },

    rebind: function (oldKeypath, newKeypath) {
      if (this.fragment) {
        this.fragment.rebind(oldKeypath, newKeypath);
      }
    },

    teardown: function (updating) {
      this.torndown = true;
      if (this.ready) {
        this.actual.teardown();
      }

      if (!updating && this.fragment) {
        this.fragment.unbind();
      }
    }
  };

  var Decorator__default = Decorator__Decorator;
  //# sourceMappingURL=01-_6to5-_Decorator.js.map

  function select__bubble() {
    var _this = this;
    if (!this.dirty) {
      this.dirty = true;

      runloop__default.scheduleTask(function () {
        select__sync(_this);
        _this.dirty = false;
      });
    }

    this.parentFragment.bubble(); // default behaviour
  }

  function select__sync(selectElement) {
    var selectNode, selectValue, isMultiple, options, optionWasSelected;

    selectNode = selectElement.node;

    if (!selectNode) {
      return;
    }

    options = array__toArray(selectNode.options);

    selectValue = selectElement.getAttribute("value");
    isMultiple = selectElement.getAttribute("multiple");

    // If the <select> has a specified value, that should override
    // these options
    if (selectValue !== undefined) {
      options.forEach(function (o) {
        var optionValue, shouldSelect;

        optionValue = o._ractive ? o._ractive.value : o.value;
        shouldSelect = isMultiple ? select__valueContains(selectValue, optionValue) : selectValue == optionValue;

        if (shouldSelect) {
          optionWasSelected = true;
        }

        o.selected = shouldSelect;
      });

      if (!optionWasSelected) {
        if (options[0]) {
          options[0].selected = true;
        }

        if (selectElement.binding) {
          selectElement.binding.forceUpdate();
        }
      }
    }

    // Otherwise the value should be initialised according to which
    // <option> element is selected, if twoway binding is in effect
    else if (selectElement.binding) {
      selectElement.binding.forceUpdate();
    }
  }

  function select__valueContains(selectValue, optionValue) {
    var i = selectValue.length;
    while (i--) {
      if (selectValue[i] == optionValue) {
        return true;
      }
    }
  }
  //# sourceMappingURL=01-_6to5-select.js.map

  function option__init(option, template) {
    option.select = option__findParentSelect(option.parent);

    // we might be inside a <datalist> element
    if (!option.select) {
      return;
    }

    option.select.options.push(option);

    // If the value attribute is missing, use the element's content
    if (!template.a) {
      template.a = {};
    }

    // ...as long as it isn't disabled
    if (template.a.value === undefined && !template.a.hasOwnProperty("disabled")) {
      template.a.value = template.f;
    }

    // If there is a `selected` attribute, but the <select>
    // already has a value, delete it
    if ("selected" in template.a && option.select.getAttribute("value") !== undefined) {
      delete template.a.selected;
    }
  }

  function option__unbind(option) {
    if (option.select) {
      array__removeFromArray(option.select.options, option);
    }
  }

  function option__findParentSelect(element) {
    if (!element) {
      return;
    }

    do {
      if (element.name === "select") {
        return element;
      }
    } while (element = element.parent);
  }
  //# sourceMappingURL=01-_6to5-option.js.map

  function Element_prototype_init__Element$init(options) {
    var parentFragment, template, ractive, binding, bindings, twoway;

    this.type = types__ELEMENT;

    // stuff we'll need later
    parentFragment = this.parentFragment = options.parentFragment;
    template = this.template = options.template;

    this.parent = options.pElement || parentFragment.pElement;

    this.root = ractive = parentFragment.root;
    this.index = options.index;
    this.key = options.key;

    this.name = enforceCase__default(template.e);

    // Special case - <option> elements
    if (this.name === "option") {
      option__init(this, template);
    }

    // Special case - <select> elements
    if (this.name === "select") {
      this.options = [];
      this.bubble = select__bubble; // TODO this is a kludge
    }

    // Special case - <form> elements
    if (this.name === "form") {
      this.formBindings = [];
    }

    // handle binding attributes first (twoway, lazy)
    processBindingAttributes__default(this, template.a || {});

    // create attributes
    this.attributes = createAttributes__default(this, template.a);
    this.conditionalAttributes = createConditionalAttributes__default(this, template.m);

    // append children, if there are any
    if (template.f) {
      this.fragment = new Fragment__default({
        template: template.f,
        root: ractive,
        owner: this,
        pElement: this });
    }

    // the element setting should override the ractive setting
    twoway = ractive.twoway;
    if (this.twoway === false) twoway = false;else if (this.twoway === true) twoway = true;

    // create twoway binding
    if (twoway && (binding = createTwowayBinding__default(this, template.a))) {
      this.binding = binding;

      // register this with the root, so that we can do ractive.updateModel()
      bindings = this.root._twowayBindings[binding.keypath] || (this.root._twowayBindings[binding.keypath] = []);
      bindings.push(binding);
    }

    // create event proxies
    if (template.v) {
      this.eventHandlers = createEventHandlers__default(this, template.v);
    }

    // create decorator
    if (template.o) {
      this.decorator = new Decorator__default(this, template.o);
    }

    // create transitions
    this.intro = template.t0 || template.t1;
    this.outro = template.t0 || template.t2;
  };
  var Element_prototype_init__default = Element_prototype_init__Element$init;
  //# sourceMappingURL=01-_6to5-init.js.map

  function Element_prototype_rebind__Element$rebind(oldKeypath, newKeypath) {
    var i, storage, liveQueries, ractive;

    if (this.attributes) {
      this.attributes.forEach(rebind);
    }

    if (this.conditionalAttributes) {
      this.conditionalAttributes.forEach(rebind);
    }

    if (this.eventHandlers) {
      this.eventHandlers.forEach(rebind);
    }

    if (this.decorator) {
      rebind(this.decorator);
    }

    // rebind children
    if (this.fragment) {
      rebind(this.fragment);
    }

    // Update live queries, if necessary
    if (liveQueries = this.liveQueries) {
      ractive = this.root;

      i = liveQueries.length;
      while (i--) {
        liveQueries[i]._makeDirty();
      }
    }

    if (this.node && (storage = this.node._ractive)) {
      // adjust keypath if needed
      keypaths__assignNewKeypath(storage, "keypath", oldKeypath, newKeypath);
    }

    function rebind(thing) {
      thing.rebind(oldKeypath, newKeypath);
    }
  };
  var Element_prototype_rebind__default = Element_prototype_rebind__Element$rebind;
  //# sourceMappingURL=01-_6to5-rebind.js.map

  function img__render(img) {
    var loadHandler;

    // if this is an <img>, and we're in a crap browser, we may need to prevent it
    // from overriding width and height when it loads the src
    if (img.attributes.width || img.attributes.height) {
      img.node.addEventListener("load", loadHandler = function () {
        var width = img.getAttribute("width"), height = img.getAttribute("height");

        if (width !== undefined) {
          img.node.setAttribute("width", width);
        }

        if (height !== undefined) {
          img.node.setAttribute("height", height);
        }

        img.node.removeEventListener("load", loadHandler, false);
      }, false);
    }
  }
  //# sourceMappingURL=01-_6to5-img.js.map

  function form__render(element) {
    element.node.addEventListener("reset", form__handleReset, false);
  }

  function form__unrender(element) {
    element.node.removeEventListener("reset", form__handleReset, false);
  }

  function form__handleReset() {
    var element = this._ractive.proxy;

    runloop__default.start();
    element.formBindings.forEach(form__updateModel);
    runloop__default.end();
  }

  function form__updateModel(binding) {
    binding.root.viewmodel.set(binding.keypath, binding.resetValue);
  }
  //# sourceMappingURL=01-_6to5-form.js.map

  var Transition_prototype_init__getValueOptions = {}; // TODO what are the options?

  function Transition_prototype_init__Transition$init(element, template, isIntro) {
    var ractive, name, fragment;

    this.element = element;
    this.root = ractive = element.root;
    this.isIntro = isIntro;

    name = template.n || template;

    if (typeof name !== "string") {
      fragment = new Fragment__default({
        template: name,
        root: ractive,
        owner: element
      });

      name = fragment.toString();
      fragment.unbind();

      if (name === "") {
        // empty string okay, just no transition
        return;
      }
    }

    this.name = name;

    if (template.a) {
      this.params = template.a;
    } else if (template.d) {
      // TODO is there a way to interpret dynamic arguments without all the
      // 'dependency thrashing'?
      fragment = new Fragment__default({
        template: template.d,
        root: ractive,
        owner: element
      });

      this.params = fragment.getValue(Transition_prototype_init__getValueOptions);
      fragment.unbind();
    }

    this._fn = config__default.registries.transitions.find(ractive, name);

    if (!this._fn) {
      log__default.error({
        debug: ractive.debug,
        message: "missingPlugin",
        args: {
          plugin: "transition",
          name: name
        }
      });
    }
  };
  var Transition_prototype_init__default = Transition_prototype_init__Transition$init;
  //# sourceMappingURL=01-_6to5-init.js.map

  var camelCase__default = function (hyphenatedStr) {
    return hyphenatedStr.replace(/-([a-zA-Z])/g, function (match, $1) {
      return $1.toUpperCase();
    });
  };
  //# sourceMappingURL=01-_6to5-camelCase.js.map

  var prefix__prefix, prefix__prefixCache, prefix__testStyle;

  if (!environment__isClient) {
    prefix__prefix = null;
  } else {
    prefix__prefixCache = {};
    prefix__testStyle = dom__createElement("div").style;

    prefix__prefix = function (prop) {
      var i, vendor, capped;

      prop = camelCase__default(prop);

      if (!prefix__prefixCache[prop]) {
        if (prefix__testStyle[prop] !== undefined) {
          prefix__prefixCache[prop] = prop;
        } else {
          // test vendors...
          capped = prop.charAt(0).toUpperCase() + prop.substring(1);

          i = vendors__default.length;
          while (i--) {
            vendor = vendors__default[i];
            if (prefix__testStyle[vendor + capped] !== undefined) {
              prefix__prefixCache[prop] = vendor + capped;
              break;
            }
          }
        }
      }

      return prefix__prefixCache[prop];
    };
  }

  var prefix__default = prefix__prefix;
  //# sourceMappingURL=01-_6to5-prefix.js.map

  var getStyle__getStyle, getStyle__getComputedStyle;

  if (!environment__isClient) {
    getStyle__getStyle = null;
  } else {
    getStyle__getComputedStyle = window.getComputedStyle || legacy__default.getComputedStyle;

    getStyle__getStyle = function (props) {
      var computedStyle, styles, i, prop, value;

      computedStyle = getStyle__getComputedStyle(this.node);

      if (typeof props === "string") {
        value = computedStyle[prefix__default(props)];
        if (value === "0px") {
          value = 0;
        }
        return value;
      }

      if (!is__isArray(props)) {
        throw new Error("Transition$getStyle must be passed a string, or an array of strings representing CSS properties");
      }

      styles = {};

      i = props.length;
      while (i--) {
        prop = props[i];
        value = computedStyle[prefix__default(prop)];
        if (value === "0px") {
          value = 0;
        }
        styles[prop] = value;
      }

      return styles;
    };
  }

  var getStyle__default = getStyle__getStyle;
  //# sourceMappingURL=01-_6to5-getStyle.js.map

  var setStyle__default = function (style, value) {
    var prop;

    if (typeof style === "string") {
      this.node.style[prefix__default(style)] = value;
    } else {
      for (prop in style) {
        if (style.hasOwnProperty(prop)) {
          this.node.style[prefix__default(prop)] = style[prop];
        }
      }
    }

    return this;
  };
  //# sourceMappingURL=01-_6to5-setStyle.js.map

  var Ticker__Ticker = function (options) {
    var easing;

    this.duration = options.duration;
    this.step = options.step;
    this.complete = options.complete;

    // easing
    if (typeof options.easing === "string") {
      easing = options.root.easing[options.easing];

      if (!easing) {
        warn__default("Missing easing function (\"" + options.easing + "\"). You may need to download a plugin from [TODO]");
        easing = Ticker__linear;
      }
    } else if (typeof options.easing === "function") {
      easing = options.easing;
    } else {
      easing = Ticker__linear;
    }

    this.easing = easing;

    this.start = getTime__default();
    this.end = this.start + this.duration;

    this.running = true;
    animations__default.add(this);
  };

  Ticker__Ticker.prototype = {
    tick: function (now) {
      var elapsed, eased;

      if (!this.running) {
        return false;
      }

      if (now > this.end) {
        if (this.step) {
          this.step(1);
        }

        if (this.complete) {
          this.complete(1);
        }

        return false;
      }

      elapsed = now - this.start;
      eased = this.easing(elapsed / this.duration);

      if (this.step) {
        this.step(eased);
      }

      return true;
    },

    stop: function () {
      if (this.abort) {
        this.abort();
      }

      this.running = false;
    }
  };

  var Ticker__default = Ticker__Ticker;
  function Ticker__linear(t) {
    return t;
  }
  //# sourceMappingURL=01-_6to5-Ticker.js.map

  var unprefix__unprefixPattern = new RegExp("^-(?:" + vendors__default.join("|") + ")-");

  var unprefix__default = function (prop) {
    return prop.replace(unprefix__unprefixPattern, "");
  };
  //# sourceMappingURL=01-_6to5-unprefix.js.map

  var hyphenate__vendorPattern = new RegExp("^(?:" + vendors__default.join("|") + ")([A-Z])");

  var hyphenate__default = function (str) {
    var hyphenated;

    if (!str) {
      return ""; // edge case
    }

    if (hyphenate__vendorPattern.test(str)) {
      str = "-" + str;
    }

    hyphenated = str.replace(/[A-Z]/g, function (match) {
      return "-" + match.toLowerCase();
    });

    return hyphenated;
  };
  //# sourceMappingURL=01-_6to5-hyphenate.js.map

  var createTransitions__createTransitions, createTransitions__testStyle, createTransitions__TRANSITION, createTransitions__TRANSITIONEND, createTransitions__CSS_TRANSITIONS_ENABLED, createTransitions__TRANSITION_DURATION, createTransitions__TRANSITION_PROPERTY, createTransitions__TRANSITION_TIMING_FUNCTION, createTransitions__canUseCssTransitions = {}, createTransitions__cannotUseCssTransitions = {};

  if (!environment__isClient) {
    createTransitions__createTransitions = null;
  } else {
    createTransitions__testStyle = dom__createElement("div").style;

    // determine some facts about our environment
    (function () {
      if (createTransitions__testStyle.transition !== undefined) {
        createTransitions__TRANSITION = "transition";
        createTransitions__TRANSITIONEND = "transitionend";
        createTransitions__CSS_TRANSITIONS_ENABLED = true;
      } else if (createTransitions__testStyle.webkitTransition !== undefined) {
        createTransitions__TRANSITION = "webkitTransition";
        createTransitions__TRANSITIONEND = "webkitTransitionEnd";
        createTransitions__CSS_TRANSITIONS_ENABLED = true;
      } else {
        createTransitions__CSS_TRANSITIONS_ENABLED = false;
      }
    }());

    if (createTransitions__TRANSITION) {
      createTransitions__TRANSITION_DURATION = createTransitions__TRANSITION + "Duration";
      createTransitions__TRANSITION_PROPERTY = createTransitions__TRANSITION + "Property";
      createTransitions__TRANSITION_TIMING_FUNCTION = createTransitions__TRANSITION + "TimingFunction";
    }

    createTransitions__createTransitions = function (t, to, options, changedProperties, resolve) {
      // Wait a beat (otherwise the target styles will be applied immediately)
      // TODO use a fastdom-style mechanism?
      setTimeout(function () {
        var hashPrefix, jsTransitionsComplete, cssTransitionsComplete, checkComplete, transitionEndHandler;

        checkComplete = function () {
          if (jsTransitionsComplete && cssTransitionsComplete) {
            // will changes to events and fire have an unexpected consequence here?
            t.root.fire(t.name + ":end", t.node, t.isIntro);
            resolve();
          }
        };

        // this is used to keep track of which elements can use CSS to animate
        // which properties
        hashPrefix = (t.node.namespaceURI || "") + t.node.tagName;

        t.node.style[createTransitions__TRANSITION_PROPERTY] = changedProperties.map(prefix__default).map(hyphenate__default).join(",");
        t.node.style[createTransitions__TRANSITION_TIMING_FUNCTION] = hyphenate__default(options.easing || "linear");
        t.node.style[createTransitions__TRANSITION_DURATION] = (options.duration / 1000) + "s";

        transitionEndHandler = function (event) {
          var index;

          index = changedProperties.indexOf(camelCase__default(unprefix__default(event.propertyName)));
          if (index !== -1) {
            changedProperties.splice(index, 1);
          }

          if (changedProperties.length) {
            // still transitioning...
            return;
          }

          t.node.removeEventListener(createTransitions__TRANSITIONEND, transitionEndHandler, false);

          cssTransitionsComplete = true;
          checkComplete();
        };

        t.node.addEventListener(createTransitions__TRANSITIONEND, transitionEndHandler, false);

        setTimeout(function () {
          var i = changedProperties.length, hash, originalValue, index, propertiesToTransitionInJs = [], prop, suffix;

          while (i--) {
            prop = changedProperties[i];
            hash = hashPrefix + prop;

            if (createTransitions__CSS_TRANSITIONS_ENABLED && !createTransitions__cannotUseCssTransitions[hash]) {
              t.node.style[prefix__default(prop)] = to[prop];

              // If we're not sure if CSS transitions are supported for
              // this tag/property combo, find out now
              if (!createTransitions__canUseCssTransitions[hash]) {
                originalValue = t.getStyle(prop);

                // if this property is transitionable in this browser,
                // the current style will be different from the target style
                createTransitions__canUseCssTransitions[hash] = (t.getStyle(prop) != to[prop]);
                createTransitions__cannotUseCssTransitions[hash] = !createTransitions__canUseCssTransitions[hash];

                // Reset, if we're going to use timers after all
                if (createTransitions__cannotUseCssTransitions[hash]) {
                  t.node.style[prefix__default(prop)] = originalValue;
                }
              }
            }

            if (!createTransitions__CSS_TRANSITIONS_ENABLED || createTransitions__cannotUseCssTransitions[hash]) {
              // we need to fall back to timer-based stuff
              if (originalValue === undefined) {
                originalValue = t.getStyle(prop);
              }

              // need to remove this from changedProperties, otherwise transitionEndHandler
              // will get confused
              index = changedProperties.indexOf(prop);
              if (index === -1) {
                warn__default("Something very strange happened with transitions. If you see this message, please let @RactiveJS know. Thanks!");
              } else {
                changedProperties.splice(index, 1);
              }

              // TODO Determine whether this property is animatable at all

              suffix = /[^\d]*$/.exec(to[prop])[0];

              // ...then kick off a timer-based transition
              propertiesToTransitionInJs.push({
                name: prefix__default(prop),
                interpolator: interpolate__default(parseFloat(originalValue), parseFloat(to[prop])),
                suffix: suffix
              });
            }
          }


          // javascript transitions
          if (propertiesToTransitionInJs.length) {
            new Ticker__default({
              root: t.root,
              duration: options.duration,
              easing: camelCase__default(options.easing || ""),
              step: function (pos) {
                var prop, i;

                i = propertiesToTransitionInJs.length;
                while (i--) {
                  prop = propertiesToTransitionInJs[i];
                  t.node.style[prop.name] = prop.interpolator(pos) + prop.suffix;
                }
              },
              complete: function () {
                jsTransitionsComplete = true;
                checkComplete();
              }
            });
          } else {
            jsTransitionsComplete = true;
          }


          if (!changedProperties.length) {
            // We need to cancel the transitionEndHandler, and deal with
            // the fact that it will never fire
            t.node.removeEventListener(createTransitions__TRANSITIONEND, transitionEndHandler, false);
            cssTransitionsComplete = true;
            checkComplete();
          }
        }, 0);
      }, options.delay || 0);
    };
  }

  var createTransitions__default = createTransitions__createTransitions;
  //# sourceMappingURL=01-_6to5-createTransitions.js.map

  var visibility__hidden, visibility__vendor, visibility__prefix, visibility__i, visibility__visibility;

  if (typeof document !== "undefined") {
    visibility__hidden = "hidden";

    visibility__visibility = {};

    if (visibility__hidden in document) {
      visibility__prefix = "";
    } else {
      visibility__i = vendors__default.length;
      while (visibility__i--) {
        visibility__vendor = vendors__default[visibility__i];
        visibility__hidden = visibility__vendor + "Hidden";

        if (visibility__hidden in document) {
          visibility__prefix = visibility__vendor;
        }
      }
    }

    if (visibility__prefix !== undefined) {
      document.addEventListener(visibility__prefix + "visibilitychange", visibility__onChange);

      // initialise
      visibility__onChange();
    } else {
      // gah, we're in an old browser
      if ("onfocusout" in document) {
        document.addEventListener("focusout", visibility__onHide);
        document.addEventListener("focusin", visibility__onShow);
      } else {
        window.addEventListener("pagehide", visibility__onHide);
        window.addEventListener("blur", visibility__onHide);

        window.addEventListener("pageshow", visibility__onShow);
        window.addEventListener("focus", visibility__onShow);
      }

      visibility__visibility.hidden = false; // until proven otherwise. Not ideal but hey
    }
  }

  function visibility__onChange() {
    visibility__visibility.hidden = document[visibility__hidden];
  }

  function visibility__onHide() {
    visibility__visibility.hidden = true;
  }

  function visibility__onShow() {
    visibility__visibility.hidden = false;
  }

  var visibility__default = visibility__visibility;
  //# sourceMappingURL=01-_6to5-visibility.js.map

  var animateStyle__animateStyle, animateStyle__getComputedStyle, animateStyle__resolved;

  if (!environment__isClient) {
    animateStyle__animateStyle = null;
  } else {
    animateStyle__getComputedStyle = window.getComputedStyle || legacy__default.getComputedStyle;

    animateStyle__animateStyle = function (style, value, options, complete) {
      var _this = this;


      var to;

      // Special case - page isn't visible. Don't animate anything, because
      // that way you'll never get CSS transitionend events
      if (visibility__default.hidden) {
        this.setStyle(style, value);
        return animateStyle__resolved || (animateStyle__resolved = Promise__default.resolve());
      }

      if (typeof style === "string") {
        to = {};
        to[style] = value;
      } else {
        to = style;

        // shuffle arguments
        complete = options;
        options = value;
      }

      // As of 0.3.9, transition authors should supply an `option` object with
      // `duration` and `easing` properties (and optional `delay`), plus a
      // callback function that gets called after the animation completes

      // TODO remove this check in a future version
      if (!options) {
        warn__default("The \"" + this.name + "\" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340");

        options = this;
        complete = this.complete;
      }

      var promise = new Promise__default(function (resolve) {
        var propertyNames, changedProperties, computedStyle, current, from, i, prop;

        // Edge case - if duration is zero, set style synchronously and complete
        if (!options.duration) {
          _this.setStyle(to);
          resolve();
          return;
        }

        // Get a list of the properties we're animating
        propertyNames = Object.keys(to);
        changedProperties = [];

        // Store the current styles
        computedStyle = animateStyle__getComputedStyle(_this.node);

        from = {};
        i = propertyNames.length;
        while (i--) {
          prop = propertyNames[i];
          current = computedStyle[prefix__default(prop)];

          if (current === "0px") {
            current = 0;
          }

          // we need to know if we're actually changing anything
          if (current != to[prop]) {
            // use != instead of !==, so we can compare strings with numbers
            changedProperties.push(prop);

            // make the computed style explicit, so we can animate where
            // e.g. height='auto'
            _this.node.style[prefix__default(prop)] = current;
          }
        }

        // If we're not actually changing anything, the transitionend event
        // will never fire! So we complete early
        if (!changedProperties.length) {
          resolve();
          return;
        }

        createTransitions__default(_this, to, options, changedProperties, resolve);
      });

      // If a callback was supplied, do the honours
      // TODO remove this check in future
      if (complete) {
        log__default.warn({
          debug: true, // no ractive instance to govern this
          message: "usePromise",
          args: {
            method: "t.animateStyle"
          }
        });

        promise.then(complete).then(null, function (err) {
          log__default.consoleError({
            debug: true,
            err: err
          });
        });
      }

      return promise;
    };
  }

  var animateStyle__default = animateStyle__animateStyle;
  //# sourceMappingURL=01-_6to5-_animateStyle.js.map

  var processParams__default = function (params, defaults) {
    if (typeof params === "number") {
      params = { duration: params };
    } else if (typeof params === "string") {
      if (params === "slow") {
        params = { duration: 600 };
      } else if (params === "fast") {
        params = { duration: 200 };
      } else {
        params = { duration: 400 };
      }
    } else if (!params) {
      params = {};
    }

    return object__fillGaps({}, params, defaults);
  };
  //# sourceMappingURL=01-_6to5-processParams.js.map

  function start__Transition$start() {
    var _this = this;
    var node, originalStyle, completed;

    node = this.node = this.element.node;
    originalStyle = node.getAttribute("style");

    // create t.complete() - we don't want this on the prototype,
    // because we don't want `this` silliness when passing it as
    // an argument
    this.complete = function (noReset) {
      if (completed) {
        return;
      }

      if (!noReset && _this.isIntro) {
        start__resetStyle(node, originalStyle);
      }

      node._ractive.transition = null;
      _this._manager.remove(_this);

      completed = true;
    };

    // If the transition function doesn't exist, abort
    if (!this._fn) {
      this.complete();
      return;
    }

    this._fn.apply(this.root, [this].concat(this.params));
  };
  var start__default = start__Transition$start;

  function start__resetStyle(node, style) {
    if (style) {
      node.setAttribute("style", style);
    } else {
      // Next line is necessary, to remove empty style attribute!
      // See http://stackoverflow.com/a/7167553
      node.getAttribute("style");
      node.removeAttribute("style");
    }
  }
  //# sourceMappingURL=01-_6to5-start.js.map

  var Transition__Transition = function (owner, template, isIntro) {
    this.init(owner, template, isIntro);
  };

  Transition__Transition.prototype = {
    init: Transition_prototype_init__default,
    start: start__default,
    getStyle: getStyle__default,
    setStyle: setStyle__default,
    animateStyle: animateStyle__default,
    processParams: processParams__default
  };

  var Transition__default = Transition__Transition;
  //# sourceMappingURL=01-_6to5-_Transition.js.map

  var Element_prototype_render__updateCss, Element_prototype_render__updateScript;

  Element_prototype_render__updateCss = function () {
    var node = this.node, content = this.fragment.toString(false);

    // IE8 has no styleSheet unless there's a type text/css
    if (window && window.appearsToBeIELessEqual8) {
      node.type = "text/css";
    }

    if (node.styleSheet) {
      node.styleSheet.cssText = content;
    } else {
      while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
      }

      node.appendChild(document.createTextNode(content));
    }
  };

  Element_prototype_render__updateScript = function () {
    if (!this.node.type || this.node.type === "text/javascript") {
      warn__default("Script tag was updated. This does not cause the code to be re-evaluated!");
      // As it happens, we ARE in a position to re-evaluate the code if we wanted
      // to - we could eval() it, or insert it into a fresh (temporary) script tag.
      // But this would be a terrible idea with unpredictable results, so let's not.
    }

    this.node.text = this.fragment.toString(false);
  };

  function Element_prototype_render__Element$render() {
    var _this = this;
    var root = this.root, namespace, node;

    namespace = Element_prototype_render__getNamespace(this);
    node = this.node = dom__createElement(this.name, namespace);

    // Is this a top-level node of a component? If so, we may need to add
    // a data-ractive-css attribute, for CSS encapsulation
    // NOTE: css no longer copied to instance, so we check constructor.css -
    // we can enhance to handle instance, but this is more "correct" with current
    // functionality
    if (root.constructor.css && this.parentFragment.getNode() === root.el) {
      this.node.setAttribute("data-ractive-css", root.constructor._guid /*|| root._guid*/);
    }

    // Add _ractive property to the node - we use this object to store stuff
    // related to proxy events, two-way bindings etc
    object__defineProperty(this.node, "_ractive", {
      value: {
        proxy: this,
        keypath: getInnerContext__default(this.parentFragment),
        events: object__create(null),
        root: root
      }
    });

    // Render attributes
    this.attributes.forEach(function (a) {
      return a.render(node);
    });
    this.conditionalAttributes.forEach(function (a) {
      return a.render(node);
    });

    // Render children
    if (this.fragment) {
      // Special case - <script> element
      if (this.name === "script") {
        this.bubble = Element_prototype_render__updateScript;
        this.node.text = this.fragment.toString(false); // bypass warning initially
        this.fragment.unrender = noop__default; // TODO this is a kludge
      }

      // Special case - <style> element
      else if (this.name === "style") {
        this.bubble = Element_prototype_render__updateCss;
        this.bubble();
        this.fragment.unrender = noop__default;
      }

      // Special case - contenteditable
      else if (this.binding && this.getAttribute("contenteditable")) {
        this.fragment.unrender = noop__default;
      } else {
        this.node.appendChild(this.fragment.render());
      }
    }

    // Add proxy event handlers
    if (this.eventHandlers) {
      this.eventHandlers.forEach(function (h) {
        return h.render();
      });
    }

    // deal with two-way bindings
    if (this.binding) {
      this.binding.render();
      this.node._ractive.binding = this.binding;
    }

    if (this.name === "option") {
      Element_prototype_render__processOption(this);
    }

    // Special cases
    if (this.name === "img") {
      // if this is an <img>, and we're in a crap browser, we may
      // need to prevent it from overriding width and height when
      // it loads the src
      img__render(this);
    } else if (this.name === "form") {
      // forms need to keep track of their bindings, in case of reset
      form__render(this);
    } else if (this.name === "input" || this.name === "textarea") {
      // inputs and textareas should store their initial value as
      // `defaultValue` in case of reset
      this.node.defaultValue = this.node.value;
    } else if (this.name === "option") {
      // similarly for option nodes
      this.node.defaultSelected = this.node.selected;
    }

    // apply decorator(s)
    if (this.decorator && this.decorator.fn) {
      runloop__default.scheduleTask(function () {
        if (!_this.decorator.torndown) {
          _this.decorator.init();
        }
      }, true);
    }

    // trigger intro transition
    if (root.transitionsEnabled && this.intro) {
      (function () {
        var transition = new Transition__default(_this, _this.intro, true);
        runloop__default.registerTransition(transition);
        runloop__default.scheduleTask(function () {
          return transition.start();
        }, true);

        _this.transition = transition;
      })();
    }

    if (this.node.autofocus) {
      // Special case. Some browsers (*cough* Firefix *cough*) have a problem
      // with dynamically-generated elements having autofocus, and they won't
      // allow you to programmatically focus the element until it's in the DOM
      runloop__default.scheduleTask(function () {
        return _this.node.focus();
      }, true);
    }

    Element_prototype_render__updateLiveQueries(this);
    return this.node;
  };
  var Element_prototype_render__default = Element_prototype_render__Element$render;

  function Element_prototype_render__getNamespace(element) {
    var namespace, xmlns, parent;

    // Use specified namespace...
    if (xmlns = element.getAttribute("xmlns")) {
      namespace = xmlns;
    }

    // ...or SVG namespace, if this is an <svg> element
    else if (element.name === "svg") {
      namespace = namespaces__default.svg;
    } else if (parent = element.parent) {
      // ...or HTML, if the parent is a <foreignObject>
      if (parent.name === "foreignObject") {
        namespace = namespaces__default.html;
      }

      // ...or inherit from the parent node
      else {
        namespace = parent.node.namespaceURI;
      }
    } else {
      namespace = element.root.el.namespaceURI;
    }

    return namespace;
  }

  function Element_prototype_render__processOption(option) {
    var optionValue, selectValue, i;

    if (!option.select) {
      return;
    }

    selectValue = option.select.getAttribute("value");
    if (selectValue === undefined) {
      return;
    }

    optionValue = option.getAttribute("value");

    if (option.select.node.multiple && is__isArray(selectValue)) {
      i = selectValue.length;
      while (i--) {
        if (optionValue == selectValue[i]) {
          option.node.selected = true;
          break;
        }
      }
    } else {
      option.node.selected = (optionValue == selectValue);
    }
  }

  function Element_prototype_render__updateLiveQueries(element) {
    var instance, liveQueries, i, selector, query;

    // Does this need to be added to any live queries?
    instance = element.root;

    do {
      liveQueries = instance._liveQueries;

      i = liveQueries.length;
      while (i--) {
        selector = liveQueries[i];
        query = liveQueries["_" + selector];

        if (query._test(element)) {
          // keep register of applicable selectors, for when we teardown
          (element.liveQueries || (element.liveQueries = [])).push(query);
        }
      }
    } while (instance = instance.parent);
  }
  //# sourceMappingURL=01-_6to5-render.js.map

  var Element_prototype_toString__default = function () {
    var str, escape;

    if (this.template.y) {
      // DOCTYPE declaration
      return "<!DOCTYPE" + this.template.dd + ">";
    }

    str = "<" + this.template.e;

    str += this.attributes.map(Element_prototype_toString__stringifyAttribute).join("") + this.conditionalAttributes.map(Element_prototype_toString__stringifyAttribute).join("");

    // Special case - selected options
    if (this.name === "option" && Element_prototype_toString__optionIsSelected(this)) {
      str += " selected";
    }

    // Special case - two-way radio name bindings
    if (this.name === "input" && Element_prototype_toString__inputIsCheckedRadio(this)) {
      str += " checked";
    }

    str += ">";

    // Special case - textarea
    if (this.name === "textarea" && this.getAttribute("value") !== undefined) {
      str += html__escapeHtml(this.getAttribute("value"));
    }

    // Special case - contenteditable
    else if (this.getAttribute("contenteditable") !== undefined) {
      str += this.getAttribute("value");
    }

    if (this.fragment) {
      escape = (this.name !== "script" && this.name !== "style");
      str += this.fragment.toString(escape);
    }

    // add a closing tag if this isn't a void element
    if (!html__voidElementNames.test(this.template.e)) {
      str += "</" + this.template.e + ">";
    }

    return str;
  };

  function Element_prototype_toString__optionIsSelected(element) {
    var optionValue, selectValue, i;

    optionValue = element.getAttribute("value");

    if (optionValue === undefined || !element.select) {
      return false;
    }

    selectValue = element.select.getAttribute("value");

    if (selectValue == optionValue) {
      return true;
    }

    if (element.select.getAttribute("multiple") && is__isArray(selectValue)) {
      i = selectValue.length;
      while (i--) {
        if (selectValue[i] == optionValue) {
          return true;
        }
      }
    }
  }

  function Element_prototype_toString__inputIsCheckedRadio(element) {
    var attributes, typeAttribute, valueAttribute, nameAttribute;

    attributes = element.attributes;

    typeAttribute = attributes.type;
    valueAttribute = attributes.value;
    nameAttribute = attributes.name;

    if (!typeAttribute || (typeAttribute.value !== "radio") || !valueAttribute || !nameAttribute.interpolator) {
      return;
    }

    if (valueAttribute.value === nameAttribute.interpolator.value) {
      return true;
    }
  }

  function Element_prototype_toString__stringifyAttribute(attribute) {
    var str = attribute.toString();
    return str ? " " + str : "";
  }
  //# sourceMappingURL=01-_6to5-toString.js.map

  function Element_prototype_unbind__Element$unbind() {
    if (this.fragment) {
      this.fragment.unbind();
    }

    if (this.binding) {
      this.binding.unbind();
    }

    if (this.eventHandlers) {
      this.eventHandlers.forEach(methodCallers__unbind);
    }

    // Special case - <option>
    if (this.name === "option") {
      option__unbind(this);
    }

    this.attributes.forEach(methodCallers__unbind);
    this.conditionalAttributes.forEach(methodCallers__unbind);
  };
  var Element_prototype_unbind__default = Element_prototype_unbind__Element$unbind;
  //# sourceMappingURL=01-_6to5-unbind.js.map

  function Element_prototype_unrender__Element$unrender(shouldDestroy) {
    var _this = this;
    var binding, bindings;

    if (this.transition) {
      this.transition.complete();
    }

    // Detach as soon as we can
    if (this.name === "option") {
      // <option> elements detach immediately, so that
      // their parent <select> element syncs correctly, and
      // since option elements can't have transitions anyway
      this.detach();
    } else if (shouldDestroy) {
      runloop__default.detachWhenReady(this);
    }

    // Children first. that way, any transitions on child elements will be
    // handled by the current transitionManager
    if (this.fragment) {
      this.fragment.unrender(false);
    }

    if (binding = this.binding) {
      this.binding.unrender();

      this.node._ractive.binding = null;
      bindings = this.root._twowayBindings[binding.keypath];
      bindings.splice(bindings.indexOf(binding), 1);
    }

    // Remove event handlers
    if (this.eventHandlers) {
      this.eventHandlers.forEach(methodCallers__unrender);
    }

    if (this.decorator) {
      runloop__default.registerDecorator(this.decorator);
    }

    // trigger outro transition if necessary
    if (this.root.transitionsEnabled && this.outro) {
      (function () {
        var transition = new Transition__default(_this, _this.outro, false);
        runloop__default.registerTransition(transition);
        runloop__default.scheduleTask(function () {
          return transition.start();
        });
      })();
    }

    // Remove this node from any live queries
    if (this.liveQueries) {
      Element_prototype_unrender__removeFromLiveQueries(this);
    }

    if (this.name === "form") {
      form__unrender(this);
    }
  };
  var Element_prototype_unrender__default = Element_prototype_unrender__Element$unrender;

  function Element_prototype_unrender__removeFromLiveQueries(element) {
    var query, selector, i;

    i = element.liveQueries.length;
    while (i--) {
      query = element.liveQueries[i];
      selector = query.selector;

      query._remove(element.node);
    }
  }
  //# sourceMappingURL=01-_6to5-unrender.js.map

  var Element__Element = function (options) {
    this.init(options);
  };

  Element__Element.prototype = {
    bubble: Element_prototype_bubble__default,
    detach: Element_prototype_detach__default,
    find: Element_prototype_find__default,
    findAll: Element_prototype_findAll__default,
    findAllComponents: Element_prototype_findAllComponents__default,
    findComponent: Element_prototype_findComponent__default,
    findNextNode: Element_prototype_findNextNode__default,
    firstNode: Element_prototype_firstNode__default,
    getAttribute: getAttribute__default,
    init: Element_prototype_init__default,
    rebind: Element_prototype_rebind__default,
    render: Element_prototype_render__default,
    toString: Element_prototype_toString__default,
    unbind: Element_prototype_unbind__default,
    unrender: Element_prototype_unrender__default
  };

  var Element__default = Element__Element;
  //# sourceMappingURL=01-_6to5-_Element.js.map

  var deIndent__empty = /^\s*$/, deIndent__leadingWhitespace = /^\s*/;

  var deIndent__default = function (str) {
    var lines, firstLine, lastLine, minIndent;

    lines = str.split("\n");

    // remove first and last line, if they only contain whitespace
    firstLine = lines[0];
    if (firstLine !== undefined && deIndent__empty.test(firstLine)) {
      lines.shift();
    }

    lastLine = lines[lines.length - 1];
    if (lastLine !== undefined && deIndent__empty.test(lastLine)) {
      lines.pop();
    }

    minIndent = lines.reduce(deIndent__reducer, null);

    if (minIndent) {
      str = lines.map(function (line) {
        return line.replace(minIndent, "");
      }).join("\n");
    }

    return str;
  };

  function deIndent__reducer(previous, line) {
    var lineIndent = deIndent__leadingWhitespace.exec(line)[0];

    if (previous === null || (lineIndent.length < previous.length)) {
      return lineIndent;
    }

    return previous;
  }
  //# sourceMappingURL=01-_6to5-deIndent.js.map

  function getPartialTemplate__getPartialTemplate(ractive, name) {
    var partial;

    // If the partial in instance or view heirarchy instances, great
    if (partial = getPartialTemplate__getPartialFromRegistry(ractive, name)) {
      return partial;
    }

    // Does it exist on the page as a script tag?
    partial = parser__default.fromId(name, { noThrow: true });

    if (partial) {
      // is this necessary?
      partial = deIndent__default(partial);

      // parse and register to this ractive instance
      var parsed = parser__default.parse(partial, parser__default.getParseOptions(ractive));

      // register (and return main partial if there are others in the template)
      return ractive.partials[name] = parsed.t;
    }
  };
  var getPartialTemplate__default = getPartialTemplate__getPartialTemplate;

  function getPartialTemplate__getPartialFromRegistry(ractive, name) {
    var partials = config__default.registries.partials;

    // find first instance in the ractive or view hierarchy that has this partial
    var instance = partials.findInstance(ractive, name);

    if (!instance) {
      return;
    }

    var partial = instance.partials[name], fn;

    // partial is a function?
    if (typeof partial === "function") {
      fn = partial.bind(instance);
      fn.isOwner = instance.partials.hasOwnProperty(name);
      partial = fn(instance.data, parser__default);
    }

    if (!partial && partial !== "") {
      log__default.warn({
        debug: ractive.debug,
        message: "noRegistryFunctionReturn",
        args: { registry: "partial", name: name }
      });
      return;
    }

    // If this was added manually to the registry,
    // but hasn't been parsed, parse it now
    if (!parser__default.isParsed(partial)) {
      // use the parseOptions of the ractive instance on which it was found
      var parsed = parser__default.parse(partial, parser__default.getParseOptions(instance));

      // Partials cannot contain nested partials!
      // TODO add a test for this
      if (parsed.p) {
        log__default.warn({
          debug: ractive.debug,
          message: "noNestedPartials",
          args: { rname: name }
        });
      }

      // if fn, use instance to store result, otherwise needs to go
      // in the correct point in prototype chain on instance or constructor
      var target = fn ? instance : partials.findOwner(instance, name);

      // may be a template with partials, which need to be registered and main template extracted
      target.partials[name] = partial = parsed.t;
    }

    // store for reset
    if (fn) {
      partial._fn = fn;
    }

    return partial.v ? partial.t : partial;
  }
  //# sourceMappingURL=01-_6to5-getPartialTemplate.js.map

  var applyIndent__default = function (string, indent) {
    var indented;

    if (!indent) {
      return string;
    }

    indented = string.split("\n").map(function (line, notFirstLine) {
      return notFirstLine ? indent + line : line;
    }).join("\n");

    return indented;
  };
  //# sourceMappingURL=01-_6to5-applyIndent.js.map

  var Partial__Partial = function (options) {
    var parentFragment, template;

    parentFragment = this.parentFragment = options.parentFragment;

    this.root = parentFragment.root;
    this.type = types__PARTIAL;
    this.index = options.index;
    this.name = options.template.r;

    this.fragment = this.fragmentToRender = this.fragmentToUnrender = null;

    Mustache__default.init(this, options);

    // If this didn't resolve, it most likely means we have a named partial
    // (i.e. `{{>foo}}` means 'use the foo partial', not 'use the partial
    // whose name is the value of `foo`')
    if (!this.keypath && (template = getPartialTemplate__default(this.root, this.name))) {
      unbind__default.call(this); // prevent any further changes
      this.isNamed = true;

      this.setTemplate(template);
    }
  };

  Partial__Partial.prototype = {
    bubble: function () {
      this.parentFragment.bubble();
    },

    detach: function () {
      return this.fragment.detach();
    },

    find: function (selector) {
      return this.fragment.find(selector);
    },

    findAll: function (selector, query) {
      return this.fragment.findAll(selector, query);
    },

    findComponent: function (selector) {
      return this.fragment.findComponent(selector);
    },

    findAllComponents: function (selector, query) {
      return this.fragment.findAllComponents(selector, query);
    },

    firstNode: function () {
      return this.fragment.firstNode();
    },

    findNextNode: function () {
      return this.parentFragment.findNextNode(this);
    },

    getPartialName: function () {
      if (this.isNamed && this.name) return this.name;else if (this.value === undefined) return this.name;else return this.value;
    },

    getValue: function () {
      return this.fragment.getValue();
    },

    rebind: function (oldKeypath, newKeypath) {
      // named partials aren't bound, so don't rebind
      if (!this.isNamed) {
        rebind__default.call(this, oldKeypath, newKeypath);
      }

      this.fragment.rebind(oldKeypath, newKeypath);
    },

    render: function () {
      this.docFrag = document.createDocumentFragment();
      this.update();

      this.rendered = true;
      return this.docFrag;
    },

    resolve: Mustache__default.resolve,

    setValue: function (value) {
      var template;

      if (value !== undefined && value === this.value) {
        // nothing has changed, so no work to be done
        return;
      }

      if (value !== undefined) {
        template = getPartialTemplate__default(this.root, "" + value);
      }

      // we may be here if we have a partial like `{{>foo}}` and `foo` is the
      // name of both a data property (whose value ISN'T the name of a partial)
      // and a partial. In those cases, this becomes a named partial
      if (!template && this.name && (template = getPartialTemplate__default(this.root, this.name))) {
        unbind__default.call(this);
        this.isNamed = true;
      }

      if (!template) {
        log__default.error({
          debug: this.root.debug,
          message: "noTemplateForPartial",
          args: { name: this.name }
        });
      }

      this.value = value;

      this.setTemplate(template || []);

      this.bubble();

      if (this.rendered) {
        runloop__default.addView(this);
      }
    },

    setTemplate: function (template) {
      if (this.fragment) {
        this.fragment.unbind();
        this.fragmentToUnrender = this.fragment;
      }

      this.fragment = new Fragment__default({
        template: template,
        root: this.root,
        owner: this,
        pElement: this.parentFragment.pElement
      });

      this.fragmentToRender = this.fragment;
    },

    toString: function (toString) {
      var string, previousItem, lastLine, match;

      string = this.fragment.toString(toString);

      previousItem = this.parentFragment.items[this.index - 1];

      if (!previousItem || (previousItem.type !== types__TEXT)) {
        return string;
      }

      lastLine = previousItem.text.split("\n").pop();

      if (match = /^\s+$/.exec(lastLine)) {
        return applyIndent__default(string, match[0]);
      }

      return string;
    },

    unbind: function () {
      if (!this.isNamed) {
        // dynamic partial - need to unbind self
        unbind__default.call(this);
      }

      if (this.fragment) {
        this.fragment.unbind();
      }
    },

    unrender: function (shouldDestroy) {
      if (this.rendered) {
        if (this.fragment) {
          this.fragment.unrender(shouldDestroy);
        }
        this.rendered = false;
      }
    },

    update: function () {
      var target, anchor;

      if (this.fragmentToUnrender) {
        this.fragmentToUnrender.unrender(true);
        this.fragmentToUnrender = null;
      }

      if (this.fragmentToRender) {
        this.docFrag.appendChild(this.fragmentToRender.render());
        this.fragmentToRender = null;
      }

      if (this.rendered) {
        target = this.parentFragment.getNode();
        anchor = this.parentFragment.findNextNode(this);
        target.insertBefore(this.docFrag, anchor);
      }
    }
  };

  var Partial__default = Partial__Partial;
  //# sourceMappingURL=01-_6to5-_Partial.js.map

  function getComponent__getComponent(ractive, name) {
    var Component, instance = config__default.registries.components.findInstance(ractive, name);

    if (instance) {
      Component = instance.components[name];

      // best test we have for not Ractive.extend
      if (!Component._Parent) {
        // function option, execute and store for reset
        var fn = Component.bind(instance);
        fn.isOwner = instance.components.hasOwnProperty(name);
        Component = fn(instance.data);

        if (!Component) {
          log__default.warn({
            debug: ractive.debug,
            message: "noRegistryFunctionReturn",
            args: { registry: "component", name: name }
          });
          return;
        }

        if (typeof Component === "string") {
          //allow string lookup
          Component = getComponent__getComponent(ractive, Component);
        }

        Component._fn = fn;
        instance.components[name] = Component;
      }
    }

    return Component;
  };
  var getComponent__default = getComponent__getComponent;
  //# sourceMappingURL=01-_6to5-getComponent.js.map

  var Component_prototype_detach__detachHook = new Hook__default("detach");

  function Component_prototype_detach__Component$detach() {
    var detached = this.instance.fragment.detach();
    Component_prototype_detach__detachHook.fire(this.instance);
    return detached;
  };
  var Component_prototype_detach__default = Component_prototype_detach__Component$detach;
  //# sourceMappingURL=01-_6to5-detach.js.map

  function Component_prototype_find__Component$find(selector) {
    return this.instance.fragment.find(selector);
  };
  var Component_prototype_find__default = Component_prototype_find__Component$find;
  //# sourceMappingURL=01-_6to5-find.js.map

  function Component_prototype_findAll__Component$findAll(selector, query) {
    return this.instance.fragment.findAll(selector, query);
  };
  var Component_prototype_findAll__default = Component_prototype_findAll__Component$findAll;
  //# sourceMappingURL=01-_6to5-findAll.js.map

  function Component_prototype_findAllComponents__Component$findAllComponents(selector, query) {
    query._test(this, true);

    if (this.instance.fragment) {
      this.instance.fragment.findAllComponents(selector, query);
    }
  };
  var Component_prototype_findAllComponents__default = Component_prototype_findAllComponents__Component$findAllComponents;
  //# sourceMappingURL=01-_6to5-findAllComponents.js.map

  function Component_prototype_findComponent__Component$findComponent(selector) {
    if (!selector || (selector === this.name)) {
      return this.instance;
    }

    if (this.instance.fragment) {
      return this.instance.fragment.findComponent(selector);
    }

    return null;
  };
  var Component_prototype_findComponent__default = Component_prototype_findComponent__Component$findComponent;
  //# sourceMappingURL=01-_6to5-findComponent.js.map

  function Component_prototype_findNextNode__Component$findNextNode() {
    return this.parentFragment.findNextNode(this);
  };
  var Component_prototype_findNextNode__default = Component_prototype_findNextNode__Component$findNextNode;
  //# sourceMappingURL=01-_6to5-findNextNode.js.map

  function Component_prototype_firstNode__Component$firstNode() {
    if (this.rendered) {
      return this.instance.fragment.firstNode();
    }

    return null;
  };
  var Component_prototype_firstNode__default = Component_prototype_firstNode__Component$firstNode;
  //# sourceMappingURL=01-_6to5-firstNode.js.map

  function HookQueue__HookQueue(event) {
    this.hook = new Hook__default(event);
    this.inProcess = {};
    this.queue = {};
  }

  HookQueue__HookQueue.prototype = {
    constructor: HookQueue__HookQueue,

    begin: function (ractive) {
      this.inProcess[ractive._guid] = true;
    },

    end: function (ractive) {
      var parent = ractive.parent;

      // If this is *isn't* a child of a component that's in process,
      // it should call methods or fire at this point
      if (!parent || !this.inProcess[parent._guid]) {
        HookQueue__fire(this, ractive);
      }
      // elsewise, handoff to parent to fire when ready
      else {
        HookQueue__getChildQueue(this.queue, parent).push(ractive);
      }

      delete this.inProcess[ractive._guid];
    }
  };

  function HookQueue__getChildQueue(queue, ractive) {
    return queue[ractive._guid] || (queue[ractive._guid] = []);
  }

  function HookQueue__fire(hookQueue, ractive) {
    var childQueue = HookQueue__getChildQueue(hookQueue.queue, ractive);

    hookQueue.hook.fire(ractive);

    // queue is "live" because components can end up being
    // added while hooks fire on parents that modify data values.
    while (childQueue.length) {
      HookQueue__fire(hookQueue, childQueue.shift());
    }

    delete hookQueue.queue[ractive._guid];
  }


  var HookQueue__default = HookQueue__HookQueue;
  //# sourceMappingURL=01-_6to5-HookQueue.js.map

  var processWrapper__default = function (wrapper, array, methodName, newIndices) {
    var root = wrapper.root;
    var keypath = wrapper.keypath;


    // If this is a sort or reverse, we just do root.set()...
    // TODO use merge logic?
    if (methodName === "sort" || methodName === "reverse") {
      root.viewmodel.set(keypath, array);
      return;
    }

    root.viewmodel.smartUpdate(keypath, array, newIndices);
  };
  //# sourceMappingURL=01-_6to5-processWrapper.js.map

  var patch___slice = Array.prototype.slice;
  var patch__patchedArrayProto = [], patch__mutatorMethods = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], patch__testObj, patch__patchArrayMethods, patch__unpatchArrayMethods;

  patch__mutatorMethods.forEach(function (methodName) {
    var method = function () {
      var args = patch___slice.call(arguments);

      var newIndices, result, wrapper, i;

      newIndices = getNewIndices__default(this, methodName, args);

      // apply the underlying method
      result = Array.prototype[methodName].apply(this, arguments);

      // trigger changes
      runloop__default.start();

      this._ractive.setting = true;
      i = this._ractive.wrappers.length;
      while (i--) {
        wrapper = this._ractive.wrappers[i];

        runloop__default.addViewmodel(wrapper.root.viewmodel);
        processWrapper__default(wrapper, this, methodName, newIndices);
      }

      runloop__default.end();

      this._ractive.setting = false;
      return result;
    };

    object__defineProperty(patch__patchedArrayProto, methodName, {
      value: method
    });
  });

  // can we use prototype chain injection?
  // http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
  patch__testObj = {};

  if (patch__testObj.__proto__) {
    // yes, we can
    patch__patchArrayMethods = function (array) {
      array.__proto__ = patch__patchedArrayProto;
    };

    patch__unpatchArrayMethods = function (array) {
      array.__proto__ = Array.prototype;
    };
  } else {
    // no, we can't
    patch__patchArrayMethods = function (array) {
      var i, methodName;

      i = patch__mutatorMethods.length;
      while (i--) {
        methodName = patch__mutatorMethods[i];
        object__defineProperty(array, methodName, {
          value: patch__patchedArrayProto[methodName],
          configurable: true
        });
      }
    };

    patch__unpatchArrayMethods = function (array) {
      var i;

      i = patch__mutatorMethods.length;
      while (i--) {
        delete array[patch__mutatorMethods[i]];
      }
    };
  }

  patch__patchArrayMethods.unpatch = patch__unpatchArrayMethods;
  var patch__default = patch__patchArrayMethods;
  //# sourceMappingURL=01-_6to5-patch.js.map

  var arrayAdaptor__arrayAdaptor,

  // helpers
  arrayAdaptor__ArrayWrapper, arrayAdaptor__errorMessage;

  arrayAdaptor__arrayAdaptor = {
    filter: function (object) {
      // wrap the array if a) b) it's an array, and b) either it hasn't been wrapped already,
      // or the array didn't trigger the get() itself
      return is__isArray(object) && (!object._ractive || !object._ractive.setting);
    },
    wrap: function (ractive, array, keypath) {
      return new arrayAdaptor__ArrayWrapper(ractive, array, keypath);
    }
  };

  arrayAdaptor__ArrayWrapper = function (ractive, array, keypath) {
    this.root = ractive;
    this.value = array;
    this.keypath = keypath;

    // if this array hasn't already been ractified, ractify it
    if (!array._ractive) {
      // define a non-enumerable _ractive property to store the wrappers
      object__defineProperty(array, "_ractive", {
        value: {
          wrappers: [],
          instances: [],
          setting: false
        },
        configurable: true
      });

      patch__default(array);
    }

    // store the ractive instance, so we can handle transitions later
    if (!array._ractive.instances[ractive._guid]) {
      array._ractive.instances[ractive._guid] = 0;
      array._ractive.instances.push(ractive);
    }

    array._ractive.instances[ractive._guid] += 1;
    array._ractive.wrappers.push(this);
  };

  arrayAdaptor__ArrayWrapper.prototype = {
    get: function () {
      return this.value;
    },
    teardown: function () {
      var array, storage, wrappers, instances, index;

      array = this.value;
      storage = array._ractive;
      wrappers = storage.wrappers;
      instances = storage.instances;

      // if teardown() was invoked because we're clearing the cache as a result of
      // a change that the array itself triggered, we can save ourselves the teardown
      // and immediate setup
      if (storage.setting) {
        return false; // so that we don't remove it from this.root.viewmodel.wrapped
      }

      index = wrappers.indexOf(this);
      if (index === -1) {
        throw new Error(arrayAdaptor__errorMessage);
      }

      wrappers.splice(index, 1);

      // if nothing else depends on this array, we can revert it to its
      // natural state
      if (!wrappers.length) {
        delete array._ractive;
        patch__default.unpatch(this.value);
      } else {
        // remove ractive instance if possible
        instances[this.root._guid] -= 1;
        if (!instances[this.root._guid]) {
          index = instances.indexOf(this.root);

          if (index === -1) {
            throw new Error(arrayAdaptor__errorMessage);
          }

          instances.splice(index, 1);
        }
      }
    }
  };

  arrayAdaptor__errorMessage = "Something went wrong in a rather interesting way";
  var arrayAdaptor__default = arrayAdaptor__arrayAdaptor;
  //# sourceMappingURL=01-_6to5-arrayAdaptor.js.map

  var magicArrayAdaptor__magicArrayAdaptor, magicArrayAdaptor__MagicArrayWrapper;

  if (magicAdaptor__default) {
    magicArrayAdaptor__magicArrayAdaptor = {
      filter: function (object, keypath, ractive) {
        return magicAdaptor__default.filter(object, keypath, ractive) && arrayAdaptor__default.filter(object);
      },

      wrap: function (ractive, array, keypath) {
        return new magicArrayAdaptor__MagicArrayWrapper(ractive, array, keypath);
      }
    };

    magicArrayAdaptor__MagicArrayWrapper = function (ractive, array, keypath) {
      this.value = array;

      this.magic = true;

      this.magicWrapper = magicAdaptor__default.wrap(ractive, array, keypath);
      this.arrayWrapper = arrayAdaptor__default.wrap(ractive, array, keypath);
    };

    magicArrayAdaptor__MagicArrayWrapper.prototype = {
      get: function () {
        return this.value;
      },
      teardown: function () {
        this.arrayWrapper.teardown();
        this.magicWrapper.teardown();
      },
      reset: function (value) {
        return this.magicWrapper.reset(value);
      }
    };
  }

  var magicArrayAdaptor__default = magicArrayAdaptor__magicArrayAdaptor;
  //# sourceMappingURL=01-_6to5-magicArrayAdaptor.js.map

  var adapt__prefixers = {};

  function adapt__Viewmodel$adapt(keypath, value) {
    var ractive = this.ractive, len, i, adaptor, wrapped;

    // Do we have an adaptor for this value?
    len = ractive.adapt.length;
    for (i = 0; i < len; i += 1) {
      adaptor = ractive.adapt[i];

      // Adaptors can be specified as e.g. [ 'Backbone.Model', 'Backbone.Collection' ] -
      // we need to get the actual adaptor if that's the case
      if (typeof adaptor === "string") {
        var found = config__default.registries.adaptors.find(ractive, adaptor);

        if (!found) {
          // will throw. "return" for safety, if we downgrade :)
          return log__default.critical({
            debug: ractive.debug,
            message: "missingPlugin",
            args: {
              plugin: "adaptor",
              name: adaptor
            }
          });
        }

        adaptor = ractive.adapt[i] = found;
      }

      if (adaptor.filter(value, keypath, ractive)) {
        wrapped = this.wrapped[keypath] = adaptor.wrap(ractive, value, keypath, adapt__getPrefixer(keypath));
        wrapped.value = value;
        return value;
      }
    }

    if (ractive.magic) {
      if (magicArrayAdaptor__default.filter(value, keypath, ractive)) {
        this.wrapped[keypath] = magicArrayAdaptor__default.wrap(ractive, value, keypath);
      } else if (magicAdaptor__default.filter(value, keypath, ractive)) {
        this.wrapped[keypath] = magicAdaptor__default.wrap(ractive, value, keypath);
      }
    } else if (ractive.modifyArrays && arrayAdaptor__default.filter(value, keypath, ractive)) {
      this.wrapped[keypath] = arrayAdaptor__default.wrap(ractive, value, keypath);
    }

    return value;
  };
  var adapt__default = adapt__Viewmodel$adapt;

  function adapt__prefixKeypath(obj, prefix) {
    var prefixed = {}, key;

    if (!prefix) {
      return obj;
    }

    prefix += ".";

    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        prefixed[prefix + key] = obj[key];
      }
    }

    return prefixed;
  }

  function adapt__getPrefixer(rootKeypath) {
    var rootDot;

    if (!adapt__prefixers[rootKeypath]) {
      rootDot = rootKeypath ? rootKeypath + "." : "";

      adapt__prefixers[rootKeypath] = function (relativeKeypath, value) {
        var obj;

        if (typeof relativeKeypath === "string") {
          obj = {};
          obj[rootDot + relativeKeypath] = value;
          return obj;
        }

        if (typeof relativeKeypath === "object") {
          // 'relativeKeypath' is in fact a hash, not a keypath
          return rootDot ? adapt__prefixKeypath(relativeKeypath, rootKeypath) : relativeKeypath;
        }
      };
    }

    return adapt__prefixers[rootKeypath];
  }
  //# sourceMappingURL=01-_6to5-adapt.js.map

  function getUpstreamChanges__getUpstreamChanges(changes) {
    var upstreamChanges = [""], i, keypath, keys, upstreamKeypath;

    i = changes.length;
    while (i--) {
      keypath = changes[i];
      keys = keypath.split(".");

      while (keys.length > 1) {
        keys.pop();
        upstreamKeypath = keys.join(".");

        if (upstreamChanges.indexOf(upstreamKeypath) === -1) {
          upstreamChanges.push(upstreamKeypath);
        }
      }
    }

    return upstreamChanges;
  };
  var getUpstreamChanges__default = getUpstreamChanges__getUpstreamChanges;
  //# sourceMappingURL=01-_6to5-getUpstreamChanges.js.map

  var applyChanges_getPotentialWildcardMatches__starMaps = {};

  // This function takes a keypath such as 'foo.bar.baz', and returns
  // all the variants of that keypath that include a wildcard in place
  // of a key, such as 'foo.bar.*', 'foo.*.baz', 'foo.*.*' and so on.
  // These are then checked against the dependants map (ractive.viewmodel.depsMap)
  // to see if any pattern observers are downstream of one or more of
  // these wildcard keypaths (e.g. 'foo.bar.*.status')
  function applyChanges_getPotentialWildcardMatches__getPotentialWildcardMatches(keypath) {
    var keys, starMap, mapper, result;

    keys = keypath.split(".");
    starMap = applyChanges_getPotentialWildcardMatches__getStarMap(keys.length);

    mapper = function (star, i) {
      return star ? "*" : keys[i];
    };

    result = starMap.map(function (mask) {
      return mask.map(mapper).join(".");
    });
    return result;
  };
  var applyChanges_getPotentialWildcardMatches__default = applyChanges_getPotentialWildcardMatches__getPotentialWildcardMatches;

  // This function returns all the possible true/false combinations for
  // a given number - e.g. for two, the possible combinations are
  // [ true, true ], [ true, false ], [ false, true ], [ false, false ].
  // It does so by getting all the binary values between 0 and e.g. 11
  function applyChanges_getPotentialWildcardMatches__getStarMap(length) {
    var ones = "", max, binary, starMap, mapper, i;

    if (!applyChanges_getPotentialWildcardMatches__starMaps[length]) {
      starMap = [];

      while (ones.length < length) {
        ones += 1;
      }

      max = parseInt(ones, 2);

      mapper = function (digit) {
        return digit === "1";
      };

      for (i = 0; i <= max; i += 1) {
        binary = i.toString(2);
        while (binary.length < length) {
          binary = "0" + binary;
        }

        starMap[i] = Array.prototype.map.call(binary, mapper);
      }

      applyChanges_getPotentialWildcardMatches__starMaps[length] = starMap;
    }

    return applyChanges_getPotentialWildcardMatches__starMaps[length];
  }
  //# sourceMappingURL=01-_6to5-getPotentialWildcardMatches.js.map

  var notifyPatternObservers__lastKey = /[^\.]+$/;

  var notifyPatternObservers__default = notifyPatternObservers__notifyPatternObservers;

  function notifyPatternObservers__notifyPatternObservers(viewmodel, keypath, onlyDirect) {
    var potentialWildcardMatches;

    notifyPatternObservers__updateMatchingPatternObservers(viewmodel, keypath);

    if (onlyDirect) {
      return;
    }

    potentialWildcardMatches = applyChanges_getPotentialWildcardMatches__default(keypath);
    potentialWildcardMatches.forEach(function (upstreamPattern) {
      notifyPatternObservers__cascade(viewmodel, upstreamPattern, keypath);
    });
  }


  function notifyPatternObservers__cascade(viewmodel, upstreamPattern, keypath) {
    var group, map, actualChildKeypath;

    group = viewmodel.depsMap.patternObservers;

    if (!(group && (map = group[upstreamPattern]))) {
      return;
    }

    map.forEach(function (childKeypath) {
      var key = notifyPatternObservers__lastKey.exec(childKeypath)[0]; // 'baz'
      actualChildKeypath = keypath ? keypath + "." + key : key; // 'foo.bar.baz'

      notifyPatternObservers__updateMatchingPatternObservers(viewmodel, actualChildKeypath);

      notifyPatternObservers__cascade(viewmodel, childKeypath, actualChildKeypath);
    });
  }

  function notifyPatternObservers__updateMatchingPatternObservers(viewmodel, keypath) {
    viewmodel.patternObservers.forEach(function (observer) {
      if (observer.regex.test(keypath)) {
        observer.update(keypath);
      }
    });
  }
  //# sourceMappingURL=01-_6to5-notifyPatternObservers.js.map

  function applyChanges__Viewmodel$applyChanges() {
    var _this = this;
    var self = this, changes, upstreamChanges, hash = {};

    changes = this.changes;

    if (!changes.length) {
      // TODO we end up here on initial render. Perhaps we shouldn't?
      return;
    }

    function cascade(keypath) {
      var map, computations;

      if (self.noCascade.hasOwnProperty(keypath)) {
        return;
      }

      if (computations = self.deps.computed[keypath]) {
        computations.forEach(function (c) {
          if (c.viewmodel === self) {
            self.clearCache(c.key);
            c.invalidate();

            changes.push(c.key);
            cascade(c.key);
          } else {
            c.viewmodel.mark(c.key);
          }
        });
      }

      if (map = self.depsMap.computed[keypath]) {
        map.forEach(cascade);
      }
    }

    changes.slice().forEach(cascade);

    upstreamChanges = getUpstreamChanges__default(changes);
    upstreamChanges.forEach(function (keypath) {
      var computations;

      // make sure we haven't already been down this particular keypath in this turn
      if (changes.indexOf(keypath) === -1 && (computations = self.deps.computed[keypath])) {
        _this.changes.push(keypath);

        computations.forEach(function (c) {
          c.viewmodel.mark(c.key);
        });
      }
    });

    this.changes = [];

    // Pattern observers are a weird special case
    if (this.patternObservers.length) {
      upstreamChanges.forEach(function (keypath) {
        return notifyPatternObservers__default(_this, keypath, true);
      });
      changes.forEach(function (keypath) {
        return notifyPatternObservers__default(_this, keypath);
      });
    }

    if (this.deps.observers) {
      upstreamChanges.forEach(function (keypath) {
        return applyChanges__notifyUpstreamDependants(_this, null, keypath, "observers");
      });
      applyChanges__notifyAllDependants(this, changes, "observers");
    }

    if (this.deps["default"]) {
      (function () {
        var bindings = [];
        upstreamChanges.forEach(function (keypath) {
          return applyChanges__notifyUpstreamDependants(_this, bindings, keypath, "default");
        });

        if (bindings.length) {
          applyChanges__notifyBindings(_this, bindings, changes);
        }

        applyChanges__notifyAllDependants(_this, changes, "default");
      })();
    }

    // Return a hash of keypaths to updated values
    changes.forEach(function (keypath) {
      hash[keypath] = _this.get(keypath);
    });

    this.implicitChanges = {};
    this.noCascade = {};

    return hash;
  };
  var applyChanges__default = applyChanges__Viewmodel$applyChanges;

  function applyChanges__notifyUpstreamDependants(viewmodel, bindings, keypath, groupName) {
    var dependants, value;

    if (dependants = applyChanges__findDependants(viewmodel, keypath, groupName)) {
      value = viewmodel.get(keypath);

      dependants.forEach(function (d) {
        // don't "set" the parent value, refine it
        // i.e. not data = value, but data[foo] = fooValue
        if (bindings && d.refineValue) {
          bindings.push(d);
        } else {
          d.setValue(value);
        }
      });
    }
  }

  function applyChanges__notifyBindings(viewmodel, bindings, changes) {
    bindings.forEach(function (binding) {
      var useSet = false, i = 0, length = changes.length, refinements = [];

      while (i < length) {
        var keypath = changes[i];

        if (keypath === binding.keypath) {
          useSet = true;
          break;
        }

        if (keypath.slice(0, binding.keypath.length) === binding.keypath) {
          refinements.push(keypath);
        }

        i++;
      }

      if (useSet) {
        binding.setValue(viewmodel.get(binding.keypath));
      }

      if (refinements.length) {
        binding.refineValue(refinements);
      }
    });
  }


  function applyChanges__notifyAllDependants(viewmodel, keypaths, groupName) {
    var queue = [];

    addKeypaths(keypaths);
    queue.forEach(dispatch);

    function addKeypaths(keypaths) {
      keypaths.forEach(addKeypath);
      keypaths.forEach(cascade);
    }

    function addKeypath(keypath) {
      var deps = applyChanges__findDependants(viewmodel, keypath, groupName);

      if (deps) {
        queue.push({
          keypath: keypath,
          deps: deps
        });
      }
    }

    function cascade(keypath) {
      var childDeps;

      if (childDeps = viewmodel.depsMap[groupName][keypath]) {
        addKeypaths(childDeps);
      }
    }

    function dispatch(set) {
      var value = viewmodel.get(set.keypath);
      set.deps.forEach(function (d) {
        return d.setValue(value);
      });
    }
  }

  function applyChanges__findDependants(viewmodel, keypath, groupName) {
    var group = viewmodel.deps[groupName];
    return group ? group[keypath] : null;
  }
  //# sourceMappingURL=01-_6to5-applyChanges.js.map

  function capture__Viewmodel$capture() {
    this.captureGroups.push([]);
  };
  var capture__default = capture__Viewmodel$capture;
  //# sourceMappingURL=01-_6to5-capture.js.map

  function clearCache__Viewmodel$clearCache(keypath, dontTeardownWrapper) {
    var cacheMap, wrapper;

    if (!dontTeardownWrapper) {
      // Is there a wrapped property at this keypath?
      if (wrapper = this.wrapped[keypath]) {
        // Did we unwrap it?
        if (wrapper.teardown() !== false) {
          // Is this right?
          // What's the meaning of returning false from teardown?
          // Could there be a GC ramification if this is a "real" ractive.teardown()?
          this.wrapped[keypath] = null;
        }
      }
    }

    this.cache[keypath] = undefined;

    if (cacheMap = this.cacheMap[keypath]) {
      while (cacheMap.length) {
        this.clearCache(cacheMap.pop());
      }
    }
  };
  var clearCache__default = clearCache__Viewmodel$clearCache;
  //# sourceMappingURL=01-_6to5-clearCache.js.map

  var getComputationSignature__pattern = /\$\{([^\}]+)\}/g;

  var getComputationSignature__default = function (signature) {
    if (typeof signature === "function") {
      return { get: signature };
    }

    if (typeof signature === "string") {
      return {
        get: getComputationSignature__createFunctionFromString(signature)
      };
    }

    if (typeof signature === "object" && typeof signature.get === "string") {
      signature = {
        get: getComputationSignature__createFunctionFromString(signature.get),
        set: signature.set
      };
    }

    return signature;
  };

  function getComputationSignature__createFunctionFromString(signature) {
    var functionBody = "var __ractive=this;return(" + signature.replace(getComputationSignature__pattern, function (match, keypath) {
      return "__ractive.get(\"" + keypath + "\")";
    }) + ")";

    return new Function(functionBody);
  }
  //# sourceMappingURL=01-_6to5-getComputationSignature.js.map

  var UnresolvedDependency__UnresolvedDependency = function (computation, ref) {
    this.computation = computation;
    this.viewmodel = computation.viewmodel;
    this.ref = ref;

    // TODO this seems like a red flag!
    this.root = this.viewmodel.ractive;
    this.parentFragment = this.root.component && this.root.component.parentFragment;
  };

  UnresolvedDependency__UnresolvedDependency.prototype = {
    resolve: function (keypath) {
      this.computation.softDeps.push(keypath);
      this.computation.unresolvedDeps[keypath] = null;
      this.viewmodel.register(keypath, this.computation, "computed");
    }
  };

  var UnresolvedDependency__default = UnresolvedDependency__UnresolvedDependency;
  //# sourceMappingURL=01-_6to5-UnresolvedDependency.js.map

  var Computation__Computation = function (ractive, key, signature) {
    var _this = this;
    this.ractive = ractive;
    this.viewmodel = ractive.viewmodel;
    this.key = key;

    this.getter = signature.get;
    this.setter = signature.set;

    this.hardDeps = signature.deps || [];
    this.softDeps = [];
    this.unresolvedDeps = {};

    this.depValues = {};

    if (this.hardDeps) {
      this.hardDeps.forEach(function (d) {
        return ractive.viewmodel.register(d, _this, "computed");
      });
    }

    this._dirty = this._firstRun = true;
  };

  Computation__Computation.prototype = {
    constructor: Computation__Computation,

    init: function () {
      var initial;

      this.bypass = true;

      initial = this.ractive.viewmodel.get(this.key);
      this.ractive.viewmodel.clearCache(this.key);

      this.bypass = false;

      if (this.setter && initial !== undefined) {
        this.set(initial);
      }
    },

    invalidate: function () {
      this._dirty = true;
    },

    get: function () {
      var _this2 = this;
      var ractive, newDeps, dependenciesChanged, dependencyValuesChanged = false;

      if (this.getting) {
        // prevent double-computation (e.g. caused by array mutation inside computation)
        return;
      }

      this.getting = true;

      if (this._dirty) {
        ractive = this.ractive;

        // determine whether the inputs have changed, in case this depends on
        // other computed values
        if (this._firstRun || (!this.hardDeps.length && !this.softDeps.length)) {
          dependencyValuesChanged = true;
        } else {
          [this.hardDeps, this.softDeps].forEach(function (deps) {
            var keypath, value, i;

            if (dependencyValuesChanged) {
              return;
            }

            i = deps.length;
            while (i--) {
              keypath = deps[i];
              value = ractive.viewmodel.get(keypath);

              if (!is__isEqual(value, _this2.depValues[keypath])) {
                _this2.depValues[keypath] = value;
                dependencyValuesChanged = true;

                return;
              }
            }
          });
        }

        if (dependencyValuesChanged) {
          ractive.viewmodel.capture();

          try {
            this.value = this.getter.call(ractive);
          } catch (err) {
            log__default.warn({
              debug: ractive.debug,
              message: "failedComputation",
              args: {
                key: this.key,
                err: err.message || err
              }
            });

            this.value = void 0;
          }

          newDeps = ractive.viewmodel.release();
          dependenciesChanged = this.updateDependencies(newDeps);

          if (dependenciesChanged) {
            [this.hardDeps, this.softDeps].forEach(function (deps) {
              deps.forEach(function (keypath) {
                _this2.depValues[keypath] = ractive.viewmodel.get(keypath);
              });
            });
          }
        }

        this._dirty = false;
      }

      this.getting = this._firstRun = false;
      return this.value;
    },

    set: function (value) {
      if (this.setting) {
        this.value = value;
        return;
      }

      if (!this.setter) {
        throw new Error("Computed properties without setters are read-only. (This may change in a future version of Ractive!)");
      }

      this.setter.call(this.ractive, value);
    },

    updateDependencies: function (newDeps) {
      var i, oldDeps, keypath, dependenciesChanged, unresolved;

      oldDeps = this.softDeps;

      // remove dependencies that are no longer used
      i = oldDeps.length;
      while (i--) {
        keypath = oldDeps[i];

        if (newDeps.indexOf(keypath) === -1) {
          dependenciesChanged = true;
          this.viewmodel.unregister(keypath, this, "computed");
        }
      }

      // create references for any new dependencies
      i = newDeps.length;
      while (i--) {
        keypath = newDeps[i];

        if (oldDeps.indexOf(keypath) === -1 && (!this.hardDeps || this.hardDeps.indexOf(keypath) === -1)) {
          dependenciesChanged = true;

          // if this keypath is currently unresolved, we need to mark
          // it as such. TODO this is a bit muddy...
          if (Computation__isUnresolved(this.viewmodel, keypath) && (!this.unresolvedDeps[keypath])) {
            unresolved = new UnresolvedDependency__default(this, keypath);
            newDeps.splice(i, 1);

            this.unresolvedDeps[keypath] = unresolved;
            runloop__default.addUnresolved(unresolved);
          } else {
            this.viewmodel.register(keypath, this, "computed");
          }
        }
      }

      if (dependenciesChanged) {
        this.softDeps = newDeps.slice();
      }

      return dependenciesChanged;
    }
  };

  function Computation__isUnresolved(viewmodel, keypath) {
    var key = keypath.split(".")[0];

    return !(key in viewmodel.ractive.data) && !(key in viewmodel.computations) && !(key in viewmodel.mappings);
  }

  var Computation__default = Computation__Computation;
  //# sourceMappingURL=01-_6to5-Computation.js.map

  function compute__Viewmodel$compute(key, signature) {
    signature = getComputationSignature__default(signature);
    return (this.computations[key] = new Computation__default(this.ractive, key, signature));
  };
  var compute__default = compute__Viewmodel$compute;
  //# sourceMappingURL=01-_6to5-compute.js.map

	var FAILED_LOOKUP__default = { FAILED_LOOKUP: true };
	//# sourceMappingURL=01-_6to5-FAILED_LOOKUP.js.map

  var get__empty = {};

  function get__Viewmodel$get(keypath, options) {
    var _this = this;
    if (options === undefined) options = get__empty;
    return (function () {
      var ractive = _this.ractive, cache = _this.cache, mapping, value, computation, wrapped, captureGroup;

      // capture the keypath, if we're inside a computation
      if (options.capture && (captureGroup = _this.captureGroups[_this.captureGroups.length - 1])) {
        if (! ~captureGroup.indexOf(keypath)) {
          captureGroup.push(keypath);
        }
      }

      if (mapping = _this.mappings[keypath.split(".")[0]]) {
        return mapping.get(keypath, options);
      }

      if (keypath[0] === "@") {
        return keypaths__decodeKeypath(keypath);
      }

      if (cache[keypath] === undefined) {
        // Is this a computed property?
        if ((computation = _this.computations[keypath]) && !computation.bypass) {
          value = computation.get();
          _this.adapt(keypath, value);
        }

        // Is this a wrapped property?
        else if (wrapped = _this.wrapped[keypath]) {
          value = wrapped.value;
        }

        // Is it the root?
        else if (!keypath) {
          _this.adapt("", ractive.data);
          value = ractive.data;
        }

        // No? Then we need to retrieve the value one key at a time
        else {
          value = get__retrieve(_this, keypath);
        }

        cache[keypath] = value;
      } else {
        value = cache[keypath];
      }

      if (!options.noUnwrap && (wrapped = _this.wrapped[keypath])) {
        value = wrapped.get();
      }

      return value === FAILED_LOOKUP__default ? void 0 : value;
    })();
  };
  var get__default = get__Viewmodel$get;

  function get__retrieve(viewmodel, keypath) {
    var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped;

    keys = keypath.split(".");
    key = keys.pop();
    parentKeypath = keys.join(".");

    parentValue = viewmodel.get(parentKeypath);

    if (wrapped = viewmodel.wrapped[parentKeypath]) {
      parentValue = wrapped.get();
    }

    if (parentValue === null || parentValue === undefined) {
      return;
    }

    // update cache map
    if (!(cacheMap = viewmodel.cacheMap[parentKeypath])) {
      viewmodel.cacheMap[parentKeypath] = [keypath];
    } else {
      if (cacheMap.indexOf(keypath) === -1) {
        cacheMap.push(keypath);
      }
    }

    // If this property doesn't exist, we return a sentinel value
    // so that we know to query parent scope (if such there be)
    if (typeof parentValue === "object" && !(key in parentValue)) {
      return viewmodel.cache[keypath] = FAILED_LOOKUP__default;
    }

    value = parentValue[key];

    // Do we have an adaptor for this value?
    viewmodel.adapt(keypath, value, false);

    // Update cache
    viewmodel.cache[keypath] = value;
    return value;
  }
  //# sourceMappingURL=01-_6to5-get.js.map

  function viewmodel_prototype_init__Viewmodel$init() {
    var key, computation, computations = [];

    for (key in this.ractive.computed) {
      computation = this.compute(key, this.ractive.computed[key]);
      computations.push(computation);

      if (key in this.mappings) {
        log__default.critical({
          message: "Cannot map to a computed property ('" + key + "')"
        });
      }
    }

    computations.forEach(viewmodel_prototype_init__init);
  };
  var viewmodel_prototype_init__default = viewmodel_prototype_init__Viewmodel$init;

  function viewmodel_prototype_init__init(computation) {
    computation.init();
  }
  //# sourceMappingURL=01-_6to5-init.js.map

  function DataTracker__DataTracker(key, viewmodel) {
    this.keypath = key;
    this.viewmodel = viewmodel;
  }

  var DataTracker__default = DataTracker__DataTracker;

  DataTracker__DataTracker.prototype.setValue = function (value) {
    this.viewmodel.set(this.keypath, value, { noMapping: true });
  };
  //# sourceMappingURL=01-_6to5-DataTracker.js.map

  function Mapping__Mapping(localKey, options) {
    this.localKey = localKey;
    this.keypath = options.keypath;
    this.origin = options.origin;

    this.trackData = options.trackData;
    this.resolved = false;
  }

  var Mapping__default = Mapping__Mapping;

  Mapping__Mapping.prototype = {
    get: function (keypath, options) {
      if (!this.resolved) {
        return undefined;
      }
      return this.origin.get(this.map(keypath), options);
    },

    getValue: function () {
      if (!this.keypath) {
        return undefined;
      }
      return this.origin.get(this.keypath);
    },

    initViewmodel: function (viewmodel) {
      this.local = viewmodel;
      this.deps = [];
      this.local.mappings[this.localKey] = this;
      this.setup();
    },

    map: function (keypath) {
      return keypath.replace(this.localKey, this.keypath);
    },

    register: function (keypath, dependant, group) {
      this.deps.push({ keypath: keypath, dep: dependant, group: group });
      this.origin.register(this.map(keypath), dependant, group);
    },

    resolve: function (keypath) {
      if (this.keypath !== undefined) {
        this.unbind(true);
      }

      this.keypath = keypath;
      this.setup();
    },

    set: function (keypath, value) {
      // TODO: force resolution
      if (!this.resolved) {
        throw new Error("Something very odd happened. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!");
      }

      this.origin.set(this.map(keypath), value);
    },

    setup: function () {
      var _this = this;
      if (this.keypath === undefined) {
        return;
      }

      this.resolved = true;

      // keep local data in sync, for browsers w/ no defineProperty
      if (this.trackData) {
        this.tracker = new DataTracker__default(this.localKey, this.local);
        this.origin.register(this.keypath, this.tracker);
      }

      // accumulated dependants can now be registered
      if (this.deps.length) {
        this.deps.forEach(function (d) {
          var keypath = _this.map(d.keypath);
          _this.origin.register(keypath, d.dep, d.group);
          d.dep.setValue(_this.origin.get(keypath));
        });

        this.origin.mark(this.keypath);
      }
    },

    setValue: function (value) {
      if (!this.keypath) {
        throw new Error("Mapping does not have keypath, cannot set value. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!");
      }

      this.origin.set(this.keypath, value);
    },

    unbind: function (keepLocal) {
      var _this2 = this;
      if (!keepLocal) {
        delete this.local.mappings[this.localKey];
      }

      this.deps.forEach(function (d) {
        _this2.origin.unregister(_this2.map(d.keypath), d.dep, d.group);
      });

      if (this.tracker) {
        this.origin.unregister(this.keypath, this.tracker);
      }
    },

    unregister: function (keypath, dependant, group) {
      var deps = this.deps, i = deps.length;

      while (i--) {
        if (deps[i].dep === dependant) {
          deps.splice(i, 1);
          break;
        }
      }
      this.origin.unregister(this.map(keypath), dependant, group);
    }
  };
  //# sourceMappingURL=01-_6to5-Mapping.js.map

  function map__Viewmodel$map(key, options) {
    var mapping = new Mapping__default(key, options);
    mapping.initViewmodel(this);
    return mapping;
  };
  var map__default = map__Viewmodel$map;
  //# sourceMappingURL=01-_6to5-map.js.map

  function mark__Viewmodel$mark(keypath, options) {
    var computation;

    runloop__default.addViewmodel(this); // TODO remove other instances of this call

    // implicit changes (i.e. `foo.length` on `ractive.push('foo',42)`)
    // should not be picked up by pattern observers
    if (options) {
      if (options.implicit) {
        this.implicitChanges[keypath] = true;
      }
      if (options.noCascade) {
        this.noCascade[keypath] = true;
      }
    }

    if (computation = this.computations[keypath]) {
      computation.invalidate();
    }

    if (this.changes.indexOf(keypath) === -1) {
      this.changes.push(keypath);
    }

    // pass on dontTeardownWrapper, if we can
    var dontTeardownWrapper = options ? options.dontTeardownWrapper : false;

    this.clearCache(keypath, dontTeardownWrapper);
  };
  var mark__default = mark__Viewmodel$mark;
  //# sourceMappingURL=01-_6to5-mark.js.map

  var mapOldToNewIndex__default = function (oldArray, newArray) {
    var usedIndices, firstUnusedIndex, newIndices, changed;

    usedIndices = {};
    firstUnusedIndex = 0;

    newIndices = oldArray.map(function (item, i) {
      var index, start, len;

      start = firstUnusedIndex;
      len = newArray.length;

      do {
        index = newArray.indexOf(item, start);

        if (index === -1) {
          changed = true;
          return -1;
        }

        start = index + 1;
      } while (usedIndices[index] && start < len);

      // keep track of the first unused index, so we don't search
      // the whole of newArray for each item in oldArray unnecessarily
      if (index === firstUnusedIndex) {
        firstUnusedIndex += 1;
      }

      if (index !== i) {
        changed = true;
      }

      usedIndices[index] = true;
      return index;
    });

    return newIndices;
  };
  //# sourceMappingURL=01-_6to5-mapOldToNewIndex.js.map

  var merge__comparators = {};

  function merge__Viewmodel$merge(keypath, currentArray, array, options) {
    var oldArray, newArray, comparator, newIndices;

    this.mark(keypath);

    if (options && options.compare) {
      comparator = merge__getComparatorFunction(options.compare);

      try {
        oldArray = currentArray.map(comparator);
        newArray = array.map(comparator);
      } catch (err) {
        // fallback to an identity check - worst case scenario we have
        // to do more DOM manipulation than we thought...

        // ...unless we're in debug mode of course
        if (this.debug) {
          throw err;
        } else {
          warn__default("Merge operation: comparison failed. Falling back to identity checking");
        }

        oldArray = currentArray;
        newArray = array;
      }
    } else {
      oldArray = currentArray;
      newArray = array;
    }

    // find new indices for members of oldArray
    newIndices = mapOldToNewIndex__default(oldArray, newArray);

    this.smartUpdate(keypath, array, newIndices, currentArray.length !== array.length);
  };
  var merge__default = merge__Viewmodel$merge;

  function merge__stringify(item) {
    return JSON.stringify(item);
  }

  function merge__getComparatorFunction(comparator) {
    // If `compare` is `true`, we use JSON.stringify to compare
    // objects that are the same shape, but non-identical - i.e.
    // { foo: 'bar' } !== { foo: 'bar' }
    if (comparator === true) {
      return merge__stringify;
    }

    if (typeof comparator === "string") {
      if (!merge__comparators[comparator]) {
        merge__comparators[comparator] = function (item) {
          return item[comparator];
        };
      }

      return merge__comparators[comparator];
    }

    if (typeof comparator === "function") {
      return comparator;
    }

    throw new Error("The `compare` option must be a function, or a string representing an identifying field (or `true` to use JSON.stringify)");
  }
  //# sourceMappingURL=01-_6to5-merge.js.map

  function register__Viewmodel$register(keypath, dependant, group) {
    if (group === undefined) group = "default";
    var mapping, depsByKeypath, deps;

    if (dependant.isStatic) {
      return;
    }

    if (mapping = this.mappings[keypath.split(".")[0]]) {
      return mapping.register(keypath, dependant, group);
    }

    depsByKeypath = this.deps[group] || (this.deps[group] = {});
    deps = depsByKeypath[keypath] || (depsByKeypath[keypath] = []);

    deps.push(dependant);

    if (!keypath) {
      return;
    }

    register__updateDependantsMap(this, keypath, group);
  };
  var register__default = register__Viewmodel$register;

  function register__updateDependantsMap(viewmodel, keypath, group) {
    var keys, parentKeypath, map, parent;

    // update dependants map
    keys = keypath.split(".");

    while (keys.length) {
      keys.pop();
      parentKeypath = keys.join(".");

      map = viewmodel.depsMap[group] || (viewmodel.depsMap[group] = {});
      parent = map[parentKeypath] || (map[parentKeypath] = []);

      if (parent[keypath] === undefined) {
        parent[keypath] = 0;
        parent.push(keypath);
      }

      parent[keypath] += 1;

      keypath = parentKeypath;
    }
  }
  //# sourceMappingURL=01-_6to5-register.js.map

  function release__Viewmodel$release() {
    return this.captureGroups.pop();
  };
  var release__default = release__Viewmodel$release;
  //# sourceMappingURL=01-_6to5-release.js.map

  function set__Viewmodel$set(keypath, value, options) {
    if (options === undefined) options = {};
    var mapping, computation, wrapper, dontTeardownWrapper;

    // unless data is being set for data tracking purposes
    if (!options.noMapping) {
      // If this data belongs to a different viewmodel,
      // pass the change along
      if (mapping = this.mappings[keypath.split(".")[0]]) {
        return mapping.set(keypath, value);
      }
    }

    computation = this.computations[keypath];
    if (computation) {
      if (computation.setting) {
        // let the other computation set() handle things...
        return;
      }
      computation.set(value);
      value = computation.get();
    }

    if (is__isEqual(this.cache[keypath], value)) {
      return;
    }

    wrapper = this.wrapped[keypath];

    // If we have a wrapper with a `reset()` method, we try and use it. If the
    // `reset()` method returns false, the wrapper should be torn down, and
    // (most likely) a new one should be created later
    if (wrapper && wrapper.reset) {
      dontTeardownWrapper = (wrapper.reset(value) !== false);

      if (dontTeardownWrapper) {
        value = wrapper.get();
      }
    }

    if (!computation && !dontTeardownWrapper) {
      set__resolveSet(this, keypath, value);
    }

    if (!options.silent) {
      this.mark(keypath);
    } else {
      // We're setting a parent of the original target keypath (i.e.
      // creating a fresh branch) - we need to clear the cache, but
      // not mark it as a change
      this.clearCache(keypath);
    }
  };
  var set__default = set__Viewmodel$set;

  function set__resolveSet(viewmodel, keypath, value) {
    var keys, lastKey, parentKeypath, wrapper, parentValue, wrapperSet, valueSet;

    wrapperSet = function () {
      if (wrapper.set) {
        wrapper.set(lastKey, value);
      } else {
        parentValue = wrapper.get();
        valueSet();
      }
    };

    valueSet = function () {
      if (!parentValue) {
        parentValue = createBranch__default(lastKey);
        viewmodel.set(parentKeypath, parentValue, { silent: true });
      }
      parentValue[lastKey] = value;
    };

    keys = keypath.split(".");
    lastKey = keys.pop();
    parentKeypath = keys.join(".");

    wrapper = viewmodel.wrapped[parentKeypath];

    if (wrapper) {
      wrapperSet();
    } else {
      parentValue = viewmodel.get(parentKeypath);

      // may have been wrapped via the above .get()
      // call on viewmodel if this is first access via .set()!
      if (wrapper = viewmodel.wrapped[parentKeypath]) {
        wrapperSet();
      } else {
        valueSet();
      }
    }
  }
  //# sourceMappingURL=01-_6to5-set.js.map

  var smartUpdate__implicitOption = { implicit: true }, smartUpdate__noCascadeOption = { noCascade: true };

  function smartUpdate__Viewmodel$smartUpdate(keypath, array, newIndices) {
    var _this = this;
    var dependants, oldLength;

    oldLength = newIndices.length;

    // Indices that are being removed should be marked as dirty
    newIndices.forEach(function (newIndex, oldIndex) {
      if (newIndex === -1) {
        _this.mark(keypath + "." + oldIndex, smartUpdate__noCascadeOption);
      }
    });

    // Update the model
    // TODO allow existing array to be updated in place, rather than replaced?
    this.set(keypath, array, { silent: true });

    if (dependants = this.deps["default"][keypath]) {
      dependants.filter(smartUpdate__canShuffle).forEach(function (d) {
        return d.shuffle(newIndices, array);
      });
    }

    if (oldLength !== array.length) {
      this.mark(keypath + ".length", smartUpdate__implicitOption);

      for (var i = oldLength; i < array.length; i += 1) {
        this.mark(keypath + "." + i);
      }

      // don't allow removed indexes beyond end of new array to trigger recomputations
      // TODO is this still necessary, now that computations are lazy?
      for (var i = array.length; i < oldLength; i += 1) {
        this.mark(keypath + "." + i, smartUpdate__noCascadeOption);
      }
    }
  };
  var smartUpdate__default = smartUpdate__Viewmodel$smartUpdate;

  function smartUpdate__canShuffle(dependant) {
    return typeof dependant.shuffle === "function";
  }
  //# sourceMappingURL=01-_6to5-smartUpdate.js.map

  function teardown__Viewmodel$teardown() {
    var _this = this;
    var unresolvedImplicitDependency;

    // Clear entire cache - this has the desired side-effect
    // of unwrapping adapted values (e.g. arrays)
    Object.keys(this.cache).forEach(function (keypath) {
      return _this.clearCache(keypath);
    });

    // Teardown any failed lookups - we don't need them to resolve any more
    while (unresolvedImplicitDependency = this.unresolvedImplicitDependencies.pop()) {
      unresolvedImplicitDependency.teardown();
    }
  };
  var teardown__default = teardown__Viewmodel$teardown;
  //# sourceMappingURL=01-_6to5-teardown.js.map

  function unregister__Viewmodel$unregister(keypath, dependant, group) {
    if (group === undefined) group = "default";
    var mapping, deps, index;

    if (dependant.isStatic) {
      return;
    }

    if (mapping = this.mappings[keypath.split(".")[0]]) {
      return mapping.unregister(keypath, dependant, group);
    }

    deps = this.deps[group][keypath];
    index = deps.indexOf(dependant);

    if (index === -1) {
      throw new Error("Attempted to remove a dependant that was no longer registered! This should not happen. If you are seeing this bug in development please raise an issue at https://github.com/RactiveJS/Ractive/issues - thanks");
    }

    deps.splice(index, 1);

    if (!keypath) {
      return;
    }

    unregister__updateDependantsMap(this, keypath, group);
  };
  var unregister__default = unregister__Viewmodel$unregister;

  function unregister__updateDependantsMap(viewmodel, keypath, group) {
    var keys, parentKeypath, map, parent;

    // update dependants map
    keys = keypath.split(".");

    while (keys.length) {
      keys.pop();
      parentKeypath = keys.join(".");

      map = viewmodel.depsMap[group];
      parent = map[parentKeypath];

      parent[keypath] -= 1;

      if (!parent[keypath]) {
        // remove from parent deps map
        array__removeFromArray(parent, keypath);
        parent[keypath] = undefined;
      }

      keypath = parentKeypath;
    }
  }
  //# sourceMappingURL=01-_6to5-unregister.js.map

  // should this be combined with prototype/adapt.js?

  var adaptConfig__configure = {
    lookup: function (target, adaptors) {
      var i, adapt = target.adapt;

      if (!adapt || !adapt.length) {
        return adapt;
      }


      if (adaptors && Object.keys(adaptors).length && (i = adapt.length)) {
        while (i--) {
          var adaptor = adapt[i];

          if (typeof adaptor === "string") {
            adapt[i] = adaptors[adaptor] || adaptor;
          }
        }
      }

      return adapt;
    },

    combine: function (parent, adapt) {
      // normalize 'Foo' to [ 'Foo' ]
      parent = adaptConfig__arrayIfString(parent);
      adapt = adaptConfig__arrayIfString(adapt);

      // no parent? return adapt
      if (!parent || !parent.length) {
        return adapt;
      }

      // no adapt? return 'copy' of parent
      if (!adapt || !adapt.length) {
        return parent.slice();
      }

      // add parent adaptors to options
      parent.forEach(function (a) {
        // don't put in duplicates
        if (adapt.indexOf(a) === -1) {
          adapt.push(a);
        }
      });

      return adapt;
    }
  };

  function adaptConfig__arrayIfString(adapt) {
    if (typeof adapt === "string") {
      adapt = [adapt];
    }

    return adapt;
  }

  var adaptConfig__default = adaptConfig__configure;
  //# sourceMappingURL=01-_6to5-adaptConfig.js.map

  var Viewmodel__Viewmodel = function (ractive, mappings) {
    var _this = this;
    if (mappings === undefined) mappings = object__create(null);
    return (function () {
      var key, mapping;

      _this.ractive = ractive; // TODO eventually, we shouldn't need this reference

      Viewmodel__Viewmodel.extend(ractive.constructor, ractive);

      // set up explicit mappings
      _this.mappings = mappings;
      for (key in mappings) {
        mappings[key].initViewmodel(_this);
      }

      if (ractive.data && ractive.parameters !== true) {
        // if data exists locally, but is missing on the parent,
        // we transfer ownership to the parent
        for (key in ractive.data) {
          if ((mapping = _this.mappings[key]) && mapping.getValue() === undefined) {
            mapping.setValue(ractive.data[key]);
          }
        }
      }

      _this.cache = {}; // we need to be able to use hasOwnProperty, so can't inherit from null
      _this.cacheMap = object__create(null);

      _this.deps = {
        computed: object__create(null),
        "default": object__create(null)
      };
      _this.depsMap = {
        computed: object__create(null),
        "default": object__create(null)
      };

      _this.patternObservers = [];

      _this.specials = object__create(null);

      _this.wrapped = object__create(null);
      _this.computations = object__create(null);

      _this.captureGroups = [];
      _this.unresolvedImplicitDependencies = [];

      _this.changes = [];
      _this.implicitChanges = {};
      _this.noCascade = {};
    })();
  };

  Viewmodel__Viewmodel.extend = function (Parent, instance) {
    if (instance.magic && !magic__default) {
      throw new Error("Getters and setters (magic mode) are not supported in this browser");
    }

    instance.adapt = adaptConfig__default.combine(Parent.prototype.adapt, instance.adapt) || [];

    instance.adapt = adaptConfig__default.lookup(instance, instance.adaptors);
  };

  Viewmodel__Viewmodel.prototype = {
    adapt: adapt__default,
    applyChanges: applyChanges__default,
    capture: capture__default,
    clearCache: clearCache__default,
    compute: compute__default,
    get: get__default,
    init: viewmodel_prototype_init__default,
    map: map__default,
    mark: mark__default,
    merge: merge__default,
    register: register__default,
    release: release__default,
    set: set__default,
    smartUpdate: smartUpdate__default,
    teardown: teardown__default,
    unregister: unregister__default
  };

  var Viewmodel__default = Viewmodel__Viewmodel;
  //# sourceMappingURL=01-_6to5-Viewmodel.js.map

  var initialise__constructHook = new Hook__default("construct"), initialise__configHook = new Hook__default("config"), initialise__initHook = new HookQueue__default("init"), initialise__uid = 0;

  var initialise__default = initialise__initialiseRactiveInstance;

  function initialise__initialiseRactiveInstance(ractive, userOptions, options) {
    if (userOptions === undefined) userOptions = {};
    if (options === undefined) options = {};


    var el;

    initialise__initialiseProperties(ractive, options);

    // make this option do what would be expected if someone
    // did include it on a new Ractive() or new Component() call.
    // Silly to do so (put a hook on the very options being used),
    // but handle it correctly, consistent with the intent.
    initialise__constructHook.fire(config__default.getConstructTarget(ractive, userOptions), userOptions);

    // init config from Parent and options
    config__default.init(ractive.constructor, ractive, userOptions);

    initialise__configHook.fire(ractive);

    initialise__initHook.begin(ractive);

    // TEMPORARY. This is so we can implement Viewmodel gradually
    ractive.viewmodel = new Viewmodel__default(ractive, options.mappings);

    // hacky circular problem until we get this sorted out
    // if viewmodel immediately processes computed properties,
    // they may call ractive.get, which calls ractive.viewmodel,
    // which hasn't been set till line above finishes.
    ractive.viewmodel.init();

    // Render our *root fragment*
    if (ractive.template) {
      ractive.fragment = new Fragment__default({
        template: ractive.template,
        root: ractive,
        owner: ractive });
    }

    initialise__initHook.end(ractive);

    // render automatically ( if `el` is specified )
    if (el = dom__getElement(ractive.el)) {
      ractive.render(el, ractive.append);
    }
  }

  function initialise__initialiseProperties(ractive, options) {
    // Generate a unique identifier, for places where you'd use a weak map if it
    // existed
    ractive._guid = "r-" + initialise__uid++;

    // events
    ractive._subs = object__create(null);

    // storage for item configuration from instantiation to reset,
    // like dynamic functions or original values
    ractive._config = {};

    // two-way bindings
    ractive._twowayBindings = object__create(null);

    // animations (so we can stop any in progress at teardown)
    ractive._animations = [];

    // nodes registry
    ractive.nodes = {};

    // live queries
    ractive._liveQueries = [];
    ractive._liveComponentQueries = [];

    // bound data functions
    ractive._boundFunctions = [];


    // properties specific to inline components
    if (options.component) {
      ractive.parent = options.parent;
      ractive.container = options.container || null;
      ractive.root = ractive.parent.root;

      ractive.component = options.component;
      options.component.instance = ractive;

      // for hackability, this could be an open option
      // for any ractive instance, but for now, just
      // for components and just for ractive...
      ractive._inlinePartials = options.inlinePartials;
    } else {
      ractive.root = ractive;
      ractive.parent = ractive.container = null;
    }
  }
  //# sourceMappingURL=01-_6to5-initialise.js.map

  var createInstance__default = function (component, Component, parameters, yieldTemplate, partials) {
    var instance, parentFragment, ractive, fragment, container, inlinePartials = {};

    parentFragment = component.parentFragment;
    ractive = component.root;

    partials = partials || {};
    object__extend(inlinePartials, partials || {});

    // Make contents available as a {{>content}} partial
    partials.content = yieldTemplate || [];

    // set a default partial for yields with no name
    inlinePartials[""] = partials.content;

    if (Component.defaults.el) {
      log__default.warn({
        debug: ractive.debug,
        message: "defaultElSpecified",
        args: {
          name: component.name
        }
      });
    }

    // find container
    fragment = parentFragment;
    while (fragment) {
      if (fragment.owner.type === types__YIELDER) {
        container = fragment.owner.container;
        break;
      }

      fragment = fragment.parent;
    }

    instance = object__create(Component.prototype);

    initialise__default(instance, {
      el: null,
      append: true,
      data: parameters.data,
      partials: partials,
      magic: ractive.magic || Component.defaults.magic,
      modifyArrays: ractive.modifyArrays,
      // need to inherit runtime parent adaptors
      adapt: ractive.adapt
    }, {
      parent: ractive,
      component: component,
      container: container,
      mappings: parameters.mappings,
      inlinePartials: inlinePartials
    });

    return instance;
  };
  //# sourceMappingURL=01-_6to5-createInstance.js.map

  function ComplexParameter__ComplexParameter(parameters, key, value) {
    this.parameters = parameters;
    this.parentFragment = parameters.component.parentFragment;
    this.key = key;

    this.fragment = new Fragment__default({
      template: value,
      root: parameters.component.root,
      owner: this
    });

    this.parameters.addData(this.key, this.fragment.getValue());
  }

  var ComplexParameter__default = ComplexParameter__ComplexParameter;

  ComplexParameter__ComplexParameter.prototype = {
    bubble: function () {
      if (!this.dirty) {
        this.dirty = true;
        runloop__default.addView(this);
      }
    },

    update: function () {
      var viewmodel = this.parameters.component.instance.viewmodel;

      this.parameters.addData(this.key, this.fragment.getValue());
      viewmodel.mark(this.key);

      this.dirty = false;
    },

    rebind: function (oldKeypath, newKeypath) {
      this.fragment.rebind(oldKeypath, newKeypath);
    },

    unbind: function () {
      this.fragment.unbind();
    }
  };
  //# sourceMappingURL=01-_6to5-ComplexParameter.js.map

  function createComponentData__createComponentData(parameters, proto) {
    // Don't do anything with data at all..
    if (!proto.parameters) {
      return parameters.data;
    }
    // No magic or legacy requested
    else if (!magic__default || proto.parameters === "legacy") {
      return createComponentData__createLegacyData(parameters);
    }
    // ES5 ftw!
    return createComponentData__createDataFromPrototype(parameters, proto);
  };
  var createComponentData__default = createComponentData__createComponentData;

  function createComponentData__createLegacyData(parameters) {
    var mappings = parameters.mappings, key;

    for (key in mappings) {
      var mapping = mappings[key];
      mapping.trackData = true;

      if (!mapping.updatable) {
        parameters.addData(key, mapping.getValue());
      }
    }

    return parameters.data;
  }

  function createComponentData__createDataFromPrototype(parameters, proto) {
    var ComponentData = createComponentData__getConstructor(parameters, proto);
    return new ComponentData(parameters);
  }

  function createComponentData__getConstructor(parameters, proto) {
    var protoparams = proto._parameters;

    if (!protoparams.Constructor || parameters.newKeys.length) {
      protoparams.Constructor = createComponentData__makeConstructor(parameters, protoparams.defined);
    }

    return protoparams.Constructor;
  }

  function createComponentData__makeConstructor(parameters, defined) {
    var properties, proto;

    properties = parameters.keys.reduce(function (definition, key) {
      definition[key] = {
        get: function () {
          var mapping = this._mappings[key];

          if (mapping) {
            return mapping.getValue();
          } else {
            return this._data[key];
          }
        },
        set: function (value) {
          var mapping = this._mappings[key];

          if (mapping) {
            runloop__default.start();
            mapping.setValue(value);
            runloop__default.end();
          } else {
            this._data[key] = value;
          }
        },
        enumerable: true
      };

      return definition;
    }, defined);

    function ComponentData(options) {
      this._mappings = options.mappings;
      this._data = options.data || {};
    }

    object__defineProperties(proto = {}, properties);
    proto.constructor = ComponentData;
    ComponentData.prototype = proto;

    return ComponentData;
  }
  //# sourceMappingURL=01-_6to5-createComponentData.js.map

  function ParameterResolver__ParameterResolver(parameters, key, template) {
    var component, resolve;

    this.parameters = parameters;
    this.key = key;
    this.resolved = this.ready = false;

    component = parameters.component;
    resolve = this.resolve.bind(this);

    if (template.r) {
      this.resolver = createReferenceResolver__default(component, template.r, resolve);
    } else if (template.x) {
      this.resolver = new ExpressionResolver__default(component, component.parentFragment, template.x, resolve);
    } else if (template.rx) {
      this.resolver = new ReferenceExpressionResolver__default(component, template.rx, resolve);
    }

    if (!this.resolved) {
      // note the mapping anyway, for the benefit of child components
      parameters.addMapping(key);
    }

    this.ready = true;
  }

  var ParameterResolver__default = ParameterResolver__ParameterResolver;

  ParameterResolver__ParameterResolver.prototype = {
    resolve: function (keypath) {
      this.resolved = true;
      this.specialRef = keypath[0] === "@";

      if (this.ready) {
        this.readyResolve(keypath);
      } else {
        this.notReadyResolve(keypath);
      }
    },

    notReadyResolve: function (keypath) {
      if (this.specialRef) {
        this.parameters.addData(this.key, keypaths__decodeKeypath(keypath));
      } else {
        var mapping = this.parameters.addMapping(this.key, keypath);

        if (mapping.getValue() === undefined) {
          mapping.updatable = true;
        }
      }
    },

    readyResolve: function (keypath) {
      var viewmodel = this.parameters.component.instance.viewmodel;

      if (this.specialRef) {
        this.parameters.addData(this.key, keypaths__decodeKeypath(keypath));
        viewmodel.mark(this.key);
      } else if (viewmodel.reversedMappings && viewmodel.reversedMappings[this.key]) {
        viewmodel.reversedMappings[this.key].rebind(keypath);
      } else {
        viewmodel.mappings[this.key].resolve(keypath);
      }
    }
  };
  //# sourceMappingURL=01-_6to5-ParameterResolver.js.map

  function createParameters__createParameters(component, proto, attributes) {
    var parameters, data, defined;

    if (!attributes) {
      return { data: {} };
    }

    if (proto.parameters) {
      defined = createParameters__getParamsDefinition(proto);
    }

    parameters = new createParameters__ComponentParameters(component, attributes, defined);
    data = createComponentData__default(parameters, proto);

    return { data: data, mappings: parameters.mappings };
  };
  var createParameters__default = createParameters__createParameters;

  function createParameters__getParamsDefinition(proto) {
    if (!proto._parameters) {
      proto._parameters = { defined: {} };
    } else if (!proto._parameters.defined) {
      proto._parameters.defined = {};
    }
    return proto._parameters.defined;
  }


  function createParameters__ComponentParameters(component, attributes, defined) {
    var _this = this;
    this.component = component;
    this.parentViewmodel = component.root.viewmodel;
    this.data = {};
    this.mappings = object__create(null);
    this.newKeys = [];
    this.keys = Object.keys(attributes);

    this.keys.forEach(function (key) {
      if (defined && !defined[key]) {
        _this.newKeys.push(key);
      }
      _this.add(key, attributes[key]);
    });
  }

  createParameters__ComponentParameters.prototype = {
    add: function (key, template) {
      // We have static data
      if (typeof template === "string") {
        var parsed = parseJSON__default(template);
        this.addData(key, parsed ? parsed.value : template);
      }
      // Empty string
      // TODO valueless attributes also end up here currently
      // (i.e. `<widget bool>` === `<widget bool=''>`) - this
      // is probably incorrect
      else if (template === 0) {
        this.addData(key);
      }
      // Interpolators
      else {
        var resolver;
        // Single interpolator
        if (createParameters__isSingleInterpolator(template)) {
          resolver = new ParameterResolver__default(this, key, template[0]).resolver;
        }
        // We have a 'complex' parameter, e.g.
        // `<widget foo='{{bar}} {{baz}}'/>`
        else {
          resolver = new ComplexParameter__default(this, key, template);
        }
        this.component.resolvers.push(resolver);
      }
    },

    addData: function (key, value) {
      this.data[key] = value;
    },

    addMapping: function (key, keypath) {
      // map directly to the source if possible...
      var mapping = this.parentViewmodel.mappings[keypath];
      return this.mappings[key] = new Mapping__default(key, {
        origin: mapping ? mapping.origin : this.parentViewmodel,
        keypath: mapping ? mapping.keypath : keypath
      });
    }
  };

  function createParameters__isSingleInterpolator(template) {
    return template.length === 1 && template[0].t === types__INTERPOLATOR;
  }
  //# sourceMappingURL=01-_6to5-createParameters.js.map

  function propagateEvents__propagateEvents(component, eventsDescriptor) {
    var eventName;

    for (eventName in eventsDescriptor) {
      if (eventsDescriptor.hasOwnProperty(eventName)) {
        propagateEvents__propagateEvent(component.instance, component.root, eventName, eventsDescriptor[eventName]);
      }
    }
  };
  var propagateEvents__default = propagateEvents__propagateEvents;

  function propagateEvents__propagateEvent(childInstance, parentInstance, eventName, proxyEventName) {
    if (typeof proxyEventName !== "string") {
      log__default.error({
        debug: parentInstance.debug,
        message: "noComponentEventArguments"
      });
    }

    childInstance.on(eventName, function () {
      var event, args;

      // semi-weak test, but what else? tag the event obj ._isEvent ?
      if (arguments.length && arguments[0] && arguments[0].node) {
        event = Array.prototype.shift.call(arguments);
      }

      args = Array.prototype.slice.call(arguments);

      fireEvent__default(parentInstance, proxyEventName, { event: event, args: args });

      // cancel bubbling
      return false;
    });
  }
  //# sourceMappingURL=01-_6to5-propagateEvents.js.map

  var updateLiveQueries__default = function (component) {
    var ancestor, query;

    // If there's a live query for this component type, add it
    ancestor = component.root;
    while (ancestor) {
      if (query = ancestor._liveComponentQueries["_" + component.name]) {
        query.push(component.instance);
      }

      ancestor = ancestor.parent;
    }
  };
  //# sourceMappingURL=01-_6to5-updateLiveQueries.js.map

  function Component_prototype_init__Component$init(options, Component) {
    var parentFragment, root, parameters;

    if (!Component) {
      throw new Error("Component \"" + this.name + "\" not found");
    }

    parentFragment = this.parentFragment = options.parentFragment;
    root = parentFragment.root;

    this.root = root;
    this.type = types__COMPONENT;
    this.name = options.template.e;
    this.index = options.index;
    this.indexRefBindings = {};
    this.yielders = {};
    this.resolvers = [];

    parameters = createParameters__default(this, Component.prototype, options.template.a);
    createInstance__default(this, Component, parameters, options.template.f, options.template.p);
    propagateEvents__default(this, options.template.v);

    // intro, outro and decorator directives have no effect
    if (options.template.t1 || options.template.t2 || options.template.o) {
      warn__default("The \"intro\", \"outro\" and \"decorator\" directives have no effect on components");
    }

    updateLiveQueries__default(this);
  };
  var Component_prototype_init__default = Component_prototype_init__Component$init;
  //# sourceMappingURL=01-_6to5-init.js.map

  function Component_prototype_rebind__Component$rebind(oldKeypath, newKeypath) {
    var query;

    this.resolvers.forEach(rebind);

    for (var k in this.yielders) {
      if (this.yielders[k][0]) {
        rebind(this.yielders[k][0]);
      }
    }

    if (query = this.root._liveComponentQueries["_" + this.name]) {
      query._makeDirty();
    }

    function rebind(x) {
      x.rebind(oldKeypath, newKeypath);
    }
  };
  var Component_prototype_rebind__default = Component_prototype_rebind__Component$rebind;
  //# sourceMappingURL=01-_6to5-rebind.js.map

  function Component_prototype_render__Component$render() {
    var instance = this.instance;

    instance.render(this.parentFragment.getNode());

    this.rendered = true;
    return instance.fragment.detach();
  };
  var Component_prototype_render__default = Component_prototype_render__Component$render;
  //# sourceMappingURL=01-_6to5-render.js.map

  function Component_prototype_toString__Component$toString() {
    return this.instance.fragment.toString();
  };
  var Component_prototype_toString__default = Component_prototype_toString__Component$toString;
  //# sourceMappingURL=01-_6to5-toString.js.map

  var Component_prototype_unbind__teardownHook = new Hook__default("teardown");

  function Component_prototype_unbind__Component$unbind() {
    var instance = this.instance;

    this.resolvers.forEach(methodCallers__unbind);

    Component_prototype_unbind__removeFromLiveComponentQueries(this);

    // teardown the instance
    instance.fragment.unbind();
    instance.viewmodel.teardown();

    if (instance.fragment.rendered && instance.el.__ractive_instances__) {
      array__removeFromArray(instance.el.__ractive_instances__, instance);
    }

    Component_prototype_unbind__teardownHook.fire(instance);
  };
  var Component_prototype_unbind__default = Component_prototype_unbind__Component$unbind;

  function Component_prototype_unbind__removeFromLiveComponentQueries(component) {
    var instance, query;

    instance = component.root;

    do {
      if (query = instance._liveComponentQueries["_" + component.name]) {
        query._remove(component);
      }
    } while (instance = instance.parent);
  }
  //# sourceMappingURL=01-_6to5-unbind.js.map

  function Component_prototype_unrender__Component$unrender(shouldDestroy) {
    this.shouldDestroy = shouldDestroy;
    this.instance.unrender();
  };
  var Component_prototype_unrender__default = Component_prototype_unrender__Component$unrender;
  //# sourceMappingURL=01-_6to5-unrender.js.map

  var Component__Component = function (options, Constructor) {
    this.init(options, Constructor);
  };

  Component__Component.prototype = {
    detach: Component_prototype_detach__default,
    find: Component_prototype_find__default,
    findAll: Component_prototype_findAll__default,
    findAllComponents: Component_prototype_findAllComponents__default,
    findComponent: Component_prototype_findComponent__default,
    findNextNode: Component_prototype_findNextNode__default,
    firstNode: Component_prototype_firstNode__default,
    init: Component_prototype_init__default,
    rebind: Component_prototype_rebind__default,
    render: Component_prototype_render__default,
    toString: Component_prototype_toString__default,
    unbind: Component_prototype_unbind__default,
    unrender: Component_prototype_unrender__default
  };

  var Component__default = Component__Component;
  //# sourceMappingURL=01-_6to5-_Component.js.map

  var Comment__Comment = function (options) {
    this.type = types__COMMENT;
    this.value = options.template.c;
  };

  Comment__Comment.prototype = {
    detach: detach__default,

    firstNode: function () {
      return this.node;
    },

    render: function () {
      if (!this.node) {
        this.node = document.createComment(this.value);
      }

      return this.node;
    },

    toString: function () {
      return "<!--" + this.value + "-->";
    },

    unrender: function (shouldDestroy) {
      if (shouldDestroy) {
        this.node.parentNode.removeChild(this.node);
      }
    }
  };

  var Comment__default = Comment__Comment;
  //# sourceMappingURL=01-_6to5-Comment.js.map

  var Yielder__Yielder = function (options) {
    var container, component;

    this.type = types__YIELDER;

    this.container = container = options.parentFragment.root;
    this.component = component = container.component;

    this.container = container;
    this.containerFragment = options.parentFragment;
    this.parentFragment = component.parentFragment;

    var name = this.name = options.template.yn || "";

    this.fragment = new Fragment__default({
      owner: this,
      root: container.parent,
      template: container._inlinePartials[name] || [],
      pElement: this.containerFragment.pElement
    });

    // even though only one yielder is allowed, we need to have an array of them
    // as it's possible to cause a yielder to be created before the last one
    // was destroyed in the same turn of the runloop
    if (!is__isArray(component.yielders[name])) {
      component.yielders[name] = [this];
    } else {
      component.yielders[name].push(this);
    }

    runloop__default.scheduleTask(function () {
      if (component.yielders[name].length > 1) {
        throw new Error("A component template can only have one {{yield" + (name ? " " + name : "") + "}} declaration at a time");
      }
    });
  };

  Yielder__Yielder.prototype = {
    detach: function () {
      return this.fragment.detach();
    },

    find: function (selector) {
      return this.fragment.find(selector);
    },

    findAll: function (selector, query) {
      return this.fragment.findAll(selector, query);
    },

    findComponent: function (selector) {
      return this.fragment.findComponent(selector);
    },

    findAllComponents: function (selector, query) {
      return this.fragment.findAllComponents(selector, query);
    },

    findNextNode: function () {
      return this.containerFragment.findNextNode(this);
    },

    firstNode: function () {
      return this.fragment.firstNode();
    },

    getValue: function (options) {
      return this.fragment.getValue(options);
    },

    render: function () {
      return this.fragment.render();
    },

    unbind: function () {
      this.fragment.unbind();
    },

    unrender: function (shouldDestroy) {
      this.fragment.unrender(shouldDestroy);
      array__removeFromArray(this.component.yielders[this.name], this);
    },

    rebind: function (oldKeypath, newKeypath) {
      this.fragment.rebind(oldKeypath, newKeypath);
    },

    toString: function () {
      return this.fragment.toString();
    }
  };

  var Yielder__default = Yielder__Yielder;
  //# sourceMappingURL=01-_6to5-Yielder.js.map

  var Doctype__Doctype = function (options) {
    this.declaration = options.template.a;
  };

  Doctype__Doctype.prototype = {
    init: noop__default,
    render: noop__default,
    unrender: noop__default,
    teardown: noop__default,
    toString: function () {
      return "<!DOCTYPE" + this.declaration + ">";
    }
  };

  var Doctype__default = Doctype__Doctype;
  //# sourceMappingURL=01-_6to5-Doctype.js.map

  function createItem__createItem(options) {
    if (typeof options.template === "string") {
      return new Text__default(options);
    }

    switch (options.template.t) {
      case types__INTERPOLATOR:
        if (options.template.r === "yield") {
          return new Yielder__default(options);
        }
        return new Interpolator__default(options);
      case types__SECTION: return new Section__default(options);
      case types__TRIPLE: return new Triple__default(options);
      case types__ELEMENT:
        var constructor;
        if (constructor = getComponent__default(options.parentFragment.root, options.template.e)) {
          return new Component__default(options, constructor);
        }
        return new Element__default(options);
      case types__PARTIAL: return new Partial__default(options);
      case types__COMMENT: return new Comment__default(options);
      case types__DOCTYPE: return new Doctype__default(options);

      default: throw new Error("Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!");
    }
  };
  var createItem__default = createItem__createItem;
  //# sourceMappingURL=01-_6to5-createItem.js.map

  function Fragment_prototype_init__Fragment$init(options) {
    var _this = this;


    var parentFragment;

    // The item that owns this fragment - an element, section, partial, or attribute
    this.owner = options.owner;
    parentFragment = this.parent = this.owner.parentFragment;

    // inherited properties
    this.root = options.root;
    this.pElement = options.pElement;
    this.context = options.context;
    this.index = options.index;
    this.key = options.key;
    this.registeredIndexRefs = [];

    // Time to create this fragment's child items

    // TODO should this be happening?
    if (typeof options.template === "string") {
      options.template = [options.template];
    } else if (!options.template) {
      options.template = [];
    }

    this.items = options.template.map(function (template, i) {
      return createItem__default({
        parentFragment: _this,
        pElement: options.pElement,
        template: template,
        index: i
      });
    }).filter(function (i) {
      return i !== null;
    });

    this.value = this.argsList = null;
    this.dirtyArgs = this.dirtyValue = true;

    this.bound = true;
  };
  var Fragment_prototype_init__default = Fragment_prototype_init__Fragment$init;
  //# sourceMappingURL=01-_6to5-init.js.map

  function Fragment_prototype_rebind__Fragment$rebind(oldKeypath, newKeypath) {
    // assign new context keypath if needed
    keypaths__assignNewKeypath(this, "context", oldKeypath, newKeypath);

    this.items.forEach(function (item) {
      if (item.rebind) {
        item.rebind(oldKeypath, newKeypath);
      }
    });
  };
  var Fragment_prototype_rebind__default = Fragment_prototype_rebind__Fragment$rebind;
  //# sourceMappingURL=01-_6to5-rebind.js.map

  function Fragment_prototype_render__Fragment$render() {
    var result;

    if (this.items.length === 1) {
      result = this.items[0].render();
    } else {
      result = document.createDocumentFragment();

      this.items.forEach(function (item) {
        result.appendChild(item.render());
      });
    }

    this.rendered = true;
    return result;
  };
  var Fragment_prototype_render__default = Fragment_prototype_render__Fragment$render;
  //# sourceMappingURL=01-_6to5-render.js.map

  function Fragment_prototype_toString__Fragment$toString(escape) {
    if (!this.items) {
      return "";
    }

    return this.items.map(function (item) {
      return item.toString(escape);
    }).join("");
  };
  var Fragment_prototype_toString__default = Fragment_prototype_toString__Fragment$toString;
  //# sourceMappingURL=01-_6to5-toString.js.map

  function Fragment_prototype_unbind__Fragment$unbind() {
    if (!this.bound) {
      return;
    }

    this.items.forEach(Fragment_prototype_unbind__unbindItem);
    this.bound = false;
  };
  var Fragment_prototype_unbind__default = Fragment_prototype_unbind__Fragment$unbind;

  function Fragment_prototype_unbind__unbindItem(item) {
    if (item.unbind) {
      item.unbind();
    }
  }
  //# sourceMappingURL=01-_6to5-unbind.js.map

  function Fragment_prototype_unrender__Fragment$unrender(shouldDestroy) {
    if (!this.rendered) {
      throw new Error("Attempted to unrender a fragment that was not rendered");
    }

    this.items.forEach(function (i) {
      return i.unrender(shouldDestroy);
    });
    this.rendered = false;
  };
  var Fragment_prototype_unrender__default = Fragment_prototype_unrender__Fragment$unrender;
  //# sourceMappingURL=01-_6to5-unrender.js.map

  var Fragment__Fragment = function (options) {
    this.init(options);
  };

  Fragment__Fragment.prototype = {
    bubble: prototype_bubble__default,
    detach: Fragment_prototype_detach__default,
    find: Fragment_prototype_find__default,
    findAll: Fragment_prototype_findAll__default,
    findAllComponents: Fragment_prototype_findAllComponents__default,
    findComponent: Fragment_prototype_findComponent__default,
    findNextNode: prototype_findNextNode__default,
    firstNode: prototype_firstNode__default,
    getNode: getNode__default,
    getValue: prototype_getValue__default,
    init: Fragment_prototype_init__default,
    rebind: Fragment_prototype_rebind__default,
    registerIndexRef: function (idx) {
      var idxs = this.registeredIndexRefs;
      if (idxs.indexOf(idx) === -1) {
        idxs.push(idx);
      }
    },
    render: Fragment_prototype_render__default,
    toString: Fragment_prototype_toString__default,
    unbind: Fragment_prototype_unbind__default,
    unregisterIndexRef: function (idx) {
      var idxs = this.registeredIndexRefs;
      idxs.splice(idxs.indexOf(idx), 1);
    },
    unrender: Fragment_prototype_unrender__default
  };

  var Fragment__default = Fragment__Fragment;
  //# sourceMappingURL=01-_6to5-Fragment.js.map

  var reset__shouldRerender = ["template", "partials", "components", "decorators", "events"], reset__resetHook = new Hook__default("reset");

  function reset__Ractive$reset(data, callback) {
    var _this = this;


    var promise, wrapper, changes, i, rerender;

    if (typeof data === "function" && !callback) {
      callback = data;
      data = {};
    } else {
      data = data || {};
    }

    if (typeof data !== "object") {
      throw new Error("The reset method takes either no arguments, or an object containing new data");
    }

    // If the root object is wrapped, try and use the wrapper's reset value
    if ((wrapper = this.viewmodel.wrapped[""]) && wrapper.reset) {
      if (wrapper.reset(data) === false) {
        // reset was rejected, we need to replace the object
        this.data = data;
      }
    } else {
      this.data = data;
    }

    // reset config items and track if need to rerender
    changes = config__default.reset(this);

    i = changes.length;
    while (i--) {
      if (reset__shouldRerender.indexOf(changes[i]) > -1) {
        rerender = true;
        break;
      }
    }

    if (rerender) {
      var component;

      this.viewmodel.mark("");

      // Is this is a component, we need to set the `shouldDestroy`
      // flag, otherwise it will assume by default that a parent node
      // will be detached, and therefore it doesn't need to bother
      // detaching its own nodes
      if (component = this.component) {
        component.shouldDestroy = true;
      }

      this.unrender();

      if (component) {
        component.shouldDestroy = false;
      }

      // If the template changed, we need to destroy the parallel DOM
      // TODO if we're here, presumably it did?
      if (this.fragment.template !== this.template) {
        this.fragment.unbind();

        this.fragment = new Fragment__default({
          template: this.template,
          root: this,
          owner: this
        });
      }

      promise = this.render(this.el, this.anchor);
    } else {
      promise = runloop__default.start(this, true);
      this.viewmodel.mark("");
      runloop__default.end();
    }

    reset__resetHook.fire(this, data);

    if (callback) {
      log__default.warn({
        debug: this.debug,
        message: "usePromise",
        args: {
          method: "ractive.reset"
        }
      });

      promise.then(callback).then(null, function (err) {
        log__default.consoleError({
          debug: _this.debug,
          err: err
        });
      });
    }

    return promise;
  };
  var reset__default = reset__Ractive$reset;
  //# sourceMappingURL=01-_6to5-reset.js.map

  var resetPartial__default = function (name, partial, callback) {
    var _this = this;
    var promise, collection = [];

    function collect(source, dest, ractive) {
      // if this is a component and it has its own partial, bail
      if (ractive && ractive.partials[name]) return;

      source.forEach(function (item) {
        // queue to rerender if the item is a partial and the current name matches
        if (item.type === types__PARTIAL && item.getPartialName() === name) {
          dest.push(item);
        }

        // if it has a fragment, process its items
        if (item.fragment) {
          collect(item.fragment.items, dest, ractive);
        }

        // or if it has fragments
        if (is__isArray(item.fragments)) {
          collect(item.fragments, dest, ractive);
        }

        // or if it is itself a fragment, process its items
        else if (is__isArray(item.items)) {
          collect(item.items, dest, ractive);
        }

        // or if it is a component, step in and process its items
        else if (item.type === types__COMPONENT && item.instance) {
          collect(item.instance.fragment.items, dest, item.instance);
        }

        // if the item is an element, process its attributes too
        if (item.type === types__ELEMENT) {
          if (is__isArray(item.attributes)) {
            collect(item.attributes, dest, ractive);
          }

          if (is__isArray(item.conditionalAttributes)) {
            collect(item.conditionalAttributes, dest, ractive);
          }
        }
      });
    }

    collect(this.fragment.items, collection);
    this.partials[name] = partial;

    promise = runloop__default.start(this, true);

    collection.forEach(function (item) {
      item.value = undefined;
      item.setValue(name);
    });

    runloop__default.end();

    if (callback) {
      log__default.warn({
        debug: this.debug,
        message: "usePromise",
        args: {
          method: "ractive.resetPartial"
        }
      });

      promise.then(callback.bind(this)).then(null, function (err) {
        log__default.consoleError({
          debug: _this.debug,
          err: err
        });
      });
    }

    return promise;
  };
  //# sourceMappingURL=01-_6to5-resetPartial.js.map

  function resetTemplate__Ractive$resetTemplate(template) {
    var transitionsEnabled, component;

    config__default.template.init(null, this, { template: template });

    transitionsEnabled = this.transitionsEnabled;
    this.transitionsEnabled = false;

    // Is this is a component, we need to set the `shouldDestroy`
    // flag, otherwise it will assume by default that a parent node
    // will be detached, and therefore it doesn't need to bother
    // detaching its own nodes
    if (component = this.component) {
      component.shouldDestroy = true;
    }

    this.unrender();

    if (component) {
      component.shouldDestroy = false;
    }

    // remove existing fragment and create new one
    this.fragment.unbind();
    this.fragment = new Fragment__default({
      template: this.template,
      root: this,
      owner: this
    });

    this.render(this.el, this.anchor);

    this.transitionsEnabled = transitionsEnabled;
  };
  var resetTemplate__default = resetTemplate__Ractive$resetTemplate;
  //# sourceMappingURL=01-_6to5-resetTemplate.js.map

	var reverse__default = makeArrayMethod__default("reverse");
	//# sourceMappingURL=01-_6to5-reverse.js.map

  var prototype_set__wildcard = /\*/;

  function prototype_set__Ractive$set(keypath, value, callback) {
    var _this = this;
    var map, promise;

    promise = runloop__default.start(this, true);

    // Set multiple keypaths in one go
    if (is__isObject(keypath)) {
      map = keypath;
      callback = value;

      for (keypath in map) {
        if (map.hasOwnProperty(keypath)) {
          value = map[keypath];
          keypath = keypaths__normalise(keypath);

          this.viewmodel.set(keypath, value);
        }
      }
    }

    // Set a single keypath
    else {
      keypath = keypaths__normalise(keypath);

      if (prototype_set__wildcard.test(keypath)) {
        keypaths__getMatchingKeypaths(this, keypath).forEach(function (keypath) {
          _this.viewmodel.set(keypath, value);
        });
      } else {
        this.viewmodel.set(keypath, value);
      }
    }

    runloop__default.end();

    if (callback) {
      log__default.warn({
        debug: this.debug,
        message: "usePromise",
        args: {
          method: "ractive.set"
        }
      });

      promise.then(callback.bind(this)).then(null, function (err) {
        log__default.consoleError({
          debug: _this.debug,
          err: err
        });
      });
    }

    return promise;
  };
  var prototype_set__default = prototype_set__Ractive$set;
  //# sourceMappingURL=01-_6to5-set.js.map

	var shift__default = makeArrayMethod__default("shift");
	//# sourceMappingURL=01-_6to5-shift.js.map

	var prototype_sort__default = makeArrayMethod__default("sort");
	//# sourceMappingURL=01-_6to5-sort.js.map

	var splice__default = makeArrayMethod__default("splice");
	//# sourceMappingURL=01-_6to5-splice.js.map

  function subtract__Ractive$subtract(keypath, d) {
    return add__default(this, keypath, (d === undefined ? -1 : -d));
  };
  var subtract__default = subtract__Ractive$subtract;
  //# sourceMappingURL=01-_6to5-subtract.js.map

  var prototype_teardown__teardownHook = new Hook__default("teardown");

  // Teardown. This goes through the root fragment and all its children, removing observers
  // and generally cleaning up after itself

  function prototype_teardown__Ractive$teardown(callback) {
    var _this = this;
    var promise;

    this.fragment.unbind();
    this.viewmodel.teardown();

    if (this.fragment.rendered && this.el.__ractive_instances__) {
      array__removeFromArray(this.el.__ractive_instances__, this);
    }

    this.shouldDestroy = true;
    promise = (this.fragment.rendered ? this.unrender() : Promise__default.resolve());

    prototype_teardown__teardownHook.fire(this);

    if (callback) {
      log__default.warn({
        debug: this.debug,
        message: "usePromise",
        args: {
          method: "ractive.teardown"
        }
      });

      promise.then(callback.bind(this)).then(null, function (err) {
        log__default.consoleError({
          debug: _this.debug,
          err: err
        });
      });
    }

    this._boundFunctions.forEach(prototype_teardown__deleteFunctionCopy);

    return promise;
  };
  var prototype_teardown__default = prototype_teardown__Ractive$teardown;

  function prototype_teardown__deleteFunctionCopy(bound) {
    delete bound.fn[bound.prop];
  }
  //# sourceMappingURL=01-_6to5-teardown.js.map

  function toggle__Ractive$toggle(keypath, callback) {
    var value;

    if (typeof keypath !== "string") {
      log__default.errorOnly({
        debug: this.debug,
        messsage: "badArguments",
        arg: { arguments: keypath }
      });
    }

    value = this.get(keypath);
    return this.set(keypath, !value, callback);
  };
  var toggle__default = toggle__Ractive$toggle;
  //# sourceMappingURL=01-_6to5-toggle.js.map

  function toHTML__Ractive$toHTML() {
    return this.fragment.toString(true);
  };
  var toHTML__default = toHTML__Ractive$toHTML;
  //# sourceMappingURL=01-_6to5-toHTML.js.map

  var Ractive_prototype_unrender__unrenderHook = new Hook__default("unrender");

  function Ractive_prototype_unrender__Ractive$unrender() {
    var _this = this;
    var promise, shouldDestroy;

    if (!this.fragment.rendered) {
      log__default.warn({
        debug: this.debug,
        message: "ractive.unrender() was called on a Ractive instance that was not rendered"
      });

      return Promise__default.resolve();
    }

    promise = runloop__default.start(this, true);

    // If this is a component, and the component isn't marked for destruction,
    // don't detach nodes from the DOM unnecessarily
    shouldDestroy = !this.component || this.component.shouldDestroy || this.shouldDestroy;

    if (this.constructor.css) {
      promise.then(function () {
        global_css__default.remove(_this.constructor);
      });
    }

    // Cancel any animations in progress
    while (this._animations[0]) {
      this._animations[0].stop(); // it will remove itself from the index
    }

    this.fragment.unrender(shouldDestroy);

    array__removeFromArray(this.el.__ractive_instances__, this);

    Ractive_prototype_unrender__unrenderHook.fire(this);

    runloop__default.end();
    return promise;
  };
  var Ractive_prototype_unrender__default = Ractive_prototype_unrender__Ractive$unrender;
  //# sourceMappingURL=01-_6to5-unrender.js.map

	var unshift__default = makeArrayMethod__default("unshift");
	//# sourceMappingURL=01-_6to5-unshift.js.map

  var Ractive_prototype_update__updateHook = new Hook__default("update");

  function Ractive_prototype_update__Ractive$update(keypath, callback) {
    var _this = this;
    var promise;

    if (typeof keypath === "function") {
      callback = keypath;
      keypath = "";
    } else {
      keypath = keypath || "";
    }

    promise = runloop__default.start(this, true);

    this.viewmodel.mark(keypath);
    runloop__default.end();

    Ractive_prototype_update__updateHook.fire(this, keypath);

    if (callback) {
      log__default.warn({
        debug: this.debug,
        message: "usePromise",
        args: {
          method: "ractive.teardown"
        }
      });

      promise.then(callback.bind(this)).then(null, function (err) {
        log__default.consoleError({
          debug: _this.debug,
          err: err
        });
      });
    }

    return promise;
  };
  var Ractive_prototype_update__default = Ractive_prototype_update__Ractive$update;
  //# sourceMappingURL=01-_6to5-update.js.map

  function updateModel__Ractive$updateModel(keypath, cascade) {
    var values, key, bindings;

    if (typeof keypath === "string" && !cascade) {
      bindings = this._twowayBindings[keypath];
    } else {
      bindings = [];

      for (key in this._twowayBindings) {
        if (!keypath || keypaths__equalsOrStartsWith(key, keypath)) {
          bindings.push.apply(bindings, this._twowayBindings[key]);
        }
      }
    }

    values = updateModel__consolidate(this, bindings);
    return this.set(values);
  };
  var updateModel__default = updateModel__Ractive$updateModel;

  function updateModel__consolidate(ractive, bindings) {
    var values = {}, checkboxGroups = [];

    bindings.forEach(function (b) {
      var oldValue, newValue;

      // special case - radio name bindings
      if (b.radioName && !b.element.node.checked) {
        return;
      }

      // special case - checkbox name bindings come in groups, so
      // we want to get the value once at most
      if (b.checkboxName) {
        if (!checkboxGroups[b.keypath] && !b.changed()) {
          checkboxGroups.push(b.keypath);
          checkboxGroups[b.keypath] = b;
        }

        return;
      }

      oldValue = b.attribute.value;
      newValue = b.getValue();

      if (array__arrayContentsMatch(oldValue, newValue)) {
        return;
      }

      if (!is__isEqual(oldValue, newValue)) {
        values[b.keypath] = newValue;
      }
    });

    // Handle groups of `<input type='checkbox' name='{{foo}}' ...>`
    if (checkboxGroups.length) {
      checkboxGroups.forEach(function (keypath) {
        var binding, oldValue, newValue;

        binding = checkboxGroups[keypath]; // one to represent the entire group
        oldValue = binding.attribute.value;
        newValue = binding.getValue();

        if (!array__arrayContentsMatch(oldValue, newValue)) {
          values[keypath] = newValue;
        }
      });
    }

    return values;
  }
  //# sourceMappingURL=01-_6to5-updateModel.js.map

  var proto__default = {
    add: prototype_add__default,
    animate: animate__default,
    detach: prototype_detach__default,
    find: prototype_find__default,
    findAll: prototype_findAll__default,
    findAllComponents: prototype_findAllComponents__default,
    findComponent: prototype_findComponent__default,
    findContainer: findContainer__default,
    findParent: findParent__default,
    fire: prototype_fire__default,
    get: prototype_get__default,
    insert: insert__default,
    merge: prototype_merge__default,
    observe: observe__default,
    observeOnce: observeOnce__default,
    off: off__default,
    on: on__default,
    once: once__default,
    pop: pop__default,
    push: push__default,
    render: prototype_render__default,
    reset: reset__default,
    resetPartial: resetPartial__default,
    resetTemplate: resetTemplate__default,
    reverse: reverse__default,
    set: prototype_set__default,
    shift: shift__default,
    sort: prototype_sort__default,
    splice: splice__default,
    subtract: subtract__default,
    teardown: prototype_teardown__default,
    toggle: toggle__default,
    toHTML: toHTML__default,
    toHtml: toHTML__default,
    unrender: Ractive_prototype_unrender__default,
    unshift: unshift__default,
    update: Ractive_prototype_update__default,
    updateModel: updateModel__default
  };
  //# sourceMappingURL=01-_6to5-prototype.js.map

  function unwrap__unwrapExtended(Child) {
    if (!(Child.prototype instanceof Ractive__default)) {
      return Child;
    }

    var options = {};

    while (Child) {
      config__default.registries.forEach(function (r) {
        unwrap__addRegistry(r.useDefaults ? Child.prototype : Child, options, r.name);
      });

      Object.keys(Child.prototype).forEach(function (key) {
        if (key === "computed") {
          return;
        }

        var value = Child.prototype[key];

        if (!(key in options)) {
          options[key] = value._method ? value._method : value;
        }

        // is it a wrapped function?
        else if (typeof options[key] === "function" && typeof value === "function" && options[key]._method) {
          var result, needsSuper = value._method;

          if (needsSuper) {
            value = value._method;
          }

          // rewrap bound directly to parent fn
          result = wrap__default(options[key]._method, value);


          if (needsSuper) {
            result._method = result;
          }

          options[key] = result;
        }
      });

      if (Child._Parent !== Ractive__default) {
        Child = Child._Parent;
      } else {
        Child = false;
      }
    }

    return options;
  };
  var unwrap__default = unwrap__unwrapExtended;

  function unwrap__addRegistry(target, options, name) {
    var registry, keys = Object.keys(target[name]);

    if (!keys.length) {
      return;
    }

    if (!(registry = options[name])) {
      registry = options[name] = {};
    }

    keys.filter(function (key) {
      return !(key in registry);
    }).forEach(function (key) {
      return registry[key] = target[name][key];
    });
  }
  //# sourceMappingURL=01-_6to5-unwrapExtended.js.map

  var extend__uid = 1;

  function extend__extend(options) {
    if (options === undefined) options = {};
    var Parent = this, Child, proto, staticProperties;

    // if we're extending with another Ractive instance, inherit its
    // prototype methods and default options as well
    options = unwrap__default(options);

    // create Child constructor
    Child = function (options, _options) {
      initialise__default(this, options, _options);
    };

    proto = object__create(Parent.prototype);
    proto.constructor = Child;

    staticProperties = {
      // each component needs a unique ID, for managing CSS
      _guid: { value: extend__uid++ },

      // alias prototype as defaults
      defaults: { value: proto },

      // extendable
      extend: { value: extend__extend, writable: true, configurable: true },

      // Parent - for IE8, can't use Object.getPrototypeOf
      _Parent: { value: Parent }
    };

    object__defineProperties(Child, staticProperties);

    // extend configuration
    config__default.extend(Parent, proto, options);

    Viewmodel__default.extend(Parent, proto);

    Child.prototype = proto;

    return Child;
  };
  var extend__default = extend__extend;
  //# sourceMappingURL=01-_6to5-_extend.js.map

  var getNodeInfo__default = function (node) {
    var info = {}, priv, indices;

    if (!node || !(priv = node._ractive)) {
      return info;
    }

    info.ractive = priv.root;
    info.keypath = priv.keypath;
    info.index = {};

    // find all index references and resolve them
    if (indices = findIndexRefs__default(priv.proxy.parentFragment)) {
      info.index = findIndexRefs__default.resolve(indices);
    }

    return info;
  };
  //# sourceMappingURL=01-_6to5-getNodeInfo.js.map

  var Ractive__Ractive, Ractive__properties;

  // Main Ractive required object
  Ractive__Ractive = function (options) {
    initialise__default(this, options);
  };


  // Ractive properties
  Ractive__properties = {
    // static methods:
    extend: { value: extend__default },
    getNodeInfo: { value: getNodeInfo__default },
    parse: { value: parse__default },

    // Namespaced constructors
    Promise: { value: Promise__default },

    // support
    svg: { value: environment__svg },
    magic: { value: magic__default },

    // version
    VERSION: { value: "0.6.1" },

    // Plugins
    adaptors: { writable: true, value: {} },
    components: { writable: true, value: {} },
    decorators: { writable: true, value: {} },
    easing: { writable: true, value: easing__default },
    events: { writable: true, value: {} },
    interpolators: { writable: true, value: interpolators__default },
    partials: { writable: true, value: {} },
    transitions: { writable: true, value: {} }
  };


  // Ractive properties
  object__defineProperties(Ractive__Ractive, Ractive__properties);

  Ractive__Ractive.prototype = object__extend(proto__default, defaults__default);

  Ractive__Ractive.prototype.constructor = Ractive__Ractive;

  // alias prototype as defaults
  Ractive__Ractive.defaults = Ractive__Ractive.prototype;

  // Ractive.js makes liberal use of things like Array.prototype.indexOf. In
  // older browsers, these are made available via a shim - here, we do a quick
  // pre-flight check to make sure that either a) we're not in a shit browser,
  // or b) we're using a Ractive-legacy.js build
  var Ractive__FUNCTION = "function";

  if (typeof Date.now !== Ractive__FUNCTION || typeof String.prototype.trim !== Ractive__FUNCTION || typeof Object.keys !== Ractive__FUNCTION || typeof Array.prototype.indexOf !== Ractive__FUNCTION || typeof Array.prototype.forEach !== Ractive__FUNCTION || typeof Array.prototype.map !== Ractive__FUNCTION || typeof Array.prototype.filter !== Ractive__FUNCTION || (typeof window !== "undefined" && typeof window.addEventListener !== Ractive__FUNCTION)) {
    throw new Error("It looks like you're attempting to use Ractive.js in an older browser. You'll need to use one of the 'legacy builds' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.");
  }

  var Ractive__default = Ractive__Ractive;
  //# sourceMappingURL=01-_6to5-Ractive.js.map

	return Ractive__default;

}));
//# sourceMappingURL=./ractive.runtime.js.map