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

export interface FindOptions {
  /**
   * Include attached children that are not rendered in anchors when looking for matching elements
   */
  remote?: boolean;
}
