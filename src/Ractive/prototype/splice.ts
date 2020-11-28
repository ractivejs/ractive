import type { ArraySplicePromise } from 'types/Generic';

import makeArrayMethod from './shared/makeArrayMethod';

type RactiveSplice = <T>(
  keypath: string,
  index: number,
  drop: number,
  ...add: T[]
) => ArraySplicePromise<T>;

const Ractive$splice = <RactiveSplice>makeArrayMethod('splice').path;
export default Ractive$splice;
