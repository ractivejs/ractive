import { Macro } from './Macro';
import { ParseFn } from './Parse';

/**
 * A Ractive keypath string which contains a navigable set of keys divided by dots.
 *
 * @example foo.bar
 * @example foo.bar.*
 * @example foo.1.*
 *
 * TODO add some documentation for keypath and example for keypath
 */
export type Keypath = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValueMap = Record<string, any>;

export type Partial = string | unknown[] | ParseFn | Macro;

export type PartialMap = Record<string, Partial>;
