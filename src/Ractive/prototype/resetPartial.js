import { PARTIAL, COMPONENT, ELEMENT } from 'config/types';
import { handleChange } from 'shared/methodCallers';
import runloop from 'src/global/runloop';
import { isArray } from 'utils/is';

function collect(source, name, attr, dest) {
  source.forEach(item => {
    // queue to rerender if the item is a partial and the current name matches
    if (item.type === PARTIAL && (item.refName === name || item.name === name)) {
      item.inAttribute = attr;
      dest.push(item);
      return; // go no further
    }

    // if it has a fragment, process its items
    if (item.fragment) {
      collect(item.fragment.iterations || item.fragment.items, name, attr, dest);
    } else if (isArray(item.items)) {
      // or if it is itself a fragment, process its items
      collect(item.items, name, attr, dest);
    } else if (item.type === COMPONENT && item.instance) {
      // or if it is a component, step in and process its items
      // ...unless the partial is shadowed
      if (item.instance.partials[name]) return;
      collect(item.instance.fragment.items, name, attr, dest);
    }

    // if the item is an element, process its attributes too
    if (item.type === ELEMENT) {
      if (isArray(item.attributes)) {
        collect(item.attributes, name, true, dest);
      }
    }
  });
}

export default function(name, partial) {
  const collection = [];
  collect(this.fragment.items, name, false, collection);

  const promise = runloop.start();

  this.partials[name] = partial;
  collection.forEach(handleChange);

  runloop.end();

  return promise;
}
