import Context from 'shared/Context';
import { EventSubscriber } from 'src/events/fireEvent';
import Fragment from 'view/Fragment';

import { Macro } from './Macro';
import { ParseFn } from './Parse';

export type Partial = string | any[] | ParseFn | Macro;

export type PartialMap = Record<string, Partial>;

// This will be replaced with something more valid :D
// TODO replace will "real" ractive class
export class RactiveFake {
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

  [key: string]: any;
}
