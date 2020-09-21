import Context from 'shared/Context';
import { Ractive } from 'src/Ractive/RactiveDefinition';

export function enqueue(ractive: Ractive, event: Context): void {
  if (ractive.event) {
    ractive._eventQueue.push(ractive.event);
  }

  ractive.event = event;
}

export function dequeue(ractive: Ractive): void {
  if (ractive._eventQueue.length) {
    ractive.event = ractive._eventQueue.pop();
  } else {
    ractive.event = null;
  }
}
