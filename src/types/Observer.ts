export interface ObserverHandle {
  /**
   * Removes the listener or observer.j
   */
  cancel(): void;

  /**
   * Stops further firings of the callback. Any related observers will still stay up-to-date, so the old value will be updated as the data changes.
   */
  silence(): void;

  /**
   * @returns true if the callback is not going to be called
   */
  isSilenced(): boolean;

  /**
   * Resume calling the callback with changes or events.
   */
  resume(): void;
}
