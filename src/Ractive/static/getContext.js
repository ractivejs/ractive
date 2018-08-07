import { doc } from 'config/environment';
import getRactiveContext from 'shared/getRactiveContext';
import { isString } from 'utils/is';

const query = doc && doc.querySelector;

export default function getContext(node) {
  if (isString(node) && query) {
    node = query.call(document, node);
  }

  let instances;
  if (node) {
    if (node._ractive) {
      return node._ractive.proxy.getContext();
    } else if ((instances = node.__ractive_instances__)) {
      if (instances.length === 1) return getRactiveContext(instances[0]);
    } else return getContext(node.parentNode);
  }
}
