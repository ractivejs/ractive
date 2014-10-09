export default function Mustache$resolve ( keypath ) {
	var wasResolved, value, twowayBinding;

	// If we resolved previously, we need to unregister
	if ( this.keypath != undefined ) { // undefined or null
		this.root.viewmodel.unregister( this.keypath, this );
		wasResolved = true;
	}

	this.keypath = keypath;

	// If the new keypath exists, we need to register
	// with the viewmodel
	if ( keypath != undefined ) { // undefined or null
		value = this.root.viewmodel.get( keypath );
		this.root.viewmodel.register( keypath, this );
	}

	// Either way we need to queue up a render (`value`
	// will be `undefined` if there's no keypath)
	this.setValue( value );

	// Two-way bindings need to point to their new target keypath
	if ( wasResolved && ( twowayBinding = this.twowayBinding ) ) {
		twowayBinding.rebound();
	}
}
