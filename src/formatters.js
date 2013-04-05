// Default formatters
(function ( R ) {
	
	'use strict';

	R.formatters = {
		equals: function ( a, b ) {
			return a === b;
		},

		greaterThan: function ( a, b ) {
			return a > b;
		},

		greaterThanEquals: function ( a, b ) {
			return a >= b;
		},

		lessThan: function ( a, b ) {
			return a < b;
		},

		lessThanEquals: function ( a, b ) {
			return a <= b;
		}
	};

}( Ractive ));