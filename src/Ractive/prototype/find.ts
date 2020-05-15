import { FindOptions } from 'src/types/Options';

/**
 * Returns the first element inside a given Ractive instance matching a CSS selector.
 * This is similar to doing `this.el.querySelector(selector)` (though it doesn't actually use `querySelector()`).
 *
 * @example
 *
 * ```
 * var r = Ractive({
 *   el: '#main',
 *   template: '#tpl'
 * })
 *
 * setTimeout(() => {
 *   var p = r.find('p.target')
 *   console.log(p.outerHTML)
 * }, 1000)
 * ```
 *
 * @param selector A CSS selector representing the element to find.
 * @param options
 */
export default function Ractive$find(selector: string, options: FindOptions = {}): HTMLElement {
  if (!this.rendered)
    throw new Error(
      `Cannot call ractive.find('${selector}') unless instance is rendered to the DOM`
    );

  let node = this.fragment.find(selector, options);
  if (node) return node;

  if (options.remote) {
    for (let i = 0; i < this._children.length; i++) {
      if (!this._children[i].instance.fragment.rendered) continue;
      node = this._children[i].instance.find(selector, options);
      if (node) return node;
    }
  }
}
