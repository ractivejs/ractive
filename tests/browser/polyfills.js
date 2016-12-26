import { isArray } from '../../src/utils/is';

// IE8... don't ask
Array.isArray || ( Array.isArray = thing => isArray( thing ) );

// IE only implements this for Element
Node.prototype.contains || ( Node.prototype.contains = function ( node ) {
	if ( !node ) {
		throw new TypeError('node required');
	}

	do {
		if (this === node) {
			return true;
		}
	} while ( node = node && node.parentNode );

	return false;
} );

export default () => {};
