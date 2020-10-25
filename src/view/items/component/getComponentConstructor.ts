import { noRegistryFunctionReturn } from 'config/errors';
import { findInstance } from 'shared/registry';
import type { Ractive, Static } from 'src/Ractive/RactiveDefinition';
import { isFunction, isString } from 'utils/is';
import { warnIfDebug } from 'utils/log';
import { hasOwn } from 'utils/object';

// finds the component constructor in the registry or view hierarchy registries
export default function getComponentConstructor(ractive: Ractive, name: string): typeof Static {
  const instance = findInstance('components', ractive, name);
  let Component: typeof Static;

  if (instance) {
    Component = <typeof Static>instance.components[name];

    if (Component && !Component.isInstance) {
      if (Component.default?.isInstance) Component = Component.default;
      // TSRChange - change match to from `!Component.then` to `instanceof Promise`
      else if (!(Component instanceof Promise) && isFunction(Component)) {
        // function option, execute and store for reset
        const fn = Component.bind(instance);
        fn.isOwner = hasOwn(instance.components, name);
        Component = fn();

        if (!Component) {
          warnIfDebug(noRegistryFunctionReturn, name, 'component', 'component', {
            ractive
          });
          return;
        }

        if (isString(Component)) {
          // allow string lookup
          Component = getComponentConstructor(ractive, Component);
        }

        Component._fn = fn;
        instance.components[name] = Component;
      }
    }
  }

  return Component;
}
