import TemplateItemType from 'config/types';
import { ElementTemplateItem } from 'parse/converters/templateItemDefinitions';
import { MacroHelper } from 'types/Macro';
import { RactiveFake } from 'types/RactiveFake';

import Partial, { PartialOpts } from './Partial';

interface AsyncProxyOpts extends PartialOpts {
  template: ElementTemplateItem;
}

export default function asyncProxy(
  promise: Promise<RactiveFake>,
  options: AsyncProxyOpts
): Partial {
  const partials = options.template.p || {};
  const name = options.template.e;

  const opts: PartialOpts = {
    ...options,
    template: { t: TemplateItemType.ELEMENT, e: name },
    macro(handle: MacroHelper) {
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
  };

  return new Partial(opts);
}
