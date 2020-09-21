import { FindOpts } from 'types/MethodOptions';
import { isArray, isObjectType } from 'utils/is';

import { Ractive } from '../RactiveDefinition';

function Ractive$findAllComponents(this: Ractive, options?: FindOpts): Ractive[];
function Ractive$findAllComponents(this: Ractive, selector?: string, options?: FindOpts): Ractive[];
function Ractive$findAllComponents(
  this: Ractive,
  selector?: string | FindOpts,
  options?: FindOpts & { result?: Ractive[] }
): Ractive[] {
  if (!options && isObjectType<FindOpts>(selector)) {
    options = selector;
    selector = '';
  }

  options = options || {};

  if (!isArray(options.result)) options.result = [];

  this.fragment.findAllComponents(selector, options);

  if (options.remote) {
    // search non-fragment children
    this._children.forEach(c => {
      if (!c.target && c.instance.fragment && c.instance.fragment.rendered) {
        if (!selector || c.name === selector) {
          options.result.push(c.instance);
        }

        c.instance.findAllComponents(selector as string, options);
      }
    });
  }

  return options.result;
}

export default Ractive$findAllComponents;
