define( function () {

	'use strict';

	return function ( keypath, callback ) {
		var value;

		if ( typeof keypath !== 'string' ) {
			if ( this.debug ) {
				throw new Error( 'Bad arguments' );
			}
			return;
		}

		value = this.get( keypath );
		return this.set( keypath, !value, callback );
	};

});
