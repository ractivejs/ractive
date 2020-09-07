import Computation from 'model/Computation';
import RootModel from 'model/RootModel';
import Context from 'shared/Context';
import { Meta } from 'types/Generic';
import { EventListenerEntry } from 'types/Listener';
import Fragment from 'view/Fragment';

import { InternalObserver } from './prototype/observe';
import { Ractive } from './Ractive';

/**
 * Internal properties of Ractive
 * @internal
 */
export class RactiveInternal {
  /** @internal */
  public fragment: Fragment;

  /** @internal */
  public torndown: boolean;

  /** @internal */
  public rendering: boolean;

  /** @internal */
  public destroyed: boolean;

  /** @internal */
  public isDetached: boolean;

  /** @internal */
  public anchor: HTMLElement;

  /** @internal */
  public _guid: number;

  /** @internal */
  public _eventQueue: Context[];

  /** @internal */
  public event: Context;

  /** @internal */
  public _nsSubs: number;

  /** @internal */
  public _subs: Record<string, EventListenerEntry[]>;

  /** @internal*/
  public _children: (Ractive | Meta)[] & { byName: Record<string, Meta[]> };

  /** @internal */
  public viewmodel: RootModel;

  /** @internal*/
  public instance: this;

  /** @internal */
  public _observers: InternalObserver[];

  /**
   * Store computation information. Item can also be a {@link InternalComputationDescription}
   * @internal
   */
  public computed: Record<string, Computation>;

  /** @internal */
  public container: this;
}
