import { ensureArray } from '../../../utils/array';

export default {
	extend: ( Parent, proto, options ) => {
		proto.adapt = combine( proto.adapt, ensureArray( options.adapt ) );
	},

	init () {}
};

function combine ( a, b ) {
	const c = a.slice();
	let i = b.length;

	while ( i-- ) {
		if ( !~c.indexOf( b[i] ) ) {
			c.push( b[i] );
		}
	}

	return c;
}
