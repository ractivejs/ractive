import { Ractive } from 'src/Ractive/Ractive';

export interface SetOpts {
  /** Whether or not to merge the given value into the existing data or replace the existing data. Defaults to replacing the existing data (false). */
  deep?: boolean;

  /** Whether or not to keep the template sturctures removed by this set around for future reinstatement. This can be used to avoid throwing away and recreating components when hiding them. Defaults to false. */
  keep?: boolean;

  /** When applied to an array keypath, whether or not to move the existing elements and their associated template around or simply replace them. Defaults to replacement (false). */
  shuffle?: Shuffler;
}
export type Shuffler = boolean | string | ShuffleFn;
export type ShuffleFn = (left: any, right: any) => 1 | 0 | -1;

export interface StyleSetOpts extends SetOpts {
  /** Whether or not to apply the new styles immediately. Defaults to updating the Ractive-managed style tag (true) */
  apply?: boolean;
}

export interface FindOpts {
  /**
   * Include attached children that are not rendered in anchors when looking for matching elements
   */
  remote?: boolean;

  /**
   * @internal
   */
  result?: Ractive[];
}

export interface UpdateOpts {
  /** Whether or not to force Ractive to consider a value to be changed. */
  force?: boolean;
}

export interface AttachOpts {
  /** The name of an anchor to attach a child to e.g. 'foo' for <#foo />. */
  target?: string;
  /** If the target anchor is already occupied, this instance will be moved to the end of the queue to occupy it, meaning that all of the other attached instances will need to be detached before this one can occupy the anchor. */
  append?: boolean;
  /** If the target anchor is already occupied, this instance will be moved to the beginning of the queue to occupy it, meaning it will replace the instance currently occupying the anchor. */
  prepend?: boolean;
  /** The index of the position in the queue for the target anchor at which to insert this instance. 0 is equivalent to prepend: true. */
  insertAt?: number;
}

export interface GetOpts {
  /**
   * Whether or not to include links and computations in the output. This creates a deep copy of the data, so changing any of it directly will have no effect on the data in Ractive's models. Defaults to true for root data and false everywhere else.
   */
  virtual?: boolean;

  /**
   * Whether or not to unwrap the value if it happens to be wrapped, returning the original value. Defaults to true.
   */
  unwrap?: boolean;
}
