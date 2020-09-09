import { cancel } from 'shared/methodCallers';
import hooks from 'src/events/Hook';
import { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { removeFromArray } from 'utils/array';
import { warnIfDebug } from 'utils/log';

import { Ractive } from '../Ractive';

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown(this: Ractive): Promise<void> {
  if (this.torndown) {
    warnIfDebug('ractive.teardown() was called on a Ractive instance that was already torn down');
    return Promise.resolve();
  }

  this.shouldDestroy = true;
  return teardown(this, () => (this.fragment.rendered ? this.unrender() : Promise.resolve()));
}

export function teardown(instance: Ractive, getPromise: () => Promise<void>): Promise<void> {
  instance.torndown = true;
  instance.fragment.unbind();
  instance._observers.slice().forEach(cancel);

  const el = <RactiveHTMLElement>instance.el;

  if (el?.__ractive_instances__) {
    removeFromArray(el.__ractive_instances__, instance);
  }

  const promise = getPromise();

  hooks.teardown.fire(instance);

  promise.then(() => {
    hooks.destruct.fire(instance);
    instance.viewmodel.teardown();
  });

  return promise;
}
