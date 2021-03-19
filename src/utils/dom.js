import { isClient, svg, vendors, win, doc } from 'config/environment';
import { html } from 'config/namespaces';
import { isString, isNumber } from 'utils/is';

let createElement, matches, div, methodNames, unprefixed, prefixed, i, j, makeFunction;

const customStr = isClient && 'registerElement' in doc;
function wrap(is) {
  return customStr ? is : { is };
}

// Test for SVG support
if (!svg) {
  /* istanbul ignore next */
  createElement = (type, ns, is) => {
    if (ns && ns !== html) {
      throw "This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you're trying to render SVG in an older browser. See http://ractive.js.org/support/#svgs for more information";
    }

    return is ? doc.createElement(type, wrap(is)) : doc.createElement(type);
  };
} else {
  createElement = (type, ns, is) => {
    if (!ns || ns === html) {
      return is ? doc.createElement(type, wrap(is)) : doc.createElement(type);
    }

    return is ? doc.createElementNS(ns, type, wrap(is)) : doc.createElementNS(ns, type);
  };
}

export function createDocumentFragment() {
  return doc.createDocumentFragment();
}

function getElement(input) {
  let output;

  if (!input || typeof input === 'boolean') {
    return;
  }

  /* istanbul ignore next */
  if (!win || !doc || !input) {
    return null;
  }

  // We already have a DOM node - no work to do. (Duck typing alert!)
  if (input.nodeType) {
    return input;
  }

  // Get node from string
  if (isString(input)) {
    // try ID first
    output = doc.getElementById(input);

    // then as selector, if possible
    if (!output && doc.querySelector) {
      try {
        output = doc.querySelector(input);
      } catch (e) {
        /* this space intentionally left blank */
      }
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

if (!isClient) {
  matches = null;
} else {
  div = createElement('div');
  methodNames = ['matches', 'matchesSelector'];

  makeFunction = function(methodName) {
    return function(node, selector) {
      return node[methodName](selector);
    };
  };

  i = methodNames.length;

  while (i-- && !matches) {
    unprefixed = methodNames[i];

    if (div[unprefixed]) {
      matches = makeFunction(unprefixed);
    } else {
      j = vendors.length;
      while (j--) {
        prefixed = vendors[i] + unprefixed.substr(0, 1).toUpperCase() + unprefixed.substring(1);

        if (div[prefixed]) {
          matches = makeFunction(prefixed);
          break;
        }
      }
    }
  }

  // IE8... and apparently phantom some?
  /* istanbul ignore next */
  if (!matches) {
    matches = function(node, selector) {
      let parentNode, i;

      parentNode = node.parentNode;

      if (!parentNode) {
        // empty dummy <div>
        div.innerHTML = '';

        parentNode = div;
        node = node.cloneNode();

        div.appendChild(node);
      }

      const nodes = parentNode.querySelectorAll(selector);

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

function detachNode(node) {
  // stupid ie
  // eslint-disable-next-line valid-typeof
  if (node && typeof node.parentNode !== 'unknown' && node.parentNode) {
    node.parentNode.removeChild(node);
  }

  return node;
}

function safeToStringValue(value) {
  return value == null || (isNumber(value) && isNaN(value)) || !value.toString ? '' : '' + value;
}

function safeAttributeString(string) {
  return safeToStringValue(string)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export { createElement, detachNode, getElement, matches, safeToStringValue, safeAttributeString };
