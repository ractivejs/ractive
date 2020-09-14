import TemplateItemType from 'config/types';
import { handleChange } from 'shared/methodCallers';
import runloop from 'src/global/runloop';
import { Partial as PartialParam } from 'types/Generic';
import { isArray } from 'utils/is';
import Fragment, { isFragment } from 'view/Fragment';
import Component from 'view/items/Component';
import Element from 'view/items/Element';
import Partial from 'view/items/Partial';
import { isItemType, ItemBasicInterface } from 'view/items/shared/Item';

import { Ractive } from '../Ractive';

function collect(
  source: (ItemBasicInterface | Fragment)[],
  name: string,
  attr: boolean,
  dest: ItemBasicInterface[]
): void {
  source.forEach(item => {
    // queue to rerender if the item is a partial and the current name matches
    if (
      isItemType<Partial>(item, TemplateItemType.PARTIAL) &&
      (item.refName === name || item.name === name)
    ) {
      // TSRChange - it seems that this property is not used inside partial class
      // item.inAttribute = attr;
      dest.push(item);
      return; // go no further
    }

    // if it has a fragment, process its items
    // TSRChange - add in guard
    if ('fragment' in item && item.fragment) {
      collect(item.fragment.iterations || item.fragment.items, name, attr, dest);
    } else if (isFragment(item) && isArray(item.items)) {
      // or if it is itself a fragment, process its items
      collect(item.items, name, attr, dest);
    } else if (isItemType<Component>(item, TemplateItemType.COMPONENT) && item.instance) {
      // or if it is a component, step in and process its items
      // ...unless the partial is shadowed
      if (item.instance.partials[name]) return;
      collect(item.instance.fragment.items, name, attr, dest);
    }

    // if the item is an element, process its attributes too
    if (isItemType<Element>(item, TemplateItemType.ELEMENT)) {
      if (isArray(item.attributes)) {
        collect(item.attributes, name, true, dest);
      }
    }
  });
}

export default function Ractive$resetPartial(
  this: Ractive,
  name: string,
  partial: PartialParam
): Promise<void> {
  const collection: ItemBasicInterface[] = [];
  collect(this.fragment.items, name, false, collection);

  const promise = runloop.start();

  this.partials[name] = partial;
  collection.forEach(handleChange);

  runloop.end();

  return promise;
}
