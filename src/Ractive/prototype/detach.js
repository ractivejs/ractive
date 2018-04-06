import hooks from 'src/events/Hook';
import { removeFromArray } from 'utils/array';

export default function Ractive$detach() {
  if (this.isDetached) {
    return this.el;
  }

  if (this.el) {
    removeFromArray(this.el.__ractive_instances__, this);
  }

  this.el = this.fragment.detach();
  this.isDetached = true;

  hooks.detach.fire(this);
  return this.el;
}
