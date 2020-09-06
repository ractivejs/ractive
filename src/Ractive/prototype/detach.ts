import hooks from 'src/events/Hook';
import { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { removeFromArray } from 'utils/array';

import { Ractive } from '../Ractive';

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
