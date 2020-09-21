import type { EventListenerEntry, ListenerCallback, ListenerHandle } from 'types/Listener';
import { isObjectType, isString } from 'utils/is';
import { hasOwn } from 'utils/object';

import type { Ractive } from '../RactiveDefinition';

import notEmptyString from './shared/notEmptyString';
import trim from './shared/trim';

function Ractive$on(this: Ractive, map: Record<string, ListenerCallback>): ListenerHandle;
function Ractive$on(this: Ractive, eventName: string, callback: ListenerCallback): ListenerHandle;
function Ractive$on(
  this: Ractive,
  eventName: string | Record<string, ListenerCallback>,
  callback?: ListenerCallback
): ListenerHandle {
  // eventName may already be a map
  const map = isObjectType<Record<string, ListenerCallback>>(eventName) ? eventName : {};
  // or it may be a string along with a callback
  if (isString(eventName)) map[eventName] = callback;

  let silent = false;
  const events: [string, EventListenerEntry][] = [];

  for (const k in map) {
    const callback = map[k];
    const entry: EventListenerEntry = {
      callback,
      handler(...args) {
        if (!silent) return callback.apply(this, args);
      }
    };

    if (hasOwn(map, k)) {
      const names = k.split(' ').map(trim).filter(notEmptyString);
      names.forEach(n => {
        (this._subs[n] || (this._subs[n] = [])).push(entry);
        if (n.indexOf('.')) this._nsSubs++;
        events.push([n, entry]);
      });
    }
  }

  return {
    cancel: () => events.forEach(e => this.off(e[0], e[1].callback)),
    isSilenced: () => silent,
    silence: () => (silent = true),
    resume: () => (silent = false)
  };
}

export default Ractive$on;
