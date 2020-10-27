import { addFunctions } from 'shared/getFunction';
import type { ExtendOpts } from 'types/InitOptions';
import { assign, create, keys } from 'utils/object';

import type { Ractive, Static } from '../RactiveDefinition';

const registryNames = [
  'adaptors',
  'components',
  'computed',
  'decorators',
  'easing',
  'events',
  'helpers',
  'interpolators',
  'partials',
  'transitions'
] as const;

const registriesOnDefaults = ['computed', 'helpers'];

class Registry {
  public name: typeof registryNames[number];
  private useDefaults: boolean;

  constructor(name: Registry['name'], useDefaults: Registry['useDefaults']) {
    this.name = name;
    this.useDefaults = useDefaults;
  }

  extend(Parent: typeof Static, proto: Static, options: ExtendOpts): void {
    const parent = this.useDefaults ? Parent.defaults : Parent;
    const target = this.useDefaults ? proto : proto.constructor;
    this.configure(parent, <Static>(<unknown>target), options);
  }

  init(): void {
    // noop
  }

  configure(Parent: typeof Static, target: Static, options: ExtendOpts): void {
    const name = this.name;
    const option = options[name];

    const registry = create(Parent[name]);

    assign(registry, option);

    target[name] = registry;

    if (name === 'partials' && target[name]) {
      keys(target[name]).forEach(key => {
        addFunctions(target[name][key]);
      });
    }
  }

  reset(ractive: Ractive): boolean {
    const registry = ractive[this.name];
    let changed = false;

    keys(registry).forEach(key => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item: any = registry[key];

      // component and partials
      if (item._fn) {
        if (item._fn.isOwner) {
          registry[key] = item._fn;
        } else {
          delete registry[key];
        }
        changed = true;
      }
    });

    return changed;
  }
}

const registries = registryNames.map(name => {
  const putInDefaults = registriesOnDefaults.indexOf(name) > -1;
  return new Registry(name, putInDefaults);
});

export default registries;
