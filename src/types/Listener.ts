import { Ractive } from 'src/Ractive/Ractive';

export type ListenerCallback<T extends Ractive = Ractive> = (
  this: T,
  ctx: any, // TODO replace with context helper
  ...args: any[]
) => boolean | void | Promise<any>;

export interface ListenerDescriptor<T extends Ractive = Ractive> {
  /**
   * The callback to call when the event is fired.
   */
  handler: ListenerCallback<T>;

  /**
   * Whether or not to immediately cancel the listener after the first firing.
   */
  once?: boolean;
}

export interface ListenerHandle {
  /**
   * Removes the listener.
   */
  cancel(): void;

  /**
   * Stops further firings of the callback.
   */
  silence?(): void;

  /**
   * @returns true if the callback is not going to be called
   */
  isSilenced?(): boolean;

  /**
   * Resume calling the callback with changes or events.
   */
  resume?(): void;
}

/** Used to handle event callback events internally */
export interface EventListenerEntry {
  off?: boolean;
  callback: ListenerCallback;
  handler: (...args: unknown[]) => ReturnType<ListenerCallback>;
}
