define([
	'global/runloop',
	'utils/createBranch',
	'utils/isArray',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	runloop,
	createBranch,
	isArray,
	clearCache,
	notifyDependants
) {

	'use strict';

	var magicAdaptor, MagicWrapper;

	try {
		Object.defineProperty({}, 'test', { value: 0 });
	} catch ( err ) {
		return false; // no magic in this browser
	}

	magicAdaptor = {
		filter: function ( object, keypath, ractive ) {
			var keys, key, parentKeypath, parentWrapper, parentValue;

			if ( !keypath ) {
				return false;
			}

			keys = keypath.split( '.' );
			key = keys.pop();
			parentKeypath = keys.join( '.' );

			// If the parent value is a wrapper, other than a magic wrapper,
			// we shouldn't wrap this property
			if ( ( parentWrapper = ractive._wrapped[ parentKeypath ] ) && !parentWrapper.magic ) {
				return false;
			}

			parentValue = ractive.get( parentKeypath );

			// if parentValue is an array that doesn't include this member,
			// we should return false otherwise lengths will get messed up
			if ( isArray( parentValue ) && /^[0-9]+$/.test( key ) ) {
				return false;
			}

			return ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) );
		},
		wrap: function ( ractive, property, keypath ) {
			return new MagicWrapper( ractive, property, keypath );
		}
	};

	MagicWrapper = function ( ractive, property, keypath ) {
		var wrapper = this, keys, objKeypath, descriptor, wrappers, oldGet, oldSet, get, set;

		this.magic = true;

		this.ractive = ractive;
		this.keypath = keypath;
		this.value = property;

		keys = keypath.split( '.' );

		this.prop = keys.pop();

		objKeypath = keys.join( '.' );
		this.obj = objKeypath ? ractive.get( objKeypath ) : ractive.data;

		descriptor = this.originalDescriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );

		// Has this property already been wrapped?
		if ( descriptor && descriptor.set && ( wrappers = descriptor.set._ractiveWrappers ) ) {

			// Yes. Register this wrapper to this property, if it hasn't been already
			if ( wrappers.indexOf( this ) === -1 ) {
				wrappers.push( this );
			}

			return; // already wrapped
		}


		// No, it hasn't been wrapped. Is this descriptor configurable?
		if ( descriptor && !descriptor.configurable ) {
			// Special case - array length
			if ( this.prop === 'length' ) {
				return;
			}

			throw new Error( 'Cannot use magic mode with property "' + this.prop + '" - object is not configurable' );
		}


		// Time to wrap this property
		if ( descriptor ) {
			oldGet = descriptor.get;
			oldSet = descriptor.set;
		}

		get = oldGet || function () {
			return wrapper.value; // whichever wrapper got there first!
		};

		set = function ( value ) {
			var wrappers, wrapper, len, i;

			if ( oldSet ) {
				oldSet( value );
			}

			if ( oldGet ) {
				value = oldGet();
			}

			wrappers = set._ractiveWrappers;
			len = wrappers.length;

			// First, reset all values...
			i = len;
			while ( i-- ) {
				wrappers[i].value = value;
			}

			// ...then notify dependants
			i = len;
			while ( i-- ) {
				wrapper = wrappers[i];

				if ( wrapper.updating ) {
					continue;
				}

				wrapper.updating = true;

				runloop.start( wrapper.ractive );
				wrapper.ractive._changes.push( wrapper.keypath );
				clearCache( wrapper.ractive, wrapper.keypath );
				notifyDependants( wrapper.ractive, wrapper.keypath );
				runloop.end();

				wrapper.updating = false;
			}
		};

		// Create an array of wrappers, in case other keypaths/ractives depend on this property.
		// Handily, we can store them as a property of the set function. Yay JavaScript.
		set._ractiveWrappers = [ this ];

		Object.defineProperty( this.obj, this.prop, { get: get, set: set, enumerable: true, configurable: true });
	};

	MagicWrapper.prototype = {
		get: function () {
			return this.value;
		},
		reset: function ( value ) {
			if ( this.updating ) {
				return;
			}

			this.updating = true;
			this.obj[ this.prop ] = value; // trigger set() accessor
			clearCache( this.ractive, this.keypath );
			this.updating = false;
		},
		set: function ( key, value ) {
			if ( this.updating ) {
				return;
			}

			if ( !this.obj[ this.prop ] ) {
				this.updating = true;
				this.obj[ this.prop ] = createBranch( key );
				this.updating = false;
			}

			this.obj[ this.prop ][ key ] = value;
		},
		teardown: function () {
			var descriptor, set, value, wrappers, index;

			// If this method was called because the cache was being cleared as a
			// result of a set()/update() call made by this wrapper, we return false
			// so that it doesn't get torn down
			if ( this.updating ) {
				return false;
			}

			descriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );
			set = descriptor && descriptor.set;

			if ( !set ) {
				// most likely, this was an array member that was spliced out
				return;
			}

			wrappers = set._ractiveWrappers;

			index = wrappers.indexOf( this );
			if ( index !== -1 ) {
				wrappers.splice( index, 1 );
			}

			// Last one out, turn off the lights
			if ( !wrappers.length ) {
				value = this.obj[ this.prop ];

				Object.defineProperty( this.obj, this.prop, this.originalDescriptor || {
					writable: true,
					enumerable: true,
					configurable: true
				});

				this.obj[ this.prop ] = value;
			}
		}
	};

	return magicAdaptor;

});
