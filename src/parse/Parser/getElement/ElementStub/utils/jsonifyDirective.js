define([ 'parse/Parser/StringStub/_index' ], function ( StringStub ) {
	
	'use strict';

	return function ( directive ) {
		var result, name;

		if ( typeof directive.name === 'string' ) {
			if ( !directive.args && !directive.dynamicArgs ) {
				return directive.name;
			}

			name = directive.name;
		} else {
			name = new StringStub( directive.name ).toJSON();
		}

		result = { n: name };

		if ( directive.args ) {
			result.a = directive.args;
			return result;
		}

		if ( directive.dynamicArgs ) {
			result.d = new StringStub( directive.dynamicArgs ).toJSON();
		}

		return result;
	};

});