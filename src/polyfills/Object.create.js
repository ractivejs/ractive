import './Object.defineProperties';

if (!Object.create) {
	const EmptyConstructor = function () { };

	Object.create = function (prototype = {}, properties = {}) {
		if (prototype !== Object(prototype) && prototype !== null)
			throw TypeError('Object prototype may only be an Object or null');

		EmptyConstructor.prototype = prototype;
		const result = new EmptyConstructor();
		Object.defineProperties(result, properties);
		result.__proto__ = prototype;

		return result;
	};
}
