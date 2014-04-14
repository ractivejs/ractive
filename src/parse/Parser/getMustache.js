define([
	'config/types',
	'parse/Parser/shared/KeypathExpressionStub',
	'parse/Parser/shared/ExpressionStub'
], function (
	types,
	KeypathExpressionStub,
	ExpressionStub
) {

	'use strict';

	return function ( token ) {
		var stub;

		if ( token.type === types.MUSTACHE || token.type === types.TRIPLE ) {
			if ( token.mustacheType === types.SECTION || token.mustacheType === types.INVERTED ) {
				return null;
			}

			this.pos += 1;

			stub = {
				t: ( token.type === types.TRIPLE ? token.type : token.mustacheType )
			};

			if ( token.ref ) {
				stub.r = token.ref;
			}

			if ( token.keypathExpression ) {
				stub.kx = new KeypathExpressionStub( token.keypathExpression ).toJSON();
			}

			if ( token.expression ) {
				stub.x = new ExpressionStub( token.expression ).toJSON();
			}

			// TEMP
			Object.defineProperty( stub, 'toString', {
				value: function () { return false; }
			});

			return stub;
		}
	};

});
