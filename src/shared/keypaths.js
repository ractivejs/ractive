import { isArray, isNumeric } from 'utils/is';
import { addToArray, removeFromArray } from 'utils/array';
import { isEqual } from 'utils/is';
import createBranch from 'utils/createBranch';
import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';


let refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
let patternPattern = /\*/;
let keypathCache = {};

let Keypath = function ( str ) {
	var keys = str.split( '.' );

// <<<<<<< HEAD
// 		if ( this.isSpecial ) { return; }

// 		this.hasCachedValue = false;
// 		this._value = void 0;

// 		if ( !keepExistingWrapper ) {
// 			// Is there a wrapped property at this keypath?
// 			if ( wrapper = this.wrapper ) {
// 				// Did we unwrap it?
// 				if ( wrapper.teardown() !== false ) {
// 					this.wrapper = null;
// 				}
// 				else {
// 					// Could there be a GC ramification if this is a "real" ractive.teardown()?
// 					this.hasCachedValue = true;
// 					this._value = this.wrapper.value;
// 				}
// 			}
// 		}
// =======
};

Keypath.prototype = {

	clearCachedValue ( keepExistingWrapper ) {
		var wrapper, children;

		this.isPattern = patternPattern.test( str );

		this.parent = str === '' ? null : getKeypath( keys.join( '.' ) );
		this.isRoot = !str;



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

		this.cacheValue();

		if ( ( !options || !options.noUnwrap ) && ( wrapper = this.wrapper ) ) {
			value = wrapper.get();
		} else {
			value = this._value;
		}

		return value === FAILED_LOOKUP ? void 0 : value;
	},

	cacheValue () {
		var computation, value;

		if ( this.hasCachedValue ) { return; }

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
			this.wrapper = this.owner.adapt( this.str, value );
		}

		// Cache raw value
		this.hasCachedValue = true;
		this._value = value;
	},

	getChildValue ( propertyOrIndex ) {
		var value = this.get();

		// if ( !hasChildFor( value, propertyOrIndex ) ) {
		// 	return FAILED_LOOKUP;
		// }
		return value[ propertyOrIndex ];
	},

	set ( value, options ) {
		var computation, wrapper, keepExistingWrapper;

		computation = this.computation;
		if ( computation ) {
			if ( computation.setting ) {
				// let the other computation set() handle things...
				return;
			}
			computation.set( value );
			value = computation.get();
		}

		if ( isEqual( this._value, value ) ) {
			return;
		}

		wrapper = this.wrapper;

		// If we have a wrapper with a `reset()` method, we try and use it. If the
		// `reset()` method returns false, the wrapper should be torn down, and
		// (most likely) a new one should be created later
		if ( wrapper && wrapper.reset ) {
			keepExistingWrapper = ( wrapper.reset( value ) !== false );

			if ( keepExistingWrapper ) {
				value = wrapper.get();
			}
		}

		if ( !computation && !keepExistingWrapper ) {
			this.parent.setChildValue( this.lastKey, value );
		}

		if ( !options || !options.silent ) {
			// Change notification happes
			this.mark();
		} else {
			// We're setting a parent of the original target keypath (i.e.
			// creating a fresh branch) - we need to clear the cache, but
			// not mark it as a change
			this.clearCachedValue();
		}
	},

	setChildValue ( propertyOrIndex, childValue ) {

		var wrapper, value;

		// this will ensure wrapper gets created prior to set
		this.cacheValue();

		// shortcut if wrapper.set available
		if( ( wrapper = this.wrapper ) && wrapper.set ) {
			wrapper.set( propertyOrIndex, childValue );
			return;
		}

		if ( !( value = this.get() ) ) {
			// set value as {} or []
			value = createBranch( propertyOrIndex );
			this.set( value, { silent: true } );
		}

		value[ propertyOrIndex ] = childValue;
	},

	mark ( options ) {

		this._dirty = true;

		/* not sure how to manage changes yet
		   maybe change listener is just another dependency? */

		// implicit changes (i.e. `foo.length` on `ractive.push('foo',42)`)
		// should not be picked up by pattern observers
		if ( options ) {
			if ( options.implicit ) {
				this.owner.implicitChanges[ this.str ] = true;
			}
			if ( options.noCascade ) {
				this.owner.noCascade[ this.str ] = true;
			}
		}

		if ( !~this.owner.changes.indexOf( this ) ) {
			this.owner.changes.push( this );
		}

		// pass on keepExistingWrapper, if we can
		let keepExistingWrapper = options ? options.keepExistingWrapper : false;

		this.clearCachedValue( keepExistingWrapper );


		/* probably directly use runloop */

		if ( this.owner.ready ) {
			this.owner.onchange();
		}
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

	keys = keypath.split( '.' );
	matchingKeypaths = [ '' ];


	while ( key = keys.shift() ) {
		if ( key === '*' ) {
			// expand to find all valid child keypaths
			matchingKeypaths = matchingKeypaths.reduce( expand, [] );
		}

		else {
			if ( matchingKeypaths[0] === ractive.viewmodel.root ) { // first key
				matchingKeypaths[0] = ractive.viewmodel.getModel( key );
			} else {
				matchingKeypaths = matchingKeypaths.map( concatenate( key ) );
			}
		}
	}

	return matchingKeypaths;

	function expand ( matchingKeypaths, keypath ) {

		var wrapper, value, keys;

		if ( keypath === '' ) {
			keys = [].concat(
				Object.keys( ractive.viewmodel.data ),
				Object.keys( ractive.viewmodel.mappings ),
				Object.keys( ractive.viewmodel.computations )
			);
		} else {
			value = ractive.viewmodel.getModel( keypath ).get();

			keys = value ? Object.keys( value ) : null;
		}

		if ( keys ) {
			keys.forEach( key => {
				if ( key !== '_ractive' || !isArray( value ) ) {
					matchingKeypaths.push( keypath ? keypath + '.' + key : key );
				}
			});
		}

		return matchingKeypaths;
	}
}

function concatenate ( key ) {
	return keypath => keypath ? keypath + '.' + key : key;
}

export function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

