define([
	'config/types',
	'utils/normaliseKeypath',
	'parse/Parser/utils/jsonifyStubs',
	'parse/Parser/shared/KeypathExpressionStub',
	'parse/Parser/shared/ExpressionStub'
], function (
	types,
	normaliseKeypath,
	jsonifyStubs,
	KeypathExpressionStub,
	ExpressionStub
) {

	'use strict';

	return function ( token ) {
		var stub, isSection, type, nextToken, fragment;

		if ( token.type === types.MUSTACHE || token.type === types.TRIPLE ) {
			if ( token.mustacheType === types.SECTION || token.mustacheType === types.INVERTED ) {
				isSection = true;
			}

			this.pos += 1;

			if ( token.type === types.TRIPLE ) {
				type = types.TRIPLE;
			} else if ( isSection ) {
				type = types.SECTION;
			} else {
				type = token.mustacheType;
			}

			stub = {
				t: type
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


			if ( isSection ) {
				if ( token.mustacheType === types.INVERTED ) {
					stub.n = true; // TODO change this to `1` - more compact
				}

				if ( token.indexRef ) {
					stub.i = token.indexRef;
				}

				fragment = [];

				nextToken = this.next();
				while ( nextToken ) {
					if ( nextToken.mustacheType === types.CLOSING ) {
						validateClosing(stub, nextToken);
						this.pos += 1;
						break;
					}

					fragment.push( this.getStub() );
					nextToken = this.next();
				}

				if ( fragment.length ) {
					stub.f = jsonifyStubs( fragment );

					if ( stub.f.length === 1 && typeof stub.f[0] === 'string' ) {
						stub.f = stub.f[0];
					}
				}
			}

			// TEMP
			Object.defineProperty( stub, 'toString', {
				value: function () { return false; }
			});

			return stub;
		}
	};

	function validateClosing(stub, token){
		var opening = stub.r,
			closing = normaliseKeypath( token.ref.trim() );

		if ( !opening || !closing ) { return; }

		if( stub.i ) { opening += ':' + stub.i; }

		if ( opening.substr( 0, closing.length) !== closing ) {

			throw new Error( 'Could not parse template: Illegal closing section {{/'
				+ closing + '}}. Expected {{/' + stub.r + '}} on line '+ token.getLinePos() );
		}
	}

});
