import { ArraySplicePromise } from 'types/Generic';

import makeArrayMethod from './shared/makeArrayMethod';

type RactiveSort = (keypath: string) => ArraySplicePromise;

const Ractive$sort: RactiveSort = makeArrayMethod('sort').path;
export default Ractive$sort;
