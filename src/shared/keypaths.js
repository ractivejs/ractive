import { isArray, isNumeric } from 'utils/is';
import { addToArray, removeFromArray } from 'utils/array';
import { isEqual } from 'utils/is';
import createBranch from 'utils/createBranch';
import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';

// move this...
import Computation from 'viewmodel/Computation/Computation';


var FAILED_LOOKUP = {};

var refPattern, keypathCache, Keypath;

refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

keypathCache = {};

Keypath = function ( str, owner ) {
	var parent, keys = str.split( '.' ), isSpecial = str[0] === '@';

	this.str = str;
	this.firstKey = keys[0];
	this.lastKey = keys.pop();


	this.isSpecial = isSpecial;
	this._value = isSpecial ? decodeKeypath( str ) : void 0;
	this.hasCachedValue = isSpecial;
	this.wrapper = null;
	this.computation = null;

	this.children = null;

	this.parent = parent = str === '' ? null : owner.getKeypath( keys.join( '.' ) );
	if ( parent ) {
		owner = parent.owner;
		parent.addChild( this );
	}

	this.owner = owner;
	this.ownerName = owner.ractive.component ? owner.ractive.component.name : 'Ractive';

	this.isRoot = !str;
};

Keypath.prototype = {

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
			this.wrapper = this.owner.adapt( this, value );
		}

		// Cache raw value
		this.hasCachedValue = true;
		this._value = value;
	},

	hasChild ( propertyOrIndex ) {
		return hasChildFor( this.get(), propertyOrIndex );
	},

	getChildValue ( propertyOrIndex ) {
		var value = this.get();

		if ( !hasChildFor( value, propertyOrIndex ) ) {
			return FAILED_LOOKUP;
		}
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

	register ( dependent ) {
		var type = dependent instanceof Computation ? 'computed' : void 0;
		this.owner.register( this, dependent, type );
	},

	unregister ( dependent ) {
		var type = dependent instanceof Computation ? 'computed' : void 0;
		this.owner.unregister( this, dependent, type );
	},

	mark ( options ) {

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
	},

	/* string manipulation: */

	equalsOrStartsWith ( keypath ) {
		return ( keypath && ( keypath.str === this.str ) ) || this.startsWith( keypath );
	},

	join ( str ) {
		if ( this.isRoot ) {
			str = String( str );
			if( str[0] === '.' ) {
				// remove prepended with "." or "./"
				str = str.replace( /^\.\/?/, '' );
			}
		}
		else {
			if ( str[0] === '.' ) {
				// normalize prepended with "./"
				str = this.str + str.replace( /^\.\//, '.' );
			} else {
				str = this.str + '.' + str;
			}
		}
		return this.owner.getKeypath( str );
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

function hasChildFor ( value, key ) {
	if ( value == null ) {
		return false;
	}
	if ( ( typeof value === 'object' || typeof value === 'function' ) && !( key in value ) ) {
		return false;
	}
	return true;
}


var KeypathAlias = function( str, owner ){
	var keys = str.split( '.' );

	this.str = str;
	this.firstKey = keys[0];
	this.lastKey = keys.pop();

	this.deps = null;
	this.realKeypath = null;

	this.owner = owner;
	this.ownerName = owner.ractive.component ? owner.ractive.component.name : 'Ractive';

}

KeypathAlias.prototype = {

	addChild ( child ) {
		if ( ! this.realKeypath ) {
			throw new Error('addChild');
		}
		this.realKeypath.addChild( child );
	},

	setComputation ( computation ) {
		throw new Error('setComputation');
	},

	assign ( keypath ) {
		var deps;
		this.realKeypath = keypath;
		if ( deps = this.deps ) {
			for ( var i = 0, len = deps.length; i < len; i++ ) {
				keypath.register( deps[i] );
			}
			this.deps = null;

			// make sure these dependents get notified
			keypath.mark();
		}
	},

	// odd-ball, see how used and if should move to viewmodel/instance based on usage.
	isRooted () {
		this.owner.hasKeypath( this.firstKey );
	},

	clearCachedValue ( keepExistingWrapper ) {
		if ( this.realKeypath ) {
			this.realKeypath.clearCachedValue( keepExistingWrapper );
		}
	},

	get ( options ) {
		// TODO: wrapping at actual key level vs alias?
		// because adaptor may be defined there
		// but maybe adaptors should be global???

		if ( this.realKeypath ) {
			return this.realKeypath.get( options );
		}
	},

	hasChild ( propertyOrIndex ) {
		if ( ! this.realKeypath ) {
			return false;
		}
		return this.realKeypath.hasChild( propertyOrIndex );
	},

	getChildValue ( propertyOrIndex ) {
		throw new Error('getChildValue');
		if ( this.realKeypath ) {
			return this.realKeypath.getChildValue( propertyOrIndex );
		}
	},

	set ( value, options ) {
		// TODO force resolution?
		if ( this.realKeypath ) {
			return this.realKeypath.set( value, options );
		}
	},

	setChildValue ( propertyOrIndex, childValue ) {
		throw new Error('setChildValue');
	},

	register ( dependent ) {
		if ( this.realKeypath ) {
			this.realKeypath.register( dependent );
		} else {
			!this.deps ? this.deps = [ dependent ] : addToArray( this.deps, dependent );
		}
	},

	unregister ( dependent ) {
		if ( this.realKeypath ) {
			this.realKeypath.unregister( dependent );
		} else if ( this.deps ) {
			removeFromArray( this.deps, dependent );
		}
	},

	mark ( options ) {
		if ( !this.realKeypath ) {
			throw new Error('mark');
		}
		this.realKeypath( options );
	},

	/* string manipulation: */

	/*
	equalsOrStartsWith ( keypath ) {
		return ( keypath && ( keypath.str === this.str ) ) || this.startsWith( keypath );
	},

	join ( str ) {
		if ( this.isRoot ) {
			str = String( str );
			if( str[0] === '.' ) {
				// remove prepended with "." or "./"
				str = str.replace( /^\.\/?/, '' );
			}
		}
		else {
			if ( str[0] === '.' ) {
				// normalize prepended with "./"
				str = this.str + str.replace( /^\.\//, '.' );
			} else {
				str = this.str + '.' + str;
			}
		}
		return this.owner.getKeypath( str );
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
	*/
}



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

