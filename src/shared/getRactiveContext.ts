import { Ractive } from 'src/Ractive/RactiveDefinition';
import noop from 'utils/noop';
import { assign, create } from 'utils/object';
import Fragment from 'view/Fragment';

import Context from './Context';

export const extern: { Context?: typeof Context } = {};

export default function getRactiveContext(ractive: Ractive, ...assigns: unknown[]): Context {
  const fragment =
    ractive.fragment ||
    ractive._fakeFragment ||
    (ractive._fakeFragment = new FakeFragment(ractive));
  return fragment.getContext(...assigns);
}

export function getContext(...assigns: unknown[]): Context {
  if (!this.ctx) this.ctx = new extern.Context(this);
  const target = create(this.ctx);

  return assign(target, ...assigns);
}

export class FakeFragment {
  public ractive: Fragment['ractive'];

  // Below properties have been added to make fake fragment compatible with fragment and
  // repeated fragment in resolve reference
  public context: Fragment['context'];
  public aliases: Fragment['aliases'];
  public parent: Fragment['parent'];

  constructor(ractive: FakeFragment['ractive']) {
    this.ractive = ractive;
  }

  getContext = getContext;
  findComponent = noop;
  findAll = noop;
  findAllComponents = noop;

  findContext(): Ractive['viewmodel'] {
    return this.ractive.viewmodel;
  }
}

export function findParentWithContext(fragment: Fragment): typeof fragment {
  let frag = fragment;
  while (frag && !frag.context) frag = frag.parent;
  if (!frag) return fragment && fragment.ractive.fragment;
  else return frag;
}
