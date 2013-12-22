define([ 'utils/isEqual' ], function ( isEqual ) {

	'use strict';

	return function () {
		var wrapped, value;

		// if we're getting a wrapped object, e.g. a promise, we want to
		// get the adapted value, not the original
		if ( wrapped = this.root._wrapped[ this.keypath ] ) {
			value = wrapped.get();
		} else {
			value = this.root.get( this.keypath );
		}

		if ( !isEqual( value, this.value ) ) {
			this.render( value );
			this.value = value;
		}
	};

});