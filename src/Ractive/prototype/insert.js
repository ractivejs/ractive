define([ 'utils/getElement' ], function ( getElement ) {

	'use strict';

	return function ( target, anchor ) {
		target = getElement( target );
		anchor = getElement( anchor ) || null;

		if ( !target ) {
			throw new Error( 'You must specify a valid target to insert into' );
		}

		target.insertBefore( this.detach(), anchor );
	};

});