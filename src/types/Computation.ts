import { Ractive } from '../Ractive/Ractive';

export type ComputationFn<T extends Ractive = Ractive> = (
  this: T,
  context: any,
  keypath: string
) => any;

export interface ComputationDescriptor<T extends Ractive = Ractive> {
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

export type Computation<T extends Ractive> = string | ComputationFn<T> | ComputationDescriptor<T>;
