import { doc } from 'config/environment';
import Context from 'shared/Context';
import getRactiveContext from 'shared/getRactiveContext';
import { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { isString } from 'utils/is';

const query = doc?.querySelector;

// todo add ContextHelper as return value
export default function getContext(startNode: HTMLElement | string): Context {
  if (isString(startNode) && query) {
    startNode = query.call(document, startNode);
  }

  const node = startNode as RactiveHTMLElement;
  let instances;
  if (node) {
    if (node._ractive) {
      return node._ractive.proxy.getContext();
    } else if ((instances = node.__ractive_instances__)) {
      if (instances.length === 1) {
        return getRactiveContext(instances[0]);
      }
    } else {
      return getContext(node.parentNode as HTMLElement);
    }
  }
}
