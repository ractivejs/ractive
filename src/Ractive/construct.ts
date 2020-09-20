import { missingPlugin } from 'config/errors';
import TemplateItemType from 'config/types';
import RootModel from 'model/RootModel';
import { findInViewHierarchy } from 'shared/registry';
import hooks from 'src/events/Hook';
import Ractive from 'src/Ractive';
import { compute } from 'src/Ractive/prototype/compute';
import { Adaptor } from 'types/Adaptor';
import { InitOpts } from 'types/InitOptions';
import { ensureArray, combine } from 'utils/array';
import { isArray, isString } from 'utils/is';
import { fatal, warnIfDebug, welcome } from 'utils/log';
import { assign, create, hasOwn } from 'utils/object';

import getRactiveContext from '../shared/getRactiveContext';

import dataConfigurator from './config/custom/data';
import subscribe from './helpers/subscribe';
import { Ractive as RactiveDefinition, RactiveConstructor } from './Ractive';

const registryNames = [
  'adaptors',
  'components',
  'decorators',
  'easing',
  'events',
  'interpolators',
  'partials',
  'transitions'
];

const protoRegistries = ['computed', 'helpers'];

let uid = 0;

export default function construct(ractive: RactiveDefinition, options: InitOpts): void {
  if ((<any>Ractive).DEBUG) welcome();

  initialiseProperties(ractive);
  handleAttributes(ractive);

  // set up event subscribers
  subscribe(ractive, options, 'on');

  // if there's not a delegation setting, inherit from parent if it's not default
  if (
    !hasOwn(options, 'delegate') &&
    ractive.parent &&
    ractive.parent.delegate !== ractive.delegate
  ) {
    ractive.delegate = false;
  }

  // plugins that need to run at construct
  if (isArray(options.use)) {
    // TODO refine plugin to handle construct prop
    ractive.use(...options.use.filter((p: any) => p.construct));
  }

  hooks.construct.fire(ractive, options);
  if (options.onconstruct) options.onconstruct.call(ractive, getRactiveContext(ractive), options);

  // Add registries
  let i = registryNames.length;
  while (i--) {
    const name = registryNames[i];
    ractive[name] = assign(create(ractive.constructor[name] || null), options[name]);
  }

  i = protoRegistries.length;
  while (i--) {
    const name = protoRegistries[i];
    ractive[name] = assign(create(ractive.constructor.prototype[name]), options[name]);
  }

  if (ractive._attributePartial) {
    ractive.partials['extra-attributes'] = ractive._attributePartial;
    delete ractive._attributePartial;
  }

  // Create a viewmodel
  const viewmodel = new RootModel({
    adapt: getAdaptors(ractive, ractive.adapt, options),
    data: dataConfigurator.init(ractive.constructor, ractive, options),
    ractive
  });

  // once resolved, share the adaptors array between the root model and instance
  ractive.adapt = viewmodel.adaptors;

  ractive.viewmodel = viewmodel;

  for (const k in ractive.computed) {
    compute.call(ractive, k, ractive.computed[k]);
  }
}

function getAdaptors(
  ractive: RactiveDefinition,
  protoAdapt: RactiveDefinition['adapt'],
  options: InitOpts
): Adaptor[] {
  protoAdapt = protoAdapt.map(lookup);
  const adapt = ensureArray(options.adapt).map(lookup);

  const srcs = [protoAdapt, adapt];
  if (ractive.parent && !ractive.isolated) {
    srcs.push(ractive.parent.viewmodel.adaptors);
  }

  return combine(...srcs);

  function lookup(adaptor: string | Adaptor): Adaptor {
    if (isString(adaptor)) {
      const adaptorName = adaptor;
      adaptor = findInViewHierarchy('adaptors', ractive, adaptorName);

      if (!adaptor) {
        fatal(missingPlugin(adaptorName, 'adaptor'));
      }
    }

    return adaptor;
  }
}

function initialiseProperties(ractive: RactiveDefinition): void {
  // Generate a unique identifier, for places where you'd use a weak map if it
  // existed
  ractive._guid = 'r-' + uid++;

  // events
  ractive._subs = create(null);
  ractive._nsSubs = 0;

  // storage for item configuration from instantiation to reset,
  // like dynamic functions or original values
  ractive._config = {};

  // events
  ractive.event = null;
  ractive._eventQueue = [];

  // observers
  ractive._observers = [];

  // external children
  ractive._children = [];
  ractive._children.byName = {};
  ractive.children = ractive._children;

  if (!ractive.component) {
    ractive.root = ractive;
    ractive.parent = ractive.container = null; // TODO container still applicable?
  }
}

function handleAttributes(ractive: RactiveDefinition): void {
  const component = ractive.component;
  const attributes = (<RactiveConstructor>ractive.constructor).attributes;

  if (attributes && component) {
    const tpl = component.template;
    const attrs = tpl.m ? tpl.m.slice() : [];

    // grab all of the passed attribute names
    const props = attrs.filter(a => a.t === TemplateItemType.ATTRIBUTE).map(a => a.n);

    // warn about missing requireds
    attributes.required.forEach(p => {
      if (!~props.indexOf(p)) {
        warnIfDebug(`Component '${component.name}' requires attribute '${p}' to be provided`);
      }
    });

    // set up a partial containing non-property attributes
    const all = attributes.optional.concat(attributes.required);
    const partial = [];
    let i = attrs.length;
    while (i--) {
      const a = attrs[i];
      if (a.t === TemplateItemType.ATTRIBUTE && !~all.indexOf(a.n)) {
        if (attributes.mapAll) {
          // map the attribute if requested and make the extra attribute in the partial refer to the mapping
          partial.unshift({
            t: TemplateItemType.ATTRIBUTE,
            n: a.n,
            f: [{ t: TemplateItemType.INTERPOLATOR, r: `~/${a.n}` }]
          });
        } else {
          // transfer the attribute to the extra attributes partial
          partial.unshift(attrs.splice(i, 1)[0]);
        }
      } else if (
        !attributes.mapAll &&
        (a.t === TemplateItemType.DECORATOR ||
          a.t === TemplateItemType.TRANSITION ||
          a.t === TemplateItemType.BINDING_FLAG)
      ) {
        partial.unshift(attrs.splice(i, 1)[0]);
      }
    }

    if (partial.length) component.template = { t: tpl.t, e: tpl.e, f: tpl.f, m: attrs, p: tpl.p };
    ractive._attributePartial = partial;
  }
}
