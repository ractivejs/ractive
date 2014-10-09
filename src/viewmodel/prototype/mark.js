export default function Viewmodel$mark ( keypath, options ) {
	var computation;

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
		this.clearCache( keypath );
	}
}
