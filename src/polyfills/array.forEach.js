if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (callback, thisArg) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.forEach called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;

		for (let index = 0; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			callback.call(thisArg, array[index], index, array);
		}

		return undefined;
	};
}
