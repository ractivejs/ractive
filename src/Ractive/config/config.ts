import hooks from 'src/events/Hook';
import type { ExtendOpts, InitOpts } from 'types/InitOptions';
import { isFunction } from 'utils/is';
import { warnIfDebug } from 'utils/log';
import { hasOwn, keys } from 'utils/object';

import RactiveProto from '../prototype';
import type { Ractive, Static } from '../RactiveDefinition';

import adaptConfigurator from './custom/adapt';
import cssConfigurator from './custom/css/css';
import dataConfigurator from './custom/data';
import templateConfigurator from './custom/template';
import defaults from './defaults';
import deprecate from './deprecate';
import registries from './registries';
import wrapPrototype from './wrapPrototypeMethod';

export interface Configurator<InitReturn = void, ResetReturn = void> {
  name?: string;
  init: (Parent: typeof Static, proto: Static, options: InitOpts) => InitReturn;
  extend: (
    Parent: typeof Static,
    proto: Static,
    options: ExtendOpts,
    Child?: typeof Static
  ) => void;
  reset?: (ractive: Ractive) => ResetReturn;
}

const config: Configurator<void, string[]> = {
  extend: (Parent, proto, options, Child) => configure('extend', Parent, proto, options, Child),
  init: (Parent, ractive, options) => configure('init', Parent, ractive, options),
  reset: ractive =>
    order.filter((c: Configurator) => c.reset && c.reset(ractive)).map((c: Configurator) => c.name)
};

export default config;

const custom = {
  adapt: adaptConfigurator,
  computed: config,
  css: cssConfigurator,
  data: dataConfigurator,
  helpers: config,
  template: templateConfigurator
};

const defaultKeys = keys(defaults);

const isStandardKey = makeObj(defaultKeys.filter(key => !custom[key]));

// blacklisted keys that we don't double extend
const isBlacklisted = makeObj([
  ...defaultKeys,
  ...registries.map(r => r.name),
  'on',
  'observe',
  'attributes',
  'cssData',
  'use'
]);

const order = [
  ...defaultKeys.filter(key => !registries[key] && !custom[key]),
  ...registries,
  //custom.data,
  custom.template,
  custom.css
];

function configure(
  method: 'init' | 'extend',
  Parent: typeof Static,
  target: Static,
  options: any, // Probably both init and extend options
  Child?: typeof Static
): void {
  deprecate(options);

  for (const key in options) {
    if (hasOwn(isStandardKey, key)) {
      const value = options[key];

      // warn the developer if they passed a function and ignore its value

      // NOTE: we allow some functions on "el" because we duck type element lists
      // and some libraries or ef'ed-up virtual browsers (phantomJS) return a
      // function object as the result of querySelector methods
      if (key !== 'el' && isFunction(value)) {
        warnIfDebug(
          `${key} is a Ractive option that does not expect a function and will be ignored`,
          method === 'init' ? target : null
        );
      } else {
        target[key] = value;
      }
    }
  }

  // disallow combination of `append` and `enhance`
  if (target.append && target.enhance) {
    throw new Error('Cannot use append and enhance at the same time');
  }

  registries.forEach(registry => {
    registry[method](Parent, target, options);
  });

  adaptConfigurator[method](Parent, target, options);
  templateConfigurator[method](Parent, target, options);
  cssConfigurator[method](Parent, target, options, Child);

  extendOtherMethods(Parent.prototype, target, options);
}

const _super = /\b_super\b/;
function extendOtherMethods(parent: Static, target: Static, options: ExtendOpts): void {
  for (const key in options) {
    if (!isBlacklisted[key] && hasOwn(options, key)) {
      let member = options[key];

      // if this is a method that overwrites a method, wrap it:
      if (isFunction(member)) {
        if (
          (key in RactiveProto ||
            (key.slice(0, 2) === 'on' && key.slice(2) in hooks && key in target)) &&
          !_super.test(member.toString())
        ) {
          warnIfDebug(
            `Overriding Ractive prototype function '${key}' without calling the '${_super}' method can be very dangerous.`
          );
        }
        member = wrapPrototype(parent, key, member);
      }

      target[key] = member;
    }
  }
}

function makeObj(array: string[]): Record<string, true> {
  const obj: ReturnType<typeof makeObj> = {};
  array.forEach(x => (obj[x] = true));
  return obj;
}
