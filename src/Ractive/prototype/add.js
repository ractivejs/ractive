import { isNumber, isObjectType } from 'utils/is';

import add from './shared/add';

export default function Ractive$add(keypath, d, options) {
  const num = isNumber(d) ? d : 1;
  const opts = isObjectType(d) ? d : options;
  return add(this, keypath, num, opts);
}
