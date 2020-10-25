import TemplateItemType from 'config/types';
import type { AwaitMustacheTemplateItem } from 'parse/converters/mustache/mustacheDefinitions';
import { isFunction, isUndefined } from 'utils/is';

import Partial, { PartialOpts } from './Partial';

function extract(tpl: AwaitMustacheTemplateItem, type: TemplateItemType, name?: string): any[] {
  const p = tpl.f.find(s => typeof s !== 'string' && s.t === type);
  if (p && typeof p !== 'string') {
    if ('n' in p && p.n)
      return [
        {
          t: TemplateItemType.ALIAS,
          n: 54,
          f: p.f || [],
          z: [{ n: p.n, x: { r: `__await.${name}` } }]
        }
      ];
    else return <unknown[]>p.f || [];
  } else return [];
}

export interface AwaitOpts extends PartialOpts {
  template: AwaitMustacheTemplateItem;
}

export default function Await(options: AwaitOpts): Partial {
  const tpl = options.template;

  const success = extract(tpl, TemplateItemType.THEN, 'value');
  const error = extract(tpl, TemplateItemType.CATCH, 'error');
  const pending = extract(tpl, TemplateItemType.SECTION);
  const undef = extract(tpl, TemplateItemType.ELSE);

  const opts: PartialOpts = {
    ...options,
    template: {
      t: TemplateItemType.ELEMENT,
      m: [
        {
          t: TemplateItemType.ATTRIBUTE,
          n: 'for',
          f: [{ t: TemplateItemType.INTERPOLATOR, r: tpl.r, rx: tpl.rx, x: tpl.x }]
        }
      ]
    },
    macro(handle, attrs) {
      handle.aliasLocal('__await');

      function update(attrs): void {
        if (attrs.for && isFunction(attrs.for.then)) {
          handle.setTemplate(pending);

          attrs.for.then(
            v => {
              handle.set('@local.value', v);
              handle.setTemplate(success);
            },
            e => {
              handle.set('@local.error', e);
              handle.setTemplate(error);
            }
          );
        } else if (isUndefined(attrs.for)) {
          handle.setTemplate(undef);
        } else {
          handle.set('@local.value', attrs.for);
          handle.setTemplate(success);
        }
      }

      update(attrs);

      return {
        update
      };
    }
  };

  // TODO Integrate MacroFn with `attributes`
  (opts.macro as any).attributes = ['for'];

  return new Partial(opts);
}
