import { ListenerCallback, ListenerHandle } from 'types/Listener';

import { Ractive } from '../Ractive';

function Ractive$once(
  this: Ractive,
  eventName: string,
  handler?: ListenerCallback
): ListenerHandle {
  const listener = this.on(eventName, (...args) => {
    handler.call(this, ...args);
    listener.cancel();
  });

  // so we can still do listener.cancel() manually
  return listener;
}

export default Ractive$once;
