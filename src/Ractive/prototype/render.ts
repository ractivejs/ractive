import { teardown } from 'shared/methodCallers';
import type { Target } from 'types/Generic';
import type { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { toArray } from 'utils/array';
import { getElement } from 'utils/dom';
import { warnIfDebug } from 'utils/log';

import type { Ractive } from '../RactiveDefinition';
import render from '../render';

// TODO anchor is not documented so it's required?
export default function Ractive$render(
  this: Ractive,
  target: Target,
  anchor: boolean | string | HTMLElement
): Promise<void> {
  if (this.torndown) {
    warnIfDebug('ractive.render() was called on a Ractive instance that was already torn down');
    return Promise.resolve();
  }

  const _target: RactiveHTMLElement = <RactiveHTMLElement>(getElement(target) || this.el);

  if (!this.append && _target) {
    // Teardown any existing instances *before* trying to set up the new one -
    // avoids certain weird bugs
    const others = _target.__ractive_instances__;
    if (others) others.forEach(teardown);

    // make sure we are the only occupants
    if (!this.enhance) {
      _target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
    }
  }

  const occupants = this.enhance ? toArray(_target.childNodes) : null;
  const promise = render(this, _target, anchor, occupants);

  if (occupants) {
    while (occupants.length) _target.removeChild(occupants.pop());
  }

  return promise;
}
