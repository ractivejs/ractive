import { InterpolatorFunction } from 'src/Ractive/static/interpolators';
import Partial from 'view/items/Partial';

import { Adaptor } from './Adaptor';
import { Decorator } from './Decorator';
import { EasingFunction } from './Easings';
import { EventPlugin } from './Events';
import { RactiveFake } from './RactiveFake';
import { Transition } from './Transition';

export type Registry<T> = Record<string, T>;

// TODO add correct type on all entries
export interface Registries {
  adaptors: Registry<Adaptor>;
  components: Registry<any>; // Component
  decorators: Registry<Decorator<RactiveFake>>;
  easings: Registry<EasingFunction>;
  events: Registry<EventPlugin<RactiveFake>>;
  interpolators: Registry<InterpolatorFunction<any>>;
  helpers: Registry<any>; // Helper
  partials: Registry<Partial>;
  transitions: Registry<Transition>;
}
