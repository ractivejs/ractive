define([ 'utils/isEqual' ], function ( isEqual ) {

	'use strict';

	return function () {
		var wrapped, value;

		value = this.root.get( this.keypath );

		// if we're getting a wrapped value, e.g. a promise, we want to
		// get the adapted value, not the original. We need to do
		// ractive.get() first, in case the object gets wrapped
		// as a result of that operation
		if ( wrapped = this.root._wrapped[ this.keypath ] ) {
			value = wrapped.get();
		}

		if ( !isEqual( value, this.value ) ) {
			this.render( value );
			this.value = value;
		}
	};

});
