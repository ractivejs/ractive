export default function Mustache$resolve ( keypath ) {
	var wasResolved, value, twowayBinding;

	// If we resolved previously, we need to unregister
	if ( this.registered ) { // undefined or null
		keypath.unregister( this );
		this.registered = false;
		wasResolved = true;
	}

	this.keypath = keypath;

	// If the new keypath exists, we need to register the mustache
	if ( keypath != undefined ) { // undefined or null
		value = keypath.get();
		keypath.register( this );
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
