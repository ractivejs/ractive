import { ArraySplicePromise } from 'types/Generic';

import makeArrayMethod from './shared/makeArrayMethod';

type RactiveReverse = (keypath: string) => ArraySplicePromise;

const Ractive$reverse: RactiveReverse = makeArrayMethod('reverse').path;
export default Ractive$reverse;
