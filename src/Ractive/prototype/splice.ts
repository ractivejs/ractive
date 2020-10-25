import type { ArraySplicePromise } from 'types/Generic';

import makeArrayMethod from './shared/makeArrayMethod';

type RactiveSplice = (
  keypath: string,
  index: number,
  drop: number,
  ...add: any[]
) => ArraySplicePromise;

const Ractive$splice: RactiveSplice = makeArrayMethod('splice').path;
export default Ractive$splice;
