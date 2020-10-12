import runloop from 'src/global/runloop';
import { toArray } from 'utils/array';
import { createDocumentFragment, matches } from 'utils/dom';
import { detachNode } from 'utils/dom';
import { decodeCharacterReferences } from 'utils/html';

import { inAttribute } from './element/Attribute';
import Mustache, { MustacheOpts } from './shared/Mustache';
import insertHtml from './triple/insertHtml';

export default class Triple extends Mustache {
  private nodes: Element[];
  private rendered: boolean;

  constructor(options: MustacheOpts) {
    super(options);
  }

  detach(): DocumentFragment {
    const docFrag = createDocumentFragment();
    if (this.nodes) this.nodes.forEach(node => docFrag.appendChild(node));
    return docFrag;
  }

  find(selector?: string): HTMLElement {
    const len = this.nodes.length;

    for (let i = 0; i < len; i += 1) {
      const node = this.nodes[i];

      if (node.nodeType !== 1) continue;

      if (matches(node, selector)) return <HTMLElement>node;

      const queryResult = node.querySelector(selector);
      if (queryResult) return <HTMLElement>queryResult;
    }

    return null;
  }

  findAll(selector: string, options: { result: Element[] }): void {
    const { result } = options;
    const len = this.nodes.length;

    for (let i = 0; i < len; i += 1) {
      const node = this.nodes[i];

      if (node.nodeType !== 1) continue;

      if (matches(node, selector)) result.push(node);

      const queryAllResult = node.querySelectorAll(selector);
      if (queryAllResult) {
        // TSRChange - add to array invocation
        result.push(...toArray(queryAllResult));
      }
    }
  }

  findComponent(): null {
    return null;
  }

  firstNode(): Element {
    return this.rendered && this.nodes[0];
  }

  render(target: Element, occupants?: Node[], anchor?: Node): void {
    if (!this.nodes) {
      const html = this.model ? this.model.get() : '';
      this.nodes = insertHtml(html, target);
    }

    let nodes = this.nodes;

    // progressive enhancement
    if (occupants) {
      let i = -1;
      let next: Element;

      // start with the first node that should be rendered
      while (occupants.length && (next = this.nodes[i + 1])) {
        let n: Node;
        // look through the occupants until a matching node is found
        while ((n = occupants.shift())) {
          const t = n.nodeType;

          if (
            t === next.nodeType &&
            ((t === 1 && (<Element>n).outerHTML === next.outerHTML) ||
              ((t === 3 || t === 8) && n.nodeValue === next.nodeValue))
          ) {
            this.nodes.splice(++i, 1, <Element>n); // replace the generated node with the existing one
            break;
          } else {
            target.removeChild(n); // remove the non-matching existing node
          }
        }
      }

      if (i >= 0) {
        // update the list of remaining nodes to attach, excluding any that were replaced by existing nodes
        nodes = this.nodes.slice(i);
      }

      // update the anchor to be the next occupant
      if (occupants.length) anchor = occupants[0];
    }

    // attach any remainging nodes to the parent
    if (nodes.length) {
      const frag = createDocumentFragment();
      nodes.forEach(n => frag.appendChild(n));

      if (anchor) {
        target.insertBefore(frag, anchor);
      } else {
        target.appendChild(frag);
      }
    }

    this.rendered = true;
  }

  toString(): string {
    let value = this.model && this.model.get();
    value = value != null ? '' + value : '';

    return inAttribute() ? decodeCharacterReferences(value) : value;
  }

  unrender(): void {
    if (this.nodes)
      this.nodes.forEach(node => {
        // defer detachment until all relevant outros are done
        runloop.detachWhenReady({
          node,
          detach() {
            detachNode(node);
          }
        });
      });
    this.rendered = false;
    this.nodes = null;
  }

  update(): void {
    if (this.rendered && this.dirty) {
      this.dirty = false;

      this.unrender();
      this.render(this.up.findParentNode(), null, this.up.findNextNode(this));
    } else {
      // make sure to reset the dirty flag even if not rendered
      this.dirty = false;
    }
  }
}
