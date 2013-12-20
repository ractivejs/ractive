define( function () {

	'use strict';

	var magicAdaptor, MagicWrapper;

	try {
		Object.defineProperty({}, 'test', { value: 0 });
	} catch ( err ) {
		return false; // no magic in this browser
	}

	magicAdaptor = {
		wrap: function ( ractive, object, keypath ) {
			return new MagicWrapper( ractive, object, keypath );
		}
	};

	MagicWrapper = function ( ractive, object, keypath ) {
		var wrapper = this, keys, prop, objKeypath, descriptor, wrappers, oldGet, oldSet, get, set;

		this.ractive = ractive;
		this.keypath = keypath;

		keys = keypath.split( '.' );

		this.prop = keys.pop();

		objKeypath = keys.join( '.' );
		this.obj = ractive.get( objKeypath );

		descriptor = this.originalDescriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );

		// Has this property already been wrapped?
		if ( descriptor && descriptor.set && ( wrappers = descriptor.set._ractiveWrappers ) ) {

			// Yes. Register this wrapper to this property, if it hasn't been already
			if ( wrappers.indexOf( this ) === -1 ) {
				wrappers[ wrappers.length ] = this;
			}

			return; // already wrapped
		}


		// No, it hasn't been wrapped. Is this descriptor configurable?
		if ( descriptor && !descriptor.configurable ) {
			throw new Error( 'Cannot use magic mode with property "' + prop + '" - object is not configurable' );
		}


		// Time to wrap this property
		if ( descriptor ) {
			this.value = descriptor.value;

			oldGet = descriptor.get;
			oldSet = descriptor.set;
		}

		get = oldGet || function () {
			return wrapper.value; // whichever wrapper got there first!
		};

		set = function ( value ) {
			var wrappers, wrapper, i;

			if ( oldSet ) {
				oldSet( value );
			}

			wrappers = set._ractiveWrappers;

			i = wrappers.length;
			while ( i-- ) {
				wrapper = wrappers[i];

				if ( !wrapper.resetting ) {
					wrapper.ractive.set( wrapper.keypath, value );
				}
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
			this.resetting = true;
			this.value = value;
			this.obj[ this.prop ] = value;
			this.resetting = false;
		},
		teardown: function () {
			var descriptor, set, value, wrappers;

			descriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );
			set = descriptor.set;
			wrappers = set._ractiveWrappers;

			wrappers.splice( wrappers.indexOf( this ), 1 );

			// Last one out, turn off the lights
			if ( !wrappers.length ) {
				value = this.obj[ this.prop ];

				Object.defineProperty( this.obj, this.prop, this.originalDescriptor );
				this.obj[ this.prop ] = value;
			}
		}
	};

	return magicAdaptor;

});