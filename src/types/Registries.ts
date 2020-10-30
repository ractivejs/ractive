import type { InterpolatorFunction } from 'src/Ractive/static/interpolators';
import type Partial from 'view/items/Partial';

import type { Component, Ractive } from '../Ractive/RactiveDefinition';

import type { Adaptor } from './Adaptor';
import type { Decorator } from './Decorator';
import type { EasingFunction } from './Easings';
import type { EventPlugin } from './Events';
import type { Helper } from './Generic';
import type { Transition } from './Transition';

export type Registry<T> = Record<string, T>;

// TODO add correct type on all entries
export interface Registries {
  adaptors: Registry<Adaptor>;
  components: Registry<Component>;
  decorators: Registry<Decorator<Ractive>>;
  easings: Registry<EasingFunction>;
  events: Registry<EventPlugin<Ractive>>;
  interpolators: Registry<InterpolatorFunction>;
  helpers: Registry<Helper>;
  partials: Registry<Partial>;
  transitions: Registry<Transition>;
}
