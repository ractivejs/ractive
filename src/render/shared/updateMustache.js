define([ 'utils/isEqual' ], function ( isEqual ) {

	'use strict';

	return function () {
		var value = this.root.get( this.keypath, true );

		if ( !isEqual( value, this.value ) ) {
			this.render( value );
			this.value = value;
		}
	};
	
});