import runloop from 'global/runloop';

export default function Viewmodel$mark ( keypath, options ) {
	var computation;

	if ( typeof keypath === 'string' ) {
		throw new Error( 'string' );
	}

	runloop.addViewmodel( this ); // TODO remove other instances of this call

	// implicit changes (i.e. `foo.length` on `ractive.push('foo',42)`)
	// should not be picked up by pattern observers
	if ( options ) {
		if ( options.implicit ) {
			this.implicitChanges[ keypath ] = true;
		}
		if ( options.noCascade ) {
			this.noCascade[ keypath ] = true;
		}
	}

	if ( computation = this.computations[ keypath ] ) {
		computation.invalidate();
	}

	if ( this.changes.indexOf( keypath ) === -1 ) {
		this.changes.push( keypath );
	}

	// pass on dontTeardownWrapper, if we can
	let dontTeardownWrapper = options ? options.dontTeardownWrapper : false;

	this.clearCache( keypath, dontTeardownWrapper );
}
