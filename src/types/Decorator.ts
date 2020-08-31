import { Ractive } from '../Ractive/Ractive';

export interface DecoratorHandle {
  /**
   * Called when any downstream template from the element will be updated.
   */
  invalidate?: () => void;

  /**
   * Called when the decorator is being removed from its element.
   */
  teardown: () => void;

  /**
   * Called when any arguments passed to the decorator update. If no update function is supplied, then the decorator will be torn down and recreated when the decorator arguments update.j
   */
  update?: (...args: any[]) => void;

  /** TODO write doc */
  shuffled?: () => void;
}

export type Decorator<T extends Ractive> = (
  this: T,
  node: HTMLElement,
  ...args: any[]
) => DecoratorHandle;
