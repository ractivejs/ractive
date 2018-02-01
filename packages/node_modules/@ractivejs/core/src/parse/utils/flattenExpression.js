import { REFERENCE, BOOLEAN_LITERAL, GLOBAL, NUMBER_LITERAL, REGEXP_LITERAL, STRING_LITERAL, ARRAY_LITERAL, OBJECT_LITERAL, KEY_VALUE_PAIR, PREFIX_OPERATOR, INFIX_OPERATOR, INVOCATION, BRACKETED, MEMBER, REFINEMENT, CONDITIONAL } from '../../config/types';
import { isObject } from '../../utils/is';

export default function flattenExpression ( expression ) {
	let refs;
	let count = 0;

	extractRefs( expression, refs = [] );
	const stringified = stringify( expression );

	return {
		r: refs,
		s: getVars(stringified)
	};

	function getVars(expr) {
		const vars = [];
		for ( let i = count - 1; i >= 0; i-- ) {
			vars.push( `x$${i}` );
		}
		return vars.length ? `(function(){var ${vars.join(',')};return(${expr});})()` : expr;
	}

	function stringify ( node ) {
		if ( typeof node === 'string' ) {
			return node;
		}

		switch ( node.t ) {
			case BOOLEAN_LITERAL:
			case GLOBAL:
			case NUMBER_LITERAL:
			case REGEXP_LITERAL:
				return node.v;

			case STRING_LITERAL:
				return JSON.stringify( String( node.v ) );

			case ARRAY_LITERAL:
				if ( node.m && hasSpread( node.m )) {
					return `[].concat(${ makeSpread( node.m, '[', ']', stringify ) })`;
				} else {
					return '[' + ( node.m ? node.m.map( stringify ).join( ',' ) : '' ) + ']';
				}

			case OBJECT_LITERAL:
				if ( node.m && hasSpread( node.m ) ) {
					return `Object.assign({},${ makeSpread( node.m, '{', '}', stringifyPair) })`;
				} else {
					return '{' + ( node.m ? node.m.map( n => `${ n.k }:${ stringify( n.v ) }` ).join( ',' ) : '' ) + '}';
				}

			case PREFIX_OPERATOR:
				return ( node.s === 'typeof' ? 'typeof ' : node.s ) + stringify( node.o );

			case INFIX_OPERATOR:
				return stringify( node.o[0] ) + ( node.s.substr( 0, 2 ) === 'in' ? ' ' + node.s + ' ' : node.s ) + stringify( node.o[1] );

			case INVOCATION:
				if ( node.o && hasSpread( node.o ) ) {
					const id = count++;
					return `(x$${ id }=${ stringify(node.x) }).apply(x$${ id },${ stringify({ t: ARRAY_LITERAL, m: node.o }) })`;
				} else {
					return stringify( node.x ) + '(' + ( node.o ? node.o.map( stringify ).join( ',' ) : '' ) + ')';
				}

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

	function stringifyPair ( node ) { return node.p ? stringify( node.k ) : `${ node.k }:${ stringify( node.v ) }`; }

	function makeSpread ( list, open, close, fn ) {
		const out = list.reduce( ( a, c ) => {
			if ( c.p ) {
				a.str += `${ a.open ? close + ',' : a.str.length ? ',' : '' }${ fn( c ) }`;
			} else {
				a.str += `${ !a.str.length ? open : !a.open ? ',' + open : ',' }${ fn( c ) }`;
			}
			a.open = !c.p;
			return a;
		}, { open: false, str: '' } );
		if ( out.open ) out.str += close;
		return out.str;
	}
}

function hasSpread ( list ) {
	for ( let i = 0; i < list.length; i++ ) {
		if ( list[i].p ) return true;
	}

	return false;
}

// TODO maybe refactor this?
function extractRefs ( node, refs ) {
	if ( node.t === REFERENCE && typeof node.n === 'string' ) {
		if ( !~refs.indexOf( node.n ) ) {
			refs.unshift( node.n );
		}
	}

	const list = node.o || node.m;
	if ( list ) {
		if ( isObject( list ) ) {
			extractRefs( list, refs );
		} else {
			let i = list.length;
			while ( i-- ) {
				extractRefs( list[i], refs );
			}
		}
	}

	if ( node.k && node.t === KEY_VALUE_PAIR && typeof node.k !== 'string' ) {
		extractRefs( node.k, refs );
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
