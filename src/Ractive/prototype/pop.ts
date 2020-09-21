import { ArrayPopPromise, Keypath } from 'types/Generic';

import { Ractive } from '../RactiveDefinition';

import makeArrayMethod from './shared/makeArrayMethod';

type RactivePop = (this: Ractive, keypath: Keypath) => ArrayPopPromise;

const Ractive$pop: RactivePop = makeArrayMethod('pop').path;
export default Ractive$pop;
