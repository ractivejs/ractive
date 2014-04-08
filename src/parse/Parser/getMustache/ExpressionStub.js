define([
	'config/types',
	'utils/isObject'
], function (
	types,
	isObject
) {

	'use strict';

	var ExpressionStub = function ( token ) {
		this.refs = [];

		getRefs( token, this.refs );
		this.str = stringify( token, this.refs );
	};

	ExpressionStub.prototype = {
		toJSON: function () {
			if ( !this.json ) {
				this.json = {
					r: this.refs,
					s: this.str
				};
			}

			return this.json;
		}
	};

	return ExpressionStub;


	function quoteStringLiteral ( str ) {
		return JSON.stringify( String( str ) );
	}

	// TODO maybe refactor this?
	function getRefs ( token, refs ) {
		var i, list;

		if ( token.t === types.REFERENCE ) {
			if ( refs.indexOf( token.n ) === -1 ) {
				refs.unshift( token.n );
			}
		}

		list = token.o || token.m;
		if ( list ) {
			if ( isObject( list ) ) {
				getRefs( list, refs );
			} else {
				i = list.length;
				while ( i-- ) {
					getRefs( list[i], refs );
				}
			}
		}

		if ( token.x ) {
			getRefs( token.x, refs );
		}

		if ( token.r ) {
			getRefs( token.r, refs );
		}

		if ( token.v ) {
			getRefs( token.v, refs );
		}
	}

	function stringify ( token, refs ) {
		var map = function ( item ) {
			return stringify( item, refs );
		};

		switch ( token.t ) {
			case types.BOOLEAN_LITERAL:
			case types.GLOBAL:
			case types.NUMBER_LITERAL:
			return token.v;

			case types.STRING_LITERAL:
			return quoteStringLiteral(token.v);

			case types.ARRAY_LITERAL:
			return '[' + ( token.m ? token.m.map( map ).join( ',' ) : '' ) + ']';

			case types.OBJECT_LITERAL:
			return '{' + ( token.m ? token.m.map( map ).join( ',' ) : '' ) + '}';

			case types.KEY_VALUE_PAIR:
			return token.k + ':' + stringify( token.v, refs );

			case types.PREFIX_OPERATOR:
			return ( token.s === 'typeof' ? 'typeof ' : token.s ) + stringify( token.o, refs );

			case types.INFIX_OPERATOR:
			return stringify( token.o[0], refs ) + ( token.s.substr( 0, 2 ) === 'in' ? ' ' + token.s + ' ' : token.s ) + stringify( token.o[1], refs );

			case types.INVOCATION:
			return stringify( token.x, refs ) + '(' + ( token.o ? token.o.map( map ).join( ',' ) : '' ) + ')';

			case types.BRACKETED:
			return '(' + stringify( token.x, refs ) + ')';

			case types.MEMBER:
			return stringify( token.x, refs ) + stringify( token.r, refs );

			case types.REFINEMENT:
			return ( token.n ? '.' + token.n : '[' + stringify( token.x, refs ) + ']' );

			case types.CONDITIONAL:
			return stringify( token.o[0], refs ) + '?' + stringify( token.o[1], refs ) + ':' + stringify( token.o[2], refs );

			case types.REFERENCE:
			return '${' + refs.indexOf( token.n ) + '}';

			default:
			throw new Error( 'Could not stringify expression token. This error is unexpected' );
		}
	}

});
