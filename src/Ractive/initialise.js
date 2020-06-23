import hooks from 'src/events/Hook';
import { getElement } from 'utils/dom';
import { isArray } from 'utils/is';
import { logIfDebug, warnIfDebug, warnOnceIfDebug } from 'utils/log';
import Fragment from 'view/Fragment';

import Ractive from '../Ractive';

import config from './config/config';
import subscribe from './helpers/subscribe';

export default function initialise(ractive, userOptions, options) {
  // initialize settable computeds
  const computed = ractive.viewmodel.computed;
  if (computed) {
    for (const k in computed) {
      if (k in ractive.viewmodel.value && computed[k] && !computed[k].isReadonly) {
        computed[k].set(ractive.viewmodel.value[k]);
      }
    }
  }

  // init config from Parent and options
  config.init(ractive.constructor, ractive, userOptions);

  // call any passed in plugins
  if (isArray(userOptions.use)) ractive.use(...userOptions.use.filter(p => !p.construct));

  hooks.config.fire(ractive);

  hooks.init.begin(ractive);

  const fragment = (ractive.fragment = createFragment(ractive, options));
  if (fragment) fragment.bind(ractive.viewmodel);

  hooks.init.end(ractive);

  // general config done, set up observers
  subscribe(ractive, userOptions, 'observe');

  if (fragment) {
    // render automatically ( if `el` is specified )
    const el = (ractive.el = ractive.target = getElement(ractive.el || ractive.target));
    if (el && !ractive.component) {
      const promise = ractive.render(el, ractive.append);

      if (Ractive.DEBUG_PROMISES) {
        promise.catch(err => {
          warnOnceIfDebug(
            'Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;'
          );
          warnIfDebug('An error happened during rendering', { ractive });
          logIfDebug(err);

          throw err;
        });
      }
    }
  }
}

export function createFragment(ractive, options = {}) {
  if (ractive.template) {
    const cssIds = [].concat(ractive.constructor._cssIds || [], options.cssIds || []);

    return new Fragment({
      owner: ractive,
      template: ractive.template,
      cssIds
    });
  }
}
