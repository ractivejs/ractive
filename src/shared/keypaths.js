import { isArray, isNumeric } from 'utils/is';
import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';


var FAILED_LOOKUP = {};

var refPattern, keypathCache, Keypath;

refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

keypathCache = {};

Keypath = function ( str, viewmodel ) {
	var parent, keys = str.split( '.' ), isSpecial = str[0] === '@';

	this.str = str;
	this.firstKey = keys[0];
	this.lastKey = keys.pop();

	this.owner = viewmodel;

	this.isSpecial = isSpecial;
	this._value = isSpecial ? decodeKeypath( str ) : void 0;
	this.hasCachedValue = isSpecial;
	this.wrapper = null;
	this.computation = null;

	this.children = null;

	this.parent = parent = str === '' ? null : viewmodel.getKeypath( keys.join( '.' ) );
	if ( parent ) {
		parent.addChild( this );
	}

	this.isRoot = !str;
};

Keypath.prototype = {

	// currently onlt external caller of this method is set, which is comparing isEqual
	getValue () {
		return this._value;
	},

	addChild ( child ) {
		this.children ? this.children.push( child ) : this.children = [ child ];
	},

	setComputation ( computation ) {
		this.computation = computation;
	},

	isRooted () {
		this.owner.hasKeypath( this.firstKey );
	},

	clearCachedValue ( keepExistingWrapper ) {
		var wrapper, children;

		if ( this.isSpecial ) { return; }

		this.hasCachedValue = false;
		this._value = void 0;

		if ( !keepExistingWrapper ) {
			// Is there a wrapped property at this keypath?
			if ( wrapper = this.wrapper ) {
				// Did we unwrap it?
				if ( wrapper.teardown() !== false ) {
					this.wrapper = null;
				}
				else {
					// Could there be a GC ramification if this is a "real" ractive.teardown()?
					this.hasCachedValue = true;
					this._value = this.wrapper.value;
				}
			}
		}

		if ( this.computation ) {
			// This is slightly broader than just viewmodel.mark(),
			// but logicially if cache is being cleared, shouldn't comp be invalid?
			this.computation.invalidate();
		}

		if ( children = this.children ) {
			children.forEach( child => {
				if ( child.owner === this.owner ) {
					child.clearCachedValue();
				}
			});
		}
	},

	get ( options ) {

		var value, wrapper;

		if ( !this.hasCachedValue ) {
			this.cacheValue();
		}

		if ( ( !options || !options.noUnwrap ) && ( wrapper = this.wrapper ) ) {
			value = wrapper.get();
		} else {
			value = this.getValue();
		}

		return value === FAILED_LOOKUP ? void 0 : value;
	},

	cacheValue () {
		var computation, value;

		// Is this a computed property?
		if ( computation = this.computation ) {
			value = computation.get();
		}

		// Get the value from the parent, or data if it's the root. Can return FAILED_LOOKUP
		else {
			value = this.isRoot ? this.owner.data : this.parent.getChildValue( this.lastKey );
		}

		// Adapt if we have a valid value and store wrapper
		if ( typeof value !== 'undefined' && value !== FAILED_LOOKUP ) {
			// this has side-effect of setting wrapper.value = value
			this.wrapper = this.owner.adapt( this, value );
		}

		// Cache raw value
		this.hasCachedValue = true;
		return this._value = value;
	},

	getChildValue ( str ) {
		var value = this.get();

		if ( value == null || ( typeof value === 'object' && !( str in value ) ) ) {
			return FAILED_LOOKUP;
		}

		return value[ str ];
	},

	/* string manipulation: */

	equalsOrStartsWith ( keypath ) {
		return ( keypath && ( keypath.str === this.str ) ) || this.startsWith( keypath );
	},

	join ( str ) {
		return this.owner.getKeypath( this.isRoot ? String( str ) : this.str + '.' + str );
	},

	replace ( oldKeypath, newKeypath ) {
		// changed to ".str === .str" to transition to multiple keypathCaches
		if ( oldKeypath && ( this.str === oldKeypath.str ) ) {
			return newKeypath;
		}

		if ( this.startsWith( oldKeypath ) ) {
			return newKeypath === null ? newKeypath : newKeypath.owner.getKeypath( this.str.replace( oldKeypath.str + '.', newKeypath.str + '.' ) );
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

// var KeypathAlias = function( str, viewmodel ){
// 	Keypath.call(this, str, viewmodel );
// }

// KeypathAlias.prototype = create(Keypath.prototype);


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

export function getMatchingKeypaths ( ractive, pattern ) {
	var keys, key, matchingKeypaths;

	keys = pattern.split( '.' );
	matchingKeypaths = [ ractive.viewmodel.rootKeypath ];

	while ( key = keys.shift() ) {
		if ( key === '*' ) {
			// expand to find all valid child keypaths
			matchingKeypaths = matchingKeypaths.reduce( expand, [] );
		}

		else {
			if ( matchingKeypaths[0] === ractive.viewmodel.rootKeypath ) { // first key
				matchingKeypaths[0] = ractive.viewmodel.getKeypath( key );
			} else {
				matchingKeypaths = matchingKeypaths.map( concatenate( key ) );
			}
		}
	}

	return matchingKeypaths;

	function expand ( matchingKeypaths, keypath ) {
		var wrapper, value, key;

		wrapper = keypath.wrapper;
		value = wrapper ? wrapper.get() : ractive.viewmodel.get( keypath );

		for ( key in value ) {
			if ( value.hasOwnProperty( key ) && ( key !== '_ractive' || !isArray( value ) ) ) { // for benefit of IE8
				matchingKeypaths.push( keypath.join( key ) );
			}
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

export { Keypath };
export { KeypathAlias };

