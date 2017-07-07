if (!Array.prototype.reduce) {
	Array.prototype.reduce = function (callback, initialValue) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.map called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;
		const isInitialValuePresent = arguments.length === 2;

		let index = 0;
		let accumulator = undefined;

		if (isInitialValuePresent) {
			accumulator = initialValue;
		} else {
			let isViableInitialValueFromArray = false;

			for (; !isViableInitialValueFromArray && index < arrayLength; index++) {
				isViableInitialValueFromArray = Object.prototype.hasOwnProperty.call(array, index);
				if (isViableInitialValueFromArray) accumulator = array[index];
			}

			if (!isViableInitialValueFromArray)
				throw new TypeError('Reduce of empty array with no initial value');
		}

		for (; index < arrayLength; index++) {
			if (!Object.prototype.hasOwnProperty.call(array, index)) continue;
			accumulator = callback.call(undefined, accumulator, array[index], index, array);
		}

		return accumulator;
	};
}
