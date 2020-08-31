import Context from 'shared/Context';
import { RactiveFake } from 'types/RactiveFake';

import { enqueue, dequeue } from './eventStack';

const initStars: Record<string, string[]> = {};
const bubbleStars: Record<string, string[]> = {};

/**
 * cartesian product of name parts and stars
 * adjusted appropriately for special cases
 */
function variants(name: string, initial: boolean): string[] {
  const map = initial ? initStars : bubbleStars;
  if (map[name]) return map[name];

  const parts = name.split('.');
  const result = [];
  let base = false;

  // initial events the implicit namespace of 'this'
  if (initial) {
    parts.unshift('this');
    base = true;
  }

  // use max - 1 bits as a bitmap to pick a part or a *
  // need to skip the full star case if the namespace is synthetic
  const max = Math.pow(2, parts.length) - (initial ? 1 : 0);
  for (let i = 0; i < max; i++) {
    const join: string[] = [];
    for (let j = 0; j < parts.length; j++) {
      join.push(1 & (i >> j) ? '*' : parts[j]);
    }
    result.unshift(join.join('.'));
  }

  if (base) {
    // include non-this-namespaced versions
    if (parts.length > 2) {
      result.push(...variants(name, false));
    } else {
      result.push('*');
      result.push(name);
    }
  }

  map[name] = result;
  return result;
}

export default function fireEvent(
  ractive: RactiveFake,
  eventName: string,
  context: Context,
  args: unknown[] = []
): boolean {
  if (!eventName) {
    return;
  }

  context.name = eventName;
  args.unshift(context);

  const eventNames = ractive._nsSubs ? variants(eventName, true) : ['*', eventName];

  return fireEventAs(ractive, eventNames, context, args, true);
}

function fireEventAs(
  ractive: RactiveFake,
  eventNames: string[],
  context: Context,
  args: unknown[],
  initialFire = false
): boolean {
  let bubble = true;

  if (initialFire || ractive._nsSubs) {
    enqueue(ractive, context);

    let i = eventNames.length;
    while (i--) {
      if (eventNames[i] in ractive._subs) {
        bubble = notifySubscribers(ractive, ractive._subs[eventNames[i]], context, args) && bubble;
      }
    }

    dequeue(ractive);
  }

  if (ractive.parent && bubble) {
    if (initialFire && ractive.component) {
      const fullName = ractive.component.name + '.' + eventNames[eventNames.length - 1];
      eventNames = variants(fullName, false);

      if (context && !context.component) {
        context.component = ractive;
      }
    }

    bubble = fireEventAs(ractive.parent, eventNames, context, args);
  }

  return bubble;
}

/** Used to handle event callback events internally */
export interface EventSubscriber {
  off: boolean;
  callback: Function;
  handler: Function;
}

function notifySubscribers(
  ractive: RactiveFake,
  subscribers: EventSubscriber[],
  context: Context,
  args: unknown[]
): boolean {
  let originalEvent: Context['event'] = null;
  let stopEvent = false;

  // subscribers can be modified inflight, e.g. "once" functionality
  // so we need to copy to make sure everyone gets called
  subscribers = subscribers.slice();

  for (let i = 0, len = subscribers.length; i < len; i += 1) {
    if (!subscribers[i].off && subscribers[i].handler.apply(ractive, args) === false) {
      stopEvent = true;
    }
  }

  if (context && stopEvent && (originalEvent = context.event)) {
    originalEvent.preventDefault && originalEvent.preventDefault();
    originalEvent.stopPropagation && originalEvent.stopPropagation();
  }

  return !stopEvent;
}
