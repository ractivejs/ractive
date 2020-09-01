import { Keypath } from 'types/Generic';
import {
  ObserverArrayCallback,
  ObserverArrayOpts,
  ObserverCallback,
  ObserverHandle,
  ObserverOpts
} from 'types/Observer';
import { isFunction, isString, isObjectType } from 'utils/is';
import { assign } from 'utils/object';

import { Ractive } from '../Ractive';

import { ObserverCallbackMap } from './observe';

const onceOptions = { init: false, once: true };

function Ractive$observeOnce(
  keypath: string,
  callback: ObserverCallback,
  opts?: ObserverOpts
): ObserverHandle;
function Ractive$observeOnce(
  keypath: string,
  callback: ObserverArrayCallback,
  opts?: ObserverArrayOpts
): ObserverHandle;
function Ractive$observeOnce(map: ObserverCallbackMap, opts?: ObserverOpts): ObserverHandle;
function Ractive$observeOnce(
  map: { [key: string]: ObserverArrayCallback },
  opts?: ObserverArrayOpts
): ObserverHandle;
function Ractive$observeOnce(
  this: Ractive,
  keypath:
    | Keypath
    | ObserverCallback
    | ObserverArrayCallback
    | ObserverCallbackMap
    | ObserverCallbackMap<ObserverArrayCallback>,
  callback?: ObserverCallback | ObserverArrayCallback | ObserverOpts | ObserverArrayOpts,
  options?: ObserverOpts | ObserverArrayOpts
): ObserverHandle {
  if (isString(keypath) && isFunction(callback)) {
    options = assign(options || {}, onceOptions);
    return this.observe(keypath, callback, options);
  }

  // TSRChange - add if for avoid type errors - consider to add an error add the end of the function?
  if (isObjectType<ObserverCallbackMap>(keypath)) {
    options = assign(callback || {}, onceOptions);
    return this.observe(keypath, options);
  }
}

export default Ractive$observeOnce;
