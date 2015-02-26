import { isArray, isNumeric } from 'utils/is';
import { addToArray, removeFromArray } from 'utils/array';
import { isEqual } from 'utils/is';
import createBranch from 'utils/createBranch';
import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';

// move this...
import Computation from 'viewmodel/Computation/Computation';


var FAILED_LOOKUP = {};

var refPattern, modelCache, Keypath;

refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

modelCache = {};

Keypath = function ( str, owner, noParentAdd ) {
	var parent, keys = str.split( '.' ), isSpecial = str[0] === '@';

	this.str = str;
	this.firstKey = keys[0];
	this.lastKey = keys.pop();


	// TEMP
	this.isKeypath = true;


	this.isSpecial = isSpecial;
	this._value = isSpecial ? decodeKeypath( str ) : void 0;
	this.hasCachedValue = isSpecial;
	this.wrapper = null;
	this.computation = null;

	this.dependants = null;

	this.children = null;

	this.parent = parent = str === '' ? null : owner.getKeypath( keys.join( '.' ) );
	if ( parent ) {
		owner = parent.owner;

		if ( !noParentAdd ) { // hack - remove
			parent.addChild( this );
		}
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

	register ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			return; // TODO we should never get here if a dependant is static...
		}

		if ( !( type === 'default' || type === 'computed' ) ) {
			this.owner.register( this, dependant, type );
		}

		var dependants = this.dependants || ( this.dependants = {} ), group;

		if( group = dependants[ type ] ) {
			group.push( dependant );
		}
		else {
			dependants[ type ] = [ dependant ];
		}
	},

	unregister ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			return; // TODO we should never get here if a dependant is static...
		}

		if ( !( type === 'default' || type === 'computed' ) ) {
			this.owner.unregister( this, dependant, type );
		}

		var dependants = this.dependants, group;

		if( dependants && ( group = this.dependants[ type ] ) ) {
			removeFromArray( group, dependant );
		}
	},

	cascade ( noCascade ) {
		var computed, children, parent;

		this._cascaded = true;

		// confusing, because property is key. not keypath
		if ( this.dependants && ( computed = this.dependants.computed ) ) {
			computed.forEach( c => c.key.mark() );
		}

		if ( !noCascade && ( children = this.children ) ) {
			children.forEach( c => c.cascade() );
		}

		// previous code look to see if parent
		// already included in changes.
		// Simplied with inherant graph structure.
		// But is there more efficient way to roll-up
		// the graph changes?
		if ( ( parent = this.parent ) && !parent._cascaded ) {
			parent.cascade( true );
		}
	},

	notify ( type ) {
		var dependants, group, value, children;

		if( !( this._dirty || this._cascaded ) ) { return; }

		// TOTAL HACK. Don't like these "flags" even being used
		if ( type === 'default' ) {
			this._cascaded = false;
			// make this should be on .get()?
			// then maybe just use hasCachedValue?
			// duplicate concept?
			this._dirty = false;
		}

		if( ( dependants = this.dependants ) && ( group = dependants[ type ] ) ) {
			value = this.get();
			group.forEach( d => d.setValue( value ) );
		}

		if ( children = this.children ) {
			children.forEach( c => c.notify( type ) );
		}
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


var KeypathAlias = function( owner ){

	// TEMP
	this.isKeypath = true;

	this.str = null;

	this.unresolved = true;

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

	resolve ( keypath ) {
		var deps, dep;
		this.realKeypath = keypath;
		this.unresolved = false;

		if ( deps = this.deps ) {
			for ( var i = 0, len = deps.length; i < len; i++ ) {
				dep = deps[i];
				keypath.register( dep, dep._type );
			}
			this.deps = null;

			// make sure these dependants get notified
			keypath.mark();
		}
	},

	forceResolution ( str ) {
		var resolved = this.owner.getKeypath( str );
		if ( resolved === this ) {
			resolved = new Keypath( str, this.owner, true );
		}
		this.resolve( resolved );
		return this;
	},

	// odd-ball, see how used and if should move to viewmodel/instance based on usage.
	isRooted () {
		debugger;
		return false; //this.owner.hasKeypath( this.firstKey );
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

	register ( dependant, type ) {
		if ( this.realKeypath ) {
			this.realKeypath.register( dependant, type );
		} else {
			dependant._type = type;
			!this.deps ? this.deps = [ dependant ] : addToArray( this.deps, dependant );
		}
	},

	unregister ( dependant, type ) {
		if ( this.realKeypath ) {
			this.realKeypath.unregister( dependant, type );
		} else if ( this.deps ) {
			removeFromArray( this.deps, dependant );
		}
	},

	mark ( options ) {
		if ( !this.realKeypath ) {
			throw new Error('mark');
		}
		return this.realKeypath.mark( options );
	},

	/* string manipulation: */

	join ( options ) {
		if ( !this.realKeypath ) {
			throw new Error('join');
		}
		return this.realKeypath.join( options );
	},

	/*
	equalsOrStartsWith ( keypath ) {
		return ( keypath && ( keypath.str === this.str ) ) || this.startsWith( keypath );
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

