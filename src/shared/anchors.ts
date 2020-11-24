import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { Meta } from 'types/Generic';
import type Fragment from 'view/Fragment';
import type Component from 'view/items/Component';

export function findAnchors(fragment: Fragment, name: string = null): Component[] {
  const res: Component[] = [];

  findAnchorsIn(fragment, name, res, fragment.ractive);

  return res;
}

function findAnchorsIn(item, name: string, result: Component[], instance: Ractive): void {
  if (item.isAnchor) {
    if (!name || item.name === name) {
      result.push(item);
    }
  } else if (item.items) {
    item.items.forEach(i => findAnchorsIn(i, name, result, instance));
  } else if (item.iterations) {
    item.iterations.forEach(i => findAnchorsIn(i, name, result, instance));
  } else if (item.fragment && (!item.component || item.fragment.ractive === instance)) {
    findAnchorsIn(item.fragment, name, result, instance);
  } else if (item.instance && item.instance.fragment) {
    const anchors = [];
    findAnchorsIn(item.instance.fragment, name, anchors, instance);
    anchors.forEach(a => a.ractive === instance && result.push(a));
  }
}

export function updateAnchors(instance: Ractive, name: string = null): void {
  const anchors = findAnchors(instance.fragment, name);
  const idxs: Record<string, number> = {};
  const children = instance._children.byName;

  anchors.forEach(a => {
    const name = a.name;
    if (!(name in idxs)) idxs[name] = 0;
    const idx = idxs[name];
    const child = (children[name] || [])[idx];

    if (child && child.lastBound !== a) {
      if (child.lastBound) child.lastBound.removeChild(child);
      a.addChild(child);
    }

    idxs[name]++;
  });
}

export function unrenderChild(meta: Meta): void {
  if (meta.instance.fragment.rendered) {
    meta.shouldDestroy = true;
    meta.instance.unrender();
  }
  meta.instance.el = null;
}
