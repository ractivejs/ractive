import { fatal } from 'utils/log';
import { missingPlugin } from 'config/errors';
import { magic } from 'config/environment';
import { ensureArray } from 'utils/array';
import { findInViewHierarchy } from 'shared/registry';
import arrayAdaptor from 'Ractive/static/adaptors/array/index';
import magicAdaptor from 'Ractive/static/adaptors/magic';
import magicArrayAdaptor from 'Ractive/static/adaptors/magicArray';

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
					fatal( missingPlugin( adaptor, 'adaptor' ) );
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