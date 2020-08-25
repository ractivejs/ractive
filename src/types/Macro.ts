import { ValueMap } from './ValueMap';

// TODO add type ofr MacroHelper
export type MacroFn = (MacroHelper) => MacroHandle;

export interface Macro extends MacroFn {
  /** Get the css data for this macro at the given keypath. */
  styleGet(keypath: string): any;
  /** Set the css data for this macro at the given keypath to the given value. */
  styleSet(keypath: string, value: any): Promise<void>;
  /** Set the given map of values in the css data for this macro. */
  styleSet(map: ValueMap): Promise<void>;
}

export interface MacroHandle {
  render?: () => void;
  teardown?: () => void;
  update?: (attributes: ValueMap) => void;
  invalidate?: () => void;
}
