import type { ArrayPopPromise } from 'types/Generic';

import makeArrayMethod from './shared/makeArrayMethod';

type RactiveShift = (keypath: string) => ArrayPopPromise;

const Ractive$shift: RactiveShift = makeArrayMethod('shift').path;
export default Ractive$shift;
