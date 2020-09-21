import Model, { AnimatePromise } from 'model/Model';
import { interpolate } from 'shared/interpolate';
import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import { Ractive } from 'src/Ractive/RactiveDefinition';
import easing from 'src/Ractive/static/easing';
import { EasingFunction } from 'types/Easings';
import { isEqual, isFunction, isObjectType } from 'utils/is';
import noop from 'utils/noop';
import { defineProperty, keys as objectKeys } from 'utils/object';

const linear = easing.linear;

export interface AnimateOpts {
  /** How many milliseconds the animation should run for. Defaults to 400. */
  duration?: number;

  /** The name of an easing function or the easing function itself.Defaults to linear. */
  easing?: EasingFunction;

  /**
   * The name of an interpolator function.
   * Defaults to the built-in number interpolator if the value is numeric, or null if none is applicable.
   */
  interpolator?: string;

  /**
   * A function called on each step of the animation.
   * @param x The animation progress between 0 and 1 with easing function already applied.
   * @param value To be documented
   * @returns The value at t with interpolator function already applied.
   */
  step?: (x: number, value: any) => number;

  /** A function to be called when the animation completes, with the value passed to animate. */
  complete?: () => void;
}

function immediate<T>(value: T): AnimatePromise {
  const result = Promise.resolve(value);
  defineProperty(result, 'stop', { value: noop });
  // In these scenario the promise doesn't respect types of animate promise so force casting
  // we can consider to change promise return type in animate promise in the future
  return (result as unknown) as AnimatePromise;
}

function getOptions(options: AnimateOpts, instance: Ractive): AnimateOpts {
  options = options || {};

  let easing: EasingFunction;
  if (options.easing) {
    easing = isFunction(options.easing) ? options.easing : instance.easing[options.easing];
  }

  return {
    easing: easing || linear,
    duration: 'duration' in options ? options.duration : 400,
    complete: options.complete || noop,
    step: options.step || ((noop as unknown) as AnimateOpts['step']),
    interpolator: options.interpolator
  };
}

export function animate<T>(
  ractive: Ractive,
  model: Model,
  to: T,
  _options: AnimateOpts
): AnimatePromise {
  const options = getOptions(_options, ractive);
  const from = model.get();

  // don't bother animating values that stay the same
  if (isEqual(from, to)) {
    // TSRChange - remove options.to from complete param since do not exists
    options.complete();
    return immediate(to);
  }

  const interpolator = interpolate<T>(from, to, ractive, options.interpolator);

  // if we can't interpolate the value, set it immediately
  if (!interpolator) {
    runloop.start();
    model.set(to);
    runloop.end();

    return immediate(to);
  }

  return model.animate(from, to, options, interpolator);
}

export default function Ractive$animate<T>(
  this: Ractive,
  keypath: string,
  to: T,
  options: AnimateOpts
): AnimatePromise {
  if (isObjectType<Record<string, unknown>>(keypath)) {
    const keys = objectKeys(keypath);

    throw new Error(`ractive.animate(...) no longer supports objects. Instead of ractive.animate({
  ${keys.map(key => `'${key}': ${keypath[key]}`).join('\n  ')}
}, {...}), do

${keys.map(key => `ractive.animate('${key}', ${keypath[key]}, {...});`).join('\n')}
`);
  }

  return animate<T>(this, this.viewmodel.joinAll(splitKeypath(keypath)), to, options);
}
