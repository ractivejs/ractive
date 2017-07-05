if (!Object.keys) {
	const hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
	const dontEnumProps = ['__proto__', 'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];
	const dontEnumPropsLength = dontEnumProps.length;

	Object.keys = function (obj) {
		if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null))
			throw new TypeError('Object.keys called on non-object');

		const result = [];

		for (const prop in obj) {
			if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue;
			result.push(prop);
		}

		if (hasDontEnumBug) {
			for (let index = 0; index < dontEnumPropsLength; index++) {
				if (!Object.prototype.hasOwnProperty.call(obj, dontEnumProps[index])) continue;
				result.push(dontEnumProps[index]);
			}
		}

		return result;
	};
}
