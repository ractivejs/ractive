export default function Mustache$resolve ( keypath ) {
	var wasResolved, twowayBinding;

	// In some cases, we may resolve to the same keypath (if this is
	// an expression mustache that was rebound due to an ancestor's
	// keypath) - in which case, this is a no-op
	if ( keypath === this.keypath ) {
		return;
	}

	// if we resolved previously, we need to unregister
	if ( this.keypath !== undefined ) {
		this.root.viewmodel.unregister( this.keypath, this );
		wasResolved = true;
	}

	this.keypath = keypath;

	if ( keypath !== undefined ) {
		this.setValue( this.root.viewmodel.get( keypath ) );
		this.root.viewmodel.register( keypath, this );
	} else {
		this.setValue( undefined );
	}

	if ( wasResolved && ( twowayBinding = this.twowayBinding ) ) {
		twowayBinding.rebound();
	}
}
