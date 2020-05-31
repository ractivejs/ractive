import { ELEMENT } from 'config/types';
import { assign } from 'utils/object';

import Partial from './Partial';

export default function asyncProxy(promise, options) {
  const partials = options.template.p || {};
  const name = options.template.e;

  const opts = assign({}, options, {
    template: { t: ELEMENT, e: name },
    macro(handle) {
      handle.setTemplate(partials['async-loading'] || []);
      promise.then(
        cmp => {
          options.up.ractive.components[name] = cmp;
          if (partials['async-loaded']) {
            handle.partials.component = [options.template];
            handle.setTemplate(partials['async-loaded']);
          } else {
            handle.setTemplate([options.template]);
          }
        },
        err => {
          if (partials['async-failed']) {
            handle.aliasLocal('error', 'error');
            handle.set('@local.error', err);
            handle.setTemplate(partials['async-failed']);
          } else {
            handle.setTemplate([]);
          }
        }
      );
    }
  });
  return new Partial(opts);
}
