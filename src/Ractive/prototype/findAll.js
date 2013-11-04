define([ 'utils/warn' ], function ( warn ) {

	'use strict';

	var tagSelector = /^[a-zA-Z][a-zA-Z0-9\-]*$/,
		classSelector = /^\.[^\s]+$/g;


	return function ( selector, live ) {
		var errorMessage;

		if ( !this.el ) {
			return [];
		}

		// If the selector is a tag name or a class name, we can (optionally)
		// return a live nodelist (querySelector returns a static list)
		if ( live ) {
			if ( tagSelector.test( selector ) ) {
				return this.el.getElementsByTagName( selector );
			}

			if ( classSelector.test( selector ) ) {
				return this.el.getElementsByClassName( selector.substring( 1 ) );
			}

			errorMessage = 'Could not generate live nodelist from "' + selector + '" selector';

			if ( this.debug ) {
				throw new Error( errorMessage );
			} else {
				warn( errorMessage );
			}
		}

		return this.el.querySelectorAll( selector );
	};

});