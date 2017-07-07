if (!Array.prototype.map) {
	Array.prototype.map = function (callback, thisArg) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.map called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;
		const results = [];

		for (let index = 0; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			results[index] = callback.call(thisArg, array[index], index, array);
		}

		return results;
	};
}
