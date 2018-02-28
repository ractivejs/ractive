import add from './shared/add';
import { isNumber, isObjectType } from 'utils/is';

export default function Ractive$subtract(keypath, d, options) {
  const num = isNumber(d) ? -d : -1;
  const opts = isObjectType(d) ? d : options;
  return add(this, keypath, num, opts);
}
