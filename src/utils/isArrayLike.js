/*global FileList */

import isArray from 'utils/isArray';

export default function isArrayLike ( obj ) {
	return isArray( obj ) ||
		obj instanceof FileList;
}
