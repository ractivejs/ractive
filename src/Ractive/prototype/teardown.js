import { cancel } from 'shared/methodCallers';
import hooks from 'src/events/Hook';
import { removeFromArray } from 'utils/array';
import { warnIfDebug } from 'utils/log';

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown() {
  if (this.torndown) {
    warnIfDebug('ractive.teardown() was called on a Ractive instance that was already torn down');
    return Promise.resolve();
  }

  this.shouldDestroy = true;
  return teardown(this, () => (this.fragment.rendered ? this.unrender() : Promise.resolve()));
}

export function teardown(instance, getPromise) {
  instance.torndown = true;
  instance.fragment.unbind();
  instance._observers.slice().forEach(cancel);

  if (instance.el && instance.el.__ractive_instances__) {
    removeFromArray(instance.el.__ractive_instances__, instance);
  }

  const promise = getPromise();

  hooks.teardown.fire(instance);

  promise.then(() => {
    hooks.destruct.fire(instance);
    instance.viewmodel.teardown();
  });

  return promise;
}
