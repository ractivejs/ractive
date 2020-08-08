import Decorator from 'view/items/element/Decorator';
import Interpolator from 'view/items/Interpolator';
import Partial from 'view/items/Partial';

import { Adaptor } from './Adaptor';
import { EasingFunction } from './Easings';
import { EventPlugin } from './Events';
import { RactiveFake } from './RactiveFake';

export type Registry<T> = Record<string, T>;

// TODO add correct type on all entries
export interface Registries {
  adaptors: Registry<Adaptor>;
  components: Registry<any>; // Component
  decorators: Registry<Decorator>;
  easings: Registry<EasingFunction>;
  events: Registry<EventPlugin<RactiveFake>>;
  interpolators: Registry<Interpolator>;
  helpers: Registry<any>; // Helper
  partials: Registry<Partial>;
}
