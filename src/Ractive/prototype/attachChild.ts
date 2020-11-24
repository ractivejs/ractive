import { unrenderChild, updateAnchors } from 'shared/anchors';
import hooks from 'src/events/Hook';
import runloop from 'src/global/runloop';
import type { Meta } from 'types/Generic';
import type { AttachOpts } from 'types/MethodOptions';

import type { Ractive } from '../RactiveDefinition';

export default function Ractive$attachChild(
  this: Ractive,
  child: Ractive,
  options: AttachOpts = {}
): Promise<void | Ractive> {
  const children = this._children;
  let idx: number;

  if (child.parent && child.parent !== this)
    throw new Error(
      `Instance ${child._guid} is already attached to a different instance ${child.parent._guid}. Please detach it from the other instance using detachChild first.`
    );
  else if (child.parent)
    throw new Error(`Instance ${child._guid} is already attached to this instance.`);

  const meta: Meta = {
    instance: child,
    ractive: this,
    name: options.name || child.constructor.name || 'Ractive',
    target: options.target || false,
    bubble,
    findNextNode
  };
  meta.nameOption = options.name;

  // child is managing itself
  if (!meta.target) {
    meta.up = this.fragment;
    meta.external = true;
  } else {
    let list = children.byName[meta.target];
    if (!list) {
      list = [];
      this.set(`@this.children.byName.${meta.target}`, list);
    }
    idx = options.prepend ? 0 : options.insertAt !== undefined ? options.insertAt : list.length;
  }

  child.parent = this;
  child.root = this.root;
  child.component = meta;
  children.push(meta);

  const promise: Promise<void> & { ractive?: Ractive } = runloop.start();

  const rm = child.viewmodel.getRactiveModel();
  rm.joinKey('parent').link(this.viewmodel.getRactiveModel());
  rm.joinKey('root').link(this.root.viewmodel.getRactiveModel());

  hooks.attachchild.fire(child);

  if (meta.target) {
    unrenderChild(meta);
    this.splice(`@this.children.byName.${meta.target}`, idx, 0, meta);
    updateAnchors(this, meta.target);
  } else {
    if (!child.isolated) child.viewmodel.attached(this.fragment);
  }

  runloop.end();

  promise.ractive = child;
  return promise.then(() => child);
}

function bubble(this: Meta): void {
  runloop.addFragment(this.instance.fragment);
}

function findNextNode(this: Meta): ReturnType<Meta['anchor']['findNextNode']> {
  if (this.anchor) return this.anchor.findNextNode();
}
