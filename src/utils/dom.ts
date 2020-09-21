import { isClient, svg, vendors, win, doc } from 'config/environment';
import Namespace from 'config/namespace';
import { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { isString, isNumber } from 'utils/is';

let createElement, matches;

// Test for SVG support
if (!svg) {
  /* istanbul ignore next */
  createElement = (
    type: string,
    namespace: string,
    extend?: ElementCreationOptions
  ): HTMLElement => {
    if (namespace && namespace !== Namespace.html) {
      throw "This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you're trying to render SVG in an older browser. See http://ractive.js.org/support/#svgs for more information";
    }

    return extend ? doc.createElement(type, extend) : doc.createElement(type);
  };
} else {
  createElement = (
    type: string,
    namespace: string,
    extend?: ElementCreationOptions
  ): HTMLElement | Element => {
    if (!namespace || namespace === Namespace.html) {
      return extend ? doc.createElement(type, extend) : doc.createElement(type);
    }

    return extend
      ? doc.createElementNS(namespace, type, extend)
      : doc.createElementNS(namespace, type);
  };
}

export function createDocumentFragment(): DocumentFragment {
  return doc.createDocumentFragment();
}

function getElement(
  input: boolean | string | HTMLElement | ArrayLike<unknown> | DocumentFragment
): RactiveHTMLElement {
  let output: HTMLElement;

  if (!input || typeof input === 'boolean') {
    return;
  }

  /* istanbul ignore next */
  if (!win || !doc || !input) {
    return null;
  }

  // We already have a DOM node - no work to do. (Duck typing alert!)
  if (input instanceof Element && input.nodeType) {
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
  const div = createElement('div');
  const methodNames = ['matches', 'matchesSelector'];

  const makeFunction = function(
    methodName: string
  ): (node: HTMLElement, selector: string) => boolean {
    return function(node: HTMLElement, selector: string): boolean {
      return node[methodName](selector);
    };
  };

  let i = methodNames.length;
  let unprefixed: string;

  while (i-- && !matches) {
    unprefixed = methodNames[i];

    if (div[unprefixed]) {
      matches = makeFunction(unprefixed);
    } else {
      let j = vendors.length;
      while (j--) {
        const prefixed =
          vendors[i] + unprefixed.substr(0, 1).toUpperCase() + unprefixed.substring(1);

        if (div[prefixed]) {
          matches = makeFunction(prefixed);
          break;
        }
      }
    }
  }

  // TSRChange - IE8 is no longer supported and phantom is not used. Maybe we can remove this code?
  // // IE8... and apparently phantom some?
  // /* istanbul ignore next */
  // if (!matches) {
  //   matches = function(node: HTMLElement, selector: string): bo {
  //     let parentNode, i;

  //     parentNode = node.parentNode;

  //     if (!parentNode) {
  //       // empty dummy <div>
  //       div.innerHTML = '';

  //       parentNode = div;
  //       node = node.cloneNode();

  //       div.appendChild(node);
  //     }

  //     const nodes = parentNode.querySelectorAll(selector);

  //     i = nodes.length;
  //     while (i--) {
  //       if (nodes[i] === node) {
  //         return true;
  //       }
  //     }

  //     return false;
  //   };
  // }
}

function detachNode<T extends Node>(node: T): T | null {
  /**
   * I'm going to remove `typeof node.parentNode !== 'unknown'` match.
   * It was only occuring in IE < 8 which is no longer supported from 0.8
   *
   * @see https://github.com/ractivejs/ractive/blob/dev/CHANGELOG.md#080
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#IE-specific_notes
   */
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }

  return node;
}

function safeToStringValue(value: unknown): string {
  return value == null || (isNumber(value) && isNaN(value)) || !value.toString ? '' : '' + value;
}

function safeAttributeString(string: string): string {
  return safeToStringValue(string)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export { createElement, detachNode, getElement, matches, safeToStringValue, safeAttributeString };
