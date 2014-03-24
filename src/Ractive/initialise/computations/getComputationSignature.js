define( function () {

	'use strict';

	var pattern = /\$\{([^\}]+)\}/g;

	return function ( signature ) {
		if ( typeof signature === 'function' ) {
			return { get: signature };
		}

		if ( typeof signature === 'string' ) {
			return {
				get: createFunctionFromString( signature )
			};
		}

		if ( typeof signature === 'object' && typeof signature.get === 'string' ) {
			signature = {
				get: createFunctionFromString( signature.get ),
				set: signature.set
			};
		}

		return signature;
	};

	function createFunctionFromString ( signature ) {
		var functionBody = 'var __ractive=this;return(' + signature.replace( pattern, function ( match, keypath ) {
			return '__ractive.get("' + keypath + '")';
		}) + ')';

		return new Function ( functionBody );
	}

});
