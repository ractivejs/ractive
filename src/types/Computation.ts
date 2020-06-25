type Ractive<T> = any; // TODO use ractive type

export type ComputationFn<T extends Ractive<T>> = (this: T, context: any, keypath: string) => any;

export interface ComputationDescriptor<T extends Ractive<T>> {
  /**
   * Called when Ractive needs to get the computed value.
   * Computations are lazy, so this is only called when a dependency asks for a value.
   */
  get: ComputationFn<T>;

  /**
   * Called when Ractive is asked to set a computed keypath.
   */
  set?: (this: T, value: any, context: any, keypath: string) => void;
}

export type Computation<T extends Ractive<T>> =
  | string
  | ComputationFn<T>
  | ComputationDescriptor<T>;
