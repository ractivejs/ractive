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



	getRefs = function ( token, refs ) {
		var i;

		if ( token.t === REFERENCE ) {
			if ( refs.indexOf( token.n ) === -1 ) {
				refs[ refs.length ] = token.n;
			}
		}

		if ( token.o ) {
			i = token.o.length;
			while ( i-- ) {
				getRefs( token.o[i], refs );
			}
		}

		if ( token.x ) {
			getRefs( token.x, refs );
		}

		if ( token.r ) {
			getRefs( token.r, refs );
		}
	};


	stringify = function ( token, refs ) {
		var map = function ( item ) {
			return stringify( item, refs );
		};

		switch ( token.t ) {
			case BOOLEAN_LITERAL:
			case GLOBAL:
			case NUMBER_LITERAL:
			return token.v;

			case STRING_LITERAL:
			return '"' + token.v.replace( /"/g, '\\"' ) + '"';

			case ARRAY_LITERAL:
			return '[' + token.m.map( map ).join( ',' ) + ']';

			case PREFIX_OPERATOR:
			return token.s + stringify( token.x, refs );

			case INFIX_OPERATOR:
			return stringify( token.o[0], refs ) + token.s + stringify( token.o[1], refs );

			case INVOCATION:
			return stringify( token.x, refs ) + '(' + ( token.o ? token.o.map( map ).join( ',' ) : '' ) + ')';

			case BRACKETED:
			return '(' + stringify( token.x, refs ) + ')';

			case MEMBER:
			return stringify( token.x, refs ) + stringify( token.r, refs );

			case REFINEMENT:
			return ( token.n ? '.' + token.n : '[' + stringify( token.x, refs ) + ']' );

			case CONDITIONAL:
			return stringify( token.o[0], refs ) + '?' + stringify( token.o[1], refs ) + ':' + stringify( token.o[2], refs );

			case REFERENCE:
			return '❖' + refs.indexOf( token.n );

			default:
			throw new Error( 'Could not stringify expression token. This error is unexpected' );
		}
	};

}( stubs ));