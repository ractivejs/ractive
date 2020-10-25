import { isFunction, isUndefined } from 'utils/is';
import { hasOwn, defineProperty } from 'utils/object';

/* istanbul ignore if */
if (!Array.prototype.find) {
  defineProperty(Array.prototype, 'find', {
    value(callback, thisArg) {
      if (this === null || isUndefined(this))
        throw new TypeError('Array.prototype.find called on null or undefined');

      if (!isFunction(callback)) throw new TypeError(`${callback} is not a function`);

      const array = Object(this);
      const arrayLength = array.length >>> 0;

      for (let index = 0; index < arrayLength; index++) {
        if (!hasOwn(array, index)) continue;
        if (!callback.call(thisArg, array[index], index, array)) continue;
        return array[index];
      }

      return undefined;
    },
    configurable: true,
    writable: true
  });
}
