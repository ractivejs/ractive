import getRactiveContext from 'src/shared/getRactiveContext';
import { ContextHelper } from 'types/Context';
import { isString } from 'utils/is';

import { Ractive } from '../Ractive';
import staticContext from '../static/getContext';

export default function Ractive$getContext(
  this: Ractive,
  node: HTMLElement | string
): ContextHelper {
  if (!node) return getRactiveContext(this);

  if (isString(node)) {
    node = this.find(node);
  }

  return staticContext(node);
}
