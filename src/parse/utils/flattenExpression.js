import { REFERENCE, BOOLEAN_LITERAL, GLOBAL, NUMBER_LITERAL, STRING_LITERAL, ARRAY_LITERAL, OBJECT_LITERAL, KEY_VALUE_PAIR, PREFIX_OPERATOR, INFIX_OPERATOR, INVOCATION, BRACKETED, MEMBER, REFINEMENT, CONDITIONAL } from 'config/types';
import { isObject } from 'utils/is';

export default function flattenExpression ( expression ) {
	var refs = [], flattened;

	extractRefs( expression, refs );

	flattened = {
		r: refs,
		s: stringify( expression )
	};

	function stringify ( node ) {
		switch ( node.t ) {
			case BOOLEAN_LITERAL:
			case GLOBAL:
			case NUMBER_LITERAL:
			return node.v;

			case STRING_LITERAL:
			return JSON.stringify( String( node.v ) );

			case ARRAY_LITERAL:
			return '[' + ( node.m ? node.m.map( stringify ).join( ',' ) : '' ) + ']';

			case OBJECT_LITERAL:
			return '{' + ( node.m ? node.m.map( stringify ).join( ',' ) : '' ) + '}';

			case KEY_VALUE_PAIR:
			return node.k + ':' + stringify( node.v );

			case PREFIX_OPERATOR:
			return ( node.s === 'typeof' ? 'typeof ' : node.s ) + stringify( node.o );

			case INFIX_OPERATOR:
			return stringify( node.o[0] ) + ( node.s.substr( 0, 2 ) === 'in' ? ' ' + node.s + ' ' : node.s ) + stringify( node.o[1] );

			case INVOCATION:
			return stringify( node.x ) + '(' + ( node.o ? node.o.map( stringify ).join( ',' ) : '' ) + ')';

			case BRACKETED:
			return '(' + stringify( node.x ) + ')';

			case MEMBER:
			return stringify( node.x ) + stringify( node.r );

			case REFINEMENT:
			return ( node.n ? '.' + node.n : '[' + stringify( node.x ) + ']' );

			case CONDITIONAL:
			return stringify( node.o[0] ) + '?' + stringify( node.o[1] ) + ':' + stringify( node.o[2] );

			case REFERENCE:
			return '_' + refs.indexOf( node.n );

			default:
			throw new Error( 'Expected legal JavaScript' );
		}
	}

	return flattened;
}

// TODO maybe refactor this?
function extractRefs ( node, refs ) {
	var i, list;

	if ( node.t === REFERENCE ) {
		if ( refs.indexOf( node.n ) === -1 ) {
			refs.unshift( node.n );
		}
	}

	list = node.o || node.m;
	if ( list ) {
		if ( isObject( list ) ) {
			extractRefs( list, refs );
		} else {
			i = list.length;
			while ( i-- ) {
				extractRefs( list[i], refs );
			}
		}
	}

	if ( node.x ) {
		extractRefs( node.x, refs );
	}

	if ( node.r ) {
		extractRefs( node.r, refs );
	}

	if ( node.v ) {
		extractRefs( node.v, refs );
	}
}

