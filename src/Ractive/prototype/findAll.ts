import type { FindOpts } from 'types/MethodOptions';
import { isArray } from 'utils/is';

import type { Ractive } from '../RactiveDefinition';

export default function Ractive$findAll(
  this: Ractive,
  selector: string,
  options: FindOpts & { result?: HTMLElement[] } = {}
): HTMLElement[] {
  if (!this.rendered)
    throw new Error(
      `Cannot call ractive.findAll('${selector}', ...) unless instance is rendered to the DOM`
    );

  if (!isArray(options.result)) options.result = [];

  this.fragment.findAll(selector, options);

  if (options.remote) {
    // search non-fragment children
    this._children.forEach(c => {
      if (!c.target && c.instance.fragment?.rendered) {
        c.instance.findAll(selector, options);
      }
    });
  }

  return options.result;
}
