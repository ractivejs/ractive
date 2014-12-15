import { isArray, isNumeric } from 'utils/is';

var refPattern, keypathCache, Keypath;

refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

keypathCache = {};

var Keypath = function ( str ) {
	var keys = str.split( '.' );

	this.str = str;

	if ( str[0] === '@' ) {
		this.isSpecial = true;
		this.value = decodeKeypath( str );
	}

	this.firstKey = keys[0];
	this.lastKey = keys.pop();

	this.parent = str === '' ? null : getKeypath( keys.join( '.' ) );
	this.isRoot = !str;
};

Keypath.prototype.toString = function () {
	return this.str;
};

export function assignNewKeypath ( target, property, oldKeypath, newKeypath ) {
	var existingKeypath = target[ property ];

	if ( !existingKeypath || equalsOrStartsWith( existingKeypath, newKeypath ) || !equalsOrStartsWith( existingKeypath, oldKeypath ) ) {
		return;
	}

	target[ property ] = getNewKeypath( existingKeypath, oldKeypath, newKeypath );
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

export function equalsOrStartsWith ( target, keypath) {
	return target === keypath || startsWithKeypath(target, keypath);
}

export function getKey ( keypath ) {
	var index = keypath.indexOf( '.' );
	return ~index ? keypath.slice( 0, index ) : keypath;
}

export function getKeypath ( str ) {
	return keypathCache[ str ] || ( keypathCache[ str ] = new Keypath( str ) );
}

export function getMatchingKeypaths ( ractive, pattern ) {
	var keys, key, matchingKeypaths;

	keys = pattern.split( '.' );
	matchingKeypaths = [ '' ];

	while ( key = keys.shift() ) {
		if ( key === '*' ) {
			// expand to find all valid child keypaths
			matchingKeypaths = matchingKeypaths.reduce( expand, [] );
		}

		else {
			if ( matchingKeypaths[0] === '' ) { // first key
				matchingKeypaths[0] = key;
			} else {
				matchingKeypaths = matchingKeypaths.map( concatenate( key ) );
			}
		}
	}

	return matchingKeypaths;

	function expand ( matchingKeypaths, keypath ) {
		var value, key, childKeypath;

		value = ( ractive.viewmodel.wrapped[ keypath ] ? ractive.viewmodel.wrapped[ keypath ].get() : ractive.get( keypath ) );

		for ( key in value ) {
			if ( value.hasOwnProperty( key ) && ( key !== '_ractive' || !isArray( value ) ) ) { // for benefit of IE8
				childKeypath = keypath ? keypath + '.' + key : key;
				matchingKeypaths.push( childKeypath );
			}
		}

		return matchingKeypaths;
	}
}

function concatenate ( key ) {
	return function ( keypath ) {
		return keypath ? keypath + '.' + key : key;
	};
}

export function getNewKeypath( targetKeypath, oldKeypath, newKeypath ) {
	// exact match
	if ( targetKeypath === oldKeypath ) {
		return newKeypath !== undefined ? newKeypath : null;
	}

	// partial match based on leading keypath segments
	if ( startsWithKeypath( targetKeypath, oldKeypath ) ){
		return newKeypath === null ? newKeypath : targetKeypath.replace( oldKeypath + '.', newKeypath + '.' );
	}
}

export function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

export function startsWithKeypath( target, keypath) {
	return target && keypath && target.substr( 0, keypath.length + 1 ) === keypath + '.';
}
