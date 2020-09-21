import hooks from 'src/events/Hook';
import type { Target } from 'types/Generic';
import type { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { getElement } from 'utils/dom';

import type { Ractive } from '../RactiveDefinition';

export default function Ractive$insert(this: Ractive, target: Target, anchor: Target): void {
  if (!this.fragment.rendered) {
    // TODO create, and link to, documentation explaining this
    throw new Error(
      'The API has changed - you must call `ractive.render(target[, anchor])` to render your Ractive instance. Once rendered you can use `ractive.insert()`.'
    );
  }

  const _target: RactiveHTMLElement = getElement(target);
  const _anchor: RactiveHTMLElement = getElement(anchor) || null;

  if (!_target) {
    throw new Error('You must specify a valid target to insert into');
  }

  _target.insertBefore(this.detach(), _anchor);
  this.el = _target;

  (_target.__ractive_instances__ || (_target.__ractive_instances__ = [])).push(this);
  this.isDetached = false;

  fireInsertHook(this);
}

function fireInsertHook(ractive: Ractive): void {
  hooks.insert.fire(ractive);

  ractive.findAllComponents('*').forEach(child => {
    fireInsertHook(child.instance);
  });
}
