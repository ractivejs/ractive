export default function Ractive$once(eventName, handler) {
  const listener = this.on(eventName, (...args) => {
    handler(...args);
    listener.cancel();
  });

  // so we can still do listener.cancel() manually
  return listener;
}
