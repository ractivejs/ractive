if (!Array.prototype.filter) {
	Array.prototype.filter = function (callback, thisArg) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.filter called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;
		const results = [];

		for (let index = 0; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			if (!callback.call(thisArg, array[index], index, array)) continue;
			results.push(array[index]);
		}

		return results;
	};
}
