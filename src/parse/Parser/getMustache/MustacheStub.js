define([
	'config/types',
	'parse/Parser/getMustache/KeypathExpressionStub',
	'parse/Parser/getMustache/ExpressionStub'
], function (
	types,
	KeypathExpressionStub,
	ExpressionStub
) {

	'use strict';

	var MustacheStub = function ( token, parser ) {
		this.type = ( token.type === types.TRIPLE ? types.TRIPLE : token.mustacheType );

		if ( token.ref ) {
			this.ref = token.ref;
		}

		if ( token.keypathExpression ) {
			this.keypathExpr = new KeypathExpressionStub( token.keypathExpression );
		}

		if ( token.expression ) {
			this.expr = new ExpressionStub( token.expression );
		}

		parser.pos += 1;
	};

	MustacheStub.prototype = {
		toJSON: function () {
			var json;

			if ( this.json ) {
				return this.json;
			}

			json = {
				t: this.type
			};

			if ( this.ref ) {
				json.r = this.ref;
			}

			if ( this.keypathExpr ) {
				json.kx = this.keypathExpr.toJSON();
			}

			if ( this.expr ) {
				json.x = this.expr.toJSON();
			}

			this.json = json;
			return json;
		},

		toString: function () {
			// mustaches cannot be stringified
			return false;
		}
	};

	return MustacheStub;

});
