import { safeToStringValue } from 'utils/dom';
import { detachNode } from 'utils/dom';
import { escapeHtml } from 'utils/html';

import Attribute from './element/Attribute';
import Binding from './element/binding/Binding';
import { inAttributes } from './element/ConditionalAttribute';
import Mustache, { MustacheOpts } from './shared/Mustache';
import progressiveText from './shared/progressiveText';

export default class Interpolator extends Mustache {
  public owner: Attribute;
  public twowayBinding: Binding;
  public bound: boolean;
  public pathChanged: () => void;
  private value: string;
  private rendered: boolean;
  private node: HTMLElement & { data: string };

  constructor(options: MustacheOpts) {
    super(options);
  }

  bubble(): void {
    if (this.owner) this.owner.bubble();
    super.bubble();
  }

  detach(): Interpolator['node'] {
    return detachNode(this.node);
  }

  firstNode(): Interpolator['node'] {
    return this.node;
  }

  getString(): string {
    return this.model ? safeToStringValue(this.model.get()) : '';
  }

  render(target, occupants): void {
    if (inAttributes()) return;
    const value = (this.value = this.getString());

    this.rendered = true;

    progressiveText(this, target, occupants, value);
  }

  toString(escape: boolean): string {
    const string = this.getString();
    return escape ? escapeHtml(string) : string;
  }

  unrender(shouldDestroy: boolean): void {
    if (shouldDestroy) this.detach();
    this.rendered = false;
  }

  update(): void {
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