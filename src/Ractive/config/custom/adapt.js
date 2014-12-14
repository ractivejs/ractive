import log from 'utils/log/log';
import { magic } from 'config/environment';
import { ensureArray } from 'utils/array';
import { findInViewHierarchy } from 'shared/registry';
// TODO move these
import arrayAdaptor from 'viewmodel/prototype/get/arrayAdaptor';
import magicAdaptor from 'viewmodel/prototype/get/magicAdaptor';
import magicArrayAdaptor from 'viewmodel/prototype/get/magicArrayAdaptor';

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

		if ( ractive.magic ) {
			if ( !magic ) {
				throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
			}

			if ( ractive.modifyArrays ) {
				ractive.adapt.push( magicArrayAdaptor );
			}

			ractive.adapt.push( magicAdaptor );
		}

		if ( ractive.modifyArrays ) {
			ractive.adapt.push( arrayAdaptor );
		}
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