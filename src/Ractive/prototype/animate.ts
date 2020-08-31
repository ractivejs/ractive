import Model, { AnimatePromise } from 'model/Model';
import { interpolate } from 'shared/interpolate';
import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import { Ractive } from 'src/Ractive/Ractive';
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

function immediate<T>(value: T): AnimatePromise<T> {
  const result: AnimatePromise<T> = Promise.resolve(value);
  defineProperty(result, 'stop', { value: noop });
  return result;
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
): AnimatePromise<T> {
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

/**
 * Similar to `ractive.set()`, this will update the data and re-render any affected mustaches and
 * notify observers.
 * All animations are handled by a global timer that is shared between Ractive instances (and which
 * only runs if there are one or more animations still in progress), so you can trigger as many
 * separate animations as you like without worrying about timer congestion.
 * Where possible, requestAnimationFrame is used rather than setTimeout.
 *
 * Numeric values and strings that can be parsed as numeric values can be interpolated. Objects and
 * arrays containing numeric values (or other objects and arrays which themselves contain numeric
 * values, and so on recursively) are also interpolated.
 * Note that there is currently no mechanism for detecting cyclical structures! Animating to a value
 * that indirectly references itself will cause an infinite loop.
 *
 * Future versions of Ractive may include string interpolators -
 *  e.g. for SVG paths, colours, transformations and so on, a la D3 -
 * and the ability to pass in your own interpolator.
 *
 * If an animation is started on a keypath which is already being animated, the first animation
 * is cancelled.
 * (Currently, there is no mechanism in place to prevent collisions between
 * e.g. `ractive.animate('foo', { bar: 1 })` and `ractive.animate('foo.bar', 0)`.)
 *
 * @example ractive.animate(keypath, value[, options])
 *
 * @param keypath The keypath to animate.
 * @param value The value to animate to.
 * @param options
 *
 * @returns Returns a Promise which resolves with the target value and has an additional stop method,
 * which cancels the animation.
 */
export default function Ractive$animate<T>(
  this: Ractive,
  keypath: string,
  to: T,
  options: AnimateOpts
): AnimatePromise<T> {
  if (isObjectType(keypath)) {
    const keys = objectKeys(keypath);

    throw new Error(`ractive.animate(...) no longer supports objects. Instead of ractive.animate({
  ${keys.map(key => `'${key}': ${keypath[key]}`).join('\n  ')}
}, {...}), do

${keys.map(key => `ractive.animate('${key}', ${keypath[key]}, {...});`).join('\n')}
`);
  }

  return animate<T>(this, this.viewmodel.joinAll(splitKeypath(keypath)), to, options);
}
