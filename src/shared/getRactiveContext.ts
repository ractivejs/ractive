import Fragment from 'src/view/Fragment';
import noop from 'utils/noop';
import { assign, create } from 'utils/object';

export const extern: { Context?: any } = {};

export default function getRactiveContext(ractive, ...assigns) {
  const fragment: Fragment =
    ractive.fragment ||
    ractive._fakeFragment ||
    (ractive._fakeFragment = new FakeFragment(ractive));
  return fragment.getContext(...assigns);
}

export function getContext(...assigns: unknown[]): typeof extern.Context {
  if (!this.ctx) this.ctx = new extern.Context(this);
  const target = create(this.ctx);

  return assign(target, ...assigns);
}

export class FakeFragment {
  public ractive;

  constructor(ractive) {
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
