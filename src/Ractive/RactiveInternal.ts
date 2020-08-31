import Context from 'shared/Context';
import { EventSubscriber } from 'src/events/fireEvent';
import Fragment from 'view/Fragment';

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
  public anchor: HTMLElement;

  /** @internal */
  public _guid: number;

  /** @internal */
  public _eventQueue: Context[];

  /** @internal */
  public _nsSubs: string[];

  /** @internal */
  public event: Context;

  /** @internal */
  public _subs: Record<string, EventSubscriber[]>;
}
