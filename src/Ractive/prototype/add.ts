import { Keypath } from 'types/Generic';
import { SetOpts } from 'types/Options';
import { isNumber, isObjectType } from 'utils/is';

import { Ractive } from '../Ractive';

import add from './shared/add';

function Ractive$add(this: Ractive, keypath: Keypath, options: SetOpts): ReturnType<typeof add>;
function Ractive$add(
  this: Ractive,
  keypath: Keypath,
  d: number,
  options: SetOpts
): ReturnType<typeof add>;
function Ractive$add(
  this: Ractive,
  keypath: Keypath,
  d: number | SetOpts,
  options?: SetOpts
): ReturnType<typeof add> {
  const num = isNumber(d) ? d : 1;
  const opts = isObjectType<SetOpts>(d) ? d : options;
  return add(this, keypath, num, opts);
}

export default Ractive$add;
