import { Template } from './Parse';
import { PartialMap } from './RactiveFake';
import { ValueMap } from './ValueMap';

export type MacroFn = (MacroHelper: MacroHelper, attrs?: Record<string, any>) => MacroHandle | void;

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

// TODO add extends ContextHelper
export interface MacroHelper {
  name: string;
  attributes: ValueMap;
  template: Template;
  partials: PartialMap;

  /**
   * Create an alias for the local context of the partial (@local).
   * @param name The name to use when creating the alias to @local
   */
  aliasLocal(name: string): void;

  /**
   * Create an alias to a keypath in the local context of the partial (@local)
   * @param reference The keypath to be aliased e.g. foo.bar for @local.foo.bar
   * @param name The name to use when created the alias
   */
  aliasLocal(reference: string, name: string): void;

  /**
   * Change the template used to render this macro. The old template will be unrenedered and replaced with the given template.
   * @param template The new template
   */
  setTemplate(template: Template): void;

  // TODO remove after we extend contexthelpers
  set(...args): void;
}
