import log from 'utils/log/log';
import { ensureArray } from 'utils/array';
import { findInViewHierarchy } from 'shared/registry';

var adaptConfigurator = {
	extend: ( Parent, proto, options ) => {
		proto.adapt = combine( proto.adapt, ensureArray( options.adapt ) );
	},

	init: ( Parent, ractive, options ) => {
		var protoAdapt, adapt;

		protoAdapt = ractive.adapt.map( lookup );
		adapt = ensureArray( options.adapt ).map( lookup );

		function lookup ( adaptor ) {
			if ( typeof adaptor === 'string' ) {
				adaptor = findInViewHierarchy( 'adaptors', ractive, adaptor );

				if ( !adaptor ) {
					log.critical({
						message: 'missingPlugin',
						args: {
							plugin: 'adaptor',
							name: adaptor
						}
					});
				}
			}

			return adaptor;
		}

		ractive.adapt = combine( protoAdapt, adapt );
	}
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