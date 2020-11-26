import type { InitOpts } from 'types/InitOptions';
import type { ListenerCallback, ListenerDescriptor } from 'types/Listener';
import type { ObserverArrayCallback, ObserverDescriptor } from 'types/Observer';
import { isFunction, isObjectType } from 'utils/is';
import { create, toPairs } from 'utils/object';

import type { Ractive, Static } from '../RactiveDefinition';

export default function subscribe(
  instance: Static | Ractive,
  options: InitOpts,
  type: 'on' | 'observe'
): void {
  const subs = (instance.constructor[`_${type}`] || []).concat(toPairs(<never>options[type] || {}));
  const single = type === 'on' ? 'once' : `${type}Once`;

  subs.forEach(([target, config]) => {
    if (isFunction<ListenerCallback | ObserverArrayCallback>(config)) {
      instance[type](target, <never>config);
    } else if (
      isObjectType<ListenerDescriptor | ObserverDescriptor>(config) &&
      isFunction(config.handler)
    ) {
      instance[config.once ? single : type](target, config.handler, create(config));
    }
  });
}
