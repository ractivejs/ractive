import TemplateItemType from 'config/types';
import type Fragment from 'view/Fragment';
import type Element from 'view/items/Element';

import type Item from './Item';

export default function findElement<Result extends Item = Element>(
  start: Fragment | Item,
  orComponent = true,
  name?: string
): Result {
  // TODO find a way to use type in this function
  let result: any = start;
  while (
    result &&
    (result.type !== TemplateItemType.ELEMENT || (name && result.name !== name)) &&
    (!orComponent ||
      (result.type !== TemplateItemType.COMPONENT && result.type !== TemplateItemType.ANCHOR))
  ) {
    // start is a fragment - look at the owner
    if (result.owner) result = result.owner;
    else if (result.component || result.yield)
      // start is a component or yielder - look at the container
      result = result.containerFragment || result.component.up;
    else if (result.parent)
      // start is an item - look at the parent
      result = result.parent;
    else if (result.up)
      // start is an item without a parent - look at the parent fragment
      result = result.up;
    else result = undefined;
  }

  return result;
}
