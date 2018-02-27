import { isArray, isObject, isNumeric } from 'utils/is';
import interpolate from 'shared/interpolate';
import { hasOwn } from 'utils/object';

const interpolators = {
	number(from, to) {
		if (!isNumeric(from) || !isNumeric(to)) {
			return null;
		}

		from = +from;
		to = +to;

		const delta = to - from;

		if (!delta) {
			return function() {
				return from;
			};
		}

		return function(t) {
			return from + t * delta;
		};
	},

	array(from, to) {
		let len, i;

		if (!isArray(from) || !isArray(to)) {
			return null;
		}

		const intermediate = [];
		const interpolators = [];

		i = len = Math.min(from.length, to.length);
		while (i--) {
			interpolators[i] = interpolate(from[i], to[i]);
		}

		// surplus values - don't interpolate, but don't exclude them either
		for (i = len; i < from.length; i += 1) {
			intermediate[i] = from[i];
		}

		for (i = len; i < to.length; i += 1) {
			intermediate[i] = to[i];
		}

		return function(t) {
			let i = len;

			while (i--) {
				intermediate[i] = interpolators[i](t);
			}

			return intermediate;
		};
	},

	object(from, to) {
		if (!isObject(from) || !isObject(to)) {
			return null;
		}

		const properties = [];
		const intermediate = {};
		const interpolators = {};

		for (const prop in from) {
			if (hasOwn(from, prop)) {
				if (hasOwn(to, prop)) {
					properties.push(prop);
					interpolators[prop] =
						interpolate(from[prop], to[prop]) || (() => to[prop]);
				} else {
					intermediate[prop] = from[prop];
				}
			}
		}

		for (const prop in to) {
			if (hasOwn(to, prop) && !hasOwn(from, prop)) {
				intermediate[prop] = to[prop];
			}
		}

		const len = properties.length;

		return function(t) {
			let i = len;

			while (i--) {
				const prop = properties[i];

				intermediate[prop] = interpolators[prop](t);
			}

			return intermediate;
		};
	}
};

export default interpolators;
