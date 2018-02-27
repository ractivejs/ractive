import { hasOwn } from 'utils/object';
import { isString, isObjectType } from 'utils/is';

const prefixers = {};

// TODO this is legacy. sooner we can replace the old adaptor API the better
/* istanbul ignore next */
function prefixKeypath(obj, prefix) {
	const prefixed = {};

	if (!prefix) {
		return obj;
	}

	prefix += '.';

	for (const key in obj) {
		if (hasOwn(obj, key)) {
			prefixed[prefix + key] = obj[key];
		}
	}

	return prefixed;
}

export default function getPrefixer(rootKeypath) {
	let rootDot;

	if (!prefixers[rootKeypath]) {
		rootDot = rootKeypath ? rootKeypath + '.' : '';

		/* istanbul ignore next */
		prefixers[rootKeypath] = function(relativeKeypath, value) {
			let obj;

			if (isString(relativeKeypath)) {
				obj = {};
				obj[rootDot + relativeKeypath] = value;
				return obj;
			}

			if (isObjectType(relativeKeypath)) {
				// 'relativeKeypath' is in fact a hash, not a keypath
				return rootDot
					? prefixKeypath(relativeKeypath, rootKeypath)
					: relativeKeypath;
			}
		};
	}

	return prefixers[rootKeypath];
}
