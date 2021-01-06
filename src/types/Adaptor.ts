import type { Ractive } from '../Ractive/RactiveDefinition';

import type { Keypath, ValueMap } from './Generic';

export interface Adaptor {
  /** Called when Ractive gets a new value to see if the adaptor should be applied.
   * @param value the value to evaluate
   * @param keypath the keypath of the value in the Ractive data
   * @param ractive the Ractive instance that is applying the value to the given keypath
   * @returns true if the adaptor should be applied, false otherwise
   */
  filter: (value: unknown, keypath: string, ractive: Ractive) => boolean;

  /** Called when Ractive is applying the adaptor to a value
   * @param ractive the Ractive instance that is applying the adaptor
   * @param value the value to which the value is being applied
   * @param keypath the keypath of the value to which the adaptor is being applied
   * @param prefixer a helper function to prefix a value map with the current keypath
   * @returns the adaptor
   */
  wrap: (
    ractive: Ractive,
    value: unknown,
    keypath: string,
    prefixer: AdaptorPrefixer
  ) => AdaptorHandle;
}
export interface AdaptorHandle {
  /** Called when Ractive needs to retrieve the adapted value. */
  get: () => unknown;
  /** Called when Ractive needs to set a property of the adapted value e.g. r.set('adapted.prop', {}). */
  set: (prop: string, value: unknown) => void;
  /** Called when Ractive needs to replace the adapted value e.g. r.set('adapted', {}). */
  reset: (value: unknown) => boolean;
  /** Called when Ractive no longer needs the adaptor. */
  teardown: () => void;
}

export type AdaptorPrefixer = (relativeKeypath: Keypath | ValueMap, value?: unknown) => ValueMap;
