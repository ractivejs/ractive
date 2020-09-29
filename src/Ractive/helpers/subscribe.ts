import type { InitOpts } from 'types/InitOptions';
import type { ListenerDescriptor } from 'types/Listener';
import type { ObserverDescriptor } from 'types/Observer';
import { isFunction, isObjectType } from 'utils/is';
import { create, toPairs } from 'utils/object';

import type { Ractive, Static } from '../RactiveDefinition';

export default function subscribe(
  instance: Static | Ractive,
  options: InitOpts,
  type: 'on' | 'observe'
): void {
  // Here we are handling both observer and listeners so having a type to handle both
  // scenario is quite difficult
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subs: [string, any][] = (instance.constructor[`_${type}`] || []).concat(
    toPairs(options[type] || {})
  );
  const single = type === 'on' ? 'once' : `${type}Once`;

  subs.forEach(([target, config]) => {
    if (isFunction(config)) {
      instance[type](target, config);
    } else if (
      isObjectType<ListenerDescriptor | ObserverDescriptor>(config) &&
      isFunction(config.handler)
    ) {
      instance[config.once ? single : type](target, config.handler, create(config));
    }
  });
}
