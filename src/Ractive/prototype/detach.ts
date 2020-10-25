import hooks from 'src/events/Hook';
import type { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { removeFromArray } from 'utils/array';

import type { Ractive } from '../RactiveDefinition';

export default function Ractive$detach(this: Ractive): DocumentFragment {
  if (this.isDetached) {
    return this.el as DocumentFragment;
  }

  if (this.el) {
    removeFromArray((this.el as RactiveHTMLElement).__ractive_instances__, this);
  }

  this.el = this.fragment.detach();
  this.isDetached = true;

  hooks.detach.fire(this);
  return this.el;
}
