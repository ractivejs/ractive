import runloop from 'global/runloop';
import resolveRef from 'shared/resolveRef';
import getNewKeypath from 'shared/keypaths/getNew';

var ReferenceResolver = function ( owner, ref, callback ) {
	var keypath;

	this.ref = ref;
	this.resolved = false;

	this.root = owner.root;
	this.parentFragment = owner.parentFragment;
	this.callback = callback;

	keypath = resolveRef( owner.root, ref, owner.parentFragment );
	if ( keypath !== undefined ) {
		this.resolve( keypath );
	}

	else {
		runloop.addUnresolved( this );
	}
};

ReferenceResolver.prototype = {
	resolve: function ( keypath ) {
		this.resolved = true;

		this.keypath = keypath;
		this.callback( keypath );
	},

	forceResolution: function () {
		this.resolve( this.ref );
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var keypath;

		if ( this.keypath !== undefined ) {
			keypath = getNewKeypath( this.keypath, oldKeypath, newKeypath );
			// was a new keypath created?
			if ( keypath !== undefined ) {
				// resolve it
				this.resolve( keypath );
			}
		}
	},

	unbind: function () {
		if ( !this.resolved ) {
			runloop.removeUnresolved( this );
		}
	}
};


export default ReferenceResolver;
