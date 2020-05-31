import { noRegistryFunctionReturn } from 'config/errors';
import { findInstance } from 'shared/registry';
import { isFunction, isString } from 'utils/is';
import { warnIfDebug } from 'utils/log';
import { hasOwn } from 'utils/object';

// finds the component constructor in the registry or view hierarchy registries
export default function getComponentConstructor(ractive, name) {
  const instance = findInstance('components', ractive, name);
  let Component;

  if (instance) {
    Component = instance.components[name];

    if (Component && !Component.isInstance) {
      if (Component.default && Component.default.isInstance) Component = Component.default;
      else if (!Component.then && isFunction(Component)) {
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
