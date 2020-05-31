import interpolate from 'shared/interpolate';
import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import easing from 'src/Ractive/static/easing';
import { isEqual, isFunction, isObjectType } from 'utils/is';
import noop from 'utils/noop';
import { defineProperty, keys as objectKeys } from 'utils/object';

function immediate(value) {
  const result = Promise.resolve(value);
  defineProperty(result, 'stop', { value: noop });
  return result;
}

const linear = easing.linear;

function getOptions(options, instance) {
  options = options || {};

  let easing;
  if (options.easing) {
    easing = isFunction(options.easing) ? options.easing : instance.easing[options.easing];
  }

  return {
    easing: easing || linear,
    duration: 'duration' in options ? options.duration : 400,
    complete: options.complete || noop,
    step: options.step || noop,
    interpolator: options.interpolator
  };
}

export function animate(ractive, model, to, options) {
  options = getOptions(options, ractive);
  const from = model.get();

  // don't bother animating values that stay the same
  if (isEqual(from, to)) {
    options.complete(options.to);
    return immediate(to);
  }

  const interpolator = interpolate(from, to, ractive, options.interpolator);

  // if we can't interpolate the value, set it immediately
  if (!interpolator) {
    runloop.start();
    model.set(to);
    runloop.end();

    return immediate(to);
  }

  return model.animate(from, to, options, interpolator);
}

export default function Ractive$animate(keypath, to, options) {
  if (isObjectType(keypath)) {
    const keys = objectKeys(keypath);

    throw new Error(`ractive.animate(...) no longer supports objects. Instead of ractive.animate({
  ${keys.map(key => `'${key}': ${keypath[key]}`).join('\n  ')}
}, {...}), do

${keys.map(key => `ractive.animate('${key}', ${keypath[key]}, {...});`).join('\n')}
`);
  }

  return animate(this, this.viewmodel.joinAll(splitKeypath(keypath)), to, options);
}
