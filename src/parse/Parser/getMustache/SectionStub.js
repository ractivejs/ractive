define([
	'config/types',
	'utils/normaliseKeypath',
	'parse/Parser/utils/jsonifyStubs',
	'parse/Parser/getMustache/KeypathExpressionStub',
	'parse/Parser/getMustache/ExpressionStub'
], function (
	types,
	normaliseKeypath,
	jsonifyStubs,
	KeypathExpressionStub,
	ExpressionStub
) {

	'use strict';

	var SectionStub = function ( firstToken, parser ) {
		var next;

		this.ref = firstToken.ref;
		this.indexRef = firstToken.indexRef;

		this.inverted = ( firstToken.mustacheType === types.INVERTED );

		if ( firstToken.keypathExpression ) {
			this.keypathExpr = new KeypathExpressionStub( firstToken.keypathExpression );
		}

		if ( firstToken.expression ) {
			this.expr = new ExpressionStub( firstToken.expression );
		}

		parser.pos += 1;

		this.items = [];
		next = parser.next();

		while ( next ) {
			if ( next.mustacheType === types.CLOSING ) {
				if ( ( normaliseKeypath( next.ref.trim() ) === this.ref ) || this.expr ) {
					parser.pos += 1;
					break;
				}

				else {
					throw new Error( 'Could not parse template: Illegal closing section' );
				}
			}

			this.items.push( parser.getStub() );
			next = parser.next();
		}
	};

	SectionStub.prototype = {
		toJSON: function ( noStringify ) {
			var json;

			if ( this.json ) {
				return this.json;
			}

			json = { t: types.SECTION };

			if ( this.ref ) {
				json.r = this.ref;
			}

			if ( this.indexRef ) {
				json.i = this.indexRef;
			}

			if ( this.inverted ) {
				json.n = true;
			}

			if ( this.expr ) {
				json.x = this.expr.toJSON();
			}

			if ( this.items.length ) {
				json.f = jsonifyStubs( this.items, noStringify );
			}

			this.json = json;
			return json;
		},

		toString: function () {
			// sections cannot be stringified
			return false;
		}
	};

	return SectionStub;

});
