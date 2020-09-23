import { updateAnchors } from 'shared/anchors';
import hooks from 'src/events/Hook';
import runloop from 'src/global/runloop';

import type { Ractive } from '../RactiveDefinition';

export default function Ractive$detachChild(this: Ractive, child: Ractive): Promise<Ractive> {
  const children = this._children;
  // TODO define meta type
  let meta, index: number;

  let i = children.length;
  while (i--) {
    if (children[i].instance === child) {
      index = i;
      meta = children[i];
      break;
    }
  }

  if (!meta || child.parent !== this)
    throw new Error(`Instance ${child._guid} is not attached to this instance.`);

  const promise: Promise<void> & { ractive?: Ractive } = runloop.start();

  if (meta.anchor) meta.anchor.removeChild(meta);
  if (!child.isolated) child.viewmodel.detached();

  children.splice(index, 1);
  if (meta.target) {
    this.splice(
      `@this.children.byName.${meta.target}`,
      children.byName[meta.target].indexOf(meta),
      1
    );
    updateAnchors(this, meta.target);
  }
  const rm = child.viewmodel.getRactiveModel();
  rm.joinKey('parent').unlink();
  rm.joinKey('root').link(rm);
  child.root = child;
  child.parent = null;
  child.component = null;

  hooks.detachchild.fire(child);

  runloop.end();

  promise.ractive = child;
  return promise.then(() => child);
}
