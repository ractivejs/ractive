import { ensureArray } from 'utils/array';

var adaptConfigurator = {
	extend: ( Parent, proto, options ) => {
		proto.adapt = combine( proto.adapt, ensureArray( options.adapt ) );
	},

	init () {}
};

export default adaptConfigurator;

function combine ( a, b ) {
	var c = a.slice(), i = b.length;

	while ( i-- ) {
		if ( !~c.indexOf( b[i] ) ) {
			c.push( b[i] );
		}
	}

	return c;
}