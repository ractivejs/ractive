import decodeKeypath from 'shared/keypaths/decode';

export default function Mustache$resolve ( keypath ) {
	var wasResolved, value, twowayBinding;

	// 'Special' keypaths, e.g. @foo or @7, encode a value
	if ( keypath && keypath[0] === '@' ) {
		this.keypath = keypath;
		this.setValue( decodeKeypath( keypath ) );
		return;
	}

	// keep accidental '.' from slipping in at head of the keypath
	if ( keypath && keypath[0] === '.' ) {
		keypath = keypath.replace( /^\.+/, '' );
		this.keypath = keypath;
	}

	// If we resolved previously, we need to unregister
	if ( this.registered ) { // undefined or null
		this.root.viewmodel.unregister( this.keypath, this );
		this.registered = false;

		wasResolved = true;
	}

	this.keypath = keypath;

	// If the new keypath exists, we need to register
	// with the viewmodel
	if ( keypath != undefined ) { // undefined or null
		value = this.root.viewmodel.get( keypath );
		this.root.viewmodel.register( keypath, this );

		this.registered = true;
	}

	// Either way we need to queue up a render (`value`
	// will be `undefined` if there's no keypath)
	this.setValue( value );

	// Two-way bindings need to point to their new target keypath
	if ( wasResolved && ( twowayBinding = this.twowayBinding ) ) {
		twowayBinding.rebound();
	}
}
