if (!Array.prototype.find) {
	Object.defineProperty( Array.prototype, 'find', {
		value (callback, thisArg) {
			if (this === null || this === undefined)
				throw new TypeError('Array.prototype.find called on null or undefined');

			if (typeof callback !== 'function')
				throw new TypeError(`${callback} is not a function`);

			const array = Object(this);
			const arrayLength = array.length >>> 0;

			for (let index = 0; index < arrayLength; index++) {
				if (!Object.hasOwnProperty.call(array, index)) continue;
				if (!callback.call(thisArg, array[index], index, array)) continue;
				return array[index];
			}

			return undefined;
		},
		configurable: true,
		writable: true
	});
}
