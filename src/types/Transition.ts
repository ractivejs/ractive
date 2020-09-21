import type { ValueMap } from './Generic';

export interface TransitionHelper {
  /** true if this transition is an intro */
  isIntro: boolean;

  /** true if this transition is an outro */
  isOutro: boolean;

  /** The name of the transition e.g. foo in foo-in-out. */
  name: string;

  /** The node to which the transition is being applied. */
  node: HTMLElement;

  /**
   * Animate the given property to the given value.
   * @param prop the css property to animate
   * @param value the value to which to animate the prop
   * @param opts a map of options, including duration to use when animating
   * @param complete an optional callback to call when the animation is complete
   * @returns a Promise that resolves when the animation is complete
   */
  animateStyle(
    prop: string,
    value: any,
    opts: TransitionOpts,
    complete?: () => void
  ): Promise<void>;

  /**
   * Animate the given map of properties.
   * @param map a map of prop -> value to animate
   * @param opts a map of options, including duration to use when animating
   * @param complete an optional callback to call when the animation is complete
   * @returns a Promise that resolves when the animation is complete
   */
  animateStyle(map: ValueMap, opts: TransitionOpts, complete?: () => void): Promise<void>;

  /**
   * The function to call when the transition is complete. This is used to control the Promises returned by mutation methods.j
   * @param noReset whether or not to skip resetting the styles back to their starting points - defaults to false
   */
  complete(noReset?: boolean): void;

  /**
   * Use getComputedStyle to retrieve the current value of the given prop.
   */
  getStyle(prop: string): any;

  /**
   * Use getComputedStyle to retrieve the current values of multiple props.
   */
  getStyle(props: string[]): ValueMap;

  /**
   * Merge the given params into a map, adding any defaults to the resulting object.
   * @param params
   * 	if a number, the duration in milliseconds
   *  if slow, 600ms
   *  if fast, 200ms
   *  if any other string, 400ms
   *  if a map, it is applied over defaults
   */
  processParams(
    params: number | 'slow' | 'fast' | string | ValueMap,
    defaults?: ValueMap
  ): ValueMap;

  /**
   * Set an inline style for the given prop at the given value.
   */
  setStyle(prop: string, value: any): void;

  /** Set inline styles for the given map of prop -> value. */
  setStyle(map: ValueMap): void;
}
export type Transition = (helper: TransitionHelper, ...args: any[]) => void | Promise<void>;
export interface TransitionOpts {
  /** The duration for the transition in milliseconds, slow for 600ms, fast for 200ms, and any other string for 400ms. */
  duration?: number | 'slow' | 'fast' | string;

  /** The easing to use for the transition. */
  easing?: string;

  /** The delay in milliseconds to wait before triggering the transition. */
  delay?: number;
}
