import type {
  Static,
  Ractive as RactiveDefinition,
  Constructor
} from 'src/Ractive/RactiveDefinition';
import type { ExtendOpts, InitOpts } from 'types/InitOptions';
import { isArray, isFunction } from 'utils/is';
import { create, defineProperties, toPairs, defineProperty } from 'utils/object';

import Ractive from '../Ractive';
import config from '../Ractive/config/config';
import dataConfigurator from '../Ractive/config/custom/data';
import construct from '../Ractive/construct';
import initialise from '../Ractive/initialise';
import isInstance from '../Ractive/static/isInstance';
import sharedGet from '../Ractive/static/sharedGet';
import sharedSet from '../Ractive/static/sharedSet';
import styleGet from '../Ractive/static/styleGet';
import { addStyle, hasStyle } from '../Ractive/static/styles';
import styleSet from '../Ractive/static/styleSet';
import use from '../Ractive/static/use';

const callsSuper = /super\s*\(|\.call\s*\(\s*this/;

export function extend(...options: ExtendOpts[]): typeof Static {
  if (!options.length) {
    return extendOne(this);
  } else {
    return options.reduce((acc, option) => {
      return extendOne(acc, option);
    }, this);
  }
}

export function extendWith<
  U extends RactiveDefinition<U>,
  V extends InitOpts<U> = InitOpts<U>,
  W extends ExtendOpts<U> = ExtendOpts<U>
>(Class: Constructor<U, V>, options?: W): typeof Static {
  return extendOne(this, options, Class);
}

function extendOne<
  T extends typeof Static,
  U extends RactiveDefinition<U> = RactiveDefinition,
  V extends InitOpts<U> = InitOpts<U>
>(Parent: T, options: ExtendOpts<U> = {}, Target?: Constructor<U, V>): typeof Static {
  let proto: RactiveDefinition;
  let Child: typeof Static = isFunction(Target) && ((Target as unknown) as typeof Static);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((<any>options).prototype instanceof Ractive) {
    throw new Error(`Ractive no longer supports multiple inheritance.`);
  }

  if (Child) {
    if (!(Child.prototype instanceof Parent)) {
      throw new Error(
        `Only classes that inherit the appropriate prototype may be used with extend`
      );
    }
    if (!callsSuper.test(Child.toString())) {
      throw new Error(`Only classes that call super in their constructor may be used with extend`);
    }

    proto = Child.prototype;
  } else {
    Child = (function (options) {
      if (!(this instanceof Child)) return new Child(options);

      construct(this, options || {});
      initialise(this, options || {}, {});
    } as unknown) as typeof Static;

    proto = create(Parent.prototype);
    proto.constructor = Child;

    Child.prototype = proto;
  }

  // Static properties
  defineProperties(Child, {
    // alias prototype as defaults
    defaults: { value: proto },

    extend: { value: extend, writable: true, configurable: true },
    extendWith: { value: extendWith, writable: true, configurable: true },
    extensions: { value: [] },
    use: { value: use },

    isInstance: { value: isInstance },

    Parent: { value: Parent },
    Ractive: { value: Ractive },

    styleGet: { value: styleGet.bind(Child), configurable: true },
    styleSet: { value: styleSet.bind(Child), configurable: true }
  });

  // extend configuration
  config.extend(Parent, proto, options, Child);

  // store event and observer registries on the constructor when extending
  Child._on = (Parent._on || []).concat(toPairs(options.on));
  Child._observe = (Parent._observe || []).concat(toPairs(options.observe));

  Parent.extensions.push(Child);

  // attribute defs are not inherited, but they need to be stored
  if (options.attributes) {
    let attrs: ExtendOpts['attributes'];

    // allow an array of optional props or an object with arrays for optional and required props
    if (isArray(options.attributes)) {
      attrs = { optional: options.attributes, required: [] };
    } else {
      attrs = options.attributes;
    }

    // make sure the requisite keys actually store arrays
    if (!isArray(attrs.required)) attrs.required = [];
    if (!isArray(attrs.optional)) attrs.optional = [];

    Child.attributes = attrs;
  }

  dataConfigurator.extend(Parent, proto, options);

  defineProperty(Child, 'helpers', { writable: true, value: proto.helpers });

  if (isArray(options.use)) Child.use(...options.use);

  return Child;
}

defineProperties(Ractive, {
  sharedGet: { value: sharedGet },
  sharedSet: { value: sharedSet },
  styleGet: { configurable: true, value: styleGet.bind(Ractive) },
  styleSet: { configurable: true, value: styleSet.bind(Ractive) },
  addCSS: { configurable: false, value: addStyle.bind(Ractive) },
  hasCSS: { configurable: false, value: hasStyle.bind(Ractive) }
});
