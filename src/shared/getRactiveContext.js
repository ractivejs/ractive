import noop from 'utils/noop';
import { assign, create } from 'utils/object';

export const extern = {};

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

  return assign(...assigns);
}

export class FakeFragment {
  constructor(ractive) {
    this.ractive = ractive;
  }

  findContext() {
    return this.ractive.viewmodel;
  }
}
const proto = FakeFragment.prototype;
proto.getContext = getContext;
proto.find = proto.findComponent = proto.findAll = proto.findAllComponents = noop;

export function findParentWithContext(fragment) {
  let frag = fragment;
  while (frag && !frag.context) frag = frag.parent;
  if (!frag) return fragment && fragment.ractive.fragment;
  else return frag;
}
