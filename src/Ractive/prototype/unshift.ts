import { ArrayPushPromise } from 'types/Generic';

import makeArrayMethod from './shared/makeArrayMethod';

type RactiveUnshift = (keypath: string, value: any) => ArrayPushPromise;

const Ractive$unshift: RactiveUnshift = makeArrayMethod('unshift').path;
export default Ractive$unshift;
