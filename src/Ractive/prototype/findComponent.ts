import { FindOpts } from 'src/types/Options';
import { isObjectType } from 'utils/is';

// TODO replace unkown with Ractive after we create ractive file

/**
 * Find the first component belonging to this instance.
 */
export function Ractive$findComponent(opts?: FindOpts): unknown;

export function Ractive$findComponent(name: string, opts?: FindOpts): unknown;

/**
 * Returns the first component inside a given Ractive instance with the given `name` (or the first component of any kind if no name is given).
 *
 * @example
 * ```
 * var Component = Ractive.extend({
 *   template: 'Component {{number}}'
 * })
 *
 * var r = Ractive({
 *   el: '#main',
 *   template: '#tpl',
 *   components: {
 *     Component: Component
 *   }
 * })
 *
 * setTimeout(() => {
 *   var c = r.findComponent('Component')
 *   console.log(c.toHTML())
 * }, 1000)
 * ```
 *
 * @param name The name of the component to find.
 * @param options
 */
export default function Ractive$findComponent(
  name: string | FindOpts,
  options: FindOpts = {}
): unknown {
  if (isObjectType(name)) {
    options = name;
    name = '';
  }

  let child = this.fragment.findComponent(name, options);
  if (child) return child;

  if (options.remote) {
    if (!name && this._children.length) return this._children[0].instance;
    for (let i = 0; i < this._children.length; i++) {
      // skip children that are or should be in an anchor
      if (this._children[i].target) continue;
      if (this._children[i].name === name) return this._children[i].instance;
      child = this._children[i].instance.findComponent(name, options);
      if (child) return child;
    }
  }
}
