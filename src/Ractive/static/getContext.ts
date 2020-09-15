import { doc } from 'config/environment';
import getRactiveContext from 'shared/getRactiveContext';
import { ContextHelper } from 'types/Context';
import { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { isString } from 'utils/is';

import { Ractive } from '../Ractive';

const query = doc?.querySelector;

export default function getContext(startNode: HTMLElement | string): ContextHelper {
  if (isString(startNode) && query) {
    startNode = query.call(document, startNode);
  }

  const node = <RactiveHTMLElement>startNode;
  let instances: Ractive[];
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
