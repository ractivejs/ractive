import { safeToStringValue } from 'utils/dom';
import { detachNode } from 'utils/dom';
import { escapeHtml } from 'utils/html';

import { inAttributes } from './element/ConditionalAttribute';
import Mustache from './shared/Mustache';
import progressiveText from './shared/progressiveText';

export default class Interpolator extends Mustache {
  bubble() {
    if (this.owner) this.owner.bubble();
    super.bubble();
  }

  detach() {
    return detachNode(this.node);
  }

  firstNode() {
    return this.node;
  }

  getString() {
    return this.model ? safeToStringValue(this.model.get()) : '';
  }

  render(target, occupants) {
    if (inAttributes()) return;
    const value = (this.value = this.getString());

    this.rendered = true;

    progressiveText(this, target, occupants, value);
  }

  toString(escape) {
    const string = this.getString();
    return escape ? escapeHtml(string) : string;
  }

  unrender(shouldDestroy) {
    if (shouldDestroy) this.detach();
    this.rendered = false;
  }

  update() {
    if (this.dirty) {
      this.dirty = false;
      if (this.rendered) {
        const value = this.getString();
        if (value !== this.value) this.node.data = this.value = value;
      }
    }
  }

  valueOf() {
    return this.model ? this.model.get() : undefined;
  }
}
