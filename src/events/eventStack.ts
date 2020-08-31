import Context from 'shared/Context';
import { RactiveFake } from 'types/RactiveFake';

export function enqueue(ractive: RactiveFake, event: Context): void {
  if (ractive.event) {
    ractive._eventQueue.push(ractive.event);
  }

  ractive.event = event;
}

export function dequeue(ractive: RactiveFake): void {
  if (ractive._eventQueue.length) {
    ractive.event = ractive._eventQueue.pop();
  } else {
    ractive.event = null;
  }
}
