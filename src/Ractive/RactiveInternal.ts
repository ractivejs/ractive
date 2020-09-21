import Computation from 'model/Computation';
import RootModel from 'model/RootModel';
import CSSModel from 'model/specials/CSSModel';
import Context from 'shared/Context';
import { FakeFragment } from 'shared/getRactiveContext';
import { Adaptor } from 'types/Adaptor';
import { Data, Meta } from 'types/Generic';
import { Partial } from 'types/Generic';
import { EventListenerEntry } from 'types/Listener';
import Fragment from 'view/Fragment';
import Element from 'view/items/Element';

import { RactiveDynamicTemplate } from './config/custom/template';
import { InternalObserver } from './prototype/observe';
import { Ractive } from './Ractive';

interface RactiveInternalConfig {
  template?: RactiveDynamicTemplate;
}

/**
 * Internal properties of Ractive
 * @internal
 */
export class RactiveInternal {
  /** @internal */
  public fragment: Fragment;

  /** @internal */
  public _fakeFragment: FakeFragment;

  /** @internal */
  public torndown: boolean;

  /** @internal */
  public rendering: boolean;

  /** @internal*/
  public rendered: boolean;

  /** @internal */
  public unrendering: boolean;

  /** @internal */
  public shouldDestroy: boolean;

  /** @internal */
  public destroyed: boolean;

  /** @internal */
  public isDetached: boolean;

  /** @internal */
  public anchor: HTMLElement;

  /** @internal */
  public _guid: string;

  /** @internal */
  public _eventQueue: Context[];

  /** @internal */
  public event: Context;

  /** @internal */
  public _nsSubs: number;

  /** @internal */
  public _subs: Record<string, EventListenerEntry[]>;

  /** @internal*/
  public _children: (Ractive | Meta)[] & { byName?: Record<string, Meta[]> };
  /** @internal*/
  public children: this['_children'];

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

  /** @internal */
  public template: any;

  /** @internal */
  public _config: RactiveInternalConfig;

  /** @internal */
  public partials: Record<string, Partial>;

  /** @internal */
  public _attributePartial: any;

  /** @internal */
  public component: any;

  /** @internal */
  public proxy: Element;

  /** @internal */
  public delegate: any;

  /** @internal */
  public data: Data;

  /** @internal */
  public value: any;

  /** @internal */
  public adapt: Adaptor[];

  public _cssModel: CSSModel;

  public _cssDef:
    | string
    | {
        transform: false;
        id: 'Ractive.addStyle';
      };
}
