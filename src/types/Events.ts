import { RactiveFake } from './RactiveFake';

export interface EventPluginHandle {
  teardown: () => void;
}

export type EventPlugin<T extends RactiveFake> = (
  this: T,
  node: HTMLElement,
  fire: (event: Event) => void
) => EventPluginHandle;
