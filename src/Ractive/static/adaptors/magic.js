import runloop from 'global/runloop';
import createBranch from 'utils/createBranch';
import { getKeypath } from 'shared/keypaths';
import { isArray } from 'utils/is';

var magicAdaptor, MagicWrapper;

try {
	Object.defineProperty({}, 'test', { value: 0 });

	magicAdaptor = {
		filter: function ( object, keypath, ractive ) {
			var parentWrapper, parentValue;

			if ( !keypath ) {
				return false;
			}

			keypath = getKeypath( keypath );

			// If the parent value is a wrapper, other than a magic wrapper,
			// we shouldn't wrap this property
			if ( ( parentWrapper = ractive.viewmodel.wrapped[ keypath.parent.str ] ) && !parentWrapper.magic ) {
				return false;
			}

			parentValue = ractive.viewmodel.get( keypath.parent );

			// if parentValue is an array that doesn't include this member,
			// we should return false otherwise lengths will get messed up
			if ( isArray( parentValue ) && /^[0-9]+$/.test( keypath.lastKey ) ) {
				return false;
			}

			return ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) );
		},
		wrap: function ( ractive, property, keypath ) {
			return new MagicWrapper( ractive, property, keypath );
		}
	};

	MagicWrapper = function ( ractive, value, keypath ) {
		var objKeypath, template, siblings;

		keypath = getKeypath( keypath );

		this.magic = true;

		this.ractive = ractive;
		this.keypath = keypath;
		this.value = value;

		this.prop = keypath.lastKey;

		objKeypath = keypath.parent;
		this.obj = objKeypath.isRoot ? ractive.data : ractive.viewmodel.get( objKeypath );

		template = this.originalDescriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );

		// Has this property already been wrapped?
		if ( template && template.set && ( siblings = template.set._ractiveWrappers ) ) {

			// Yes. Register this wrapper to this property, if it hasn't been already
			if ( siblings.indexOf( this ) === -1 ) {
				siblings.push( this );
			}

			return; // already wrapped
		}

		// No, it hasn't been wrapped
		createAccessors( this, value, template );
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
			runloop.addViewmodel( this.ractive.viewmodel );
			this.ractive.viewmodel.mark( this.keypath, { dontTeardownWrapper: true } );
			this.updating = false;
			return true;
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
			var template, set, value, wrappers, index;

			// If this method was called because the cache was being cleared as a
			// result of a set()/update() call made by this wrapper, we return false
			// so that it doesn't get torn down
			if ( this.updating ) {
				return false;
			}

			template = Object.getOwnPropertyDescriptor( this.obj, this.prop );
			set = template && template.set;

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
} catch ( err ) {
	magicAdaptor = false; // no magic in this browser
}

export default magicAdaptor;

function createAccessors ( originalWrapper, value, template ) {

	var object, property, oldGet, oldSet, get, set;

	object = originalWrapper.obj;
	property = originalWrapper.prop;

	// Is this template configurable?
	if ( template && !template.configurable ) {
		// Special case - array length
		if ( property === 'length' ) {
			return;
		}

		throw new Error( 'Cannot use magic mode with property "' + property + '" - object is not configurable' );
	}


	// Time to wrap this property
	if ( template ) {
		oldGet = template.get;
		oldSet = template.set;
	}

	get = oldGet || function () {
		return value;
	};

	set = function ( v ) {
		if ( oldSet ) {
			oldSet( v );
		}

		value = oldGet ? oldGet() : v;
		set._ractiveWrappers.forEach( updateWrapper );
	};

	function updateWrapper ( wrapper ) {
		var keypath, ractive;

		wrapper.value = value;

		if ( wrapper.updating ) {
			return;
		}

		ractive = wrapper.ractive;
		keypath = wrapper.keypath;

		wrapper.updating = true;
		runloop.start( ractive );

		ractive.viewmodel.mark( keypath );

		runloop.end();
		wrapper.updating = false;
	}

	// Create an array of wrappers, in case other keypaths/ractives depend on this property.
	// Handily, we can store them as a property of the set function. Yay JavaScript.
	set._ractiveWrappers = [ originalWrapper ];
	Object.defineProperty( object, property, { get: get, set: set, enumerable: true, configurable: true });
}
