import { isObject } from '../../utils/is';

const onceOptions = { init: false, once: true };

export default function observeOnce ( keypath, callback, options ) {
	if ( isObject( keypath ) || typeof keypath === 'function' ) {
		options = Object.assign( callback || {}, onceOptions );
		return this.observe( keypath, options );
	}

	options = Object.assign( options || {}, onceOptions );
	return this.observe( keypath, callback, options );
}
