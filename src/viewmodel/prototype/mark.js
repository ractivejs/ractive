export default function Viewmodel$mark ( keypath, options ) {
	// implicit changes (i.e. `foo.length` on `ractive.push('foo',42)`)
	// should not be picked up by pattern observers
	if ( options ) {
		if ( options.implicit ) {
			this.implicitChanges[ keypath ] = true;
		}
		if ( options.noDownstream ) {
			this.noDownstreamChanges[ keypath ] = true;
		}
	}

	if ( this.changes.indexOf( keypath ) === -1 ) {
		this.changes.push( keypath );
		this.clearCache( keypath );
	}
}
