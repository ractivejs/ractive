import ModelBase, { fireShuffleTasks, maybeBind, shuffle } from './ModelBase';
import { capture } from '../global/capture';
import { handleChange, marked, markedAll, teardown } from 'shared/methodCallers';
import { rebindMatch } from 'shared/rebind';
import resolveReference from 'src/view/resolvers/resolveReference';
import noop from 'utils/noop';
import { hasOwn } from 'utils/object';
import { isUndefined } from 'utils/is';

// temporary placeholder target for detached implicit links
export const Missing = {
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
  shufle: noop,
  set: noop,
  unregisterLink: noop
};
Missing.parent = Missing;

export default class LinkModel extends ModelBase {
  constructor(parent, owner, target, key) {
    super(parent);

    this.owner = owner;
    this.target = target;
    this.key = isUndefined(key) ? owner.key : key;
    if (owner && owner.isLink) this.sourcePath = `${owner.sourcePath}.${this.key}`;

    if (target) target.registerLink(this);

    if (parent) this.isReadonly = parent.isReadonly;

    this.isLink = true;
  }

  animate(from, to, options, interpolator) {
    return this.target.animate(from, to, options, interpolator);
  }

  applyValue(value) {
    if (this.boundValue) this.boundValue = null;
    this.target.applyValue(value);
  }

  attach(fragment) {
    const model = resolveReference(fragment, this.key);
    if (model) {
      this.relinking(model, false);
    } else {
      // if there is no link available, move everything here to real models
      this.owner.unlink();
    }
  }

  detach() {
    this.relinking(Missing, false);
  }

  get(shouldCapture, opts = {}) {
    if (shouldCapture) {
      capture(this);

      // may need to tell the target to unwrap
      opts.unwrap = 'unwrap' in opts ? opts.unwrap : true;
    }

    const bind = 'shouldBind' in opts ? opts.shouldBind : true;
    opts.shouldBind = this.mapping && this.target.parent && this.target.parent.isRoot;

    return maybeBind(this, this.target.get(false, opts), bind);
  }

  getKeypath(ractive) {
    if (ractive && ractive !== this.root.ractive) return this.target.getKeypath(ractive);

    return super.getKeypath(ractive);
  }

  handleChange() {
    this.deps.forEach(handleChange);
    this.links.forEach(handleChange);
    this.notifyUpstream();
  }

  isDetached() {
    return this.virtual && this.target === Missing;
  }

  joinKey(key) {
    // TODO: handle nested links
    if (isUndefined(key) || key === '') return this;

    if (!hasOwn(this.childByKey, key)) {
      const child = new LinkModel(this, this, this.target.joinKey(key), key);
      this.children.push(child);
      this.childByKey[key] = child;
    }

    return this.childByKey[key];
  }

  mark(force) {
    this.target.mark(force);
  }

  marked() {
    if (this.boundValue) this.boundValue = null;

    this.links.forEach(marked);

    this.deps.forEach(handleChange);
  }

  markedAll() {
    this.children.forEach(markedAll);
    this.marked();
  }

  notifiedUpstream(startPath, root) {
    this.links.forEach(l => l.notifiedUpstream(startPath, this.root));
    this.deps.forEach(handleChange);
    if (startPath && this.rootLink) {
      const parent = this.parent;
      if (this.root !== root) {
        const path = startPath.slice(1);
        path.unshift(this.key);
        this.notifyUpstream(path);
      } else if (parent && parent !== this.target) {
        const path = [parent.key, this.key];
        parent.links.forEach(l => l.notifiedUpstream(path, parent.root));
        parent.deps.forEach(d => d.handleChange(path));
        parent.notifyUpstream(path);
      }
    }
  }

  relinked() {
    this.target.registerLink(this);
    this.children.forEach(c => c.relinked());
  }

  relinking(target, safe) {
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

  set(value) {
    if (this.boundValue) this.boundValue = null;
    this.target.set(value);
  }

  shuffle(newIndices) {
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

  teardown() {
    if (this._link) this._link.teardown();
    this.target.unregisterLink(this);
    this.children.forEach(teardown);
  }
}

ModelBase.prototype.link = function link(model, keypath, options) {
  const lnk = this._link || new LinkModel(this.parent, this, model, this.key);
  lnk.implicit = options && options.implicit;
  lnk.mapping = options && options.mapping;
  lnk.sourcePath = keypath;
  lnk.rootLink = true;
  if (this._link) this._link.relinking(model, false);
  this._link = lnk;
  this.rebind(lnk, this, false);
  fireShuffleTasks();

  lnk.markedAll();

  this.notifyUpstream();
  return lnk;
};

ModelBase.prototype.unlink = function unlink() {
  if (this._link) {
    const ln = this._link;
    this._link = undefined;
    ln.rebind(this, ln, false);
    fireShuffleTasks();
    ln.teardown();
    this.notifyUpstream();
  }
};
