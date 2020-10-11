import TemplateItemType from 'config/types';

import type Item from '../items/shared/Item';

// TODO all this code needs to die
export default function processItems(items: Item[], values, guid: string, counter = 0): string {
  return items
    .map(item => {
      if (item.type === TemplateItemType.TEXT) {
        return item.template;
      }

      if (item.fragment) {
        if (item.fragment.iterations) {
          return item.fragment.iterations
            .map(fragment => {
              return processItems(fragment.items, values, guid, counter);
            })
            .join('');
        } else {
          return processItems(item.fragment.items, values, guid, counter);
        }
      }

      const placeholderId = `${guid}-${counter++}`;
      // TSRChange - it seems that `item.newModel` is never set
      const model = item.model;

      values[placeholderId] = model
        ? model.wrapper
          ? model.wrapperValue
          : model.get()
        : undefined;

      return '${' + placeholderId + '}';
    })
    .join('');
}
