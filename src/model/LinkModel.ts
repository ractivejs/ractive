import { handleChange, marked, markedAll, teardown } from 'shared/methodCallers';
import { rebindMatch } from 'shared/rebind';
import { Keypath } from 'types/Keypath';
import { Indexes } from 'utils/array';
import { isUndefined } from 'utils/is';
import noop from 'utils/noop';
import { hasOwn } from 'utils/object';
import resolveReference from 'view/resolvers/resolveReference';

import { capture } from '../global/capture';

import Model from './Model';
import ModelBase, { maybeBind, shuffle, ModelWithShuffle, ModelGetOpts } from './ModelBase';

/**
 * temporary placeholder target for detached implicit links
 * so force it as Model to avoid type warning
 */
export const Missing: Model = ({
  parent: undefined,
  key: '@missing',
  animate: noop,
  applyValue: noop,
  get: noop,
  getKeypath() {
    return this.key;
  },
  joinAll() {
    return this;
  },
  joinKey() {
    return this;
  },
  mark: noop,
  registerLink: noop,
  shuffle: noop,
  set: noop,
  unregisterLink: noop
} as unknown) as Model;
Missing.parent = Missing;

export default class LinkModel extends ModelBase implements ModelWithShuffle {
  private virtual: boolean;
  private boundValue: any;

  public owner: ModelBase;
  public target: Model;
  public sourcePath: Keypath;
  public rootLink: boolean;

  public shuffling: boolean;

  public isReadonly: boolean;

  public implicit: boolean;
  public mapping: boolean;

  /** @override */
  public children: LinkModel[];
  /** @override */
  public childByKey: { [key: string]: LinkModel };

  constructor(parent, owner: ModelBase, target, key?: string) {
    super(parent);

    this.owner = owner;
    this.target = target;
    this.key = isUndefined(key) ? owner.key : key;
    if (owner && owner instanceof LinkModel) this.sourcePath = `${owner.sourcePath}.${this.key}`;

    if (target) target.registerLink(this);

    if (parent) this.isReadonly = parent.isReadonly;

    this.isLink = true;
  }

  animate(from, to, options, interpolator) {
    return this.target.animate(from, to, options, interpolator);
  }

  applyValue(value): void {
    if (this.boundValue) this.boundValue = null;
    this.target.applyValue(value);
  }

  attach(fragment): void {
    const model = resolveReference(fragment, this.key);
    if (model) {
      this.relinking(model, false);
    } else {
      // if there is no link available, move everything here to real models
      this.owner.unlink();
    }
  }

  detach(): void {
    this.relinking(Missing, false);
  }

  get(shouldCapture: boolean, opts: ModelGetOpts = {}) {
    if (shouldCapture) {
      capture(this);

      // may need to tell the target to unwrap
      opts.unwrap = 'unwrap' in opts ? opts.unwrap : true;
    }

    const bind = 'shouldBind' in opts ? opts.shouldBind : true;
    opts.shouldBind = this.mapping && this.target.parent && this.target.parent.isRoot;

    return maybeBind(this, this.target.get(false, opts), bind);
  }

  // TODO add ractive type
  getKeypath(ractive): Keypath {
    if (ractive && ractive !== this.root.ractive) return this.target.getKeypath(ractive);

    return super.getKeypath(ractive);
  }

  handleChange(): void {
    this.deps.forEach(handleChange);
    this.links.forEach(handleChange);
    this.notifyUpstream();
  }

  isDetached(): boolean {
    return this.virtual && this.target === Missing;
  }

  joinKey(key: string): LinkModel {
    // TODO: handle nested links
    if (isUndefined(key) || key === '') return this;

    if (!hasOwn(this.childByKey, key)) {
      const child = new LinkModel(this, this, this.target.joinKey(key), key);
      this.children.push(child);
      this.childByKey[key] = child;
    }

    return this.childByKey[key];
  }

  mark(force?: boolean): void {
    this.target.mark(force);
  }

  marked(): void {
    if (this.boundValue) this.boundValue = null;

    this.links.forEach(marked);

    this.deps.forEach(handleChange);
  }

  markedAll(): void {
    this.children.forEach(markedAll);
    this.marked();
  }

  notifiedUpstream(startPath, root): void {
    this.links.forEach(l => l.notifiedUpstream(startPath, this.root));
    this.deps.forEach(handleChange);
    if (startPath && this.rootLink && this.root !== root) {
      const path = startPath.slice(1);
      path.unshift(this.key);
      this.notifyUpstream(path);
    }
  }

  relinked(): void {
    this.target.registerLink(this);
    this.children.forEach(c => c.relinked());
  }

  relinking(target, safe: boolean): void {
    if (this.rootLink && this.sourcePath)
      target = rebindMatch(this.sourcePath, target, this.target);
    if (!target || this.target === target) return;

    this.target && this.target.unregisterLink(this);

    this.target = target;
    this.children.forEach(c => {
      c.relinking(target.joinKey(c.key), safe);
    });

    if (!safe) this.keypath = undefined;

    if (this.rootLink)
      this.addShuffleTask(() => {
        this.relinked();
        if (!safe) {
          this.markedAll();
          this.notifyUpstream();
        }
      });
  }

  set(value): void {
    if (this.boundValue) this.boundValue = null;
    this.target.set(value);
  }

  shuffle(newIndices: Indexes): void {
    // watch for extra shuffles caused by a shuffle in a downstream link
    if (this.shuffling) return;

    // let the real model handle firing off shuffles
    if (!this.target.shuffling) {
      if (this.target.shuffle) {
        this.target.shuffle(newIndices);
      } else {
        // the target is a computation, which can't shuffle
        this.target.mark();
      }
    } else {
      shuffle(this, newIndices, true);
    }
  }

  source() {
    if (this.target.source) return this.target.source();
    else return this.target;
  }

  teardown(): void {
    if (this._link) this._link.teardown();
    this.target.unregisterLink(this);
    this.children.forEach(teardown);
  }
}
