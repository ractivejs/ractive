import getRactiveContext from 'src/shared/getRactiveContext';
import { isString } from 'utils/is';

import staticContext from '../static/getContext';

export default function getContext(node, options) {
  if (!node) return getRactiveContext(this);

  if (isString(node)) {
    node = this.find(node, options);
  }

  return staticContext(node);
}
