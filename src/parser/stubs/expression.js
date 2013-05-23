(function ( stubs ) {

	var ExpressionStub, getRefs, stringify;

	stubs.expression = function ( token ) {
		return new ExpressionStub( token );
	};

	ExpressionStub = function ( token ) {
		this.refs = [];

		getRefs( token, this.refs );

		this.str = stringify( token, this.refs );

	};

	ExpressionStub.prototype = {
		toJson: function () {
			return {
				r: this.refs,
				s: this.str
			};
		}
	};



	getRefs = function ( exprToken, refs ) {
		var i;

		if ( exprToken.type === REFERENCE ) {
			if ( refs.indexOf( exprToken.name ) === -1 ) {
				refs[ refs.length ] = exprToken.name;
			}
		}

		if ( exprToken.expressions ) {
			i = exprToken.expressions.length;
			while ( i-- ) {
				getRefs( exprToken.expressions[i], refs );
			}
		}

		if ( exprToken.expression ) {
			getRefs( exprToken.expression, refs );
		}

		if ( exprToken.parameters ) {
			i = exprToken.parameters.length;
			while ( i-- ) {
				getRefs( exprToken.parameters[i], refs );
			}
		}

		if ( exprToken.refinement ) {
			getRefs( exprToken.refinement, refs );
		}
	};


	stringify = function ( exprToken, refs ) {
		var map = function ( item ) {
			return stringify( item, refs );
		};

		switch ( exprToken.type ) {
			case BOOLEAN_LITERAL:
			case GLOBAL:
			case NUMBER_LITERAL:
			return exprToken.value;

			case STRING_LITERAL:
			return '"' + exprToken.value.replace( /"/g, '\\"' ) + '"';

			case ARRAY_LITERAL:
			return '[' + exprToken.expressions.map( map ).join( ',' ) + ']';

			case PREFIX:
			return exprToken.symbol + stringify( exprToken.expression, refs );

			case INVOCATION:
			return stringify( exprToken.expression, refs ) + '(' + ( exprToken.parameters ? exprToken.parameters.map( map ).join( ',' ) : '' ) + ')';

			case BRACKETED:
			return '(' + stringify( exprToken.expression, refs ) + ')';

			case MEMBER:
			return stringify( exprToken.expression, refs ) + stringify( exprToken.refinement, refs );

			case REFINEMENT:
			return ( exprToken.name ? '.' + exprToken.name : '[' + stringify( exprToken.expression, refs ) + ']' );

			case CONDITIONAL:
			return stringify( exprToken.expressions[0], refs ) + '?' + stringify( exprToken.expressions[1], refs ) + ':' + stringify( exprToken.expressions[2], refs );

			case REFERENCE:
			return '❖' + refs.indexOf( exprToken.name );

			default:
			return stringify( exprToken.expressions[0], refs ) + exprToken.symbol + stringify( exprToken.expressions[1], refs );
		}
	};

}( stubs ));