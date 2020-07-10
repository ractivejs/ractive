import Namespace from 'src/config/namespace';
import { createElement } from 'utils/dom';

const elementCache: { [key: string]: Element | HTMLElement } = {};

let ieBug: boolean;
let ieBlacklist: { [key: string]: [string, string] };

try {
  createElement('table').innerHTML = 'foo';
} catch (/* istanbul ignore next */ err) {
  ieBug = true;

  ieBlacklist = {
    TABLE: ['<table class="x">', '</table>'],
    THEAD: ['<table><thead class="x">', '</thead></table>'],
    TBODY: ['<table><tbody class="x">', '</tbody></table>'],
    TR: ['<table><tr class="x">', '</tr></table>'],
    SELECT: ['<select class="x">', '</select>']
  };
}

export default function insertHtml(html: string, node: Element): Element[] {
  const nodes: Element[] = [];

  // render 0 and false
  if (html == null || html === '') return nodes;

  let container: Element;
  let wrapper: [string, string];
  let selectedOption: HTMLOptionElement;

  /* istanbul ignore if */
  if (ieBug && (wrapper = ieBlacklist[node.tagName])) {
    container = element('div');
    container.innerHTML = wrapper[0] + html + wrapper[1];
    container = container.querySelector('.x');

    // TSRChange - replace `container.tagName === 'SELECT'` with instanceof
    if (container instanceof HTMLSelectElement) {
      selectedOption = container.options[container.selectedIndex];
    }
  } else if (node.namespaceURI === Namespace.svg) {
    container = element('div');
    container.innerHTML = '<svg class="x">' + html + '</svg>';
    container = container.querySelector('.x');
  } else if (node.tagName === 'TEXTAREA') {
    container = createElement('div');

    if (typeof container.textContent !== 'undefined') {
      container.textContent = html;
    } else {
      container.innerHTML = html;
    }
  } else {
    container = element(node.tagName);
    container.innerHTML = html;

    // TSRChange - replace `container.tagName === 'SELECT'` with instanceof
    if (container instanceof HTMLSelectElement) {
      selectedOption = container.options[container.selectedIndex];
    }
  }

  let child;
  while ((child = container.firstChild)) {
    nodes.push(child);
    container.removeChild(child);
  }

  // This is really annoying. Extracting <option> nodes from the
  // temporary container <select> causes the remaining ones to
  // become selected. So now we have to deselect them. IE8, you
  // amaze me. You really do
  // ...and now Chrome too
  if (node.tagName === 'SELECT') {
    let i = nodes.length;
    while (i--) {
      if (nodes[i] !== selectedOption) {
        (nodes[i] as HTMLOptionElement).selected = false;
      }
    }
  }

  return nodes;
}

function element(tagName: string): Element {
  return elementCache[tagName] || (elementCache[tagName] = createElement(tagName));
}
