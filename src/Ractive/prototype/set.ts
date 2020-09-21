import { build, set } from 'shared/set';
import { ValueMap } from 'types/Generic';
import { SetOpts } from 'types/MethodOptions';
import { isObjectType } from 'utils/is';

import { Ractive } from '../RactiveDefinition';

function Ractive$set(keypath: string, value: unknown, options?: SetOpts): Promise<void>;
function Ractive$set(keypath: ValueMap, options?: SetOpts): Promise<void>;
function Ractive$set(
  this: Ractive,
  keypath: string | ValueMap,
  value: unknown | SetOpts,
  options?: SetOpts
): Promise<void> {
  const opts: SetOpts = isObjectType(keypath) ? value : options;

  return set(build(this, keypath, value, opts?.isolated), opts);
}

export default Ractive$set;
