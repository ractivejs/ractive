import runloop from 'global/runloop';
import { getKeypath } from 'shared/keypaths';
import resolveRef from 'shared/resolveRef';

var ReferenceResolver = function ( owner, ref, callback ) {
	var keypath;

	this.ref = ref;
	this.resolved = false;

	this.root = owner.root;
	this.parentFragment = owner.parentFragment;
	this.callback = callback;

	keypath = resolveRef( owner.root, ref, owner.parentFragment );
	if ( keypath != undefined ) {
		this.resolve( keypath );
	}

	else {
		runloop.addUnresolved( this );
	}
};

ReferenceResolver.prototype = {
	resolve: function ( keypath ) {
		if ( this.keypath && !keypath ) {
			// it was resolved, and now it's not. Can happen if e.g. `bar` in
			// `{{foo[bar]}}` becomes undefined
			runloop.addUnresolved( this );
		}

		this.resolved = true;

		this.keypath = keypath;
		this.callback( keypath );
	},

	forceResolution: function () {
		this.resolve( getKeypath( this.ref ) );
	},

	rebind: function ( oldKeypath, newKeypath ) {
		var keypath;

		if ( this.keypath != undefined ) {
			keypath = this.keypath.replace( oldKeypath, newKeypath );
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
