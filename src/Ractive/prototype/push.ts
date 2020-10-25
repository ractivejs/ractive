import type { ArrayPushPromise } from 'types/Generic';

import makeArrayMethod from './shared/makeArrayMethod';

type RactivePush = (keypath: string, ...values: any[]) => ArrayPushPromise;

const Ractive$push: RactivePush = makeArrayMethod('push').path;
export default Ractive$push;
