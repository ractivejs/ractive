import noop from 'utils/noop';
import { assign, create } from 'utils/object';

export const extern: { Context?: any } = {};

export default function getRactiveContext(ractive, ...assigns) {
  const fragment =
    ractive.fragment ||
    ractive._fakeFragment ||
    (ractive._fakeFragment = new FakeFragment(ractive));
  return fragment.getContext(...assigns);
}

export function getContext(...assigns) {
  if (!this.ctx) this.ctx = new extern.Context(this);
  assigns.unshift(create(this.ctx));

  const [target, ...rest] = assigns;

  return assign(target, ...rest);
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

export function findParentWithContext(fragment) {
  let frag = fragment;
  while (frag && !frag.context) frag = frag.parent;
  if (!frag) return fragment && fragment.ractive.fragment;
  else return frag;
}
