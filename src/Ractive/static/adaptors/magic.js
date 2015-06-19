import runloop from 'global/runloop';
import createBranch from 'utils/createBranch';
import { isArray } from 'utils/is';
import { splitKeypath } from 'shared/keypaths';

let magicAdaptor;

try {
	Object.defineProperty({}, 'test', { value: 0 });

	magicAdaptor = {
		filter ( object, keypath, ractive ) {
			var parentWrapper, parentValue;

			if ( !keypath ) return false;

			const keys = splitKeypath( keypath );
			const parent = keys.length === 1 ? ractive.viewmodel : ractive.viewmodel.join( keys.slice( 0, -1 ) );

			if ( parent.__initmagic ) return false;
			parent.__initmagic = true;

			// If the parent value is a wrapper, other than a magic wrapper,
			// we shouldn't wrap this property
			if ( parent && ( parentWrapper = parent.wrapper ) && !parentWrapper.magic ) return false;

			const key = keys[ keys.length - 1 ];

			if ( !parent.has( key ) ) return false;

			const model = parent.join( keys.slice( -1 ) );

			parentValue = ractive.viewmodel.get( model.parent );

			// if parentValue is an array that doesn't include this member,
			// we should return false otherwise lengths will get messed up
			if ( isArray( parentValue ) && /^[0-9]+$/.test( model.key ) ) {
				return false;
			}

			return ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) );
		},
		wrap ( ractive, property, keypath ) {
			return new MagicWrapper( ractive, property, keypath );
		}
	};

	class MagicWrapper {
		constructor ( ractive, value, keypath ) {
			var objKeypath, template, siblings;

			keypath = ractive.viewmodel.getContext( keypath );

			this.magic = true;

			this.ractive = ractive;
			this.keypath = keypath;
			this.value = value;

			this.prop = keypath.lastKey;

			objKeypath = keypath.parent;
			this.obj = objKeypath.isRoot ? ractive.viewmodel.data : ractive.viewmodel.get( objKeypath );

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
		}

		get () {
			return this.value;
		}

		reset ( value ) {
			if ( this.updating ) {
				return;
			}

			this.updating = true;
			this.obj[ this.prop ] = value; // trigger set() accessor
			this.keypath.mark( { keepExistingWrapper: true } );
			this.updating = false;
			return true;
		}

		set ( key, value ) {
			if ( this.updating ) {
				return;
			}

			if ( !this.obj[ this.prop ] ) {
				this.updating = true;
				this.obj[ this.prop ] = createBranch( key );
				this.updating = false;
			}

			this.obj[ this.prop ][ key ] = value;
		}

		teardown () {
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
	}
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

		keypath.mark();

		runloop.end();
		wrapper.updating = false;
	}

	// Create an array of wrappers, in case other keypaths/ractives depend on this property.
	// Handily, we can store them as a property of the set function. Yay JavaScript.
	set._ractiveWrappers = [ originalWrapper ];
	Object.defineProperty( object, property, { get: get, set: set, enumerable: true, configurable: true });
}
