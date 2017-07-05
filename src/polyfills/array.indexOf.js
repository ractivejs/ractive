if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement, fromIndex) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.indexOf called on null or undefined');

		const array = Object(this);
		const arrayLength = array.length >>> 0;
		const fromIndexInt = fromIndex >>> 0;
		const fromIndexAdjusted = Math.max(fromIndexInt >= 0 ? fromIndexInt : arrayLength - Math.abs(fromIndexInt), 0);

		for (let index = fromIndexAdjusted; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			if (array[index] !== searchElement) continue;
			return index;
		}

		return -1;
	};
}
