import { RactiveFake } from 'types/RactiveFake';
import noop from 'utils/noop';
import { assign, create } from 'utils/object';
import Fragment from 'view/Fragment';

import Context from './Context';

export const extern: { Context?: typeof Context } = {};

export default function getRactiveContext(ractive, ...assigns): Context {
  const fragment: Fragment =
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
  public ractive: RactiveFake;

  constructor(ractive: FakeFragment['ractive']) {
    this.ractive = ractive;
  }

  getContext = getContext;
  findComponent = noop;
  findAll = noop;
  findAllComponents = noop;

  findContext() {
    return this.ractive.viewmodel;
  }
}

export function findParentWithContext(fragment: Fragment): typeof fragment {
  let frag = fragment;
  while (frag && !frag.context) frag = frag.parent;
  if (!frag) return fragment && fragment.ractive.fragment;
  else return frag;
}
