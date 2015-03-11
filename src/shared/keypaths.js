import { isArray, isNumeric } from 'utils/is';
import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';

let refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
let patternPattern = /\*/;
let keypathCache = {};

let Keypath = function ( str ) {
	var keys = str.split( '.' );

	this.str = str;

	if ( str[0] === '@' ) {
		this.isSpecial = true;
		this.value = decodeKeypath( str );
	}

	this.firstKey = keys[0];
	this.lastKey = keys.pop();

	this.isPattern = patternPattern.test( str );

	this.parent = str === '' ? null : getKeypath( keys.join( '.' ) );
	this.isRoot = !str;
};

Keypath.prototype = {
	equalsOrStartsWith ( keypath ) {
		return keypath === this || this.startsWith( keypath );
	},

	join ( str ) {
		return getKeypath( this.isRoot ? String( str ) : this.str + '.' + str );
	},

	replace ( oldKeypath, newKeypath ) {
		if ( this === oldKeypath ) {
			return newKeypath;
		}

		if ( this.startsWith( oldKeypath ) ) {
			return newKeypath === null ? newKeypath : getKeypath( this.str.replace( oldKeypath.str + '.', newKeypath.str + '.' ) );
		}
	},

	startsWith ( keypath ) {
		if ( !keypath ) {
			// TODO under what circumstances does this happen?
			return false;
		}

		return keypath && this.str.substr( 0, keypath.str.length + 1 ) === keypath.str + '.';
	},

	toString () {
		throw new Error( 'Bad coercion' );
	},

	valueOf () {
		throw new Error( 'Bad coercion' );
	},

	wildcardMatches () {
		return this._wildcardMatches || ( this._wildcardMatches = getPotentialWildcardMatches( this.str ) );
	}
};

export function assignNewKeypath ( target, property, oldKeypath, newKeypath ) {
	var existingKeypath = target[ property ];

	if ( existingKeypath && ( existingKeypath.equalsOrStartsWith( newKeypath ) || !existingKeypath.equalsOrStartsWith( oldKeypath ) ) ) {
		return;
	}

	target[ property ] = existingKeypath ? existingKeypath.replace( oldKeypath, newKeypath ) : newKeypath;
	return true;
}

export function decodeKeypath ( keypath ) {
	var value = keypath.slice( 2 );

	if ( keypath[1] === 'i' ) {
		return isNumeric( value ) ? +value : value;
	} else {
		return value;
	}
}

export function getKeypath ( str ) {
	if ( str == null ) {
		return str;
	}

	// TODO it *may* be worth having two versions of this function - one where
	// keypathCache inherits from null, and one for IE8. Depends on how
	// much of an overhead hasOwnProperty is - probably negligible
	if ( !keypathCache.hasOwnProperty( str ) ) {
		keypathCache[ str ] = new Keypath( str );
	}

	return keypathCache[ str ];
}

export function getMatchingKeypaths ( ractive, keypath ) {
	var keys, key, matchingKeypaths;

	keys = keypath.str.split( '.' );
	matchingKeypaths = [ rootKeypath ];

	while ( key = keys.shift() ) {
		if ( key === '*' ) {
			// expand to find all valid child keypaths
			matchingKeypaths = matchingKeypaths.reduce( expand, [] );
		}

		else {
			if ( matchingKeypaths[0] === rootKeypath ) { // first key
				matchingKeypaths[0] = getKeypath( key );
			} else {
				matchingKeypaths = matchingKeypaths.map( concatenate( key ) );
			}
		}
	}

	return matchingKeypaths;

	function expand ( matchingKeypaths, keypath ) {
		var wrapper, value, keys;

		if ( keypath.isRoot ) {
			keys = [].concat(
				Object.keys( ractive.viewmodel.data ),
				Object.keys( ractive.viewmodel.mappings ),
				Object.keys( ractive.viewmodel.computations )
			);
		} else {
			wrapper = ractive.viewmodel.wrapped[ keypath.str ];
			value = wrapper ? wrapper.get() : ractive.viewmodel.get( keypath );

			keys = value ? Object.keys( value ) : null;
		}

		if ( keys ) {
			keys.forEach( key => {
				if ( key !== '_ractive' || !isArray( value ) ) {
					matchingKeypaths.push( keypath.join( key ) );
				}
			});
		}

		return matchingKeypaths;
	}
}

function concatenate ( key ) {
	return function ( keypath ) {
		return keypath.join( key );
	};
}

export function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

export var rootKeypath = getKeypath( '' );
