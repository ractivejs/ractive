import { Ractive } from '../Ractive/RactiveDefinition';

export interface EventPluginHandle {
  teardown: () => void;
}

export type EventPlugin<T extends Ractive> = (
  this: T,
  node: HTMLElement,
  fire: (event: Event) => void
) => EventPluginHandle;
