import staticContext from '../static/getContext';
import getRactiveContext from 'src/shared/getRactiveContext';
import { isString } from 'utils/is';

export default function getContext(node, options) {
  if (!node) return getRactiveContext(this);

  if (isString(node)) {
    node = this.find(node, options);
  }

  return staticContext(node);
}
