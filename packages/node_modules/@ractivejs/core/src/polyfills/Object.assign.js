if (!Object.assign) {
	Object.assign = function (target, ...sources) {
		if (target == null)
			throw new TypeError('Cannot convert undefined or null to object');

		const to = Object(target);
		const sourcesLength = sources.length;

		for (let index = 0; index < sourcesLength; index++) {
			const nextSource = sources[index];
			for (const nextKey in nextSource) {
				if (!Object.prototype.hasOwnProperty.call(nextSource, nextKey)) continue;
				to[nextKey] = nextSource[nextKey];
			}
		}

		return to;
	};
}
