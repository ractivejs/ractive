define([
	'parse/Parser/getStringFragment/_getStringFragment'
], function (
	getStringFragment
) {

	'use strict';

	return function ( directive ) {
		var result, name;

		if ( typeof directive.name === 'string' ) {
			if ( !directive.args && !directive.dynamicArgs ) {
				return directive.name;
			}

			name = directive.name;
		} else {
			name = getStringFragment( directive.name );
		}

		result = { n: name };

		if ( directive.args ) {
			result.a = directive.args;
			return result;
		}

		if ( directive.dynamicArgs ) {
			result.d = getStringFragment( directive.dynamicArgs );
		}

		return result;
	};

});
